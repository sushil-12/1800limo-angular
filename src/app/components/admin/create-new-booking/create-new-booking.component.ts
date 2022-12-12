import { Component, OnInit, ViewChild, ElementRef, NgZone, EventEmitter } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { from, interval, throwError } from 'rxjs';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';

import { SharedModule } from 'src/app/components/shared/shared.module'

import { constant_data } from 'src/assets/js/data.js'



import { StateManagementService } from 'src/app/services/statemanagement.service';
import PlaceResult = google.maps.places.PlaceResult
import { isIdentifier } from '@angular/compiler';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { EventListenerFocusTrapInertStrategy } from '@angular/cdk/a11y';
declare var $: any







@Component({
	selector: 'app-create-new-booking',
	templateUrl: './create-new-booking.component.html',
	styleUrls: ['./create-new-booking.component.scss']
})
export class CreateNewBookingComponent implements OnInit
{
	outputDateFormat = 'YYYY-MM-DD';
	bookingForm: FormGroup
	constants_data = constant_data
	account_type_radio_buttons: Array<String> = ['individual', 'corporate', 'travel_planner', 'loose_customer']
	affiliate_type_radio_buttons: Array<String> = ['affiliate', 'loose_affiliate']
	selected_vehicle_driver_details: Array<Array<String>> = [['name', 'gender'], ['languages', 'dress'], ['experience', 'phone']]
	months: Array<string> = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	years: Array<number> = []

	booking_id: number = 0					// received in case of editing the booking
	update_type: string = 'new'				// recieved in case of editing the booking
	modal_image: string

	fetched_user: any
	editing_data: any
	selected_vehicle: any = null
	driver_image = {}
	vehicle_image = {}

	// Arrays of type any and object
	// Convention Ref.: every array will have '_list' as suffix
	big_data_list: any
	big_data_list_copy: any
	user_list: Array<any> = []
	affiliate_vehicle_list: Array<any> = []
	affiliate_driver_list: Array<any> = []
	affiliate_list: Array<any> = []
	number_count: Array<number> = []

	close_image_modal: EventEmitter<any> = new EventEmitter()

	MobileObject: any;
	getMobileCountry: any;


	constructor(
		public _activatedRoute: ActivatedRoute,
		private _formBuilder: FormBuilder,
		private _adminService: AdminService,
		private _spinner: NgxSpinnerService,
		private _stateManager: StateManagementService,
		private mapsAPILoader: MapsAPILoader,
		private _router: Router,
		private _errorDialog: ErrorDialogService,
		private globalFunctions: SharedModule
	) { }

	ngOnInit()
	{
		this._activatedRoute.queryParams.subscribe((params: any) =>
		{
			// build the form 
			this.buildBookingFormGroup()

			// check whether the request has been made for editing or duplicate a booking
			if (params != undefined && Object.keys(params).length > 0)
			{
				this.booking_id = params.bookingId
				this.update_type = params.updateType ?? ''
			}
		})
		let date = new Date().getFullYear()
		for (let i = 0; i < 31; i++)
		{
			this.years.push(i + date)
		}

		this.getBigData().then((data) =>
		{
			this.big_data_list = data
			this.big_data_list_copy = JSON.parse(JSON.stringify(data))
			this.prefillBookingFormGroup()

		})

		this.fetchAccounts('individual').then((data: any) =>
		{
			this.user_list = data
		})

		this.fetchAffiliates('affiliate').then((data: any) =>
		{
			this.affiliate_list = data

			// lose all data
			for (const key in this.Form)
			{
				if (this.searchSubstring(key, 'vehicle') || this.searchSubstring(key, 'driver'))
				{
					this.bookingForm.get(key).reset()
				}
			}
		})

		for (let i = 1; i <= 70; i++)
		{
			this.number_count.push(i)
		}
	}
	// ngOnInit ends

	/**
	 * Build the Form, assign the validations and default values
	 */
	buildBookingFormGroup()
	{
		this.bookingForm = this._formBuilder.group({
			reservation_id: [''],
			updateType: [''],
			service_type: ['', Validators.required],
			transfer_type: ['', Validators.required],
			return_transfer_type: [''],
			pickup_airport: [''],
			pickup_airport_latitude: [''],
			pickup_airport_longitude: [''],
			pickup_airline: [''],
			pickup_flight: [''],
			origin_airport_city: [''],
			cruise_name: [''],
			cruise_port: [''],
			cruise_time: [''],
			pickup: [''],
			pickup_latitude: [''],
			pickup_longitude: [''],
			dropoff_airport: [''],
			dropoff_airport_latitude: [''],
			dropoff_airport_longitude: [''],
			dropoff_airline: [''],
			dropoff_flight: [''],
			dropoff: [''],
			dropoff_latitude: [''],
			dropoff_longitude: [''],
			stop_1: [''],
			stop_1_latitude: [''],
			stop_1_longitude: [''],
			stop_2: [''],
			stop_2_latitude: [''],
			stop_2_longitude: [''],
			meet_greet_choices: [''],
			pickup_date: [''],
			pickup_time: [''],
			return_pickup_airport: [''],
			return_pickup_airport_latitude: [''],
			return_pickup_airport_longitude: [''],
			return_pickup_airline: [''],
			return_pickup_flight: [''],
			return_pickup: [''],
			return_pickup_latitude: [''],
			return_pickup_longitude: [''],
			return_dropoff_airport: [''],
			return_dropoff_airport_latitude: [''],
			return_dropoff_airport_longitude: [''],
			return_dropoff_airline: [''],
			return_dropoff_flight: [''],
			return_dropoff: [''],
			return_dropoff_latitude: [''],
			return_dropoff_longitude: [''],
			return_cruise_name: [''],
			return_cruise_port: [''],
			return_cruise_time: [''],
			return_stop_1: [''],
			return_stop_1_latitude: [''],
			return_stop_1_longitude: [''],
			return_stop_2: [''],
			return_stop_2_latitude: [''],
			return_stop_2_longitude: [''],
			return_meet_greet_choices: [''],
			return_pickup_date: [''],
			return_pickup_time: [''],
			account_type: [''],
			acc_id: [''],
			passenger_name: [''],
			passenger_cell: [''],
			passenger_cell_isd: [''],
			passenger_email: [''],
			total_passengers: [''],
			luggage_count: [''],
			booking_instructions: [''],
			number_of_hours: [''],
			number_of_vehicles: [1],
			affiliate_type: [''],
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
			lose_affiliate_name: [''],
			lose_affiliate_phone: [''],
			lose_affiliate_email: [''],
			driver_dresses: this._formBuilder.array([]),
			driver_languages: this._formBuilder.array([]),
			amenities: this._formBuilder.array([]),
			chargedAmenities: this._formBuilder.array([]),
			driver_ex_law_officer: [''],
			driver_veteran: [''],
			driver_foid_card: [''],
			driver_dod: [''],
			driver_background_certified: [''],
			journeyDistance: [''],
			journeyTime: [''],
			returnJourneyDistance: [''],
			returnJourneyTime: [''],
			driver_image_id: [''],
			vehicle_image_id: [''],
			booking_status: [''],
			loose_customer: this._formBuilder.group({
				first_name: ['', Validators.required],
				middle_name: [''],
				last_name: ['', Validators.required],
				phone: ['', Validators.required],
				phone_country: ['us', Validators.required],
				phone_isd: ['+1', Validators.required],
				email: ['', Validators.required],
				address: [''],
				card_details: this._formBuilder.group({
					name: ['', Validators.required],
					card_number: ['', Validators.required],
					exp_month: ['', Validators.required],
					exp_year: ['', Validators.required],
					cvv: ['', Validators.required]
				})
			})
		})
		return true
	}

