import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';

@Component({
	selector: 'app-add-corporate-account',
	templateUrl: './add-corporate-account.component.html',
	styleUrls: ['./add-corporate-account.component.scss']
})
export class AddCorporateAccountComponent implements OnInit
{

	public addCorporateAccountForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public yearOptions: any = [];
	public HomeObject: any;
	public OfficeObject: any;
	public MobileObject: any;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private mapsAPILoader: MapsAPILoader,
		private ngZone: NgZone,
		private customValidator: CustomvalidationService
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

	ngOnInit(): void
	{
		const currentYear = (new Date()).getFullYear();
		for (let i = 0; i < 40; i++)
		{
			this.yearOptions.push(currentYear + i);
		}
		//google map autocomplete
		this.mapsAPILoader.load().then(() =>
		{
			// this.setCurrentLocation();
			this.geoCoder = new google.maps.Geocoder;
			let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
			autocomplete.addListener("place_changed", () =>
			{
				this.ngZone.run(() =>
				{
					//get the place result
					let place: google.maps.places.PlaceResult = autocomplete.getPlace();
					//verify result
					if (place.geometry === undefined || place.geometry === null)
					{
						return;
					}
					console.log(place);
					//Fill one way form pickup address fields
					this.addCorporateAccountForm.patchValue({
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					});
					if (place.address_components[1])
						this.addCorporateAccountForm.patchValue({
							city: place.address_components[1].long_name
						});
					if (place.address_components[2])
						this.addCorporateAccountForm.patchValue({
							state: place.address_components[2].long_name
						});
					if (place.address_components[3])
						this.addCorporateAccountForm.patchValue({
							country: place.address_components[3].long_name
						});
					if (place.address_components[4])
						this.addCorporateAccountForm.patchValue({
							zipCode: place.address_components[place.address_components.length - 1].long_name
						});
				});
			});
		});

		//add amenity form validation
		this.addCorporateAccountForm = this.formBuilder.group({
			role: ['4', [Validators.required, Validators.pattern("^[0-9].*$")]],//corporate
			firstName: ['', Validators.required],
			middleName: ['', Validators.required],
			lastName: ['', Validators.required],
			home: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			homeIsd: ['+1', Validators.required],
			homeCountry: ['us'],
			office: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			officeIsd: ['+1', Validators.required],
			officeCountry: ['us'],
			mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			mobileIsd: ['+1', Validators.required],
			mobileCountry: ['us'],
			email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
			address: ['', Validators.required],
			city: ['', Validators.required],
			state: ['', Validators.required],
			country: ['', Validators.required],
			zipCode: ['', Validators.required],
			companyName: ['', Validators.required],
			department: ['', Validators.required],
			businessDescription: ['', Validators.required],
			latitude: [''],
			longitude: [''],
			card_type: ['personal', Validators.required],
			number: ['', [Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.minLength(19), Validators.maxLength(19), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			cvc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(3), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			name: ['', Validators.required],
		});
		/* Card Number Spacing */

		$('#card-number').on('keypress change blur', function ()
		{
			$(this).val(function (index, value)
			{
				return value.replace(/[^a-z0-9]+/gi, '').replace(/(.{4})/g, '$1 ');
			});
		});

		$('#card-number').on('copy cut paste', function ()
		{
			setTimeout(function ()
			{
				$('#card-number').trigger("change");
			});
		});
	}

	onCountryChange(event, type)
	{
		if (type == 'mobile')
		{
			this.addCorporateAccountForm.patchValue({
				mobileIsd: '+' + event.dialCode,
				mobileCountry: event.iso2
			});
		}
		else if (type = 'office')
		{
			this.addCorporateAccountForm.patchValue({
				officeIsd: '+' + event.dialCode,
				officeCountry: event.iso2
			});
		}
		else
		{
			this.addCorporateAccountForm.patchValue({
				homeIsd: '+' + event.dialCode,
				homeCountry: event.iso2
			});
		}
		// console.log(this.countryCode);
	}
	telInputObjectHome(obj)
	{
		this.HomeObject = obj;
	}
	telInputObjectOffice(obj)
	{
		this.OfficeObject = obj;
	}
	telInputObjectMobile(obj)
	{
		this.MobileObject = obj;
	}

	get f()
	{
		return this.addCorporateAccountForm.controls;
	}

	submitForm()
	{
		console.log(this.addCorporateAccountForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addCorporateAccountForm.invalid)
		{
			return;
		}

		console.log(this.addCorporateAccountForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button

		this.adminService.addCorporateAccount(this.addCorporateAccountForm.value)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(result =>
			{
				this.response = result;
				this.spinner.hide();//hide spinner
				this.disableSubmitButton = false; //enable submit button

				this.router.navigate(['/admin/corporate-account-admin']);
			});
	}

	resetForm()
	{
		this.addCorporateAccountForm.reset();
	}
	backButton()
	{
		this.router.navigate(['/admin/corporate-account-admin']);
	}

}
