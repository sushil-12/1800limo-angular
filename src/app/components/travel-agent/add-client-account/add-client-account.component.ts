import { Component, ElementRef, NgZone, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as intlTelInput from 'intl-tel-input';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { TravelAgentService } from 'src/app/services/travel-agent.service';

@Component({
	selector: 'app-add-client-account',
	templateUrl: './add-client-account.component.html',
	styleUrls: ['./add-client-account.component.scss']
})
export class AddClientAccountComponent implements OnInit, AfterViewInit {
	@ViewChild('search1') search1!: ElementRef;
	geoCoder!: google.maps.Geocoder;
	@ViewChild('mobileInput') mobileInput!: ElementRef;
	@ViewChild('workInput') workInput!: ElementRef;

	public addIndividualAccountForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public yearOptions: any = [];
	public MobileObject: any;
	public WorkObject: any;
	clientId: any = null;
	type: any = null;

	constructor(
		private travelService: TravelAgentService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private $routeurl: ActivatedRoute,
		private ngZone: NgZone,
		private customValidator: CustomvalidationService,
		private errors: ErrorDialogService
	) { }


	//google map autocomplete
	title: string = 'AGM project';
	latitude: number;
	longitude: number;
	zoom: number;
	address: string;
	currentUser: any;

	ngOnInit(): void {
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
		this.buildAddIndividualForm();
		this.$routeurl.queryParams.subscribe((params: any) => {
			console.log('params---->>>>>', params)
			this.clientId = params?.clientId
			if (params && params.type) {
				this.type = params.type
			}
		})
		const currentYear = (new Date()).getFullYear();
		for (let i = 0; i < 40; i++) {
			this.yearOptions.push(currentYear + i);
		}

		if (this.clientId) {
			this.travelService.getClientAccount(this.clientId)
				.pipe(
					catchError(err => {
						this.spinner.hide();//hide spinner
						return throwError(err);
					})
				).subscribe(result => {
					this.response = result;

					this.addIndividualAccountForm.patchValue({
						id: this.clientId,
						firstName: this.response.data.first_name,
						middleName: this.response.data.middle_name,
						lastName: this.response.data.last_name,
						mobile: this.response.data.mobile,
						mobileIsd: this.response.data.mobileIsd,
						work: this.response.data.work_contact_number,
						workIsd: this.response.data.workIsd,
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
		}

		//add amenity form validation

		/* Card Number Spacing */

		$('#card-number').on('keypress change blur', function () {
			$(this).val(function (index, value) {
				return value.replace(/[^a-z0-9]+/gi, '')
				// .replace(/(.{4})/g, '$1 ')
			});
		});

		$('#card-number').on('copy cut paste', function () {
			setTimeout(function () {
				$('#card-number').trigger("change");
			});
		});

		if (this.type == 'edit') {
			['name', 'number', 'cvc', 'exp_month', 'exp_year'].forEach(i => {
				console.log('i--_>>>>>', i)
				this.addIndividualAccountForm.get(i).clearValidators();
				this.addIndividualAccountForm.get(i).updateValueAndValidity();
			})
		}
	}


	ngAfterViewInit() {

		this.initallphonefields()

		//google map autocomplete
		this.geoCoder = new google.maps.Geocoder();

		const autocomplete = new google.maps.places.Autocomplete(
			this.search1.nativeElement,
			{
				types: ['geocode', 'establishment'], // Use geocode for addresses and landmarks // Optional: Restrict to US addresses
				fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components', 'types'] // You can tweak this to 'address', etc.
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
							country: component.long_name
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
					// else if (types.includes('street_number')) {
					// 	this.addIndividualAccountForm.patchValue({
					// 		address: component.long_name
					// 	});
					// }
				});
			});
		});


	}

	initallphonefields() {
		console.log("in init phone", this.mobileInput, this.workInput)

		if (this.mobileInput) {
			console.log('onput', this.mobileInput, this.mobileInput.nativeElement)
			this.MobileObject = intlTelInput(this.mobileInput.nativeElement, {
				initialCountry: 'us',
				preferredCountries: ['us', 'ca', 'mx', 'gb'],
				separateDialCode: true,
				nationalMode: true,
				// autoPlaceholder: 'aggressive',
				utilsScript:
					'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js'
			});

			this.addCustomCountrySearch(this.mobileInput.nativeElement);

			this.mobileInput.nativeElement.addEventListener('countrychange', () => {
				const countryData = this.MobileObject.getSelectedCountryData();
				console.log("in change", countryData)
				this.onCountryChange(countryData, 'mobile')
			});
		}

		if (this.workInput) {
			console.log('onput', this.workInput, this.workInput.nativeElement)
			this.WorkObject = intlTelInput(this.workInput.nativeElement, {
				initialCountry: 'us',
				preferredCountries: ['us', 'ca', 'mx', 'gb'],
				separateDialCode: true,
				nationalMode: true,
				// autoPlaceholder: 'aggressive',
				utilsScript:
					'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js'
			});

			this.addCustomCountrySearch(this.workInput.nativeElement);

			this.workInput.nativeElement.addEventListener('countrychange', () => {
				const countryData = this.WorkObject.getSelectedCountryData();
				console.log("in change", countryData)
				this.onCountryChange(countryData, 'work');
			});
		}



	}

	buildAddIndividualForm() {
		this.addIndividualAccountForm = this.formBuilder.group({
			id: [''],
			role: ['5', [Validators.required, Validators.pattern("^[0-9].*$")]],//individual
			firstName: ['', Validators.required],
			middleName: [''],
			lastName: ['', Validators.required],
			mobile: ['', [Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			mobileIsd: ['+1', Validators.required],
			mobileCountry: ['us'],
			work: [''],
			workIsd: ['+1', Validators.required],
			workCountry: ['us'],
			email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
			address: ['', Validators.required],
			city: [''],
			state: [''],
			country: ['', Validators.required],
			zipCode: ['', Validators.required],
			latitude: [''],
			longitude: [''],
			card_type: ['personal', Validators.required],
			number: ['', [Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.minLength(14), Validators.maxLength(20), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			cvc: ['', [Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(3), Validators.maxLength(5), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			name: ['', Validators.required],
		});
	}



	onCountryChange(event, type) {
		console.log(event)
		if (type == 'mobile') {
			console.log("in mobile", event.dialCode, event.iso2)
			this.addIndividualAccountForm.patchValue({
				mobileIsd: '+' + event.dialCode,
				mobileCountry: event.iso2
			});
			this.addIndividualAccountForm.get('mobile').updateValueAndValidity(); // Ensure validity updates
			this.validateMobile();
		}
		else {
			this.addIndividualAccountForm.patchValue({
				workIsd: '+' + event.dialCode,
				workCountry: event.iso2
			});
			this.addIndividualAccountForm.get('work').updateValueAndValidity(); // Ensure validity updates
			this.validateWork();
		}
		// console.log(this.countryCode);
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

	validatePhoneGeneric(control: any, telInputObject: any) {
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

	validateMobile() {
		this.validatePhoneGeneric(this.addIndividualAccountForm.get('mobile'), this.MobileObject);
	}

	validateWork() {
		this.validatePhoneGeneric(this.addIndividualAccountForm.get('work'), this.WorkObject);
	}
	telInputObjectMobile(obj) {
		this.MobileObject = obj;
	}
	telInputObjectWork(obj) {
		this.WorkObject = obj;
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

		// Sanitize work (remove Country Code if present)
		if (this.addIndividualAccountForm.value.work && this.addIndividualAccountForm.value.workIsd && this.addIndividualAccountForm.value.work.startsWith(this.addIndividualAccountForm.value.workIsd)) {
			this.addIndividualAccountForm.value.work = this.addIndividualAccountForm.value.work.substring(this.addIndividualAccountForm.value.workIsd.length);
		}

		// Sanitize mobile (remove Country Code if present)
		if (this.addIndividualAccountForm.value.mobile && this.addIndividualAccountForm.value.mobileIsd && this.addIndividualAccountForm.value.mobile.startsWith(this.addIndividualAccountForm.value.mobileIsd)) {
			this.addIndividualAccountForm.value.mobile = this.addIndividualAccountForm.value.mobile.substring(this.addIndividualAccountForm.value.mobileIsd.length);
		}

		if (this.addIndividualAccountForm.get('address').value != '' && this.addIndividualAccountForm.get('latitude').value == '') {
			this.errors.openDialog({
				errors: {
					error: `<spanclass="text-danger font-weight-bolder text-xl">Please choose the correct address from the dropdown.</span>`
				}
			})
			return;
		}

		console.log(this.addIndividualAccountForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button
		console.log(this.addIndividualAccountForm.value)
		this.travelService.addAccount(this.addIndividualAccountForm.value, this.clientId)
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

				this.router.navigate([`/${this.currentUser?.roleName}/staff-account-list`]);
			});
	}

	resetForm() {
		const keepValues = [
			this.addIndividualAccountForm.controls.mobile.value,
			this.addIndividualAccountForm.controls.id.value,
			this.addIndividualAccountForm.controls.mobileIsd.value,
			this.addIndividualAccountForm.controls.mobileCountry.value,

		];

		this.buildAddIndividualForm()
		this.addIndividualAccountForm.controls.mobile.patchValue(keepValues[0]);
		this.addIndividualAccountForm.controls.id.patchValue(keepValues[1]);
		this.addIndividualAccountForm.controls.mobileIsd.patchValue(keepValues[2]);
		this.addIndividualAccountForm.controls.mobileCountry.patchValue(keepValues[3]);

		console.log(this.addIndividualAccountForm.value)
	}
	backButton() {
		this.router.navigate([`${this.currentUser?.roleName}/individual-account-admin`]);
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
