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
export class AddVehicleRatesComponent implements OnInit {

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
	rate_range_object: any = {}
	thumb_value: number = 0;


	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private stateManagementService: StateManagementService,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private httpClient: HttpClient) { }

	ngOnInit(): void {

		// this.stateManagementService.setprogressBar(true);
		//pick vehicle id from query params
		this.activatedroute.queryParamMap
			.subscribe((params) => {
				this.paramResponse = { ...params.keys, ...params };
				this.vehicle_id = this.paramResponse.params.vehicleId;
			}
			);
		const currentUser = JSON.parse(sessionStorage.getItem("affiliateUserData"));
		this.affiliateId = sessionStorage.getItem("affiliateId");

		//load list of currencies and show selected currency
		this.httpClient.get("assets/json/currencyOptions.json").subscribe(data => {
			this.currencyOptions = data;
			for (const key of Object.keys(this.currencyOptions)) {
				if (key.toLowerCase() == currentUser.CellNumberCountry.toLowerCase()) {
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
			hourly_rate: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
			hourly_rate_after_five_hours: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
			hours_day_rate: [8, [Validators.pattern(/^\d+(\.\d+)?$/)]],
			day_rate: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			km_mile: ['mile', Validators.required],
			milage_rate: [2],
			kilometer_rate: [1.71],
			minimum_airport_departure_rate: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
			minimum_airport_arrival_rate: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
			minimum_city_rate: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
			minimum_cruise_port_arrival_rate: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			minimum_cruise_port_departure_rate: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			minimum_on_demand_rate: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			per_person_group_ride_rate: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			in_town_extra_stop: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			outside_town_extra_stop: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			airport_city_percentage_booking_cancel_charges: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			charter_percentage_booking_cancel_charges: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			gratuity: ['20', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
			rate_range: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			is_gratuity: ['yes', Validators.required],
			amenites_rates: new FormGroup({}),
			airport_arrival_tax_per_us: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			airport_departure_tax_per_us: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			sea_port_tax_per_us: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			city_congestion_tax_per_us: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			city_tax_percent_flat: ['flat'],
			state_tax_percent_flat: ['flat'],
			rate_range_percent_flat: ['flat'],
			vat_percent_flat: ['flat'],
			workman_comp_percent_flat: ['flat'],
			other_transportation_tax_percent_flat: ['flat'],
			city_tax: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			state_tax: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			vat: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			workmans_comp: ['', [Validators.pattern(/^\d+(\.\d+)?$/)]],
			other_transportation_tax: ['', [Validators.pattern("^[0-9]*$")]],
			early_late_charges: [0, [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			holiday_charges: [0, [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
			friday_saturday_charges: [0, [Validators.pattern("^[0-9]*(\.[0-9]+)?$")]],
		});
		//autopopulate values of departure in arrival
		this.addVehicleRatesForm.get('minimum_airport_departure_rate').valueChanges.subscribe(
			value => {
				this.addVehicleRatesForm.patchValue({ minimum_airport_arrival_rate: value });
			}
		);
		this.addVehicleRatesForm.get('hourly_rate').valueChanges.subscribe(
			value => {
				this.addVehicleRatesForm.patchValue({ hourly_rate_after_five_hours: value });
			}
		);


		this.addVehicleRatesForm.get('hourly_rate').valueChanges.subscribe(
			value => {
				this.dayRateCalculations();
			}
		);
		this.addVehicleRatesForm.get('hourly_rate_after_five_hours').valueChanges.subscribe(
			value => {
				this.dayRateCalculations();
			}
		);
		this.addVehicleRatesForm.get('hours_day_rate').valueChanges.subscribe(
			value => {
				this.dayRateCalculations();
			}
		);

		//get selected amenities to show fields
		this.adminService.getVehicleInfo(this.vehicle_id)
			.pipe(
				catchError(err => {
					// this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			).subscribe(({ data }: any) => {
				if (data.amenities) {
					Object.entries(data.amenities).forEach(
						([key, value]) => {
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
				// this.stateManagementService.setprogressBar(false);
			});
		this.km_mile_switch('mile');
		this.initRateRangeObject();
		this.updateRateRangeObject()
	}
	changeGraruity(e) {
		if (e.checked) {
			this.addVehicleRatesForm.patchValue({
				is_gratuity: 'yes'
			});
		} else {
			this.addVehicleRatesForm.patchValue({
				is_gratuity: 'no'
			});
		}
	}
	handleChangeMCPAR(value) {

		this.addVehicleRatesForm.patchValue({
			minimum_cruise_port_departure_rate: value ? value : null
		})
	}

	changeAmenityRate(babySeatKey, babySeatValue) {
		//changes in amenity rates formGroup
		if (babySeatValue.label == 'Baby_Seat') {
			Object.entries(this.addVehicleRatesForm.value.amenites_rates).forEach(
				([key, value]: any) => {
					if (value.label == 'Booster_Seat' || value.label == 'Baggage_Meet_Dom_' || value.label == 'Baggage_Meet_Int_') {
						(this.amenites_rates.get(key) as FormGroup).setValue({ ...value, price: babySeatValue.price });
					}
				});
		}
	}
	get form() {
		return this.addVehicleRatesForm.controls
	}
	changeThumb(value: number, style?: string) {
		if (style == '+') {
			this.getRateRange(this.thumb_value + value)
		}
		if (style == '-') {
			this.getRateRange(this.thumb_value - value)
		}
	}


	/**
	 * build a new object with keys as the form control names and and values as the value of those controls.
	 */
	initRateRangeObject(): boolean {
		let form_control_names = ['milage_rate', 'kilometer_rate', 'hourly_rate', 'hourly_rate_after_five_hours',
			'day_rate', 'minimum_city_rate', 'minimum_airport_departure_rate', 'minimum_airport_arrival_rate',
			'minimum_cruise_port_arrival_rate', 'minimum_cruise_port_departure_rate', 'in_town_extra_stop', 'outside_town_extra_stop',
			'airport_city_percentage_booking_cancel_charges', 'per_person_group_ride_rate']
		form_control_names.forEach((name: string) => {
			this.rate_range_object[name] = this.addVehicleRatesForm.get(name).value ?? 0
		})
		console.log('Rate Range Object Initialised ', this.rate_range_object)
		return true
	}
	updateRateRangeObject() {
		for (let form_name in this.rate_range_object) {
			try {
				// console.log(form_name,typeof this.addVehicleRatesForm.get(form_name).value)
				this.rate_range_object[form_name] = parseFloat(this.addVehicleRatesForm.get(form_name).value.toFixed(2))
			}
			catch (err) {
				console.log(form_name, typeof this.addVehicleRatesForm.get(form_name).value, err)
			}
		}
		console.log(this.rate_range_object)
	}

	/**
 * 
 * @param range_value current value of the slider
 */
	getRateRange(range_value: number) {
		console.log('range_value', range_value)
		this.thumb_value = range_value
		this.SetFormValue('rate_range', range_value)
		// --------- For Flat ------------------
		if (this.form.rate_range_percent_flat.value == 'flat') {
			// for neutral
			if (range_value == 0) {
				console.log('B')
				for (const key in this.rate_range_object) {
					this.SetFormValue('rate_range', '0')
					this.SetFormValue(key, this.rate_range_object[key])
				}
			}

			// for negative side indicator
			if (range_value < 0) {
				for (const key in this.rate_range_object) {
					this.rate_range_object[key] == null && this.SetFormValue(key, 0)	// set 0 if null
					// decrease by number and set value upto two decimal places and update
					// let value = Math.round(Number.EPSILON + (Math.abs(parseInt(this.rate_range_object[key])) - Math.abs(range_value)) * 100) / 100
					let value = parseFloat(Math.abs(this.rate_range_object[key] - Math.abs(range_value)).toFixed(2))
					this.SetFormValue(key, value)
				}
			}

			// for positive side indicator
			if (range_value > 0) {
				for (const key in this.rate_range_object) {
					this.rate_range_object[key] == null && this.SetFormValue(key, 0) 	// set 0 if null

					// let value = this.rate_range_object[key]
					// increase by number and set value upto two decimal places and update
					// let value = Math.round(Number.EPSILON + (Math.abs(parseInt(this.rate_range_object[key])) + Math.abs(range_value)) * 100) / 100
					let value = parseFloat(Math.abs(this.rate_range_object[key] + Math.abs(range_value)).toFixed(2))
					this.SetFormValue(key, value)
				}
			}
			console.log(this.rate_range_object)
		}
		// -------------- For Percentage ------------------
		else {
			// for neutral
			if (range_value == 0) {
				for (const key in this.rate_range_object) {
					this.SetFormValue('rate_range', '0')
					this.SetFormValue(key, this.rate_range_object[key])
				}
			}
			// for negative side indicator
			if (range_value < 0) {
				for (const key in this.rate_range_object) {
					this.rate_range_object[key] == null && this.SetFormValue(key, 0)	// set 0 if null

					// decrease by percentage and set value upto two decimal places and update
					let percentage_value = this.rate_range_object[key] - (this.rate_range_object[key] * Math.abs(range_value) / 100)
					let value = Math.round(Number.EPSILON + percentage_value * 100) / 100
					this.SetFormValue(key, value)
				}
			}

			// for positive side indicator
			if (range_value > 0) {
				for (const key in this.rate_range_object) {
					this.rate_range_object[key] == null && this.SetFormValue(key, 0)	// set 0 if null

					// decrease by percentage and set value upto two decimal places and update
					let percentage_value = this.rate_range_object[key] + (this.rate_range_object[key] * Math.abs(range_value) / 100)
					let value = Math.round(Number.EPSILON + percentage_value * 100) / 100
					this.SetFormValue(key, value)
				}
			}
		}
	}

	/**
 * Set the specified value into form
 * 
 * @params form_control: String [Required] Form Control name
 * @params value: String [Required] value to be saved in form
 */
	SetFormValue(form_control: string, value: any) {
		console.info('Setting Value of ', form_control, ': ', value)
		this.addVehicleRatesForm.get(form_control).setValue(value)
		this.addVehicleRatesForm.updateValueAndValidity()
	}

	get amenites_rates() {
		const amenites_rates = this.addVehicleRatesForm.get("amenites_rates") as FormGroup;
		return amenites_rates;
	}
	createItem(e): FormGroup {
		return this.formBuilder.group({ ...e });
	}

	km_mile_switch(km_mile) {
		switch (km_mile) {
			case 'kilometer': {
				this.milage_rate_selected = false;
				console.log('set validator for km')
				this.addVehicleRatesForm.get('kilometer_rate')?.setValidators([Validators.required, Validators.pattern("^[0-9]*(\.[0-9]+)?$"), Validators.min(1.72)]); // Set back the validator
				this.addVehicleRatesForm.get('milage_rate')?.clearValidators(); // Clear the validator
				this.addVehicleRatesForm.get('kilometer_rate')?.updateValueAndValidity();
				this.addVehicleRatesForm.get('milage_rate')?.updateValueAndValidity();
				break;
			}
			case 'mile': {
				this.milage_rate_selected = true;
				this.addVehicleRatesForm.get('milage_rate')?.setValidators([Validators.required, Validators.pattern("^[0-9]*(\.[0-9]+)?$"), Validators.min(2.1)]); // Set back the validator
				this.addVehicleRatesForm.get('kilometer_rate')?.clearValidators();
				this.addVehicleRatesForm.get('milage_rate')?.updateValueAndValidity()
				this.addVehicleRatesForm.get('kilometer_rate')?.updateValueAndValidity();
				break;
			}
		}
		this.addVehicleRatesForm.controls['milage_rate'].updateValueAndValidity();
		this.addVehicleRatesForm.controls['kilometer_rate'].updateValueAndValidity();
	}

	dayRateCalculations() {
		let dayRateValue = (this.addVehicleRatesForm.get('hourly_rate').value * 5) + (this.addVehicleRatesForm.get('hourly_rate_after_five_hours').value * (this.addVehicleRatesForm.get('hours_day_rate').value - 5));
		this.addVehicleRatesForm.patchValue({
			day_rate: dayRateValue
		});
	}

	changeCurrencySymbol(selectedCountryCode) {
		for (const key of Object.keys(this.currencyOptions)) {
			if (key == selectedCountryCode) {
				this.changeCurrency(this.currencyOptions[key].symbol);
			}
		}
	}
	changeCurrency(selectedCountrySymbol) {
		this.currencySymbol = selectedCountrySymbol;
	}
	get f() {
		return this.addVehicleRatesForm.controls;
	}

	IsZeroValidator(value: any, form_control: string) {
		if (value == 0) {
			this.addVehicleRatesForm.get(form_control).setValue(null);
			this.addVehicleRatesForm.updateValueAndValidity();
			return true;
		}
		return false;
	}

	submitForm() {
		this.submittedForm = true;
		this.addVehicleRatesForm.patchValue({
			vehicle_id: this.vehicle_id
		});
		// stop here if form is invalid
		if (this.addVehicleRatesForm.invalid) {
			return;
		}
		this.addVehicleRatesForm.value.stepCompleted = this.adminService.getUpdatedStepsLocal('5');

		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button 

		this.adminService.addVehicleRates(this.addVehicleRatesForm.value)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					this.disableSubmitButton = false; //disable submit button
					return throwError(err);
				})
			)
			.subscribe(({ success, data }: any) => {
				this.spinner.hide();//hide spinner
				this.disableSubmitButton = true; //disable submit button

				if (success == true) {
					this.adminService.updateStepsLocal('5');
				}
				if (data.msg) {
					sessionStorage.setItem('msg', data.msg)
				}
				this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
					this.router.navigate(['/admin/affiliate/step6'])
				);
			});
	}

	resetForm() {
		this.addVehicleRatesForm.reset();
	}

}
