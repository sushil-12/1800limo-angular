import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { HttpClient } from "@angular/common/http";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StateManagementService } from '../../../services/statemanagement.service';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
declare var $: any;
@Component({
	selector: 'app-add-vehicle-rates',
	templateUrl: './add-vehicle-rates.component.html',
	styleUrls: ['./add-vehicle-rates.component.scss']
})
export class AddVehicleRatesComponent implements OnInit
{

	public tree: any;
	public affiliateId: string;
	public paramResponse: any;
	public vehicle_id: string;
	public vehicleTypeId: string;
	public milage_rate_selected: boolean = true;
	public currencyOptions: any = [];
	public currencySymbol: string;
	public vehicleType: string;
	public vehicleColor: string;
	public vehicleMake: string;
	public vehicleModel: string;
	public vehicleYear: string;
	public vehicle_image: string;
	public is_gratuity: string = 'yes';


	public addVehicleRatesForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;

	public response: any;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private stateManagementService: StateManagementService,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private httpClient: HttpClient) { }

	ngOnInit(): void
	{

		this.stateManagementService.setprogressBar(true);
		//pick vehicle id from query params
		this.activatedroute.queryParamMap
			.subscribe((params) =>
			{
				this.paramResponse = { ...params.keys, ...params };
				this.vehicle_id = this.paramResponse.params.vehicleId;
			}
			);
		const currentUser = JSON.parse(sessionStorage.getItem("affiliateUserData"));
		this.affiliateId = sessionStorage.getItem("affiliateId");

		//load list of currencies and show selected currency
		this.httpClient.get("assets/json/currencyOptions.json").subscribe(data =>
		{
			this.currencyOptions = data;
			for (const key of Object.keys(this.currencyOptions))
			{
				if (key.toLowerCase() == currentUser.CellNumberCountry.toLowerCase())
				{
					this.addVehicleRatesForm.patchValue({
						currency: key
					});
					this.changeCurrency(this.currencyOptions[key].symbol);
				}
			}
		})

		//add amenity form validation
		this.addVehicleRatesForm = this.formBuilder.group({
			acc_id: [''],
			affiliate_type: [''],
			vehicle_id: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
			currency: ['$', Validators.required],
			hourly_rate: ['', [Validators.required, Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			hourly_rate_after_five_hours: ['', [Validators.required, Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			hours_day_rate: [8, [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			day_rate: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			km_mile: ['mile', Validators.required],
			milage_rate: [''],
			kilometer_rate: [''],
			minimum_airport_departure_rate: ['', [Validators.required, Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			minimum_airport_arrival_rate: ['', [Validators.required, Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			minimum_city_rate: ['', [Validators.required, Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			minimum_cruise_port_arrival_rate: ['', [Validators.required, Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			minimum_on_demand_rate: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			per_person_group_ride_rate: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			airport_city_percentage_booking_cancel_charges: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			charter_percentage_booking_cancel_charges: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			gratuity: ['20', [Validators.required, Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			rate_range: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			is_gratuity: ['yes', Validators.required],
			amenites_rates: new FormGroup({}),
			airport_arrival_tax_per_us: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			airport_departure_tax_per_us: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			sea_port_tax_per_us: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			city_congestion_tax_per_us: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			city_tax_percent_flat: ['flat'],
			state_tax_percent_flat: ['flat'],
			rate_range_percent_flat: ['flat'],
			vat_percent_flat: ['flat'],
			workman_comp_percent_flat: ['flat'],
			other_transportation_tax_percent_flat: ['flat'],
			city_tax: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			state_tax: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			vat: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			workmans_comp: ['', [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			other_transportation_tax: ['', [Validators.pattern("^[0-9]*$")]],
		});
		//autopopulate values of departure in arrival
		this.addVehicleRatesForm.get('minimum_airport_departure_rate').valueChanges.subscribe(
			value =>
			{
				this.addVehicleRatesForm.patchValue({ minimum_airport_arrival_rate: value });
			}
		);
		this.addVehicleRatesForm.get('hourly_rate').valueChanges.subscribe(
			value =>
			{
				this.addVehicleRatesForm.patchValue({ hourly_rate_after_five_hours: value });
			}
		);


		this.addVehicleRatesForm.get('hourly_rate').valueChanges.subscribe(
			value =>
			{
				this.dayRateCalculations();
			}
		);
		this.addVehicleRatesForm.get('hourly_rate_after_five_hours').valueChanges.subscribe(
			value =>
			{
				this.dayRateCalculations();
			}
		);
		this.addVehicleRatesForm.get('hours_day_rate').valueChanges.subscribe(
			value =>
			{
				this.dayRateCalculations();
			}
		);

		//get selected amenities to show fields
		this.adminService.getVehicleInfo(this.vehicle_id)
			.pipe(
				catchError(err =>
				{
					this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			).subscribe(({ data }: any) =>
			{
				if (data.amenities)
				{
					Object.entries(data.amenities).forEach(
						([key, value]) =>
						{
							this.amenites_rates.addControl(key, this.createItem(value))
						}
					);
				}
				this.vehicleType = data.vehicleType;
				this.vehicleColor = data.vehicleColor;
				this.vehicleMake = data.vehicleMake;
				this.vehicleModel = data.vehicleModel;
				this.vehicleYear = data.vehicleYear;
				this.vehicle_image = data.vehicle_image;
				this.stateManagementService.setprogressBar(false);
			});
		this.km_mile_switch('mile');
	}
	changeGraruity(e)
	{
		if (e.checked)
		{
			this.addVehicleRatesForm.patchValue({
				is_gratuity: 'yes'
			});
		} else
		{
			this.addVehicleRatesForm.patchValue({
				is_gratuity: 'no'
			});
		}
	}

	changeAmenityRate(babySeatKey, babySeatValue)
	{
		//changes in amenity rates formGroup
		if (babySeatValue.label == 'Baby_Seat')
		{
			Object.entries(this.addVehicleRatesForm.value.amenites_rates).forEach(
				([key, value]: any) =>
				{
					if (value.label == 'Booster_Seat' || value.label == 'Baggage_Meet_Dom_' || value.label == 'Baggage_Meet_Int_')
					{
						(this.amenites_rates.get(key) as FormGroup).setValue({ ...value, price: babySeatValue.price });
					}
				});
		}
	}

	get amenites_rates()
	{
		const amenites_rates = this.addVehicleRatesForm.get("amenites_rates") as FormGroup;
		return amenites_rates;
	}
	createItem(e): FormGroup
	{
		return this.formBuilder.group({ ...e });
	}

	km_mile_switch(km_mile)
	{
		switch (km_mile)
		{
			case 'kilometer': {
				this.milage_rate_selected = false;
				this.addVehicleRatesForm.controls['kilometer_rate'].setValidators([Validators.required, Validators.pattern("^[0-9]*(\.[0-9]+)?$")]);
				this.addVehicleRatesForm.controls['milage_rate'].clearValidators();
				break;
			}
			case 'mile': {
				this.milage_rate_selected = true;
				this.addVehicleRatesForm.controls['milage_rate'].setValidators([Validators.required, Validators.pattern("^[0-9]*(\.[0-9]+)?$")]);
				this.addVehicleRatesForm.controls['kilometer_rate'].clearValidators();
				break;
			}
		}
		this.addVehicleRatesForm.controls['milage_rate'].updateValueAndValidity();
		this.addVehicleRatesForm.controls['kilometer_rate'].updateValueAndValidity();
	}

	dayRateCalculations()
	{
		let dayRateValue = (this.addVehicleRatesForm.get('hourly_rate').value * 5) + (this.addVehicleRatesForm.get('hourly_rate_after_five_hours').value * (this.addVehicleRatesForm.get('hours_day_rate').value - 5));
		this.addVehicleRatesForm.patchValue({
			day_rate: dayRateValue
		});
	}

	changeCurrencySymbol(selectedCountryCode)
	{
		for (const key of Object.keys(this.currencyOptions))
		{
			if (key == selectedCountryCode)
			{
				this.changeCurrency(this.currencyOptions[key].symbol);
			}
		}
	}
	changeCurrency(selectedCountrySymbol)
	{
		this.currencySymbol = selectedCountrySymbol;
	}
	get f()
	{
		return this.addVehicleRatesForm.controls;
	}

	submitForm()
	{
		this.submittedForm = true;
		this.addVehicleRatesForm.patchValue({
			vehicle_id: this.vehicle_id
		});
		// stop here if form is invalid
		if (this.addVehicleRatesForm.invalid)
		{
			return;
		}
		this.adminService.setSessionStepsCompleted(5)
		this.adminService.setSessionStepsCompleted(6)
		this.addVehicleRatesForm.value.stepCompleted = this.adminService.getSessionStepsCompleted();

		this.addVehicleRatesForm.value.stepCompleted = this.adminService.getSessionStepsCompleted();;
		this.addVehicleRatesForm.value.affiliate_type = sessionStorage.getItem('affiliateType');
		this.addVehicleRatesForm.value.acc_id = sessionStorage.getItem('affiliateId');

		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button 

		this.adminService.addVehicleRates(this.addVehicleRatesForm.value)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					this.disableSubmitButton = false; //disable submit button
					return throwError(err);
				})
			)
			.subscribe(({ success, data }: any) =>
			{
				this.spinner.hide();//hide spinner
				this.disableSubmitButton = true; //disable submit button

				if (success.errors || success.error)
				{
					this.adminService.unsetSessionStepsCompleted(5)
					this.adminService.unsetSessionStepsCompleted(6)
				}
				if (data.msg)
				{
					sessionStorage.setItem('msg', data.msg)
				}
				this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
					this.router.navigate(['/admin/affiliate/step5'])
				);
			});
	}

	resetForm()
	{
		this.addVehicleRatesForm.reset();
	}

}
