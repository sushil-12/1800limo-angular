import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import * as intlTelInput from 'intl-tel-input';

@Component({
	selector: 'app-edit-individual-account',
	templateUrl: './edit-individual-account.component.html',
	styleUrls: ['./edit-individual-account.component.scss']
})
export class EditIndividualAccountComponent implements OnInit, AfterViewInit {
	@ViewChild('search1') search1!: ElementRef;
	geoCoder!: google.maps.Geocoder;
	@ViewChild('mobileInput') mobileInput!: ElementRef;
	@ViewChild('workInput') workInput!: ElementRef;

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
		private ngZone: NgZone
	) { }


	//google map autocomplete
	title: string = 'AGM project';
	latitude: number;
	longitude: number;
	zoom: number;
	address: string;

	ngOnInit(): void {
		this.currentUser = JSON.parse(sessionStorage.getItem("currentUserData"))
		this.spinner.show();//hide spinner
		this.buildAddIndividualForm()
		//pick vehicle type id from query params
		this.activatedroute.queryParamMap
			.subscribe((params) => {
				this.paramResponse = { ...params.keys, ...params };
				// console.log(this.paramResponse.params.vehicleTypeId);
				this.individualId = this.paramResponse.params.individualId;
				// console.log(this.vehicleId);
			}
			);

		//fetch data to display on edit screen
		this.adminService.getIndividualAccount(this.individualId)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result => {
				this.response = result;

				this.addIndividualAccountForm.patchValue({
					id: this.individualId,
					firstName: this.response.data.first_name,
					middleName: this.response.data.middle_name,
					lastName: this.response.data.last_name,
					mobile: this.response.data.mobile,
					mobileIsd: this.response.data.mobileIsd,
					work: this.response.data.work_contact_number,
					workIsd: this.response.data.workIsd ? this.response.data.workIsd : '+1',
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
		this.geoCoder = new google.maps.Geocoder();

		const autocomplete = new google.maps.places.Autocomplete(
			this.search1.nativeElement,
			{
				types: ['address'] // You can tweak this to 'address', etc.
			}
		);

		autocomplete.addListener("place_changed", () => {
			this.ngZone.run(() => {
				//get the place result
				const place: google.maps.places.PlaceResult = autocomplete.getPlace();
				if (!place.geometry || !place.geometry.location) return;

				this.addIndividualAccountForm.patchValue({
					address: place.formatted_address,
					latitude: place.geometry.location.lat(),
					longitude: place.geometry.location.lng()
				});


				// Extract address components
				place.address_components?.forEach(component => {
					const types = component.types;
					if (types.includes('country')) {
						this.addIndividualAccountForm.patchValue({
							country: component.short_name
						});
					} else if (types.includes('administrative_area_level_1')) {
						this.addIndividualAccountForm.patchValue({
							state: component.long_name
						});
					} else if (types.includes('administrative_area_level_3')) {
						this.addIndividualAccountForm.patchValue({
							city: component.long_name
						});
					} else if (types.includes('postal_code')) {
						this.addIndividualAccountForm.patchValue({
							zipCode: component.long_name
						});
					}
				});
			});
		});


	}

	ngAfterViewInit() {

		const telOptions = {
			initialCountry: 'us',
			preferredCountries: ['us', 'ca', 'mx', 'gb'],
			separateDialCode: true,
			nationalMode: false,
			utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js'
		};

		// Cell Number
		this.MobileObject = intlTelInput(this.mobileInput.nativeElement, telOptions);
		this.mobileInput.nativeElement.addEventListener('countrychange', () => {
			const countryData = this.MobileObject.getSelectedCountryData();
			this.onCountryChange(countryData, 'mobile');
		});

		// Background Company Tel
		this.WorkObject = intlTelInput(this.workInput.nativeElement, telOptions);
		this.workInput.nativeElement.addEventListener('countrychange', () => {
			const countryData = this.WorkObject.getSelectedCountryData();
			this.onCountryChange(countryData, 'work_contact_number');
		});
	}


	buildAddIndividualForm() {
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
			email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
			address: [''],
			city: [''],
			state: [''],
			country: [''],
			zipCode: [''],
			latitude: [''],
			longitude: [''],
		});
	}
	telInputObjectMobile(obj) {
		this.MobileObject = obj;
	}
	telInputObjectWork(obj) {
		this.WorkObject = obj;
	}
	onCountryChange(event, type) {
		if (type == 'mobile') {
			this.addIndividualAccountForm.patchValue({
				mobileIsd: '+' + event.dialCode,
				mobileCountry: event.iso2
			});
		}
		else {
			this.addIndividualAccountForm.patchValue({
				workIsd: '+' + event.dialCode,
				workCountry: event.iso2
			});
		}
		// console.log(this.countryCode);
	}

	get f() {
		return this.addIndividualAccountForm.controls;
	}


	submitForm() {
		console.log(this.addIndividualAccountForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addIndividualAccountForm.invalid) {
			return;
		}

		console.log(this.addIndividualAccountForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button

		this.adminService.updateIndividualAccount(this.addIndividualAccountForm.value)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner/
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;
				this.spinner.hide();//hide spinner
				this.disableSubmitButton = false; //enable submit button

				this.router.navigate(['/admin/individual-account-admin']);
			});
	}

	resetForm() {
		this.buildAddIndividualForm()
		this.addIndividualAccountForm.patchValue({
			id: this.individualId,
			mobile: this.response.data.mobile,
			mobileIsd: '+44'
		});
	}
	backButton() {
		this.router.navigate(['/admin/individual-account-admin']);
	}

}