	/**
	 * Prefill the Form with values according to 
	 * previous booking id 
	 * or via quotebot 
	 * or via manually
	 */
	prefillBookingFormGroup()
	{
		// filling via Booking Id
		if (this.booking_id != 0)
		{
			this._adminService.getBookingDataForEdit(this.booking_id).subscribe((response: any) =>
			{
				console.warn('Prefilling via Booking Id')
				this.editing_data = response.data
				console.log(this.editing_data, "...get booking data")
				this.bookingForm.patchValue({
					updateType: this.update_type,
					reservation_id: this.booking_id,
					acc_id: response.data.acc_id,
					service_type: response.data.service_type == 'oneway' ? 'one_way' : response.data['service_type'] == 'roundtrip' ? 'round_trip' : 'charter_tour',
					transfer_type: response.data.transfer_type != null ? response.data.transfer_type : '',
					return_transfer_type: response.data.return_transfer_type != null ? response.data.return_transfer_type : '',
					pickup_airport: response.data.pickup_airport ?? '',
					pickup_airport_latitude: response.data.pickup_airport_latitude ?? '',
					pickup_airport_longitude: response.data.pickup_airport_longitude ?? '',
					pickup_airline: response.data.pickup_airline != null ? response.data.pickup_airline : '',
					pickup_flight: response.data.pickup_flight != null ? response.data.pickup_flight : '',
					origin_airport_city: response.data.origin_airport_city != null ? response.data.origin_airport_city : '',
					cruise_name: response.data.cruise_name != null ? response.data.cruise_name : '',
					cruise_port: response.data.cruise_port != null ? response.data.cruise_port : '',
					cruise_time: response.data.cruise_time != null ? response.data.cruise_time : '',
					pickup: response.data.pickup != null ? response.data.pickup : '',
					pickup_latitude: response.data.pickup_latitude != null ? response.data.pickup_latitude : '',
					pickup_longitude: response.data.pickup_longitude != null ? response.data.pickup_longitude : '',
					dropoff_airport: response.data.dropoff_airport ?? '',
					dropoff_airport_latitude: response.data.dropoff_airport_latitude ?? '',
					dropoff_airport_longitude: response.data.dropoff_airport_longitude ?? '',
					dropoff_airline: response.data.dropoff_airline != null ? response.data.dropoff_airline : '',
					dropoff_flight: response.data.dropoff_flight != null ? response.data.dropoff_flight : '',
					dropoff: response.data.dropoff != null ? response.data.dropoff : '',
					dropoff_latitude: response.data.dropoff_latitude != null ? response.data.dropoff_latitude : '',
					dropoff_longitude: response.data.dropoff_longitude != null ? response.data.dropoff_longitude : '',
					return_cruise_name: response.data.return_cruise_name != null ? response.data.return_cruise_name : '',
					return_cruise_port: response.data.return_cruise_port != null ? response.data.return_cruise_port : '',
					return_cruise_time: response.data.return_cruise_time != null ? response.data.return_cruise_time : '',
					stop_1: response.data.stop_1 != null ? response.data.stop_1 : '',
					stop_1_latitude: response.data.stop_1_latitude != null ? response.data.stop_1_latitude : '',
					stop_1_longitude: response.data.stop_1_longitude != null ? response.data.stop_1_longitude : '',
					stop_2: response.data.stop_2 != null ? response.data.stop_2 : '',
					stop_2_latitude: response.data.stop_2_latitude != null ? response.data.stop_2_latitude : '',
					stop_2_longitude: response.data.stop_2_longitude != null ? response.data.stop_2_longitude : '',
					meet_greet_choices: response.data.meet_greet_choices != null ? response.data.meet_greet_choices : '',
					pickup_date: response.data.pickup_date != null ? response.data.pickup_date : '',
					pickup_time: response.data.pickup_time != null ? response.data.pickup_time : '',
					return_pickup_airport: response.data.return_pickup_airport ?? '',
					return_pickup_airport_latitude: response.data.return_pickup_airport_latitude ?? '',
					return_pickup_airport_longitude: response.data.return_pickup_airport_longitude ?? '',
					return_pickup_airline: response.data.return_pickup_airline != null ? response.data.return_pickup_airline : '',
					return_pickup_flight: response.data.return_pickup_flight != null ? response.data.return_pickup_flight : '',
					return_pickup: response.data.return_pickup != null ? response.data.return_pickup : '',
					return_pickup_latitude: response.data.return_pickup_latitude != null ? response.data.return_pickup_latitude : '',
					return_pickup_longitude: response.data.return_pickup_longitude != null ? response.data.return_pickup_longitude : '',
					return_dropoff_airport: response.data.return_dropoff_airport ?? '',
					return_dropoff_airport_latitude: response.data.return_dropoff_airport_latitude ?? '',
					return_dropoff_airport_longitude: response.data.return_dropoff_airport_longitude ?? '',
					return_dropoff_airline: response.data.return_dropoff_airline != null ? response.data.return_dropoff_airline : '',
					return_dropoff_flight: response.data.return_dropoff_flight != null ? response.data.return_dropoff_flight : '',
					return_dropoff: response.data.return_dropoff != null ? response.data.return_dropoff : '',
					return_dropoff_latitude: response.data.return_dropoff_latitude != null ? response.data.return_dropoff_latitude : '',
					return_dropoff_longitude: response.data.return_dropoff_longitude != null ? response.data.return_dropoff_longitude : '',
					return_stop_1: response.data.return_stop_1 != null ? response.data.return_stop_1 : '',
					return_stop_1_latitude: response.data.return_stop_1_latitude != null ? response.data.return_stop_1_latitude : '',
					return_stop_1_longitude: response.data.return_stop_1_longitude != null ? response.data.return_stop_1_longitude : '',
					return_stop_2: response.data.return_stop_2 != null ? response.data.return_stop_2 : '',
					return_stop_2_latitude: response.data.return_stop_2_latitude != null ? response.data.return_stop_2_latitude : '',
					return_stop_2_longitude: response.data.return_stop_2_longitude != null ? response.data.return_stop_2_longitude : '',
					return_meet_greet_choices: response.data.return_meet_greet_choices != null ? response.data.return_meet_greet_choices : '',
					return_pickup_date: response.data.return_pickup_date != null ? response.data.return_pickup_date : '',
					return_pickup_time: response.data.return_pickup_time != null ? response.data.return_pickup_time : '',
					account_type: response.data.account_type != null ? response.data.account_type : '',
					passenger_name: response.data.passenger_name != null ? response.data.passenger_name : '',
					passenger_cell: response.data.passenger_cell != null ? response.data.passenger_cell : '',
					passenger_email: response.data.passenger_email != null ? response.data.passenger_email : '',
					total_passengers: response.data.total_passengers != null ? response.data.total_passengers : '',
					luggage_count: response.data.luggage_count != null ? response.data.luggage_count : '',
					booking_instructions: response.data.booking_instructions != null ? response.data.booking_instructions : '',
					number_of_hours: response.data.number_of_hours != null ? response.data.number_of_hours : '',
					number_of_vehicles: response.data.number_of_vehicles != null ? (response.data.number_of_vehicles).toString() : 1,
					affiliate_type: response.data.affiliate_type != null ? response.data.affiliate_type : '',
					affiliate_id: response.data.affiliate_id != null ? response.data.affiliate_id : '',
					vehicle_type: response.data.vehicle_type != null && response.data.affiliate_type == 'loose_affiliate' ? response.data.vehicle_type : response.data.vehicle_id,
					vehicle_id: response.data.vehicle_id != null ? response.data.vehicle_id : '',
					license_plate: response.data.license_plate != null ? response.data.license_plate : '',
					number_of_seats: response.data.number_of_seats != null ? response.data.number_of_seats : '',
					driver_id: response.data.driver_id != null ? response.data.driver_id : '',
					driver_name: response.data.driver_name != null ? response.data.driver_name : '',
					driver_gender: response.data.driver_gender != null ? response.data.driver_gender : '',
					driver_cell: response.data.driver_cell != null ? response.data.driver_cell : '',
					driver_email: response.data.driver_email != null ? response.data.driver_email : '',
					driver_phone_type: response.data.driver_phone_type != null ? response.data.driver_phone_type : '',
					lose_affiliate_name: response.data.lose_affiliate_name != null ? response.data.lose_affiliate_name : '',
					lose_affiliate_phone: response.data.lose_affiliate_phone != null ? response.data.lose_affiliate_phone : '',
					lose_affiliate_email: response.data.lose_affiliate_email != null ? response.data.lose_affiliate_email : '',
					driver_image_id: response.data.driver_image_id != null ? response.data.driver_image_id : '',
					vehicle_image_id: response.data.vehicle_image_id != null ? response.data.vehicle_image_id : '',
					booking_status: response.data.booking_status != null ? response.data.booking_status : ''
				})

				this.driver_image['image'] = this.Form.driver_image_id.value
				this.vehicle_image['image'] = this.Form.vehicle_image_id.value
				this.account_type_radio_buttons.pop()

				// th big data takes time to load so keep the form filling these values until big data is fetched
				let interval = setInterval(() =>
				{
					if (this.big_data_list != undefined)
					{
						clearInterval(interval)
						this.bookingForm.patchValue({
							vehicle_make: response.data.vehicle_make != null ? this.big_data_list['vehicleMakes'].find((item: any) => item.name == response.data['vehicle_make']) : '',
							vehicle_model: response.data.vehicle_model != null ? this.big_data_list['vehicleModels'].find((item: any) => item.name == response.data['vehicle_model']) : '',
							vehicle_year: response.data.vehicle_year != null ? this.big_data_list['vehicleYears'].find((item: any) => item.name == response.data['vehicle_year']) : '',
							vehicle_color: response.data.vehicle_color != null ? this.big_data_list['vehicleColors'].find((item: any) => item.name == response.data['vehicle_color']) : '',
						})
					}
				}, 1000)
				this.Form.affiliate_id.value != 0 && this.getVehiclesandDriversFromAffiliate(this.Form.affiliate_id.value)
				this.userSelection(this.Form.acc_id.value)
			})
		}
		// filling via Quotebot
		else if (localStorage.getItem('quotebot_form') != null)
		{
			// fetch data from quotebot, if it exists?
			console.warn('Prefilling via Quotebot')
			let data = JSON.parse(localStorage.getItem('quotebot_form'))

			// prefill here for quotebot, has different field names
			this.bookingForm.patchValue({
				service_type: data['service_type'],
				transfer_type: data['pickup_type'] + '_to_' + data['dropoff_type'],
				return_transfer_type: data['dropoff_type'] + '_to_' + data['pickup_type'],
				// pickup address
				pickup: data['pickup_address'],
				pickup_latitude: data['pickup_address_lat'],
				pickup_longitude: data['pickup_address_long'],
				// return pickup address
				return_pickup: data['return_pickup_address'] ?? '',
				return_pickup_latitude: data['return_pickup_address_lat'] ?? '',
				return_pickup_longitude: data['return_pickup_address_long'] ?? '',
				pickup_date: data['pickup_date'],
				pickup_time: data['pickup_time'],
				return_pickup_date: data['return_pickup_date'] ?? '',
				return_pickup_time: data['return_pickup_time'] ?? '',
				// pickup airport
				pickup_airport: data['pickup_airport'],
				pickup_airport_latitude: data['pickup_airport_lat'],
				pickup_airport_longitude: data['pickup_airport_long'],
				// return pickup airport
				return_pickup_airport: data['return_pickup_airport'],
				return_pickup_airport_latitude: data['return_pickup_airport_lat'],
				return_pickup_airport_longitude: data['return_pickup_airport_long'],
				// dropoff address
				dropoff: data['dropoff_address'],
				dropoff_latitude: data['dropoff_address_lat'],
				dropoff_longitude: data['dropoff_address_long'],
				// return dropoff address
				return_dropoff: data['return_dropoff_address'] ?? '',
				return_dropoff_latitude: data['return_dropoff_address_lat'] ?? '',
				return_dropoff_longitude: data['return_dropoff_address_long'] ?? '',
				// dropoff airport
				dropoff_airport: data['dropoff_airport'],
				dropoff_airport_latitude: data['dropoff_airport_lat'],
				dropoff_airport_longitude: data['dropoff_airport_long'],
				// return dropoff airport
				return_dropoff_airport: data['return_dropoff_airport'],
				return_dropoff_airport_latitude: data['return_dropoff_airport_lat'],
				return_dropoff_airport_longitude: data['return_dropoff_airport_long'],
				total_passengers: data['no_of_passenger'],
				luggage_count: data['no_of_luggage'],
				number_of_hours: data['booking_hour'] ?? '',
				number_of_vehicles: "1",
				journeyDistance: data['location_info'][0].distance.value,
				journeyTime: data['location_info'][0].duration.value,
				returnJourneyDistance: data['location_info'][1] != undefined ? data['location_info'][1].distance.value : '',
				returnJourneyTime: data['location_info'][1] != undefined ? data['location_info'][1].duration.value : ''
			})
		}
		else
		{
			// filling via Manually
			console.warn('Prefilling via Manually')
			this.bookingForm.patchValue({
				service_type: 'one_way',
				transfer_type: 'city_to_city',
				pickup_time: '12:00:00',
				return_transfer_type: 'city_to_city',
				number_of_vehicles: "1",
				travel_time: '12:00:00',
				return_travel_time: '12:30:00',
			})
		}

		// always filling values
		this.setFormValue('luggage_count', 1)
		this.setFormValue('account_type', 'individual')
		this.setFormValue('affiliate_type', 'affiliate')
		console.log('\n\n\n\n')
		console.group('Prefilled Form Group: ')
		console.log(this.bookingForm)
		console.log('\n\n\n\n')
		console.groupEnd()
		this.initMap()
	}


