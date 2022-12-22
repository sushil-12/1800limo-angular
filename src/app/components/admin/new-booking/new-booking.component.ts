import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { AdminService } from 'src/app/services/admin.service';
import { SharedModule } from 'src/app/components/shared/shared.module'
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
	selector: 'app-new-booking',
	templateUrl: './new-booking.component.html',
	styleUrls: ['./new-booking.component.scss']
})
export class NewBookingComponent implements OnInit
{
	booking_params: any = {
		transfer_types: ['airport_to_city', 'city_to_airport', 'city_to_city'],
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
	BigData_COPY: any
	ClientAccounts: Array<Record<string, any>> = []
	AffiliateAccounts: Array<Record<string, any>> = []
	VehicleList: Array<Record<string, any>> = []
	DriverList: Array<Record<string, any>> = []

	chosen_user: Record<string, any>





	is_booking_edit_case: boolean = false


	constructor(
		private $form: FormBuilder,
		private $api: AdminService,
		private $shared: SharedModule,
		private $spinner: NgxSpinnerService
	) { }

	ngOnInit(): void
	{
		// build the form first 
		this.buildBookingForm()
		// fetch the big data
		this.fetchAirportsAndBigData().then((data: any) =>
		{
			this.BigData = data
			this.BigData_COPY = JSON.parse(JSON.stringify(data))
		})

		// Subscriptions
		this.Subscriptions()
		this.fetchClientAccounts('individual')
		this.fetchAffiliates('affiliate')
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
	searchSubstring(text: string, search_string: string, start: number = 0): boolean
	{
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
			number_of_hours: ['0'],
			acc_id: [''],
			account_type: ['individual', Validators.required],
			loose_customer: this.$form.group({
				first_name: [''],
				middle_name: [''],
				last_name: [''],
				phone: [''],
				phone_isd: ['+1'],
				phone_country: ['us'],
				email: [''],
				address: [''],
				card_details: this.$form.group({
					name: [''],
					card_number: [''],
					exp_month: [''],
					exp_year: [''],
					cvv: ['']
				})
			}),
			passenger_name: [''],
			passenger_email: [''],
			passenger_cell: [''],
			passenger_cell_isd: [''],
			total_passengers: [1],
			luggage_count: [1],
			booking_instructions: [''],
			affiliate_type: ['affiliate', Validators.required],
			affiliate_id: [''],
			lose_affiliate_name: [''],
			lose_affiliate_phone: [''],
			lose_affiliate_email: [''],
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
			pickup_date: [new Date().toISOString().slice(0, new Date().toISOString().indexOf('T'))],
			pickup_time: ['12:00:00'],
			extra_stops: this.$form.group({
				stop_1: ['']
			}),
			pickup: [''],
			pickup_latitude: [''],
			pickup_longitude: [''],
			pickup_airport: [''],
			pickup_airport_latitude: [''],
			pickup_airport_longitude: [''],
			pickup_airline: [''],
			pickup_flight: [''],
			origin_airport_city: [''],
			cruise_port: [''],
			cruise_name: [''],
			cruise_time: [''],
			dropoff: [''],
			dropoff_latitude: [''],
			dropoff_longitude: [''],
			dropoff_airport: [''],
			dropoff_airport_latitude: [''],
			dropoff_airport_longitude: [''],
			dropoff_airline: [''],
			dropoff_flight: [''],
			return_pickup_date: [''],
			return_pickup_time: [''],
			return_pickup: [''],
			return_pickup_latitude: [''],
			return_pickup_longitude: [''],
			return_pickup_airport: [''],
			return_pickup_airport_latitude: [''],
			return_pickup_airport_longitude: [''],
			return_pickup_airline: [''],
			return_pickup_flight: [''],
			return_cruise_port: [''],
			return_cruise_name: [''],
			return_cruise_time: [''],
			return_dropoff: [''],
			return_dropoff_latitude: [''],
			return_dropoff_longitude: [''],
			return_dropoff_airport: [''],
			return_dropoff_airport_latitude: [''],
			return_dropoff_airport_longitude: [''],
			return_dropoff_airline: [''],
			return_dropoff_flight: [''],
			driver_languages: this.$form.array([]),
			driver_dresses: this.$form.array([]),
			amenties: this.$form.array([]),
			chargedAmenities: this.$form.array([])
		})
	}

