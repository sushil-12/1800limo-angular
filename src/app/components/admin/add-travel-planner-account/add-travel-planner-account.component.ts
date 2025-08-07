import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CustomvalidationService } from '../../../services/customvalidation.service';
import { HttpClient } from '@angular/common/http';
import * as intlTelInput from 'intl-tel-input';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';

@Component({
	selector: 'app-add-travel-planner-account',
	templateUrl: './add-travel-planner-account.component.html',
	styleUrls: ['./add-travel-planner-account.component.scss']
})
export class AddTravelPlannerAccountComponent implements OnInit, AfterViewInit {
	@ViewChild('search1') search1!: ElementRef;
	@ViewChild('officeInput') officeInput!: ElementRef;
	@ViewChild('mobileInput') mobileInput!: ElementRef;
	@ViewChild('faxInput') faxInput!: ElementRef;
	@ViewChild('officeNumberInput') officeNumberInput!: ElementRef;


	public addTravelPlannerAccountForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public yearOptions: any = [];
	public OfficeObject: any;
	public MobileObject: any;
	public FaxObject: any;
	public OfficePhoneObject: any;
	travelPlannerId: any = null;
	public countryCodeName: any = "United States";
	countryOptions: any;
	stateOptions: any;


	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private ngZone: NgZone,
		private customValidator: CustomvalidationService,
		private httpClient: HttpClient,
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
		const currentYear = (new Date()).getFullYear();
		for (let i = 0; i < 40; i++) {
			this.yearOptions.push(currentYear + i);
		}
		this.httpClient.get("assets/json/countryStateList.json").subscribe(data => {
			this.countryOptions = data;
		})

		//add amenity form validation
		this.buildTravelAgentForm()
		/* Card Number Spacing */

		$('#card-number').on('keypress change blur', function () {
			$(this).val(function (index, value) {
				return value.replace(/[^a-z0-9]+/gi, '').replace(/(.{4})/g, '$1 ');
			});
		});

		$('#card-number').on('copy cut paste', function () {
			setTimeout(function () {
				$('#card-number').trigger("change");
			});
		});