	/**
	 * Big Data API. Fetching airports and all database data for vehicle and driver
	 * 
	 * fills big_data_list variable
	 */
	getBigData()
	{
		const promise = new Promise((resolve) =>
		{
			if (this._adminService.getBookingData() != undefined)
			{
				resolve(this._adminService.getBookingData())
			}
			else
			{
				const interval = setInterval(() =>
				{
					if (this._adminService.getBookingData() === undefined)
					{
						this._spinner.show('fetchspinner')
					}
					else
					{
						this._spinner.hide('fetchspinner')
						clearInterval(interval)
						resolve(this._adminService.getBookingData())
					}
				}, 1500)
			}
		})
		return promise
	}

	/**
	 * Initialise the oneway_map
	 */
	initMap()
	{
		console.log('Initialising OneWay_Map')
		this.mapsAPILoader.load().then(() =>
		{
			const directionsRenderer = new google.maps.DirectionsRenderer()
			const directionsService = new google.maps.DirectionsService()
			const map = new google.maps.Map(document.getElementById("oneway_map"), {
				zoom: 7,
				center: new google.maps.LatLng(41.850033, -87.6500523),
				scaleControl: true
			})
			directionsRenderer.setMap(map)


			let waypoints = []

			if (this.Form.stop_1.value != '') 
			{
				waypoints.push({
					location: new google.maps.LatLng(this.Form.stop_1_latitude.value, this.Form.stop_1_longitude.value),
					stopover: true
				})
			}
			if (this.Form.stop_2.value != '')
			{
				waypoints.push({
					location: new google.maps.LatLng(this.Form.stop_2_latitude.value, this.Form.stop_2_longitude.value),
					stopover: true
				})
			}

			// build request
			let request = {
				waypoints: waypoints,
				optimizeWaypoints: true,
				travelMode: google.maps.TravelMode.DRIVING
			}

			if (this.Form.pickup.value != '')
			{
				request['origin'] = new google.maps.LatLng(this.Form.pickup_latitude.value, this.Form.pickup_longitude.value)
			}
			if (this.Form.dropoff.value != '')
			{
				request['destination'] = new google.maps.LatLng(this.Form.dropoff_latitude.value, this.Form.dropoff_longitude.value)
			}
			if (this.Form.pickup_airport.value != '')
			{
				request['origin'] = new google.maps.LatLng(this.Form.pickup_airport_latitude.value, this.Form.pickup_airport_longitude.value)
			}
			if (this.Form.dropoff_airport.value != '')
			{
				request['destination'] = new google.maps.LatLng(this.Form.dropoff_airport_latitude.value, this.Form.dropoff_airport_longitude.value)
			}

			console.log(request)
			return

			directionsService.route(request, (response: any, status: string) =>
			{
				if (status == google.maps.DirectionsStatus.OK)
				{
					console.log('Directions Service Response: ', response)
					directionsRenderer.setDirections(response)
					this.fetchDistanceAndTime(response).then((response: { distance: number, time: number }) =>
					{
						this.bookingForm.patchValue({
							journeyDistance: response.distance,
							journeyTime: response.time
						})
					})
				}
			})
		})
	}

