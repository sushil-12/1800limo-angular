import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
	selector: 'app-add-sub-admin',
	templateUrl: './add-sub-admin.component.html',
	styleUrls: ['./add-sub-admin.component.scss']
})
export class AddSubAdminComponent implements OnInit
{

	public addSubAdminAccountForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public subAdminId: number;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private mapsAPILoader: MapsAPILoader,
		private ngZone: NgZone
	) { }


	//google map autocomplete
	title: string = 'AGM project';
	latitude: number;
	longitude: number;
	zoom: number;
	address: string;
	private geoCoder;
	@ViewChild('search1')
	public searchElementRef: ElementRef;

	ngOnInit(): void
	{
		//add amenity form validation
		this.addSubAdminAccountForm = this.formBuilder.group({
			id: [],
			firstName: ['', Validators.required],
			middleName: [''],
			lastName: ['', Validators.required],
			mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(12)]],
			mobileIsd: ['+1', Validators.required],
			email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/i)]],
			address: ['', Validators.required],
			city: ['', Validators.required],
			state: ['', Validators.required],
			country: ['United States', Validators.required],
			zipCode: ['', Validators.required],
			latitude: [''],
			longitude: [''],
		});

		// this.spinner.show();//hide spinner

		//pick vehicle type id from query params
		this.activatedroute.queryParamMap
			.subscribe((params) =>
			{
				var paramResponse: any = { ...params.keys, ...params };
				// console.log(this.paramResponse.params.vehicleTypeId);
				this.subAdminId = paramResponse.params.subAdminId;
				// console.log(this.vehicleId);
			}
			);

		if (this.subAdminId)
		{
			// fetch data to display on edit screen
			this.adminService.getSubAdminAccount(this.subAdminId)
				.pipe(
					catchError(err =>
					{
						this.spinner.hide();//hide spinner
						return throwError(err);
					})
				).subscribe(result =>
				{
					this.response = result;

					this.addSubAdminAccountForm.patchValue({
						id: this.subAdminId,
						firstName: this.response.data.first_name,
						middleName: this.response.data.middle_name,
						lastName: this.response.data.last_name,
						mobile: this.response.data.mobile,
						mobileIsd: this.response.data.mobileIsd,
						email: this.response.data.email,
						address: this.response.data.address,
						city: this.response.data.city,
						state: this.response.data.state,
						country: this.response.data.country,
						zipCode: this.response.data.zip,
						latitude: this.response.data.latitude,
						longitude: this.response.data.longitude,
					});
					this.spinner.hide();//hide spinner
				});
		}

		//google map autocomplete
		this.mapsAPILoader.load().then(() =>
		{
			// this.setCurrentLocation();
			this.geoCoder = new google.maps.Geocoder;
			let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
			autocomplete.addListener("place_changed", () =>
			{
				this.ngZone.run(() =>
				{
					//get the place result
					let place: google.maps.places.PlaceResult = autocomplete.getPlace();
					//verify result
					if (place.geometry === undefined || place.geometry === null)
					{
						return;
					}
					console.log(place);
					//Fill one way form pickup address fields
					this.addSubAdminAccountForm.patchValue({
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					});
					if (place.address_components[1])
						this.addSubAdminAccountForm.patchValue({
							city: place.address_components[1].long_name
						});
					if (place.address_components[2])
						this.addSubAdminAccountForm.patchValue({
							state: place.address_components[2].long_name
						});
					// if (place.address_components[3])
					// 	this.addSubAdminAccountForm.patchValue({
					// 		country: place.address_components[3].long_name
					// 	});
					if (place.address_components[4])
						this.addSubAdminAccountForm.patchValue({
							zipCode: place.address_components[4].long_name
						});
				});
			});
		});
	}

	onCountryChange(event)
	{
		this.addSubAdminAccountForm.patchValue({
			mobileIsd: '+' + event.dialCode,
			country:event.name
		});
		console.log(event);
	}

	get f()
	{
		return this.addSubAdminAccountForm.controls;
	}

	submitForm()
	{
		console.log(this.addSubAdminAccountForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addSubAdminAccountForm.invalid)
		{
			return;
		}

		console.log(this.addSubAdminAccountForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button

		this.adminService.addSubAdmin(this.addSubAdminAccountForm.value)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(result =>
			{
				this.response = result;
				this.spinner.hide();//hide spinner
				this.disableSubmitButton = false; //enable submit button

				this.router.navigate(['/admin/sub-admins']);
			});
	}

	resetForm()
	{
		this.addSubAdminAccountForm = this.formBuilder.group({
			id: [],
			firstName: ['', Validators.required],
			middleName: [''],
			lastName: ['', Validators.required],
			mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(12)]],
			mobileIsd: ['+1', Validators.required],
			email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/i)]],
			address: ['', Validators.required],
			city: ['', Validators.required],
			state: ['', Validators.required],
			country: ['', Validators.required],
			zipCode: ['', Validators.required],
			latitude: [''],
			longitude: [''],
		});
	}
	backButton()
	{
		this.router.navigate(['/admin/sub-admins']);
	}

}
