import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CustomvalidationService } from '../../../services/customvalidation.service';
import * as intlTelInput from 'intl-tel-input';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';

import { CommonService } from '../../../services/common.service';
import * as moment from "moment";
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

declare var $: any;

export const MY_FORMATS = {
	parse: {
		dateInput: 'MM/YYYY',
	},
	display: {
		dateInput: 'MM/YYYY',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};


@Component({
	selector: 'app-add-individual-account',
	templateUrl: './add-individual-account.component.html',
	styleUrls: ['./add-individual-account.component.scss'],
	providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
		},
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
})
export class AddIndividualAccountComponent implements OnInit, AfterViewInit {
	@ViewChild('mobileInput') mobileInput!: ElementRef;
	@ViewChild('workInput') workInput!: ElementRef;

	public addIndividualAccountForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public yearOptions: any = [];
	public MobileObject: any;
	public WorkObject: any;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private ngZone: NgZone,
		private customValidator: CustomvalidationService,
		private errors: ErrorDialogService,
		private commonServices: CommonService
	) { }


	//google map autocomplete
	title: string = 'AGM project';
	latitude: number;
	longitude: number;
	zoom: number;
	address: string;
	geoCoder!: google.maps.Geocoder;


	ngOnInit(): void {
		this.buildAddIndividualForm();
		const currentYear = (new Date()).getFullYear();
		for (let i = 0; i < 40; i++) {
			this.yearOptions.push(currentYear + i);
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
	}

	ngAfterViewInit(): void {
		this.initallphonefields()

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

		if (this.mobileInput) {
			console.log('onput', this.mobileInput, this.mobileInput.nativeElement)
			const telOptions: any = this.commonServices.getTelInputOptions('us');
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
			const telOptions: any = this.commonServices.getTelInputOptions('us');
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

	onGmpAddIndividualAddressSelected(place: google.maps.places.PlaceResult): void {
		this.ngZone.run(() => {
			if (!place.geometry?.location) {
				return;
			}
			const lat = place.geometry.location.lat();
			const lng = place.geometry.location.lng();

			this.addIndividualAccountForm.patchValue({
				address: place.formatted_address,
				latitude: lat,
				longitude: lng,
			});

			place.address_components?.forEach((component) => {
				const types = component.types;

				if (types.includes('locality')) {
					this.addIndividualAccountForm.patchValue({ city: component.long_name });
				}
				if (types.includes('administrative_area_level_1')) {
					this.addIndividualAccountForm.patchValue({ state: component.long_name });
				}
				if (types.includes('country')) {
					this.addIndividualAccountForm.patchValue({ country: component.long_name });
				}
				if (types.includes('postal_code')) {
					this.addIndividualAccountForm.patchValue({ zipCode: component.long_name });
				}
			});
		});
	}

	buildAddIndividualForm() {
		this.addIndividualAccountForm = this.formBuilder.group({
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
			card_type: ['personal', Validators.required],
			number: ['', [Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.maxLength(20), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			cvc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(5), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			name: ['', Validators.required],
		}, { validators: this.expiryDateValidator() });
		this.setExpiryDate(moment());
	}



	onCountryChange(event, type) {
		console.log(event)
		if (type == 'mobile') {
			console.log("in mobile", event.dialCode, event.iso2)
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
		this.expiryDateControl.markAsTouched();

		// Sync mobile Country Data
		if (this.MobileObject) {
			const countryData = this.MobileObject.getSelectedCountryData();
			if (countryData && countryData.dialCode) {
				this.addIndividualAccountForm.patchValue({
					mobileIsd: '+' + countryData.dialCode,
					mobileCountry: countryData.iso2
				});
			}
		}

		// Sync work Country Data
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
		console.log(this.addIndividualAccountForm.value)
		this.adminService.addAccount(this.addIndividualAccountForm.value)
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

				this.router.navigate(['/admin/individual-account-admin']);
			});
	}

	resetForm() {
		this.buildAddIndividualForm()
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
	// Month-Year Picker Logic
	expiryDateControl = new FormControl(moment());

	get minExpiryDate() {
		return moment().startOf('month');
	}

	private setExpiryDate(date: moment.Moment) {
		const selectedDate = date.clone().startOf('month');
		this.expiryDateControl.setValue(selectedDate);
		this.addIndividualAccountForm.patchValue({
			exp_month: selectedDate.format('MM'),
			exp_year: selectedDate.year()
		}, { emitEvent: false });
		this.addIndividualAccountForm.updateValueAndValidity({ emitEvent: false });
	}

	private expiryDateValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const expMonth = control.get('exp_month')?.value;
			const expYear = control.get('exp_year')?.value;

			if (!expMonth || !expYear) {
				return null;
			}

			const selectedDate = moment(`${expYear}-${expMonth}-01`, 'YYYY-MM-DD', true);
			if (!selectedDate.isValid()) {
				return { invalidExpiryDate: true };
			}

			return selectedDate.isBefore(moment().startOf('month')) ? { invalidExpiryDate: true } : null;
		};
	}

	chosenYearHandler(normalizedYear: moment.Moment) {
		const ctrlValue = this.expiryDateControl.value || moment();
		ctrlValue.year(normalizedYear.year());
		this.expiryDateControl.setValue(ctrlValue);
	}

	chosenMonthHandler(normalizedMonth: moment.Moment, datepicker: any) {
		const selectedDate = normalizedMonth.clone().year(normalizedMonth.year()).month(normalizedMonth.month());
		this.setExpiryDate(selectedDate);

		this.addIndividualAccountForm.get('exp_month').markAsDirty();
		this.addIndividualAccountForm.get('exp_year').markAsDirty();
		this.addIndividualAccountForm.get('exp_month').markAsTouched();
		this.addIndividualAccountForm.get('exp_year').markAsTouched();
		this.expiryDateControl.markAsTouched();

		datepicker.close();
	}
}