	/**
	 * Initialize the return_map
	 */
	initReturnMap()
	{
		console.log('Initialising Return_Map')
		this.mapsAPILoader.load().then(() =>
		{
			const directionsRenderer = new google.maps.DirectionsRenderer()
			const directionsService = new google.maps.DirectionsService()
			const map = new google.maps.Map(document.getElementById("return_map"), {
				zoom: 8,
				center: new google.maps.LatLng(41.850033, -87.6500523),
				scaleControl: true
			})
			directionsRenderer.setMap(map)


			let return_waypoints = []

			if (this.Form.return_stop_1.value != '')
			{
				return_waypoints.push({
					location: new google.maps.LatLng(this.Form.return_stop_1_latitude.value, this.Form.return_stop_1_longitude.value),
					stopover: true,
				})
			}
			if (this.Form.return_stop_2.value != '')
			{
				return_waypoints.push({
					location: new google.maps.LatLng(this.Form.return_stop_2_latitude.value, this.Form.return_stop_2_longitude.value),
					stopover: true
				})
			}

			// build request
			let return_request = {
				origin: new google.maps.LatLng(this.Form.return_pickup_latitude.value, this.Form.return_pickup_longitude.value),
				destination: new google.maps.LatLng(this.Form.return_dropoff_latitude.value, this.Form.return_dropoff_longitude.value),
				waypoints: return_waypoints,
				optimizeWaypoints: true,
				travelMode: google.maps.TravelMode.DRIVING
			}

			directionsService.route(return_request, (response: any, status: string) =>
			{
				if (status == google.maps.DirectionsStatus.OK)
				{
					console.log('Directions Service Response: ', response)
					directionsRenderer.setDirections(response)
					this.fetchDistanceAndTime(response).then((response: { distance: number, time: number }) =>
					{
						this.bookingForm.patchValue({
							returnJourneyDistance: response.distance,
							returnJourneyTime: response.time
						})
					})
				}
			})

		})
	}

	fetchDistanceAndTime(data: any)
	{
		let total_distance = 0.0
		let total_time = 0
		const promise = new Promise((resolve) =>
		{
			data.routes[0].legs.forEach((item: any) =>
			{
				if (item.distance.value == 0)
				{
					this._errorDialog.openDialog({
						errors: {
							error: 'Please select a valid location point.'
						}
					})
					return
				}
				else
				{
					total_distance += item.distance.value
					total_time += item.duration.value
				}
			})
			resolve({
				distance: total_distance,
				time: total_time
			})
		})

		return promise
	}


	onAutocompleteSelected(result: PlaceResult, key_name: string)
	{
		console.log('onAutocompleteSelected: ', result, 'key_name: ', key_name);
		this.setFormValue(key_name, result.formatted_address)
	}

	onLocationSelected(location: Location, key_name: string)
	{
		console.log('onLocationSelected: ', location, 'key_name: ', key_name);
		this.setFormValue(key_name + '_latitude', location['latitude'])
		this.setFormValue(key_name + '_longitude', location['longitude'])
		this.initMap()
		if (this.Form.service_type.value == 'round_trip' && !key_name.includes('return_'))
		{
			if (key_name == 'pickup') 
			{
				key_name = 'dropoff'
			}
			else if (key_name == 'dropoff') 
			{
				key_name = 'pickup'
			}
			else if (key_name == 'stop_1')
			{
				key_name = 'stop_2'
			}
			else if (key_name == 'stop_2')
			{
				key_name = 'stop_1'
			}
			this.setFormValue('return_' + key_name + '_latitude', location['latitude'])
			this.setFormValue('return_' + key_name + '_longitude', location['longitude'])
		}
		this.initReturnMap()

		this.getAffiliatesListFromPickup(location['latitude'], location['longitude'])
	}

	getAffiliatesListFromPickup(latitude, longitude)
	{
		this.affiliate_list = []
		this._adminService.getAffiliatesListFromCoords(latitude, longitude).then((response: any) =>
		{
			this.affiliate_list = response.data
		})
	}

