import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
	selector: 'app-edit-individual-account',
	templateUrl: './edit-individual-account.component.html',
	styleUrls: ['./edit-individual-account.component.scss']
})
export class EditIndividualAccountComponent implements OnInit
{

	public addIndividualAccountForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public paramResponse: any;
	public individualId: Number;
	public MobileObject: any;
	public WorkObject: any;
	public currentUser: any;

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
		this.currentUser = JSON.parse(sessionStorage.getItem("currentUserData"))
		this.spinner.show();//hide spinner

		//pick vehicle type id from query params
		this.activatedroute.queryParamMap
			.subscribe((params) =>
			{
				this.paramResponse = { ...params.keys, ...params };
				// console.log(this.paramResponse.params.vehicleTypeId);
				this.individualId = this.paramResponse.params.individualId;
				// console.log(this.vehicleId);
			}
			);

		//fetch data to display on edit screen
		this.adminService.getIndividualAccount(this.individualId)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result =>
			{
				this.response = result;

				this.addIndividualAccountForm.patchValue({
					id: this.individualId,
					firstName: this.response.data.first_name,
					middleName: this.response.data.middle_name,
					lastName: this.response.data.last_name,
					mobile: this.response.data.mobile,
					mobileIsd: '+44',
					work: this.response.data.work_contact_number,
					workIsd: '+44',
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
				this.MobileObject.setCountry(this.response.data.mobileCountry);
				this.WorkObject.setCountry(this.response.data.workCountry);
			});

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
					this.addIndividualAccountForm.patchValue({
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					});
					if (place.address_components[1])
						this.addIndividualAccountForm.patchValue({
							city: place.address_components[1].long_name
						});
					if (place.address_components[2])
						this.addIndividualAccountForm.patchValue({
							state: place.address_components[2].long_name
						});
					if (place.address_components[3])
						this.addIndividualAccountForm.patchValue({
							country: place.address_components[3].long_name
						});
					if (place.address_components[4])
						this.addIndividualAccountForm.patchValue({
							zipCode: place.address_components[4].long_name
						});
				});
			});
		});

		//add amenity form validation
		this.addIndividualAccountForm = this.formBuilder.group({
			id: ['5', Validators.required],
			role: ['5', [Validators.required, Validators.pattern("^[0-9].*$")]],//individual
			firstName: ['', Validators.required],
			middleName: [''],
			lastName: ['', Validators.required],
			mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			mobileIsd: ['+1', Validators.required],
			mobileCountry: ['us'],
			work: [''],
			workIsd: ['+1', Validators.required],
			workCountry: ['us'],
			email: ['', [Validators.required ,Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/i)]],
			address: ['', Validators.required],
			city: ['', Validators.required],
			state: ['', Validators.required],
			country: ['', Validators.required],
			zipCode: ['', Validators.required],
			latitude: [''],
			longitude: [''],
		});
	}
	telInputObjectMobile(obj)
	{
		this.MobileObject = obj;
	}
	telInputObjectWork(obj)
	{
		this.WorkObject = obj;
	}
	onCountryChange(event, type)
	{
		if (type == 'mobile')
		{
			this.addIndividualAccountForm.patchValue({
				mobileIsd: '+' + event.dialCode,
				mobileCountry: event.iso2
			});
		}
		else
		{
			this.addIndividualAccountForm.patchValue({
				workIsd: '+' + event.dialCode,
				workCountry: event.iso2
			});
		}
		// console.log(this.countryCode);
	}

	get f()
	{
		return this.addIndividualAccountForm.controls;
	}


	submitForm()
	{
		console.log(this.addIndividualAccountForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addIndividualAccountForm.invalid)
		{
			return;
		}

		console.log(this.addIndividualAccountForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button

		this.adminService.updateIndividualAccount(this.addIndividualAccountForm.value)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner/
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(result =>
			{
				this.response = result;
				this.spinner.hide();//hide spinner
				this.disableSubmitButton = false; //enable submit button

				this.router.navigate(['/admin/individual-account-admin']);
			});
	}

	resetForm()
	{
		this.addIndividualAccountForm.reset();
	}
	backButton()
	{
		this.router.navigate(['/admin/individual-account-admin']);
	}

}
