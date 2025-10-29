import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import * as intlTelInput from 'intl-tel-input';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';

@Component({
	selector: 'app-add-sub-admin',
	templateUrl: './add-sub-admin.component.html',
	styleUrls: ['./add-sub-admin.component.scss']
})
export class AddSubAdminComponent implements OnInit, AfterViewInit {
	@ViewChild('search1') search1!: ElementRef;
	@ViewChild('phoneInput') phoneInput!: ElementRef;

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
		private ngZone: NgZone,
		private errors: ErrorDialogService
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

		if (this.search1) {
			this.initAutocomplete(this.search1.nativeElement, 'pickup');
		}

		this.MobileObject = intlTelInput(this.phoneInput.nativeElement, {
			initialCountry: 'us',
			preferredCountries: ['us', 'ca', 'mx', 'gb'],
			separateDialCode: true,
			nationalMode: false,
			// autoPlaceholder: 'aggressive',
			utilsScript:
				'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js'
		});

		this.phoneInput.nativeElement.addEventListener('countrychange', () => {
			const countryData = this.MobileObject.getSelectedCountryData();
			this.onCountryChange(countryData)
		});

		this.MobileObject.setCountry(this.response.data.mobileCountry);

	}

	initAutocomplete(input: ElementRef | HTMLInputElement, control: string, index?: number, is_return: boolean = false) {
		const nativeInput = input instanceof ElementRef ? input.nativeElement : input;
		console.log("initautocomplete", nativeInput)

		const autocomplete = new google.maps.places.Autocomplete(nativeInput, {
			types: ['geocode', 'establishment'], // Use geocode for addresses and landmarks // Optional: Restrict to US addresses
            fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components', 'types']
			// componentRestrictions: { country: 'us' } // Optional: Uncomment if needed
		});

		autocomplete.addListener('place_changed', () => {
			const place = autocomplete.getPlace();
			if (!place.geometry || !place.geometry.location) return;

			const formatted_address = place.formatted_address;
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

		if (this.addSubAdminAccountForm.get('address').value != '' && this.addSubAdminAccountForm.get('latitude').value == '') {
			this.errors.openDialog({
				errors: {
					error: `<spanclass="text-danger font-weight-bolder text-xl">Please choose the correct address from the dropdown.</span>`
				}
			})
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

		console.log("payload", payload)

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
