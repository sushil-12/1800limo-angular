import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
	selector: 'app-edit-travel-planner-account',
	templateUrl: './edit-travel-planner-account.component.html',
	styleUrls: ['./edit-travel-planner-account.component.scss']
})
export class EditTravelPlannerAccountComponent implements OnInit
{

	public editTravelPlannerAccountForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public travelPlannerId: string;
	public paramResponse: any;
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
		private ngZone: NgZone
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
		this.spinner.show();//hide spinner

		//pick vehicle type id from query params
		this.activatedroute.queryParamMap
			.subscribe((params) =>
			{
				this.paramResponse = { ...params.keys, ...params };
				// console.log(this.paramResponse.params.vehicleTypeId);
				this.travelPlannerId = this.paramResponse.params.travelPlannerId;
				// console.log(this.vehicleId);
			}
			);

		//fetch data to display on edit screen
		this.adminService.getTravelPlannerAccount(this.travelPlannerId)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result =>
			{
				this.response = result;

				this.editTravelPlannerAccountForm.patchValue({
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
			});

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
					this.editTravelPlannerAccountForm.patchValue({
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					});
					for (var i = 0; i < place.address_components.length; i++) {
						for (var j = 0; j < place.address_components[i].types.length; j++) {
							if (place.address_components[i].types[j] == "country") {
								this.editTravelPlannerAccountForm.patchValue({
									country: place.address_components[i].long_name
								});
							}
							else if (place.address_components[i].types[j] == "administrative_area_level_1") {
								this.editTravelPlannerAccountForm.patchValue({
									state: place.address_components[i].long_name
								});
							}
							else if (place.address_components[i].types[j] == "administrative_area_level_3") {
								this.editTravelPlannerAccountForm.patchValue({
									city: place.address_components[i].long_name
								});
							}
							else if (place.address_components[i].types[j] == "postal_code") {
								this.editTravelPlannerAccountForm.patchValue({
									zipCode: place.address_components[i].long_name
								});
							}
							else if (place.address_components[i].types[j] == "street_number") {
								this.editTravelPlannerAccountForm.patchValue({
									address: place.address_components[i].long_name
								});
							}
						}
					}
					// if (place.address_components[1])
					// 	this.editTravelPlannerAccountForm.patchValue({
					// 		city: place.address_components[1].long_name
					// 	});
					// if (place.address_components[2])
					// 	this.editTravelPlannerAccountForm.patchValue({
					// 		state: place.address_components[2].long_name
					// 	});
					// if (place.address_components[3])
					// 	this.editTravelPlannerAccountForm.patchValue({
					// 		country: place.address_components[3].long_name
					// 	});
					// if (place.address_components[4])
					// 	this.editTravelPlannerAccountForm.patchValue({
					// 		zipCode: place.address_components[place.address_components.length - 1].long_name
					// 	});
				});
			});
		});

		//add amenity form validation
		this.editTravelPlannerAccountForm = this.formBuilder.group({
			id: ['', [Validators.required, Validators.pattern("^[0-9].*$")]],//travelPlanner
			role: ['3', [Validators.required, Validators.pattern("^[0-9].*$")]],//travelPlanner
			firstName: ['', Validators.required],
			middleName: [''],
			lastName: ['', Validators.required],
			office: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
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
			fax: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			faxIsd: ['+1', Validators.required],
			faxCountry: ['us'],
			officeNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			isd_office_number: ['+1', Validators.required],
			office_country_code: ['us'],
			latitude: [''],
			longitude: [''],
		});
	}

	onCountryChange(event, type)
	{
		if (type == 'mobile')
		{
			this.editTravelPlannerAccountForm.patchValue({
				mobileIsd: '+' + event.dialCode,
				mobileCountry: event.iso2
			});
		}
		else if (type == 'office')
		{
			this.editTravelPlannerAccountForm.patchValue({
				officeIsd: '+' + event.dialCode,
				officeCountry: event.iso2
			});
		}
		else if (type == 'officeNumber')
		{
			this.editTravelPlannerAccountForm.patchValue({
				isd_office_number: '+' + event.dialCode,
				office_country_code: event.iso2
			});
		}
		else
		{
			this.editTravelPlannerAccountForm.patchValue({
				faxIsd: '+' + event.dialCode,
				faxCountry: event.iso2
			});
		}
		// console.log(this.countryCode);
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
	get f()
	{
		return this.editTravelPlannerAccountForm.controls;
	}

	submitForm()
	{
		console.log(this.editTravelPlannerAccountForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.editTravelPlannerAccountForm.invalid)
		{
			return;
		}

		console.log(this.editTravelPlannerAccountForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button

		this.adminService.updateTravelPlannerAccount(this.editTravelPlannerAccountForm.value)
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
		this.editTravelPlannerAccountForm.reset();
	}
	backButton()
	{
		this.router.navigate(['/admin/travel-planner-account-admin']);
	}

}
