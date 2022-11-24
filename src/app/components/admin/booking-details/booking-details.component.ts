import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';

@Component({
	selector: 'app-booking-details',
	templateUrl: './booking-details.component.html',
	styleUrls: ['./booking-details.component.scss']
})
export class BookingDetailsComponent implements OnInit 
{
	booking_id: number = 0
	booking_details = {
		booking: [
			{
				label: 'Booking Details',
				data: [
					'service_type',
					'transfer_type',
					'return_transfer_type'
				]
			},
			{
				label: 'Journey Details',
				data: [
					'number_of_hours',
					'pickup_address',
					'pickup_airport',
					'pickup_airline',
					'pickup_flight',
					'dropoff_address',
					'dropoff_airport',
					'dropoff_airline',
					'dropoff_flight',
					'cruise_name',
					'cruise_port',
					'cruise_time',
					'pickup_date',
					'pickup_time',
					'meet_greet_choices',
					'return_pickup_address',
					'return_pickup_airport',
					'return_pickup_airline',
					'return_pickup_flight',
					'return_dropoff_address',
					'return_dropoff_airport',
					'return_dropoff_airline',
					'return_dropoff_flight',
					'return_cruise_name',
					'return_cruise_port',
					'return_cruise_time',
					'return_pickup_date',
					'return_pickup_time',
					'return_meet_greet_choices',
					'total_passengers',
					'luggage_count'
				]
			},
			{
				label: 'Account Information',
				data: [
					'account_type',
					'name',
					'affiliate_type',
					'loose_affiliate_name',
					'loose_affiliate_email',
					{
						'phone': '(' + 'loose_affiliate_phone_isd' + ')' + 'loose_affiliate_phone'
					},
					'passenger_name',
					'passenger_cell',
					'passenger_email',
					{
						'Country Code': 'passenger_cell_isd'
					},
				]
			},
			{
				label: 'Vehicle Preferences',
				data: [
					'amenities',
					'vehicle_type_name',
					{
						'year': 'vehicle_year',
						'make / model / color': 'vehicle_make' + '/' + 'vehicle_model' + '/' + 'vehicle_color',
					}
				]
			},
			{
				label: 'Driver Preferences',
				data: [
					{
						name: 'driver_name' + '(' + 'driver_phone' + ')',
					}
				]
			}
		]
	}
	BookingDetails: any


	constructor(
		private $activateRoute: ActivatedRoute,
		private $router: Router,
		private $api: AdminService
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
			this.fetchBookingDetails(this.booking_id)
		}
		else
		{
			console.error('Booking Not Found.')
			return
		}
	}

	fetchBookingDetails(booking_id: number)
	{
		this.$api.getReservationDetails(booking_id).subscribe((response: any) =>
		{
			this.BookingDetails = JSON.parse(JSON.stringify(response.data)) // make a copy
		})
	}

	isString(value: any)
	{
		return typeof value === 'string'
	}


	obtainValue(value: string)
	{
		// possibilites: '/', '()'
		let temp: any

		if (value.indexOf('/') !== -1)
		{
			temp = temp.split('/')
			// replace every item with its value from booking detail
			temp.forEach((item: any, index: number) =>
			{
				temp[index] = this.BookingDetails['booking_detail'][item]
			})
			return temp.join('/')
		}
		else if (value.indexOf('(') !== -1 && value.indexOf(')') !== -1)
		{
			let extraction = value.substring(value.indexOf('('), value.indexOf(')'))
			return this.booking_details['booking_detail']['extraction']
		}
		else
		{
			return this.BookingDetails['booking_detail'][value]
		}
	}



}
