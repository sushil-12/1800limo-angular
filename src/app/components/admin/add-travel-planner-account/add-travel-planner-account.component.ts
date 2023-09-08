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
	selector: 'app-add-travel-planner-account',
	templateUrl: './add-travel-planner-account.component.html',
	styleUrls: ['./add-travel-planner-account.component.scss']
})
export class AddTravelPlannerAccountComponent implements OnInit
{

	public addTravelPlannerAccountForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public yearOptions: any = [];
	public OfficeObject: any;
	public MobileObject: any;
	public FaxObject: any;
	public OfficePhoneObject: any;


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
					this.addTravelPlannerAccountForm.patchValue({
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng(),
						address : place?.formatted_address
					  });
						for (var i = 0; i < place.address_components.length; i++) {
						for (var j = 0; j < place.address_components[i].types.length; j++) {
							if (place.address_components[i].types[j] == "country") {
								this.addTravelPlannerAccountForm.patchValue({
									country: place.address_components[i].long_name
								});
								// this.changeCountry(place.address_components[i].short_name)
							}
							else if (place.address_components[i].types[j] == "administrative_area_level_1") {
								this.addTravelPlannerAccountForm.patchValue({
									state: place.address_components[i].long_name
								});
							}
							else if (place.address_components[i].types[j] == "administrative_area_level_3") {
								this.addTravelPlannerAccountForm.patchValue({
									city: place.address_components[i].long_name
								});
							}
							else if (place.address_components[i].types[j] == "postal_code") {
								this.addTravelPlannerAccountForm.patchValue({
									zipCode: place.address_components[i].long_name
								});
							}
							else if (place.address_components[i].types[j] == "street_number") {
								this.addTravelPlannerAccountForm.patchValue({
									street: place.address_components[i].long_name
								});
							}
						}
					}
					//Fill one way form pickup address fields
					// this.addTravelPlannerAccountForm.patchValue({
					// 	latitude: place.geometry.location.lat(),
					// 	longitude: place.geometry.location.lng()
					// });
					// if (place.address_components[1])
					// 	this.addTravelPlannerAccountForm.patchValue({
					// 		city: place.address_components[1].long_name
					// 	});
					// if (place.address_components[2])
					// 	this.addTravelPlannerAccountForm.patchValue({
					// 		state: place.address_components[2].long_name
					// 	});
					// if (place.address_components[3])
					// 	this.addTravelPlannerAccountForm.patchValue({
					// 		country: place.address_components[3].long_name
					// 	});
					// if (place.address_components[4])
					// 	this.addTravelPlannerAccountForm.patchValue({
					// 		zipCode: place.address_components[place.address_components.length - 1].long_name
					// 	});
				});
				
			});
		});

		//add amenity form validation
		this.addTravelPlannerAccountForm = this.formBuilder.group({
			role: ['3', [Validators.required, Validators.pattern("^[0-9].*$")]],//travelPlanner
			firstName: ['', Validators.required],
			middleName: ['', Validators.required],
			lastName: ['', Validators.required],
			office: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			officeIsd: ['+1', Validators.required],
			officeCountry: ['us'],
			mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			mobileIsd: ['+1', Validators.required],
			mobileCountry: ['us'],
			email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/i)]],
			address: ['', Validators.required],
			city: ['', Validators.required],
			state: ['', Validators.required],
			country: ['', Validators.required],
			zipCode: ['', Validators.required],
			agencyName: ['', Validators.required],
			payee: ['', Validators.required],
			iata: ['', Validators.required],
			fax: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			faxIsd: ['+1', Validators.required],
			faxCountry: ['us'],
			officeNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			isd_office_number: ['+1', Validators.required],
			office_country_code: ['us'],
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
	telInputObjectOffice(obj)
	{
		this.OfficeObject = obj;
	}
	telInputObjectMobile(obj)
	{
		this.MobileObject = obj;
	}
	telInputObjectFax(obj)
	{
		this.FaxObject = obj;
	}
	telInputObjectOfficePhone(obj)
	{
		this.OfficePhoneObject = obj;
	}
	onCountryChange(event, type)
	{
		if (type == 'mobile')
		{
			console.log("11111")
			this.addTravelPlannerAccountForm.patchValue({
				mobileIsd: '+' + event.dialCode,
				mobileCountry: event.iso2
			});
		}
		else if (type == 'office')
		{
			console.log("222222")
			this.addTravelPlannerAccountForm.patchValue({
				officeIsd: '+' + event.dialCode,
				officeCountry: event.iso2
			});
		}
		else if (type == 'officeNumber')
		{
			console.log("333333")
			this.addTravelPlannerAccountForm.patchValue({
				isd_office_number: '+' + event.dialCode,
				office_country_code: event.iso2
			});
		}
		else
		{
			console.log("4444444")
			this.addTravelPlannerAccountForm.patchValue({
				faxIsd: '+' + event.dialCode,
				faxCountry: event.iso2
			});
		}
		// console.log(this.countryCode);
	}

	get f()
	{
		return this.addTravelPlannerAccountForm.controls;
	}

	submitForm()
	{
		console.log(this.addTravelPlannerAccountForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addTravelPlannerAccountForm.invalid)
		{
			return;
		}

		console.log(this.addTravelPlannerAccountForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button

		this.adminService.addTravelPlannerAccount(this.addTravelPlannerAccountForm.value)
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

				this.router.navigate(['/admin/travel-planner-account-admin']);
			});
	}

	resetForm()
	{
		this.addTravelPlannerAccountForm.reset();
	}
	backButton()
	{
		this.router.navigate(['/admin/travel-planner-account-admin']);
	}

}
