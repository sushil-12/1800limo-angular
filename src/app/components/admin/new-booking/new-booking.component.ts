import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { AdminService } from 'src/app/services/admin.service';
import { SharedModule } from 'src/app/components/shared/shared.module'


@Component({
	selector: 'app-new-booking',
	templateUrl: './new-booking.component.html',
	styleUrls: ['./new-booking.component.scss']
})
export class NewBookingComponent implements OnInit
{
	booking_params: any = {
		transfer_types: ['airport_to_city', 'city_to_airport'],
		client_account_types: ['individual', 'corporate', 'travel_planner', 'loose_customer'],
		affiliate_accounts: ['affiliate', 'loose_affiliate'],
		numbers: (() =>
		{
			let arr = []
			for (let i = 1; i < 20; i++)
			{
				arr.push(i)
			}
			return arr
		})()
	}

	BookingForm: FormGroup

	BigData: any
	ClientAccounts: Array<Record<string, any>> = []
	AffiliateAccounts: Array<Record<string, any>> = []
	VehicleList: Array<Record<string, any>> = []
	DriverList: Array<Record<string, any>> = []







	is_booking_edit_case: boolean = false


	constructor(
		private $form: FormBuilder,
		private $api: AdminService,
		private $shared: SharedModule
	) { }

	ngOnInit(): void
	{
		// build the form first 
		this.buildBookingForm()
		// fetch the big data
		this.fetchAirportsAndBigData().then((data: any) =>
		{
			this.BigData = data
		})

		// Subscriptions
		this.Subscriptions()
	}

	textFormatter(text: string)
	{
		return text.replace(/[\\\-\_]+/g, ' ')
	}

	/**
	 * Returns true/false depending on the existence of search_string in text.
	 * @param text [Required] text where to search ?
	 * @param search_string [Required] text what to search ?
	 * @param start [Optional] search starting point. Default 0
	 * @returns boolean
	 */
	searchSubstring(text: string, search_string: any, start: number = 0): boolean
	{
		if (search_string instanceof RegExp)
		{
			throw TypeError('Required String but instead got Regular Expression: ' + search_string)
		}
		return text.indexOf(search_string, start) != -1
	}


	/**
	 * Booking Form
	 */
	buildBookingForm()
	{
		this.BookingForm = this.$form.group({
			service_type: ['one_way', Validators.required],
			transfer_type: ['city_to_city', Validators.required],
			return_transfer_type: ['city_to_city', Validators.required],
			acc_id: [''],
			account_type: ['individual', Validators.required],
			passenger_name: [''],
			passenger_email: [''],
			passenger_cell: [''],
			passenger_cell_isd: [''],
			total_passengers: ['1'],
			luggage_count: ['1'],
			booking_instructions: [''],
			affiliate_type: ['affiliate', Validators.required],
			affiliate_id: [''],
			vehicle_type: [''],
			vehicle_id: [''],
			vehicle_make: [''],
			vehicle_model: [''],
			vehicle_year: [''],
			vehicle_color: [''],
			license_plate: [''],
			number_of_seats: [''],
			driver_id: [''],
			driver_name: [''],
			driver_gender: [''],
			driver_cell: [''],
			driver_cell_isd: [''],
			driver_email: [''],
			driver_phone_type: [''],
			meet_greet_choices: [''],
			number_of_vehicles: ['1'],



		})
	}

	SetFormValue(form_control: string, value: any)
	{
		console.log('Value for ', form_control, ' : ', value)
		this.BookingForm.get(form_control).setValue(value)
		this.BookingForm.updateValueAndValidity()
	}

	get Form()
	{
		return this.BookingForm.controls;
	}


	fillAddress(form_control: string, address: any)
	{
		console.log('Address: ', address)
	}

	fillLocationPoints(form_control: string, location: any)
	{
		console.log('Location Points', location)
	}


	fetchAirportsAndBigData(): Promise<Record<string, any> | boolean | string>
	{
		return new Promise((resolve, reject) =>
		{
			resolve(true)
		})
	}

	fetchAffiliates()
	{
		this.AffiliateAccounts = []
		this.$api.getAccountBytype('driver').subscribe((response: any) =>
		{
			if (response.success)
			{
				this.AffiliateAccounts = response.data

				//lose all affiliate vehicle and driver data on selection of affiliate type
				for (let key in this.Form)
				{
					if (this.searchSubstring(key, 'vehicle') || this.searchSubstring(key, 'driver'))
					{
						this.BookingForm.get(key).reset()
					}
				}
			}
		})
	}


	fetchAffiliateVehicles(affiliate: Record<string, any>)
	{
		this.$api.adminAffiliateVehicleList(affiliate.id).then((response: any) =>
		{
			if (response.success && response.data.vehicleList.length > 0)
			{
				this.VehicleList = response.data.vehicleList

				if (this.is_booking_edit_case)
				{
					// Todo: fetch data for autofill
					this.autofillData('vehicle', 'data')
				}
			}
		})
	}

	fetchVehiclesFromVehicleType(vehicleType_id: any)
	{
		// Todo: autofill data 
	}

	fetchModels(make_id: number)
	{
		this.BigData['vehicleModels'] = this.BigData['vehicleModels'].filter(item => item.make_id == make_id)
		return
	}

	autofillData(filling_type: string, data: any)
	{
		console.log('Yet To make .... ', filling_type, data)
	}



	addExtraStop()
	{
		console.log('Adding Extra Stop ...')
	}



	intlTelInputObject(event: any)
	{
		// this.MobileObject = event
	}
	telephoneCountryChange(form_control: string, value: any)
	{
		this.SetFormValue(form_control, value)
	}
	onCountryChange(event: any)
	{
		console.log(event)
		this.Form.loose_customer.get('phone_country').setValue(event.iso2)
		this.Form.loose_customer.get('phone_isd').setValue('+' + event.dialCode)
		this.BookingForm.updateValueAndValidity()
	}

	submitForm()
	{
		console.log('\n\n Submitting Form \n\n')
		console.log(this.BookingForm)
	}


	Subscriptions()
	{
		this.BookingForm.get('account_type').valueChanges.subscribe((value: string) =>
		{
			if (value == 'loose_customer')
			{
				this.BookingForm.addControl('loose_customer', this.$form.group({
					first_name: new FormControl('', Validators.required),
					middle_name: new FormControl(''),
					last_name: new FormControl('', Validators.required),
					phone: new FormControl('', Validators.required),
					phone_isd: new FormControl('+1', Validators.required),
					phone_country: new FormControl('us', Validators.required),
					email: new FormControl('', Validators.required),
					address: new FormControl(''),
					card_details: this.$form.group({
						name: new FormControl('', Validators.required),
						card_number: new FormControl('', Validators.required),
						exp_month: new FormControl('', Validators.required),
						exp_year: new FormControl('', Validators.required),
						cvv: new FormControl('', Validators.required)
					})
				}))
			}
			else
			{
				this.BookingForm.removeControl('loose_customer')
			}
		})

		// Subscription for Affiliate Type
		this.BookingForm.get('affiliate_type').valueChanges.subscribe((value: string) => 
		{
			if (value == 'loose_affiliate')
			{
				// TODO do thing
			}
			else
			{
				this.fetchAffiliates()
			}
		})

		// Pickup Airport
		this.BookingForm.get('pickup_airport').valueChanges.subscribe((value: string) =>
		{
			this.$shared.ListSearch('filter', this.BigData.airportsData, value, 'name')
		})
	}

}