	SetFormValue(form_control: string, value: any)
	{
		console.log('Setting Form Value for ', form_control, ' : ', value)
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
		return new Promise((resolve) =>
		{
			if (this.$api.getBookingData() != undefined)
			{
				resolve(this.$api.getBookingData())
			}
			else
			{
				const interval = setInterval(() =>
				{
					if (this.$api.getBookingData() === undefined)
					{
						this.$spinner.show('fetchspinner')
					}
					else
					{
						this.$spinner.hide('fetchspinner')
						clearInterval(interval)
						resolve(this.$api.getBookingData())
					}
				}, 1500)
			}
		})
	}


	fetchClientAccounts(account_type: string)
	{
		const legend = {
			individual: 'individual',
			corporate: 'corporate',
			travel_planner: 'travel'
		}

		// fail-safe
		if (!legend.hasOwnProperty(account_type))
		{
			console.error('Invalid Account type: ', account_type)
			return
		}
		else
		{
			this.$spinner.show()
			this.$api.getAccountBytype(legend[account_type]).subscribe((response: any) =>
			{
				this.$spinner.hide()
				if (response.success && response.data.length > 0)
				{
					this.ClientAccounts = response.data
				}
			})
		}
	}

	chooseUser(account_id: number)
	{
		this.$spinner.show()
		this.$api.chooseUser(account_id, this.Form.account_type.value).subscribe((response: any) =>
		{
			if (response.success && Object.keys(response.data).length > 0)
			{
				this.chosen_user = response.data
				this.chosen_user['name'] = `${response.data.first_name} ${response.data.middle_name ?? ''} ${response.data.last_name}`
				this.autofillData('passenger', this.chosen_user)
			}
		})
	}

