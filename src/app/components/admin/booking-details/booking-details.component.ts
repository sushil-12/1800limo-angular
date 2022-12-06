import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';


@Component({
	selector: 'app-booking-details',
	templateUrl: './booking-details.component.html',
	styleUrls: ['./booking-details.component.scss']
})
export class BookingDetailsComponent implements OnInit 
{
	RatesForm: FormGroup

	booking_id: number = 0
	legend = {
		"Booking Information": {
			"Service": "service_type/transfer_type/return_transfer_type"
		},
		"Journey Information": [
			"number_of_hours",
			"pickup_address",
			"pickup_airport",
			"pickup_airline",
			"pickup_flight",
			"dropoff_address",
			"dropoff_airport",
			"dropoff_airline",
			"dropoff_flight",
			"cruise_name",
			"cruise_port",
			"cruise_time",
			"pickup_date",
			"pickup_time",
			"meet_greet_choices",
			"return_pickup_address",
			"return_pickup_airport",
			"return_pickup_airline",
			"return_pickup_flight",
			"return_dropoff_address",
			"return_dropoff_airport",
			"return_dropoff_airline",
			"return_dropoff_flight",
			"return_cruise_name",
			"return_cruise_port",
			"return_cruise_time",
			"return_pickup_date",
			"return_pickup_time",
			"return_meet_greet_choices",
			"total_passengers",
			"luggage_count"
		],
		"Vehicle Preferences": {
			"vehicle": "vehicle_type_name",
			"make / model / color": "vehicle_make / vehicle_model / vehicle_color",
			"year": "year",
			"amenities": "amenities"
		},
		"Driver Information": {
			"Name": "driver_name(driver_gender)",
			"Phone": "(driver_cell_isd)driver_cell",
			"Email": "driver_email"
		}
	}
	BookingDetails: any
	PriceDetails: any = {}


	constructor(
		private $activateRoute: ActivatedRoute,
		private $router: Router,
		private $api: AdminService,
		private $forms: FormBuilder
	) { }

	ngOnInit(): void
	{
		// capture the booking id or navigate back to daily bookings page
		this.$activateRoute.queryParams.subscribe((params: any) =>
		{
			if (params && params.bookingId)
			{
				this.booking_id = params.bookingId
			} else
			{
				this.$router.navigateByUrl('/admin/daily-bookings-admin')
			}
		})

		if (this.booking_id != 0)
		{
			this.buildRatesForm()
			this.fetchBookingDetails(this.booking_id).then((success: boolean) =>
			{
				if (success)
				{
					for (let [key, value] of Object.entries(this.BookingDetails.priceDetail))
					{
						this.addFormControl(key, value)
					}

					// check which rates to show and which to hide. validate them by comparing and fill values accordingly
					this.validateCheckAndShowRates(this.BookingDetails.priceDetail)
				}
			})
		}
		else
		{
			console.error('Booking Not Found.')
			return
		}
	}

	/**
	 * return new promise object with confirmation of booking details populated.
	 * 
	 * @params booking_id: Number [Required] unique booking id
	 * @returns Promise<boolean>
	 */
	fetchBookingDetails(booking_id: number): Promise<boolean>
	{
		return new Promise((resolve, reject) =>
		{
			this.$api.getReservationDetails(booking_id).subscribe((response: any) =>
			{
				if (!response.success)
				{
					reject(false)
					return
				}
				this.BookingDetails = JSON.parse(JSON.stringify(response.data)) // make a copy
				resolve(true)
			})
		})
	}

	identifyDataType(value: any)
	{
		if (Array.isArray(value))
		{
			return 0
		} else
		{
			return 1
		}
	}

	formatString(text: string)
	{
		return (text.replace(/[\_\-]/gi, ' '))
	}


	obtainValue(value: string)
	{
		// possibilites: '/', '()'
		let temp: any

		if (this.BookingDetails)
		{
			// if value is customised
			if (/[\/]/g.test(value))
			{
				// for forward slashes
				temp = value.split('/')
				temp.forEach((value: string, index: number) =>
				{
					// change temp value at every index
					temp[index] = this.BookingDetails.booking_detail[value] ?? ''
				})
				return temp.join(' / ').replace(/\s?\/\s?$/g, ' ').trim()
			}

			// if value is customised
			if (/[\(\)]/g.test(value))
			{
				let a = /\(([^(]+)\)/g.exec(value.trim())
				let b = /\)([^\)\(]+)/g.exec(value.trim()) ?? /([^\)\(]+)\(/g.exec(value.trim())
				let extraction = a[1]
				let leftout = b[1]

				if (this.BookingDetails.booking_detail[extraction] == null && this.BookingDetails.booking_detail[leftout] == null)
				{
					return null
				}

				let str = value.replace(extraction, this.BookingDetails.booking_detail[extraction]).replace(leftout, this.BookingDetails.booking_detail[leftout])
				return str
			}

			// if value is directly a key in data
			if (/[\_]/g.test(value))
			{
				// for underscores
				return this.BookingDetails.booking_detail[value]
			}
		}
	}

	keyvalueSortingOrder()
	{
		// return 0 or 1 for no sorting
		return 0
	}


	buildRatesForm()
	{
		this.RatesForm = this.$forms.group({
			priceDetail: this.$forms.group({
				all_inclusive_rates: new FormGroup({}),
				others: new FormGroup({}),
				direct_taxes: new FormGroup({}),
				taxes: new FormGroup({}),
				amenities: new FormGroup({}),
			}),
			reservation_id: ['', Validators.required],
			sub_total: ['', Validators.required],
			grand_total: ['', Validators.required],
			payment_method: ['', Validators.required],
			CreditCardsDetail: this.$forms.group({
				cardID: [''],
				cvc: [''],
			}),
		})
		console.info('\n ----- Form Group -----', this.RatesForm)
	}

	get Form()
	{
		return this.RatesForm.controls
	}

	get priceDetail()
	{
		return this.RatesForm.controls.priceDetail as FormGroup
	}

	getFormControl(form_control: string): FormControl
	{
		return this.RatesForm.get(form_control) as FormControl
	}

	addFormControl(group_name: string, obj: Object)
	{
		for (let [key, value] of Object.entries(obj))
		{
			(<FormGroup>this.priceDetail.get(group_name)).addControl(key, new FormControl())
		}
	}



	/**
	 * Check and Validate Rates to show
	 */
	validateCheckAndShowRates(prices?: Object)
	{
		if (prices['all_inclusive_rates'])
		{
			let rate_label = Object.keys(prices['all_inclusive_rates']).find(ele => ele.match(/(.)+_rate/gi))
			console.log(rate_label)
			let rate = prices['all_inclusive_rates'][rate_label]

			this.PriceDetails['all_incl_rates'] = {}
			this.PriceDetails['all_incl_rates']['rate_label'] = rate.rate_label
			this.PriceDetails['all_incl_rates']['rate_amount'] = rate.amount

			// if(!rate_label.toLowerCase().includes('minimum') && rate.amount > prices['all_inclusive_rates']['Minimum_Rate'].amount)
			// {
			// 	this.PriceDetails['all_incl_rates']['rate_label'] = rate.rate_label
			// 	this.PriceDetails['all_incl_rates']['rate_amount'] = rate.amount
			// }
			// else
			// {
			// 	this.PriceDetails['all_incl_rates']['rate_label'] = "Minumum Rate"
			// 	this.PriceDetails['all_incl_rates']['rate_amount'] = 
			// }
		}
	}

	inputChangeCapture(value: any, form_control: string)
	{ }



}
