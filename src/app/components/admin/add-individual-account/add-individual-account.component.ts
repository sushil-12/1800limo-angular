import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CustomvalidationService } from '../../../services/customvalidation.service';


@Component({
	selector: 'app-add-individual-account',
	templateUrl: './add-individual-account.component.html',
	styleUrls: ['./add-individual-account.component.scss']
})
export class AddIndividualAccountComponent implements OnInit
{

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
					this.addIndividualAccountForm.patchValue({
						address: place.formatted_address
					})
					//Fill one way form pickup address fields
					this.addIndividualAccountForm.patchValue({
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					});
					if (place.address_components[1])
						this.addIndividualAccountForm.patchValue({
							city: place.address_components[1].long_name
						});
					if (place.address_components[2])
						this.addIndividualAccountForm.patchValue({
							state: place.address_components[2].long_name
						});
					if (place.address_components[3])
						this.addIndividualAccountForm.patchValue({
							country: place.address_components[3].long_name
						});
					if (place.address_components[4])
						this.addIndividualAccountForm.patchValue({
							zipCode: place.address_components[place.address_components.length - 1].long_name
						});
				});
			});
		});

		//add amenity form validation
		this.addIndividualAccountForm = this.formBuilder.group({
			role: ['5', [Validators.required, Validators.pattern("^[0-9].*$")]],//individual
			firstName: ['', Validators.required],
			middleName: [''],
			lastName: ['', Validators.required],
			mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]],
			mobileIsd: ['+1', Validators.required],
			mobileCountry: ['us'],
			work: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]],
			workIsd: ['+1', Validators.required],
			workCountry: ['us'],
			email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
			address: ['', Validators.required],
			city: ['', Validators.required],
			state: ['', Validators.required],
			country: ['', Validators.required],
			zipCode: ['', Validators.required],
			latitude: [''],
			longitude: [''],
			card_type: ['personal', Validators.required],
			number: ['', [Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.maxLength(18), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			cvc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(5), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			name: ['', Validators.required],
		});
		/* Card Number Spacing */

		$('#card-number').on('keypress change blur', function ()
		{
			$(this).val(function (index, value)
			{
				return value.replace(/[^a-z0-9]+/gi, '')
				// .replace(/(.{4})/g, '$1 ')
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
			this.addIndividualAccountForm.patchValue({
				mobileIsd: '+' + event.dialCode,
				mobileCountry: event.iso2
			});
		}
		else
		{
			this.addIndividualAccountForm.patchValue({
				workIsd: '+' + event.dialCode,
				workCountry: event.iso2
			});
		}
		// console.log(this.countryCode);
	}
	telInputObjectMobile(obj)
	{
		this.MobileObject = obj;
	}
	telInputObjectWork(obj)
	{
		this.WorkObject = obj;
	}
	get f()
	{
		return this.addIndividualAccountForm.controls;
	}

	submitForm()
	{
		console.log(this.addIndividualAccountForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addIndividualAccountForm.invalid)
		{
			return;
		}

		console.log(this.addIndividualAccountForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button
		console.log(this.addIndividualAccountForm.value)
		this.adminService.addAccount(this.addIndividualAccountForm.value)
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

				this.router.navigate(['/admin/individual-account-admin']);
			});
	}

	resetForm()
	{
		this.addIndividualAccountForm.reset();
	}
	backButton()
	{
		this.router.navigate(['/admin/individual-account-admin']);
	}

}