	fetchAffiliates(affiliate_type: 'affiliate' | 'loose_affiliate')
	{
		if (affiliate_type == 'loose_affiliate')
		{
			return
		}
		else
		{
			this.AffiliateAccounts = []
			this.$spinner.show()
			this.$api.getAccountBytype('driver').subscribe((response: any) =>
			{
				this.$spinner.hide()
				if (response.success && response.data.length > 0)
				{
					this.AffiliateAccounts = response.data

					//lose all affiliate vehicle and driver data on change of affiliate type
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
	}

	chooseAffiliate()
	{
		this.fetchAffiliateVehicles(this.Form.affiliate_id.value)
		this.fetchAffiliateDrivers(this.Form.affiliate_id.value)
	}


	fetchAffiliateVehicles(affiliate_id: number)
	{
		if (!affiliate_id)
		{
			console.log('Invalid Paramater affiliate_data', affiliate_id)
			return
		}
		this.$spinner.show()
		this.$api.adminAffiliateVehicleList(affiliate_id).then((response: any) =>
		{
			this.$spinner.hide()
			if (response.success && response.data.vehicleList.length > 0)
			{
				this.VehicleList = response.data.vehicleList

				// autofill data
				if (this.VehicleList.length == 1)
				{
					this.SetFormValue('vehicle_type', this.VehicleList[0].ID)
					this.SetFormValue('vehicle_id', this.VehicleList[0].ID)
					this.autofillData('vehicle', this.VehicleList[0])
				}
			}
		})
	}

	fetchAffiliateDrivers(affiliate_id: number)
	{
		if (!affiliate_id)
		{
			console.log('Invalid Paramater affiliate_data', affiliate_id)
			return
		}
		this.$spinner.show()
		this.$api.driverList(affiliate_id).then((response: any) =>
		{
			if (response.success && response.data?.data.length > 0)
			{
				this.DriverList = response.data.data

				// autofill data
				if (this.DriverList.length == 1)
				{
					this.SetFormValue('driver_id', this.DriverList[0].id)
					this.autofillData('driver', this.DriverList[0])
				}
			}
		})
	}

	chooseDriver(driver_data: any)
	{
		this.autofillData('driver', driver_data)
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


	fillValue(list: Array<Record<string, any> | string>, form_control: string, return_key: string)
	{
		// fail-safe
		if (!this.BigData)
		{
			return
		}
		// fail-safes
		if (!list || !form_control || !return_key)
		{
			console.warn('Invalid Parameters Passed. ')
			return
		}
		if (typeof list[0] === 'string')
		{
			return list.find((item: string) => item == this.Form[form_control].value)[return_key]
		}
		return this.$shared.ListSearch('find', list, this.BookingForm.get(form_control).value, 'id')[return_key]

	}

	autofillData(filling_for: string, data: any)
	{
		console.log('Yet To make .... ', filling_for, data)

		if (filling_for === 'passenger')
		{
			this.SetFormValue('passenger_name', `${data.first_name} ${data.middle_name ?? ''} ${data.last_name}`)
			this.SetFormValue('passenger_email', data.email)
			this.SetFormValue('passenger_cell', data.mobile)
			this.SetFormValue('passenger_cell_isd', data.mobileIsd)
		}

		if (filling_for == 'vehicle')
		{
			this.SetFormValue('license_plate', data.licensePlate)
			this.SetFormValue('number_of_seats', data.seats)

			// fill values of make/model/year/color
			let i = 0
			let legend = ['make', 'model', 'year', 'color']
			for (let item of ['vehicleMakes', 'vehicleModels', 'vehicleYears', 'vehicleColors'])
			{
				let id = this.$shared.ListSearch('find', this.BigData[item], data[legend[i]], 'name')['id']
				this.SetFormValue('vehicle_' + legend[i], id)
				i++;
			}
		}

		if (filling_for == 'driver')
		{
			this.SetFormValue('driver_name', `${data.FirstName} ${data.MiddleName ?? ''} ${data.LastName}`)
			this.SetFormValue('driver_gender', data.Gender)
			this.SetFormValue('driver_cell', data.CellNumber)
			this.SetFormValue('driver_cell_isd', data.CellIsd)
			this.SetFormValue('driver_email', data.Email)
			this.SetFormValue('driver_phone_type', data.PhoneType ?? '')
		}
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
		// Account Type Subscription
		this.BookingForm.get('account_type').valueChanges.subscribe((value: string) =>
		{
			if (value == 'loose_customer')
			{
				const loose_customer = (this.BookingForm.get('loose_customer') as FormGroup)
				// for every 'item' in loose_customer
				for (let item in loose_customer.controls)
				{
					// if 'item' in loose_customer is a formgroup, like card_details
					if (loose_customer[item] instanceof FormGroup)
					{
						// for every 'key' in card_details formgroup
						for (let key in (loose_customer.get(item) as FormGroup).controls)
						{
							// set validators in card_details
							loose_customer.get(item).get(key).setValidators(Validators.required)
						}
					}
					loose_customer.get(item).setValidators(Validators.required)
				}
			}
			else
			{
				const loose_customer = (this.BookingForm.get('loose_customer') as FormGroup)
				// for every 'item' in loose_customer
				for (let item in loose_customer.controls)
				{
					// if 'item' in loose_customer is a formgroup, like card_details
					if (loose_customer[item] instanceof FormGroup)
					{
						// for every 'key' in card_details formgroup
						for (let key in (loose_customer.get(item) as FormGroup).controls)
						{
							// clear validators in card_details
							loose_customer.get(item).get(key).clearValidators()
							loose_customer.get(item).get(key).updateValueAndValidity()
						}
					}
					loose_customer[item].clearValidators()
					loose_customer[item].updateValueAndValidity()
				}

				this.fetchClientAccounts(value)
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
				this.fetchAffiliates('affiliate')
			}
		})

		// Pickup Airport
		this.BookingForm.get('pickup_airport').valueChanges.subscribe((value: string) =>
		{
			if (value == '')
			{
				this.BigData['airportsData'] = this.BigData_COPY
			}
			this.SetFormValue('return_pickup_airport', value)
			this.BigData['airportsData'] = this.$shared.ListSearch('filter', this.BigData.airportsData, value, 'name')
		})

		this.BookingForm.get('pickup').valueChanges.subscribe((value: string) =>
		{
			this.SetFormValue('return_pickup', value)
		})
		this.BookingForm.get('dropoff').valueChanges.subscribe((value: string) =>
		{
			this.SetFormValue('return_dropoff', value)
		})

	}

}