	get Form()
	{
		return this.bookingForm.controls
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

	telInputObjectMobile(obj)
	{
		this.MobileObject = obj
		console.log(obj)
	}

	onCountryChange(event)
	{
		this.Form.loose_customer.get('phone_country').setValue(event.iso2)
		this.Form.loose_customer.get('phone_isd').setValue('+' + event.dialCode)
		this.bookingForm.updateValueAndValidity()
	}

	changeDetection = {
		service_type: () =>
		{
			if (this.Form.service_type.value == 'round_trip')
			{
				this.initReturnMap()
			}
		},
		transfer_type: () =>
		{
			// fills the form with reversed value
			function ReverseStringChars(text: string)
			{
				const str = text.split('_')
				return str.reverse().join('_')
			}
			this.setFormValue('return_transfer_type', ReverseStringChars(this.Form.transfer_type.value))
		},
		checkbox: (event: any, form_key: string, chargeable: boolean) =>
		{
			if (event.target.checked)
			{
				if (chargeable)
				{
					(this.bookingForm.get('chargedAmenities') as FormArray).push(new FormControl(event.target.value))
				}
				else
				{
					(this.bookingForm.get(form_key) as FormArray).push(new FormControl(event.target.value))
				}
			}
			else
			{
				if (chargeable)
				{
					(this.bookingForm.get('chargedAmenities') as FormArray).removeAt(
						this.Form['chargedAmenities'].value.findIndex((item: any) =>
						{
							item.value == event.target.value
						})
					)
				}
				else
				{
					(this.bookingForm.get(form_key) as FormArray).removeAt(
						this.Form[form_key].value.findIndex((item: any) =>
						{
							item.value == event.target.value
						})
					)
				}
			}
		},
		countryChange: (form_key: string, value: any) =>
		{
			this.bookingForm.get(form_key).setValue(value)
			this.bookingForm.updateValueAndValidity()
		},
		selectDate: (dateType, value: any) =>
		{
			if (dateType == 'pickupDate')
			{
				console.log(value, "check date format...............")
				this.setFormValue('pickup_date', value)
			}
			else
			{
				console.log(value, "check date format...............")
				this.setFormValue('return_pickup_date', value)
			}
		},
		setVehicle: (value: string) =>
		{
			this.setFormValue('number_of_vehicles', value)
		}

	}

	/**
	 * set value in form of specified key
	 * @param key_name [Required] name of the form key
	 * @param value [Required] value to be set
	 */
	setFormValue(key_name: string, value: any)
	{
		console.log(`\nSetting Value of \"${key_name}\" as \"${value}\"\n`)
		this.bookingForm.get(key_name).setValue(value)
		this.bookingForm.updateValueAndValidity()
	}


	/**
	 * fetches list of user accounts
	 * @param account_type [Required] type of the account requested
	 */
	fetchAccounts(account_type: string): Promise<any>
	{
		const legend = {
			individual: 'individual',
			corporate: 'corporate',
			travel_planner: 'travel'
		}
		// return a new Promise object with fetched data
		return new Promise((resolve, reject) =>
		{
			this._adminService.getAccountBytype(legend[account_type]).subscribe((response: any) =>
			{
				if (response.success)
				{
					resolve(response.data)
				} else
				{
					reject(response.message || response.errors.error)
				}
			})
		})
	}

	/**
	 * Fetch Affiliates List 
	 * 
	 * @params affiliate_type: String [Required] type of requested affiliate
	 */
	fetchAffiliates(affiliate_type: string): Promise<any>
	{
		const legend = {
			affiliate: 'driver',
			loose_affiliate: 'loose_affiliate'
		}

		// return a new Promise object with fetched data
		return new Promise((resolve, reject) =>
		{
			this._adminService.getAccountBytype(legend[affiliate_type]).subscribe((response: any) =>
			{
				if (response.success)
				{
					resolve(response.data)
				} else
				{
					reject(response.message || response.errors.error)
				}
			})
		})
	}

	userSelection(user_id: number)
	{
		if (this.Form.account_type.value != 'loose_customer')
		{
			this._spinner.show()
			this.fetched_user = {}
			this._adminService.getAccountBytype(this.Form.account_type.value).subscribe((response: any) =>
			{
				this._spinner.hide()
				this.fetched_user = response.data
				this.bookingForm.patchValue({
					passenger_name: `${response.data.first_name} ${response.data.middle_name ?? ''} ${response.data.last_name}`,
					passenger_cell: response.data.mobile,
					passenger_cell_isd: response.data.mobileIsd,
					passenger_email: response.data.email
				})
				this.MobileObject.setCountry(response.data.mobileCountry);
			})
		}
	}


	fillValue(list: any, value: string | number, comparison_key: string, fetch_name: string)
	{
		if (value == null || value == '') { return '' }
		return list.find((item: any) => item[comparison_key] == value)[fetch_name]
	}


	getVehiclesandDriversFromAffiliate(affiliate_id: number)
	{
		this.affiliate_driver_list = [];
		this.affiliate_vehicle_list = [];
		this._stateManager.setprogressBar(true)
		this._adminService.adminAffiliateVehicleList(affiliate_id).then((response: any) =>
		{
			if (response.success && response.data.vehicleList.length > 0)
			{
				this.affiliate_vehicle_list = response.data.vehicleList

				// for edit case, fill vehicle details
				if (this.booking_id != 0)
				{
					this.fillVehicleDetails(this.affiliate_vehicle_list.find((item: any) => item.ID == this.Form.vehicle_id.value))
				}
				this._stateManager.setprogressBar(false)
			} else
			{
				this._stateManager.setprogressBar(false)
				console.warn('Could not fetch vehicle list')
			}
		})
		this._adminService.driverList(affiliate_id).then((response: any) =>
		{
			this.affiliate_driver_list = response.data.data
			this._stateManager.setprogressBar(false)
		})
	}


	getVehiclesFromVehicleType(vehicle_type_id: number)
	{
		// get vehicle object from chosen vehicle type
		const vehicle_chosen = this.affiliate_vehicle_list.filter((item: any) => item.ID == vehicle_type_id)
		this.fillVehicleDetails(vehicle_chosen[0])
		// if (vehicle_chosen.length == 1)
		// {
		// 	this.fillVehicleDetails(vehicle_chosen[0])
		// } else
		// {
		// 	this.affiliate_vehicle_list = vehicle_chosen
		// }
	}

	fillVehicleDetails(vehicle_obj: any)
	{
		this.bookingForm.patchValue({
			vehicle_id: vehicle_obj.ID,
			vehicle_make: this.big_data_list['vehicleMakes'].find((item: any) => item.name == vehicle_obj.make)['id'],
			vehicle_model: this.big_data_list['vehicleModels'].find((item: any) => item.name == vehicle_obj.model)['id'],
			vehicle_year: this.big_data_list['vehicleYears'].find((item: any) => item.name == vehicle_obj.year)['id'],
			vehicle_color: this.big_data_list['vehicleColors'].find((item: any) => item.name == vehicle_obj.color)['id'],
			license_plate: vehicle_obj.licensePlate,
			number_of_seats: vehicle_obj.seats,
		})
	}

	/**
	 * fills details of the driver based on the specified id
	 * @param driver_id [Required] id of the driver selected
	 */
	fillDriverDetails(driver_id: number = 0)
	{
		let driver_chosen = this.affiliate_driver_list.find((item: any) => item.id == driver_id)
		this.bookingForm.patchValue({
			driver_name: `${driver_chosen.FirstName} ${driver_chosen.MiddleName ?? ''} ${driver_chosen.LastName}`,
			driver_gender: driver_chosen.Gender,
			driver_cell_isd: driver_chosen.CellIsd,
			driver_cell: driver_chosen.CellNumber,
			driver_email: driver_chosen.Email,
			driver_phone_type: driver_chosen.PhoneType
		})
	}


	fillFormArray(form_key: string, value: Array<any>)
	{
		console.log(value)
		value.forEach((item: any) =>
		{
			(this.bookingForm.get(form_key) as FormArray).push(new FormControl(item))
		})
	}


	fetchModels(make_id: number)
	{
		this.big_data_list['vehicleModels'] = this.big_data_list['vehicleModels'].filter((item: any) => item.make_id == make_id)
	}

	onChildVeteranDodChange(e, type)
	{
		switch (type)
		{
			case 'driver_veteran':
				{
					if (e.target.selected)
					{
						this.bookingForm.patchValue({
							driver_veteran: 'yes'
						});
					} else
					{
						this.bookingForm.patchValue({
							driver_veteran: 'no'
						});
					}
					break;
				}
			case 'driver_dod':
				{
					if (e.target.selected)
					{
						this.bookingForm.patchValue({
							driver_dod: 'yes'
						});
					} else
					{
						this.bookingForm.patchValue({
							driver_dod: 'no'
						});
					}
					break;
				}
			case 'driver_foid_card':
				{
					if (e.target.selected)
					{
						this.bookingForm.patchValue({
							driver_foid_card: 'yes'
						});
					} else
					{
						this.bookingForm.patchValue({
							driver_foid_card: 'no'
						});
					}
					break;
				}
			case 'driver_ex_law_officer':
				{
					if (e.target.selected)
					{
						this.bookingForm.patchValue({
							driver_ex_law_officer: 'yes'
						});
					} else
					{
						this.bookingForm.patchValue({
							driver_ex_law_officer: 'no'
						});
					}
					break;
				}
			case 'driver_background_certified':
				{
					if (e.target.selected)
					{
						this.bookingForm.patchValue({
							driver_background_certified: 'yes'
						});
					} else
					{
						this.bookingForm.patchValue({
							driver_background_certified: 'no'
						});
					}
					break;
				}
		}
		// console.log(this.bookingForm);
	}

	isCheckboxSelected(list: any, comparison_key: string, comparison_obj: any): boolean
	{
		return list != null ? list.some((item: any) => item == comparison_obj[comparison_key]) : false
	}


	is_save_button_disabled: boolean = false
	submitForm(preview: boolean = false)
	{
		if (this.bookingForm.invalid)
		{
			console.warn('\n\n\nInvalid Form\n\n\n')
			console.log(this.bookingForm)
			return
		}
		console.log(this.bookingForm.value)


		if (preview)
		{
			this._spinner.show()
			this.bookingForm.value.number_of_vehicles = this.bookingForm.value.number_of_vehicles != null ? parseInt(this.bookingForm.value.number_of_vehicles) : 1
			this._adminService.createBooking(this.bookingForm.value).subscribe((response: any) =>
			{
				if (response)
				{
					this._router.navigate(['/admin/daily-bookings-admin'])
					return
					// 	, {
					// 	queryParams: {
					// 		bookingId: response.data.reservation_id
					// 	},
					// 	queryParamsHandling: 'merge'
					// }
				}
				else
				{
					this.is_save_button_disabled = false
					return
				}
			})
		}
		else
		{
			$('#previewModal').modal('handleUpdate').modal('show')
		}
	}


	resetForm()
	{
		this.bookingForm.reset()
	}


	textFormat(text: any, list: any = null)
	{
		if (typeof text == 'string' && isNaN(parseInt(text)))
		{
			return text.replace(/[_-]/g, ' ')
		}
		if (typeof text == 'number' || (typeof text == 'string' && !isNaN(parseInt(text))))	
		{
			return text
		}
	}



	searchBigDataListValue(type: string, text: string)
	{
		const model = {
			year: 'vehicleYears',
			color: 'vehicleColors',
			make: 'vehicleMakes',
			model: 'vehicleModels'
		}

		if (text == '')
		{
			this.big_data_list[model[type]] = this.big_data_list_copy[model[type]]
		}
		else
		{
			const object = this.globalFunctions.ListSearch('filter', this.big_data_list[model[type]], text, 'name')

			if (object)
			{
				this.big_data_list[model[type]] = object
			}
			else
			{
				console.error('Could Not Find Objects.\n Fetching Errors....')
			}
		}
	}

	fillBigDataListValue(type: string, form_control: string)
	{
		const model = {
			year: 'vehicleYears',
			color: 'vehicleColors',
			make: 'vehicleMakes',
			model: 'vehicleModels'
		}

		if (this.Form[form_control].value)
		{
			const searchvalue = this.globalFunctions.ListSearch('find', this.big_data_list[model[type]], this.Form[form_control].value, 'id')
			if (searchvalue)
			{
				return searchvalue['name']
			}
		}
		else
		{
			return ''
		}
	}

	selectBigDataListValue(type: string, selected_id: number, form_control: string, autofill: boolean = false)
	{
		const model = {
			year: 'vehicleYears',
			color: 'vehicleColors',
			make: 'vehicleMakes',
			model: 'vehicleModels'
		}

		const searchvalue = this.globalFunctions.ListSearch('find', this.big_data_list[model[type]], selected_id, 'id')
		if (searchvalue)
		{
			this.setFormValue(form_control, searchvalue.id)
			if (type == 'make')
			{
				this.selectBigDataListValue('model', searchvalue.id, 'vehicle_model', true)
			}
		}
	}

	searchAirport(text: string)
	{
		if (text.length == 0)
		{
			this.big_data_list.airportsData = this.big_data_list_copy.airportsData
		}
		else
		{
			this.big_data_list.airportsData = this.big_data_list_copy.airportsData.filter((item: any) => item.name.toLowerCase().includes(text.toLowerCase()))
		}
	}

	searchAirline(text: string)
	{
		if (text.length == 0)
		{
			this.big_data_list.airportsData = this.big_data_list_copy.airlinesData
		}
		else
		{
			this.big_data_list.airlinesData = this.big_data_list_copy.airlinesData.filter((item: any) => item.name.toLowerCase().includes(text.toLowerCase()))
		}
	}

	chooseAirportAirline(value_id: number, type: string)
	{
		this.setFormValue(type, value_id)
	}

	selectAirportAirline(list: any, value: any)
	{
		return list.find((item: any) => item.id == value)['name']
	}

	/**
	 * upload image with the specified name and set form value with its id.
	 * @param event input event
	 * @param image_type String [Required] type of the image being uploaded
	 * @param image_id [Optional] id of the image to be edited
	 */
	uploadImage(event: any, image_type: string)
	{
		let image: any
		if (event.target.files && event.target.files.length > 0)
		{
			const reader = new FileReader()
			const file = event.target.files[0]
			reader.readAsDataURL(file)
			reader.onload = () =>
			{
				image = reader.result as string
				this._adminService.uploadVehicleImage(image).subscribe((response: any) =>
				{
					this[image_type] = { image: response.data.image, id: response.data.ID }
					this.setFormValue(image_type + '_id', this[image_type]['id'])
				})
			}
		}
	}


	/**
	 * Delete the image from the form. Basically sets the form value, empty.
	 * @param image_type String [Required] type of the image to delete
	 */
	deleteImage(image_type: string)
	{
		this[image_type] = {}
		this.setFormValue(image_type + '_id', '')
	}


	showImageModal(image: string)
	{
		this.modal_image = image
		$("#imageModal").addClass("showImage");
		$("#imageModal").removeClass("d-none");
	}

	closeImageModal()
	{
		this.close_image_modal.emit()
	}



































	// ----------------------------------------------------------------------------------------

	origin: any
	destination: any
	waypoints: any
	pickupLat: any
	pickupLng: any
	dropoffLng: any
	dropoffLat: any
	stop1Lat: any
	stop1Lng: any
	stop2Lat: any
	stop2Lng: any
	journeyDistanceTotal: any
	journeyTimeTotal: any
	returnOrigin: any
	returnDestination: any
	returnWaypoints: any
	returnPickupLat: any
	returnPickupLng: any
	returnDropoffLng: any
	returnDropoffLat: any
	returnStop1Lat: any
	returnStop1Lng: any
	returnStop2Lat: any
	returnStop2Lng: any
	returnJourneyDistanceTotal: any
	returnJourneyTimeTotal: any

	init()
	{
		this.pickupLat = this.bookingForm.get('pickup_latitude').value
		this.pickupLng = this.bookingForm.get('pickup_longitude').value
		this.dropoffLat = this.bookingForm.get('dropoff_latitude').value
		this.dropoffLng = this.bookingForm.get('dropoff_longitude').value
		this.stop1Lat = this.bookingForm.get('stop_1_latitude').value
		this.stop1Lng = this.bookingForm.get('stop_1_longitude').value
		this.stop2Lat = this.bookingForm.get('stop_2_latitude').value
		this.stop2Lng = this.bookingForm.get('stop_2_longitude').value

		this.returnPickupLat = this.bookingForm.get('return_pickup_latitude').value
		this.returnPickupLng = this.bookingForm.get('return_pickup_longitude').value
		this.returnDropoffLat = this.bookingForm.get('return_dropoff_latitude').value
		this.returnDropoffLng = this.bookingForm.get('return_dropoff_longitude').value
		this.returnStop1Lat = this.bookingForm.get('return_stop_1_latitude').value
		this.returnStop1Lng = this.bookingForm.get('return_stop_1_longitude').value
		this.returnStop2Lat = this.bookingForm.get('return_stop_2_latitude').value
		this.returnStop2Lng = this.bookingForm.get('return_stop_2_longitude').value
	}
	directionMarked()
	{
		this.origin = { lat: this.pickupLat, lng: this.pickupLng };
		this.destination = { lat: this.dropoffLat, lng: this.dropoffLng };
		this.waypoints = [];
		if (this.stop1Lat && this.stop1Lng)
		{
			this.waypoints.push({ location: { lat: this.stop1Lat, lng: this.stop1Lng } });
		}
		if (this.stop2Lat && this.stop2Lng)
		{
			this.waypoints.push({ location: { lat: this.stop2Lat, lng: this.stop2Lng } });
		}
	}
	async pathInfo()
	{
		let journeyDistance1 = 0;
		let journeyDistance2 = 0;
		let journeyDistance3 = 0;
		let journeyTime1 = 0;
		let journeyTime2 = 0;
		let journeyTime3 = 0;
		if (this.pickupLat && this.pickupLng && this.dropoffLat && this.dropoffLng)
		{
			if (!(this.stop1Lat && this.stop1Lng) && !(this.stop2Lat && this.stop2Lng))//in case of no stops
			{
				const origin = { lat: this.pickupLat, lng: this.pickupLng };
				const destination = { lat: this.dropoffLat, lng: this.dropoffLng };
				this.fetchDistanceTime(origin, destination).then(res =>
				{
					journeyDistance1 = res.distance.value;
					journeyTime1 = res.duration.value;
					//calculate total distance/time
					this.journeyDistanceTotal = journeyDistance1 + journeyDistance2 + journeyDistance3;
					this.journeyTimeTotal = journeyTime1 + journeyTime2 + journeyTime3;
				});
			}
			else
			{
				if (this.stop1Lat && this.stop1Lng && this.stop2Lat && this.stop2Lng)//in case of both stops
				{
					var origin = { lat: this.pickupLat, lng: this.pickupLng };
					var destination = { lat: this.stop1Lat, lng: this.stop1Lng };
					this.fetchDistanceTime(origin, destination).then(res =>
					{
						var stop1Res = res;
						var distanceStop1 = res.distance.value;
						// origin = { lat: this.pickupLat, lng: this.pickupLng };
						destination = { lat: this.stop2Lat, lng: this.stop2Lng };
						this.fetchDistanceTime(origin, destination).then(res =>
						{
							var stop2Res = res;
							var distanceStop2 = res.distance.value;
							if (distanceStop1 < distanceStop2)//find distance/time of nearest point first
							{
								//find distance/time between pickup and stop1
								journeyDistance1 = stop1Res.distance.value;
								journeyTime1 = stop1Res.duration.value;
								//find distance/time between stop1 and stop2
								var origin = { lat: this.stop1Lat, lng: this.stop1Lng };
								var destination = { lat: this.stop2Lat, lng: this.stop2Lng };
								this.fetchDistanceTime(origin, destination).then(res =>
								{
									journeyDistance2 = res.distance.value;
									journeyTime2 = res.duration.value;
									//find distance/time between stop2 and dropoff
									var origin = { lat: this.stop2Lat, lng: this.stop2Lng };
									destination = { lat: this.dropoffLat, lng: this.dropoffLng };
									this.fetchDistanceTime(origin, destination).then(res =>
									{
										journeyDistance3 = res.distance.value;
										journeyTime3 = res.duration.value;
										//calculate total distance/time
										this.journeyDistanceTotal = journeyDistance1 + journeyDistance2 + journeyDistance3;
										this.journeyTimeTotal = journeyTime1 + journeyTime2 + journeyTime3;
									});
								});
							}
							else
							{
								//find distance/time between pickup and stop2
								journeyDistance1 = stop2Res.distance.value;
								journeyTime1 = stop2Res.duration.value;
								//find distance/time between stop2 and stop1
								var origin = { lat: this.stop2Lat, lng: this.stop2Lng };
								var destination = { lat: this.stop1Lat, lng: this.stop1Lng };
								this.fetchDistanceTime(origin, destination).then(res =>
								{
									journeyDistance2 = res.distance.value;
									journeyTime2 = res.duration.value;
									//find distance/time between stop1 and dropoff
									var origin = { lat: this.stop1Lat, lng: this.stop1Lng };
									destination = { lat: this.dropoffLat, lng: this.dropoffLng };
									this.fetchDistanceTime(origin, destination).then(res =>
									{
										journeyDistance3 = res.distance.value;
										journeyTime3 = res.duration.value;
										//calculate total distance/time
										this.journeyDistanceTotal = journeyDistance1 + journeyDistance2 + journeyDistance3;
										this.journeyTimeTotal = journeyTime1 + journeyTime2 + journeyTime3;
									});
								});
							}
						});
					});
				}
				else
				{
					if (this.stop1Lat && this.stop1Lng)//in case of 1st stop only
					{
						//find distance/time between pickup and stop1
						var origin = { lat: this.pickupLat, lng: this.pickupLng };
						var destination = { lat: this.stop1Lat, lng: this.stop1Lng };
						this.fetchDistanceTime(origin, destination).then(res =>
						{
							journeyDistance1 = res.distance.value;
							journeyTime1 = res.duration.value;
							//find distance/time between stop1 and dropoff
							origin = { lat: this.stop1Lat, lng: this.stop1Lng };
							destination = { lat: this.dropoffLat, lng: this.dropoffLng };
							this.fetchDistanceTime(origin, destination).then(res =>
							{
								journeyDistance2 = res.distance.value;
								journeyTime2 = res.duration.value;
								//calculate total distance/time
								this.journeyDistanceTotal = journeyDistance1 + journeyDistance2 + journeyDistance3;
								this.journeyTimeTotal = journeyTime1 + journeyTime2 + journeyTime3;
							});
						});
					}
					else if (this.stop2Lat && this.stop2Lng)//in case of 2nd stop only
					{
						//find distance/time between pickup and stop2
						var origin = { lat: this.pickupLat, lng: this.pickupLng };
						destination = { lat: this.stop2Lat, lng: this.stop2Lng };
						this.fetchDistanceTime(origin, destination).then(res =>
						{
							journeyDistance1 = res.distance.value;
							journeyTime1 = res.duration.value;
							//find distance/time between stop2 and dropoff
							origin = { lat: this.stop2Lat, lng: this.stop2Lng };
							destination = { lat: this.dropoffLat, lng: this.dropoffLng };
							this.fetchDistanceTime(origin, destination).then(res =>
							{
								journeyDistance2 = res.distance.value;
								journeyTime2 = res.duration.value;
								//calculate total distance/time
								this.journeyDistanceTotal = journeyDistance1 + journeyDistance2 + journeyDistance3;
								this.journeyTimeTotal = journeyTime1 + journeyTime2 + journeyTime3;
							});
						});
					}
				}
			}
		}
	}



	async fetchDistanceTime(origin, destination)
	{
		const service = new google.maps.DistanceMatrixService();
		const response = await new Promise(resolve =>
			service.getDistanceMatrix({
				origins: [origin],
				destinations: [destination],
				travelMode: google.maps.TravelMode.DRIVING,
				unitSystem: google.maps.UnitSystem.METRIC,
				avoidHighways: false,
				avoidTolls: false,
			}, (response) => resolve({ response })));
		// console.log('dasda',response.rows[0].elements[0])
		if (response['rows'][0].elements[0].status != 'OK')
		{
			alert('NO PATH FOUND!');
			return false;
		}
		return response['rows'][0].elements[0];
	}
	returnDirectionMarked()
	{
		this.returnOrigin = { lat: this.returnPickupLat, lng: this.returnPickupLng };
		this.returnDestination = { lat: this.returnDropoffLat, lng: this.returnDropoffLng };
		this.returnWaypoints = [];
		if (this.returnStop1Lat && this.returnStop1Lng)
		{
			this.returnWaypoints.push({ location: { lat: this.returnStop1Lat, lng: this.returnStop1Lng } });
		}
		if (this.returnStop2Lat && this.returnStop2Lng)
		{
			this.returnWaypoints.push({ location: { lat: this.returnStop2Lat, lng: this.returnStop2Lng } });
		}
	}


	async returnPathInfo()
	{
		let returnJourneyDistance1 = 0;
		let returnJourneyDistance2 = 0;
		let returnJourneyDistance3 = 0;
		let returnJourneyTime1 = 0;
		let returnJourneyTime2 = 0;
		let returnJourneyTime3 = 0;
		if (this.returnPickupLat && this.returnPickupLng && this.returnDropoffLat && this.returnDropoffLng)
		{
			if (!(this.returnStop1Lat && this.returnStop1Lng) && !(this.returnStop2Lat && this.returnStop2Lng))//in case of no stops
			{
				const origin = { lat: this.returnPickupLat, lng: this.returnPickupLng };
				const destination = { lat: this.returnDropoffLat, lng: this.returnDropoffLng };
				this.fetchDistanceTime(origin, destination).then(res =>
				{
					returnJourneyDistance1 = res.distance.value;
					returnJourneyTime1 = res.duration.value;
					//calculate total distance/time
					this.returnJourneyDistanceTotal = returnJourneyDistance1 + returnJourneyDistance2 + returnJourneyDistance3;
					this.returnJourneyTimeTotal = returnJourneyTime1 + returnJourneyTime2 + returnJourneyTime3;
				});
			}
			else
			{
				if (this.returnStop1Lat && this.returnStop1Lng && this.returnStop2Lat && this.returnStop2Lng)//in case of both stops
				{
					var origin = { lat: this.returnPickupLat, lng: this.returnPickupLng };
					var destination = { lat: this.returnStop1Lat, lng: this.returnStop1Lng };
					this.fetchDistanceTime(origin, destination).then(res =>
					{
						var stop1Res = res;
						var distanceStop1 = res.distance.value;
						// origin = { lat: this.pickupLat, lng: this.pickupLng };
						destination = { lat: this.stop2Lat, lng: this.stop2Lng };
						this.fetchDistanceTime(origin, destination).then(res =>
						{
							var stop2Res = res;
							var distanceStop2 = res.distance.value;
							if (distanceStop1 < distanceStop2)//find distance/time of nearest point first
							{
								//find distance/time between pickup and stop1
								returnJourneyDistance1 = stop1Res.distance.value;
								returnJourneyTime1 = stop1Res.duration.value;
								//find distance/time between stop1 and stop2
								var origin = { lat: this.returnStop1Lat, lng: this.returnStop1Lng };
								var destination = { lat: this.returnStop2Lat, lng: this.returnStop2Lng };
								this.fetchDistanceTime(origin, destination).then(res =>
								{
									returnJourneyDistance2 = res.distance.value;
									returnJourneyTime2 = res.duration.value;
									//find distance/time between stop2 and dropoff
									var origin = { lat: this.returnStop2Lat, lng: this.returnStop2Lng };
									destination = { lat: this.returnDropoffLat, lng: this.returnDropoffLng };
									this.fetchDistanceTime(origin, destination).then(res =>
									{
										returnJourneyDistance3 = res.distance.value;
										returnJourneyTime3 = res.duration.value;
										//calculate total distance/time
										this.returnJourneyDistanceTotal = returnJourneyDistance1 + returnJourneyDistance2 + returnJourneyDistance3;
										this.returnJourneyTimeTotal = returnJourneyTime1 + returnJourneyTime2 + returnJourneyTime3;
									});
								});
							}
							else
							{
								//find distance/time between pickup and stop2
								returnJourneyDistance1 = stop2Res.distance.value;
								returnJourneyTime1 = stop2Res.duration.value;
								//find distance/time between stop2 and stop1
								var origin = { lat: this.returnStop2Lat, lng: this.returnStop2Lng };
								var destination = { lat: this.returnStop1Lat, lng: this.returnStop1Lng };
								this.fetchDistanceTime(origin, destination).then(res =>
								{
									returnJourneyDistance2 = res.distance.value;
									returnJourneyTime2 = res.duration.value;
									//find distance/time between stop1 and dropoff
									var origin = { lat: this.returnStop1Lat, lng: this.returnStop1Lng };
									destination = { lat: this.returnDropoffLat, lng: this.returnDropoffLng };
									this.fetchDistanceTime(origin, destination).then(res =>
									{
										returnJourneyDistance3 = res.distance.value;
										returnJourneyTime3 = res.duration.value;
										//calculate total distance/time
										this.returnJourneyDistanceTotal = returnJourneyDistance1 + returnJourneyDistance2 + returnJourneyDistance3;
										this.returnJourneyTimeTotal = returnJourneyTime1 + returnJourneyTime2 + returnJourneyTime3;
									});
								});
							}
						});
					});
				}
				else
				{
					if (this.returnStop1Lat && this.returnStop1Lng)//in case of 1st stop only
					{
						//find distance/time between pickup and stop1
						var origin = { lat: this.returnPickupLat, lng: this.returnPickupLng };
						var destination = { lat: this.returnStop1Lat, lng: this.returnStop1Lng };
						this.fetchDistanceTime(origin, destination).then(res =>
						{
							returnJourneyDistance1 = res.distance.value;
							returnJourneyTime1 = res.duration.value;
							//find distance/time between stop1 and dropoff
							origin = { lat: this.returnStop1Lat, lng: this.returnStop1Lng };
							destination = { lat: this.returnDropoffLat, lng: this.returnDropoffLng };
							this.fetchDistanceTime(origin, destination).then(res =>
							{
								returnJourneyDistance2 = res.distance.value;
								returnJourneyTime2 = res.duration.value;
								//calculate total distance/time
								this.returnJourneyDistanceTotal = returnJourneyDistance1 + returnJourneyDistance2 + returnJourneyDistance3;
								this.returnJourneyTimeTotal = returnJourneyTime1 + returnJourneyTime2 + returnJourneyTime3;
							});
						});
					}
					else if (this.returnStop2Lat && this.returnStop2Lng)//in case of 2nd stop only
					{
						//find distance/time between pickup and stop2
						var origin = { lat: this.returnPickupLat, lng: this.returnPickupLng };
						destination = { lat: this.returnStop2Lat, lng: this.returnStop2Lng };
						this.fetchDistanceTime(origin, destination).then(res =>
						{
							returnJourneyDistance1 = res.distance.value;
							returnJourneyTime1 = res.duration.value;
							//find distance/time between stop2 and dropoff
							origin = { lat: this.returnStop2Lat, lng: this.returnStop2Lng };
							destination = { lat: this.returnDropoffLat, lng: this.returnDropoffLng };
							this.fetchDistanceTime(origin, destination).then(res =>
							{
								returnJourneyDistance2 = res.distance.value;
								returnJourneyTime2 = res.duration.value;
								//calculate total distance/time
								this.returnJourneyDistanceTotal = returnJourneyDistance1 + returnJourneyDistance2 + returnJourneyDistance3;
								this.returnJourneyTimeTotal = returnJourneyTime1 + returnJourneyTime2 + returnJourneyTime3;
							});
						});
					}
				}
			}
		}
	}
}