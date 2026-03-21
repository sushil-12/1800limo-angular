import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import * as intlTelInput from 'intl-tel-input';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { attachPlaceAutocompleteElement } from '../../../utils/google-place-autocomplete';

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
			mobile: ['', [Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(10), Validators.maxLength(12)]],
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
			nationalMode: true,
			// autoPlaceholder: 'aggressive',
			utilsScript:
				'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js'
		});


		this.addCustomCountrySearch(this.phoneInput.nativeElement);

		this.phoneInput.nativeElement.addEventListener('countrychange', () => {
			const countryData = this.MobileObject.getSelectedCountryData();
			this.onCountryChange(countryData)
			this.validatePhone('mobile', this.MobileObject);
		});

		this.MobileObject.setCountry(this.response.data.mobileCountry);

	}

	numberOnly(event: any): boolean {
		const charCode = (event.which) ? event.which : event.keyCode;
		// Allow: backspace, delete, tab, escape, enter, + symbol (43)
		if (charCode === 43) {
			return true;
		}
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}

	validatePhone(controlName: string, telInputObject: any) {
		const control = this.addSubAdminAccountForm.get(controlName);
		if (telInputObject) {
			const value = control.value;
			if (!value) {
				if (control.errors) {
					const { invalidIntl, ...otherErrors } = control.errors;
					control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
				}
				return;
			}
			const isValid = telInputObject.isValidNumber();
			if (!isValid) {
				const errorCode = telInputObject.getValidationError();
				const errorMsg = ["Invalid phone number", "Invalid country code", "Invalid phone number", "Invalid phone number", "Invalid phone number"][errorCode] || "Invalid phone number";
				const currentErrors = control.errors || {};
				control.setErrors({ ...currentErrors, 'invalidIntl': errorMsg });
			} else {
				if (control.errors) {
					const { invalidIntl, ...otherErrors } = control.errors;
					control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
				}
			}
		}
	}

	initAutocomplete(input: ElementRef | HTMLInputElement, control: string, index?: number, is_return: boolean = false) {
		const nativeInput = input instanceof ElementRef ? input.nativeElement : input;
		console.log("initautocomplete", nativeInput)

		void attachPlaceAutocompleteElement(
			nativeInput,
			{
				types: ['geocode', 'establishment'],
				fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components', 'types'],
			},
			(place) => {
				if (!place.geometry || !place.geometry.location) return;

				const lat = place.geometry.location.lat();
				const lng = place.geometry.location.lng();

				this.addSubAdminAccountForm.patchValue({
					address: place.formatted_address,
					latitude: lat,
					longitude: lng
				});

				place.address_components?.forEach((component) => {
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
			}
		);
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

		// Sync mobile Country Data
		if (this.MobileObject) {
			const countryData = this.MobileObject.getSelectedCountryData();
			if (countryData && countryData.dialCode) {
				this.addSubAdminAccountForm.patchValue({
					mobileIsd: '+' + countryData.dialCode,
					country: countryData.name
				});
			}
		}

		// stop here if form is invalid
		if (this.addSubAdminAccountForm.invalid) {
			return;
		}

		// Sanitize mobile (remove Country Code if present)
		if (this.addSubAdminAccountForm.value.mobile && this.addSubAdminAccountForm.value.mobileIsd && this.addSubAdminAccountForm.value.mobile.startsWith(this.addSubAdminAccountForm.value.mobileIsd)) {
			this.addSubAdminAccountForm.value.mobile = this.addSubAdminAccountForm.value.mobile.substring(this.addSubAdminAccountForm.value.mobileIsd.length);
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
			mobile: ['', [Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(10), Validators.maxLength(12)]],
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


	private addCustomCountrySearch(element: HTMLElement) {
		element.addEventListener('open:countrydropdown', () => {
			const container = element.closest('.iti');
			const dropdown = container?.querySelector('.iti__country-list');
			if (!dropdown) return;

			// Check if search already exists
			if (dropdown.querySelector('.iti-search-input')) return;

			// Create search container
			const searchContainer = document.createElement('div');
			searchContainer.className = 'iti-search-container';

			// Create search input
			const searchInput = document.createElement('input');
			searchInput.type = 'text';
			searchInput.className = 'iti-search-input';
			searchInput.placeholder = 'Search country...';

			searchContainer.appendChild(searchInput);

			// Prevent dropdown from closing when interacting with search
			searchInput.addEventListener('click', (e) => e.stopPropagation());
			searchInput.addEventListener('keydown', (e) => e.stopPropagation());

			// Insert at top of dropdown
			dropdown.insertBefore(searchContainer, dropdown.firstChild);

			// Focus on search
			setTimeout(() => searchInput.focus(), 100);

			// Filter countries on input
			searchInput.addEventListener('input', (e: any) => {
				e.stopPropagation();
				const searchTerm = e.target.value.toLowerCase();
				const countries = dropdown.querySelectorAll('.iti__country');
				let hasVisible = false;

				countries.forEach((country: any) => {
					// Search in the full text (Name + Dial Code)
					const text = country.textContent?.toLowerCase() || '';

					if (text.includes(searchTerm)) {
						country.classList.remove('iti__hide');
						country.style.display = 'block'; // Force show
						hasVisible = true;
					} else {
						country.classList.add('iti__hide');
						country.style.display = 'none'; // Force hide
					}
				});

				// Handle No Results
				let noResults = dropdown.querySelector('.iti-no-results');
				if (!noResults) {
					noResults = document.createElement('div');
					noResults.className = 'iti-no-results';
					noResults.textContent = 'No results found';
					dropdown.appendChild(noResults);
				}

				if (!hasVisible && searchTerm) {
					(noResults as HTMLElement).style.display = 'block';
				} else {
					(noResults as HTMLElement).style.display = 'none';
				}

				// Show all if search is empty
				if (!searchTerm) {
					countries.forEach((country: any) => {
						country.classList.remove('iti__hide');
						country.style.display = 'block';
					});
					(noResults as HTMLElement).style.display = 'none';
				}
			});
		});
	}
}
