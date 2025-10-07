import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CustomvalidationService } from '../../../services/customvalidation.service';
import * as intlTelInput from 'intl-tel-input';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';


@Component({
	selector: 'app-add-individual-account',
	templateUrl: './add-individual-account.component.html',
	styleUrls: ['./add-individual-account.component.scss']
})
export class AddIndividualAccountComponent implements OnInit, AfterViewInit {
	@ViewChild('search1') search1!: ElementRef;
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
		this.initGoogleAutocomplete();
		this.initallphonefields()

	}


	initallphonefields() {

		if (this.mobileInput) {
			console.log('onput', this.mobileInput, this.mobileInput.nativeElement)
			this.MobileObject = intlTelInput(this.mobileInput.nativeElement, {
				initialCountry: 'us',
				preferredCountries: ['us', 'ca', 'mx', 'gb'],
				separateDialCode: true,
				nationalMode: false,
				// autoPlaceholder: 'aggressive',
				utilsScript:
					'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js'
			});

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
				nationalMode: false,
				// autoPlaceholder: 'aggressive',
				utilsScript:
					'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js'
			});

			this.workInput.nativeElement.addEventListener('countrychange', () => {
				const countryData = this.WorkObject.getSelectedCountryData();
				console.log("in change", countryData)
				this.onCountryChange(countryData, 'work');
			});
		}



	}

	initGoogleAutocomplete(): void {
		this.geoCoder = new google.maps.Geocoder;

		const autocomplete = new google.maps.places.Autocomplete(this.search1.nativeElement, {
			types: ['geocode'], // Use geocode for addresses and landmarks // Optional: Restrict to US addresses
            fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components', 'types']
		});

		autocomplete.addListener('place_changed', () => {
			this.ngZone.run(() => {
				const place: google.maps.places.PlaceResult = autocomplete.getPlace();

				if (!place.geometry || !place.geometry.location) return;

				const lat = place.geometry.location.lat();
				const lng = place.geometry.location.lng();

				this.addIndividualAccountForm.patchValue({
					address: place.formatted_address,
					latitude: lat,
					longitude: lng
				});

				place.address_components?.forEach(component => {
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
		});

	}

	buildAddIndividualForm() {
		this.addIndividualAccountForm = this.formBuilder.group({
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
			card_type: ['personal', Validators.required],
			number: ['', [Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.maxLength(20), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			cvc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(5), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
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
		// stop here if form is invalid
		if (this.addIndividualAccountForm.invalid) {
			return;
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

}
