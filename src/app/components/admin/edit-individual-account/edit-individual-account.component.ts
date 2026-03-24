import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import * as intlTelInput from 'intl-tel-input';
import { CommonService } from '../../../services/common.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { attachPlaceAutocompleteElement } from '../../../utils/google-place-autocomplete';

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
		private ngZone: NgZone,
		private errors: ErrorDialogService,
		private commonServices: CommonService
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





	}

	ngAfterViewInit() {

		this.initallphonefields()

		//google map autocomplete
		this.geoCoder = new google.maps.Geocoder();

		void attachPlaceAutocompleteElement(
			this.search1.nativeElement,
			{
				types: ['geocode', 'establishment'],
				fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components', 'types'],
				syncControl: this.addIndividualAccountForm.get('address')!,
			},
			(place) => {
				this.ngZone.run(() => {
					if (!place.geometry || !place.geometry.location) return;

					this.addIndividualAccountForm.patchValue({
						address: place.formatted_address,
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					});

					place.address_components?.forEach((component) => {
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
					});
				});
			}
		);

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
		const control = this.addIndividualAccountForm.get(controlName);
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

	initallphonefields() {
		let countryCode = 'auto';
		if (this.currentUser && (this.currentUser.phoneCountry || this.currentUser.country)) {
			countryCode = this.currentUser.phoneCountry || this.currentUser.country;
		}

		if (this.mobileInput) {
			console.log('onput', this.mobileInput, this.mobileInput.nativeElement)
			const telOptions: any = this.commonServices.getTelInputOptions(countryCode);
			this.MobileObject = intlTelInput(this.mobileInput.nativeElement, telOptions);

			this.addCustomCountrySearch(this.mobileInput.nativeElement);

			this.mobileInput.nativeElement.addEventListener('countrychange', () => {
				const countryData = this.MobileObject.getSelectedCountryData();
				console.log("in change", countryData)
				this.onCountryChange(countryData, 'mobile')
				this.validatePhone('mobile', this.MobileObject);
			});
		}

		if (this.workInput) {
			console.log('onput', this.workInput, this.workInput.nativeElement)
			const telOptions: any = this.commonServices.getTelInputOptions(countryCode);
			this.WorkObject = intlTelInput(this.workInput.nativeElement, telOptions);

			this.addCustomCountrySearch(this.workInput.nativeElement);

			this.workInput.nativeElement.addEventListener('countrychange', () => {
				const countryData = this.WorkObject.getSelectedCountryData();
				console.log("in change", countryData)
				this.onCountryChange(countryData, 'work');
				this.validatePhone('work', this.WorkObject);
			});
		}
	}


	buildAddIndividualForm() {
		//add amenity form validation
		this.addIndividualAccountForm = this.formBuilder.group({
			id: ['5', Validators.required],
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

		// Sync Mobile Country Data
		if (this.MobileObject) {
			const countryData = this.MobileObject.getSelectedCountryData();
			if (countryData && countryData.dialCode) {
				this.addIndividualAccountForm.patchValue({
					mobileIsd: '+' + countryData.dialCode,
					mobileCountry: countryData.iso2
				});
			}
		}

		// Sync Work Country Data
		if (this.WorkObject) {
			const countryData = this.WorkObject.getSelectedCountryData();
			if (countryData && countryData.dialCode) {
				this.addIndividualAccountForm.patchValue({
					workIsd: '+' + countryData.dialCode,
					workCountry: countryData.iso2
				});
			}
		}

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