		this.activatedroute.queryParams.subscribe((params: any) => {
			if (params.travelPlannerId) {
				this.travelPlannerId = params.travelPlannerId
				localStorage.setItem('travelAgent_id', this.travelPlannerId)
				this.addTravelPlannerAccountForm.patchValue({
					acc_id: this.travelPlannerId
				})
				this.getTravelAgentData()
			}
			else if (localStorage.getItem('travelAgent_id')) {
				this.travelPlannerId = localStorage.getItem('travelAgent_id')
				this.addTravelPlannerAccountForm.patchValue({
					acc_id: this.travelPlannerId
				})
				this.getTravelAgentData()
			}
		})

	}

	buildTravelAgentForm() {
		this.addTravelPlannerAccountForm = this.formBuilder.group({
			id: [''],//travelPlanner
			acc_id: [''],
			role: ['3', [Validators.required, Validators.pattern("^[0-9].*$")]],//travelPlanner
			firstName: ['', Validators.required],
			middleName: [''],
			lastName: ['', Validators.required],
			office: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			officeIsd: ['+1', Validators.required],
			officeCountry: ['us'],
			mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			mobileIsd: ['+1', Validators.required],
			mobileCountry: ['us'],
			email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
			address: ['', Validators.required],
			city: [''],
			state: [''],
			country: ['', Validators.required],
			zipCode: ['', Validators.required],
			agencyName: ['', Validators.required],
			payee: ['', Validators.required],
			iata: ['', Validators.required],
			fax: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			faxIsd: ['+1', Validators.required],
			faxCountry: ['us'],
			officeNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			isd_office_number: ['+1', Validators.required],
			office_country_code: ['us'],
			latitude: [''],
			longitude: [''],
			card_type: ['personal', Validators.required],
			number: ['', [Validators.pattern("^[0-9\\s]*$"), Validators.minLength(14), Validators.maxLength(20), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			cvc: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(3), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			exp_month: [''],
			exp_year: [''],
			name: [''],
		});
	}

	ngAfterViewInit(): void {

		this.initallphonefields()

		//ggole maps autocomplete
		this.geoCoder = new google.maps.Geocoder();

		const autocomplete = new google.maps.places.Autocomplete(
			this.search1.nativeElement,
			{
				types: ['address'] // You can tweak this to 'address', etc.
			}
		);

		autocomplete.addListener('place_changed', () => {
			this.ngZone.run(() => {
				const place: google.maps.places.PlaceResult = autocomplete.getPlace();
				if (!place.geometry || !place.geometry.location) return;

				// Patch coordinates and formatted address
				this.addTravelPlannerAccountForm.patchValue({
					latitude: place.geometry.location.lat(),
					longitude: place.geometry.location.lng(),
					address: place.formatted_address
				});

				// Extract address components
				place.address_components?.forEach(component => {
					const types = component.types;
					if (types.includes('country')) {
						this.addTravelPlannerAccountForm.patchValue({
							country: component.short_name
						});
					} else if (types.includes('administrative_area_level_1')) {
						this.addTravelPlannerAccountForm.patchValue({
							state: component.short_name
						});
					} else if (types.includes('administrative_area_level_3')) {
						this.addTravelPlannerAccountForm.patchValue({
							city: component.long_name
						});
					} else if (types.includes('postal_code')) {
						this.addTravelPlannerAccountForm.patchValue({
							zipCode: component.long_name
						});
					}
				});
			});
		});
	}

	initallphonefields() {

		const telOptions = {
			initialCountry: 'us',
			preferredCountries: ['us', 'ca', 'mx', 'gb'],
			separateDialCode: true,
			nationalMode: false,
			// autoPlaceholder: 'aggressive',
			utilsScript:
				'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js'
		}



		if (this.officeInput) {
			console.log('onput', this.officeInput, this.officeInput.nativeElement)
			this.OfficeObject = intlTelInput(this.officeInput.nativeElement, telOptions);
			this.officeInput.nativeElement.addEventListener('countrychange', () => {
				const countryData = this.OfficeObject.getSelectedCountryData();
				console.log("in change", countryData)
				this.onCountryChange(countryData, 'office')
			});
		}

		if (this.mobileInput) {
			console.log('onput', this.mobileInput, this.mobileInput.nativeElement)
			this.MobileObject = intlTelInput(this.mobileInput.nativeElement, telOptions);
			this.mobileInput.nativeElement.addEventListener('countrychange', () => {
				const countryData = this.MobileObject.getSelectedCountryData();
				console.log("in change", countryData)
				this.onCountryChange(countryData, 'mobile');
			});
		}

		if (this.faxInput) {
			console.log('onput', this.faxInput, this.faxInput.nativeElement)
			this.FaxObject = intlTelInput(this.faxInput.nativeElement, telOptions);
			this.faxInput.nativeElement.addEventListener('countrychange', () => {
				const countryData = this.FaxObject.getSelectedCountryData();
				console.log("in change", countryData)
				this.onCountryChange(countryData, 'fax')
			});
		}

		if (this.officeNumberInput) {
			console.log('onput', this.officeNumberInput, this.officeNumberInput.nativeElement)
			this.OfficePhoneObject = intlTelInput(this.officeNumberInput.nativeElement, telOptions);
			this.officeNumberInput.nativeElement.addEventListener('countrychange', () => {
				const countryData = this.OfficePhoneObject.getSelectedCountryData();
				console.log("in change", countryData)
				this.onCountryChange(countryData, 'officeNumber')
			});
		}


	}


	changeCountry(selectedCountryCode) {
		let selectedCountryData: any;

		selectedCountryData = this.countryOptions.filter(function (countryOption) {
			return countryOption.countryShortCode == selectedCountryCode;
		});
		if (selectedCountryData) {
			this.stateOptions = selectedCountryData[0].regions;
		}
	}

	telInputObjectOffice(obj) {
		this.OfficeObject = obj;
	}
	telInputObjectMobile(obj) {
		this.MobileObject = obj;
	}
	telInputObjectFax(obj) {
		this.FaxObject = obj;
	}
	telInputObjectOfficePhone(obj) {
		this.OfficePhoneObject = obj;
	}
	onCountryChange(event, type) {
		if (type == 'mobile') {
			console.log("11111", event)
			this.addTravelPlannerAccountForm.patchValue({
				mobileIsd: '+' + event.dialCode,
				mobileCountry: event.iso2
			});
			this.countryCodeName = event.name?.split('(')[0].trim()
		}
		else if (type == 'office') {
			console.log("222222")
			this.addTravelPlannerAccountForm.patchValue({
				officeIsd: '+' + event.dialCode,
				officeCountry: event.iso2
			});
		}
		else if (type == 'officeNumber') {
			console.log("333333")
			this.addTravelPlannerAccountForm.patchValue({
				isd_office_number: '+' + event.dialCode,
				office_country_code: event.iso2
			});
		}
		else {
			console.log("4444444")
			this.addTravelPlannerAccountForm.patchValue({
				faxIsd: '+' + event.dialCode,
				faxCountry: event.iso2
			});
		}
		// console.log(this.countryCode);
	}

	get f() {
		return this.addTravelPlannerAccountForm.controls;
	}

	getTravelAgentData() {
		console.log("In GET travel planner details")
		this.adminService.getTravelPlannerAccount(this.travelPlannerId)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result => {
				this.response = result;

				this.addTravelPlannerAccountForm.patchValue({
					id: this.travelPlannerId,
					firstName: this.response?.data?.first_name,
					middleName: this.response?.data?.middle_name,
					lastName: this.response?.data?.last_name,
					mobile: this.response?.data?.mobile,
					mobileIsd: '+1',
					office: this.response?.data?.office,
					officeIsd: '+1',
					officeNumber: this.response?.data?.officeNumber,
					isd_office_number: '+1',
					agencyName: this.response?.data?.agency_name,
					payee: this.response?.data?.payee,
					iata: this.response?.data?.iata,
					fax: this.response?.data?.fax,
					faxIsd: '+1',
					email: this.response?.data?.email,
					address: this.response?.data?.Address,
					city: this.response?.data?.city,
					state: this.response?.data?.state,
					country: this.response?.data?.country,
					zipCode: this.response?.data?.zipCode,
					companyName: this.response?.data?.company_name,
					department: this.response?.data?.department,
					businessDescription: this.response?.data?.zip,
					// latitude:this.response.data.latitude,
					// longitude:this.response.data.longitude,
				});
				this.spinner.hide();//hide spinner
				this.MobileObject.setCountry(this.response?.data?.mobileCountry);
				this.OfficeObject.setCountry(this.response?.data?.officeCountry);
				this.OfficePhoneObject.setCountry(this.response?.data?.office_country_code);
				this.FaxObject.setCountry(this.response?.data?.faxCountry);
				this.httpClient
					.get("assets/json/countryCodeWithIsd.json")
					.subscribe((data: any) => {
						// this.countryCodeName = data;
						console.log("country code--->", this.countryCodeName)
						let selectedCountryObj = data.find(i => i.code.toLowerCase() == this.response?.data?.mobileCountry)
						this.countryCodeName = selectedCountryObj.name
					});
			});
	}

	submitForm() {
		console.log(this.addTravelPlannerAccountForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addTravelPlannerAccountForm.invalid) {
			return;
		}


		if (this.addTravelPlannerAccountForm.get('address').value != '' && this.addTravelPlannerAccountForm.get('latitude').value == '') {
			this.errors.openDialog({
				errors: {
					error: `<spanclass="text-danger font-weight-bolder text-xl">Please choose the correct address from the dropdown.</span>`
				}
			})
			return;
		}

		console.log(this.addTravelPlannerAccountForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button

		this.adminService.addTravelPlannerAccount(this.addTravelPlannerAccountForm.value, this.travelPlannerId)
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
				console.log("this.response?.data?.id", this.response)
				localStorage.setItem('travelAgent_id', this.response?.data?.id)
				this.router.navigateByUrl('/admin/travel-planner-account/step2').then(() => {
					window.location.reload();
				});
				// this.router.navigate(['/admin/travel-planner-account/step2']);
			});
	}

	resetForm() {
		const keepValues = [
			this.addTravelPlannerAccountForm.controls.mobile.value,
			this.addTravelPlannerAccountForm.controls.id.value,
			this.addTravelPlannerAccountForm.controls.acc_id.value,
			this.addTravelPlannerAccountForm.controls.mobileIsd.value,
			this.addTravelPlannerAccountForm.controls.mobileCountry.value

		];


		// this.addTravelPlannerAccountForm.reset();
		this.buildTravelAgentForm();
		this.addTravelPlannerAccountForm.controls.mobile.patchValue(keepValues[0]);
		this.addTravelPlannerAccountForm.controls.id.patchValue(keepValues[1]);
		this.addTravelPlannerAccountForm.controls.acc_id.patchValue(keepValues[2]);
		this.addTravelPlannerAccountForm.controls.mobileIsd.patchValue(keepValues[3]);
		this.addTravelPlannerAccountForm.controls.mobileCountry.patchValue(keepValues[4]);

		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
	backButton() {
		this.router.navigate(['/admin/travel-planner-account-admin']);
	}

}
