import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
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
export class AddSubAdminComponent implements OnInit {
	@ViewChild('search1') search1!:ElementRef;

	public addSubAdminAccountForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public subAdminId: number;
	public MobileObject: any;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private ngZone: NgZone
	) { }


	//google map autocomplete
	title: string = 'AGM project';
	latitude: number;
	longitude: number;
	zoom: number;
	address: string;
	geoCoder!: google.maps.Geocoder;

	ngOnInit(): void {
		//add amenity form validation
		this.addSubAdminAccountForm = this.formBuilder.group({
			id: [],
			firstName: ['', Validators.required],
			middleName: [''],
			lastName: ['', Validators.required],
			mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(12)]],
			mobileIsd: ['+1', Validators.required],
			email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
			address: ['', Validators.required],
			city: [''],
			state: [''],
			country: ['', Validators.required],
			zipCode: ['', Validators.required],
			latitude: [''],
			longitude: [''],
		});

		// this.spinner.show();//hide spinner

		//pick vehicle type id from query params
		this.activatedroute.queryParamMap
			.subscribe((params) => {
				var paramResponse: any = { ...params.keys, ...params };
				// console.log(this.paramResponse.params.vehicleTypeId);
				this.subAdminId = paramResponse.params.subAdminId;
				// console.log(this.vehicleId);
			}
			);

		if (this.subAdminId) {
			// fetch data to display on edit screen
			this.adminService.getSubAdminAccount(this.subAdminId)
				.pipe(
					catchError(err => {
						this.spinner.hide();//hide spinner
						return throwError(err);
					})
				).subscribe(result => {
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
					this.MobileObject.setCountry(this.response.data.mobileCountry);
					this.spinner.hide();//hide spinner
				});
		}
	}

	ngAfterViewInit(): void {
		this.initGoogleAutocomplete();
	  }

	initGoogleAutocomplete(): void{ 
		this.geoCoder = new google.maps.Geocoder;

		const autocomplete = new google.maps.places.Autocomplete(this.search1.nativeElement, {
			types: ['address'] // or 'address'
		  });

		autocomplete.addListener('place_changed', () => {
			this.ngZone.run(() => {
			  const place: google.maps.places.PlaceResult = autocomplete.getPlace();
	  
			  if (!place.geometry || !place.geometry.location) return;
	  
			  const lat = place.geometry.location.lat();
			  const lng = place.geometry.location.lng();
	  
			  this.addSubAdminAccountForm.patchValue({
				address: place.formatted_address,
				latitude: lat,
				longitude: lng
			  });
	  
			  place.address_components?.forEach(component => {
				const types = component.types;
	  
				if (types.includes('locality')) {
				  this.addSubAdminAccountForm.patchValue({ city: component.long_name });
				}
				if (types.includes('administrative_area_level_1')) {
				  this.addSubAdminAccountForm.patchValue({ state: component.long_name });
				}
				if (types.includes('country')) {
				  this.addSubAdminAccountForm.patchValue({ country: component.long_name });
				}
				if (types.includes('postal_code')) {
				  this.addSubAdminAccountForm.patchValue({ zipCode: component.long_name });
				}
			  });
			});
		  });

	 }

	onCountryChange(event) {
		this.addSubAdminAccountForm.patchValue({
			mobileIsd: '+' + event.dialCode,
			country: event.name
		});
		console.log(event);
	}

	get f() {
		return this.addSubAdminAccountForm.controls;
	}

	telInputObjectMobile(obj) {
		this.MobileObject = obj;
	}

	submitForm() {
		console.log(this.addSubAdminAccountForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addSubAdminAccountForm.invalid) {
			return;
		}

		console.log(this.addSubAdminAccountForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button


		const formData = this.addSubAdminAccountForm.value;
		const payload = {
			...formData,
			user_id: JSON.parse(localStorage.getItem('currentUser'))?.id,
		};

		console.log("payload",payload)
		
		this.adminService.addSubAdmin(payload)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;
				this.spinner.hide();//hide spinner
				this.disableSubmitButton = false; //enable submit button

				this.router.navigate(['/admin/sub-admins']);
			});
	}

	resetForm() {
		this.addSubAdminAccountForm = this.formBuilder.group({
			id: [],
			firstName: ['', Validators.required],
			middleName: [''],
			lastName: ['', Validators.required],
			mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(12)]],
			mobileIsd: ['+1', Validators.required],
			email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
			address: ['', Validators.required],
			city: ['', Validators.required],
			state: ['', Validators.required],
			country: ['', Validators.required],
			zipCode: ['', Validators.required],
			latitude: [''],
			longitude: [''],
		});
	}
	backButton() {
		this.router.navigate(['/admin/sub-admins']);
	}

}
