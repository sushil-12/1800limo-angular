import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { AdminService } from '../../../services/admin.service';
import { IndividualService } from '../../../services/individual.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CustomvalidationService } from '../../../services/customvalidation.service';
declare var $: any;

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

	public addIndividualAccountForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public cardDetails: any;
	public yearOptions: any = [];
	public MobileObject: any;
	public WorkObject: any;
	cardToDelete: any;
	alertMessage: string;
	currentUser: any;
	defaultCountryCode: string;
	is_family_member: any = false;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private mapsAPILoader: MapsAPILoader,
		private ngZone: NgZone,
		private customValidator: CustomvalidationService,
		private individualService: IndividualService,
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

	ngOnInit(): void {
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
		this.buildAddIndividualForm();

		const currentYear = (new Date()).getFullYear();
		for (let i = 0; i < 40; i++) {
			this.yearOptions.push(currentYear + i);
		}
		if (this.currentUser?.is_profile_complete) {
			this.getProfile()
		}
		else {
			this.addIndividualAccountForm.patchValue({
				mobile: this.currentUser?.phone,
				mobileIsd: this.currentUser?.isd,
				mobileCountry: this.currentUser?.phoneCountry
			})
			this.defaultCountryCode = this.currentUser?.phoneCountry
		}

		this.is_family_member = localStorage.getItem("is_family_member") ? localStorage.getItem("is_family_member") : false
		console.log("is_family_member", this.is_family_member)

		//google map autocomplete
		this.mapsAPILoader.load().then(() => {
			// this.setCurrentLocation();
			this.geoCoder = new google.maps.Geocoder;
			let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
			autocomplete.addListener("place_changed", () => {
				console.log('auto fill address-->>>')
				this.ngZone.run(() => {
					//get the place result
					let place: google.maps.places.PlaceResult = autocomplete.getPlace();
					//verify result
					if (place.geometry === undefined || place.geometry === null) {
						return;
					}
					console.log(place);
					this.addIndividualAccountForm.patchValue({
						zipCode: '',
						city: '',
						state: '',
						country: ''
					})
					this.addIndividualAccountForm.patchValue({
						address: place.formatted_address
					})
					//Fill one way form pickup address fields
					this.addIndividualAccountForm.patchValue({
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					});
					place.address_components.forEach(component => {
						const types = component.types;

						if (types.includes('postal_code')) {
							this.addIndividualAccountForm.patchValue({
								zipCode: component.long_name
							});
						} else if (types.includes('locality')) {
							this.addIndividualAccountForm.patchValue({
								city: component.long_name
							});
						} else if (types.includes('administrative_area_level_1')) {
							this.addIndividualAccountForm.patchValue({
								state: component.long_name
							});
						} else if (types.includes('country')) {
							this.addIndividualAccountForm.patchValue({
								country: component.long_name
							});
						}
					});
					// if (place.address_components[1])
					// 	this.addIndividualAccountForm.patchValue({
					// 		city: place.address_components[1].long_name
					// 	});
					// if (place.address_components[2])
					// 	this.addIndividualAccountForm.patchValue({
					// 		state: place.address_components[2].long_name
					// 	});
					// if (place.address_components[3])
					// 	this.addIndividualAccountForm.patchValue({
					// 		country: place.address_components[3].long_name
					// 	});
					// if (place.address_components[4])
					// 	this.addIndividualAccountForm.patchValue({
					// 		zipCode: place.address_components[place.address_components.length - 1].long_name
					// 	});
				});
			});
		});

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

	getProfile() {
		this.individualService.getIndividualAccountDetails()
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result => {
				this.response = result;
				this.cardDetails = this.response?.data?.cards
				this.addIndividualAccountForm.patchValue({
					smsOptIn: this.response?.data?.sms_optin == 1 ? true : false,
					firstName: this.response?.data?.first_name,
					middleName: this.response?.data?.middle_name,
					lastName: this.response?.data?.last_name,
					mobile: this.response?.data?.mobile,
					mobileIsd: this.response?.data?.mobileIsd,
					mobileCountry: this.response?.data?.mobileCountry,
					work: this.response?.data?.work_contact_number,
					workCountry: this.response?.data?.workCountry,
					workIsd: this.response?.data?.workIsd,
					email: this.response?.data?.email,
					address: this.response?.data?.address,
					city: this.response?.data?.city,
					state: this.response?.data?.state,
					country: this.response?.data?.country,
					zipCode: this.response?.data?.zip,
					latitude: this.response?.data?.latitude,
					longitude: this.response?.data?.longitude,
				});
				this.spinner.hide();//hide spinner
				this.MobileObject.setCountry(this.response?.data?.mobileCountry);
				this.WorkObject.setCountry(this.response?.data?.workCountry);

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
			workIsd: ['+1'],
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
			cvc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(5), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			name: ['', Validators.required],
			smsOptIn: [false, Validators.requiredTrue]  // Ensures the checkbox must be checked

		});
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
		if (this.response?.data?.cards?.length > 0) {
			console.log("in check if cards list to clear validators")
			this.addIndividualAccountForm.controls['card_type'].clearValidators();
			this.addIndividualAccountForm.controls['card_type'].updateValueAndValidity()
			this.addIndividualAccountForm.controls['number'].clearValidators();
			this.addIndividualAccountForm.controls['number'].updateValueAndValidity()
			this.addIndividualAccountForm.controls['cvc'].clearValidators();
			this.addIndividualAccountForm.controls['cvc'].updateValueAndValidity()
			this.addIndividualAccountForm.controls['name'].clearValidators();
			this.addIndividualAccountForm.controls['name'].updateValueAndValidity()
			this.addIndividualAccountForm.controls['exp_year'].clearValidators();
			this.addIndividualAccountForm.controls['exp_year'].updateValueAndValidity()
			this.addIndividualAccountForm.controls['exp_month'].clearValidators();
			this.addIndividualAccountForm.controls['exp_month'].updateValueAndValidity()

		}
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
		console.log(this.addIndividualAccountForm.value)
		this.individualService.createIndividualAccount(this.addIndividualAccountForm.value, this.currentUser?.is_profile_complete)
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
				if (this.response?.data?.is_profile_complete) {
					this.currentUser['is_profile_complete'] = 1
					this.currentUser['name'] = this.response?.data?.first_name + ' ' + this.response?.data?.last_name
					// this.currentUser['account_id'] = this.response?.data?.acc_id
					localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
				}
				this.router.navigate(['/individual/bookings']);
			});
	}

	resetForm() {
		console.log("reset clicked")
		const keepValues = [
			this.addIndividualAccountForm.controls.mobile.value,
			this.addIndividualAccountForm.controls.mobileIsd.value,
			this.addIndividualAccountForm.controls.mobileCountry.value

		];

		this.buildAddIndividualForm();
		this.addIndividualAccountForm.controls.mobile.patchValue(keepValues[0]);
		this.addIndividualAccountForm.controls.mobileIsd.patchValue(keepValues[1]);
		this.addIndividualAccountForm.controls.mobileCountry.patchValue(keepValues[2]);
	}
	// backButton()
	// {
	// 	this.router.navigate(['/admin/individual-account-admin']);
	// }

	enableDisableClicked(id) {
		this.cardToDelete = id;
		this.alertMessage = "Are you sure you want to delete this Card?"
	}

	addCardClick() {
		this.router.navigate(['/individual/add-card'])
	}

	deleteCard() {
		this.spinner.show();
		this.individualService.deleteIndividualCreditCard(this.cardToDelete)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.spinner.hide()
				$('#deleteConfirmationModal').modal('hide');
				this.getProfile()
			});
	}

}
