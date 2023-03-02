import { Component, EventEmitter, OnInit, ViewChild, isDevMode } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { pluck } from 'rxjs/operators';

import { MapsAPILoader } from '@agm/core';
import { AdminService } from 'src/app/services/admin.service';
import { SharedModule } from 'src/app/components/shared/shared.module'
import { NgxSpinnerService } from 'ngx-spinner';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import * as moment from 'moment';
import { RatesFormComponent } from '../rates-form/rates-form.component';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';

declare var $: any
@Component({
	selector: 'app-new-booking',
	templateUrl: './new-booking.component.html',
	styleUrls: ['./new-booking.component.scss']
})
export class NewBookingComponent implements OnInit {

	@ViewChild('searchInput', { read: MatAutocompleteTrigger }) triggerAutoCompleteInput: MatAutocompleteTrigger

	todays_date: string = moment().format('YYYY-MM-DD');

	booking_params: any = {
		transfer_types: ["airport_to_city", "airport_to_airport", "airport_to_cruise", "city_to_city", "city_to_airport", "city_to_cruise", "cruise_to_airport", "cruise_to_city"],
		client_account_types: ['individual', 'corporate', 'travel_planner', 'loose_customer'],
		affiliate_accounts: ['affiliate', 'loose_affiliate'],
		numbers: (() => {
			let arr = []
			for (let i = 0; i < 20; i++) {
				arr.push(i)
			}
			return arr
		})(),
		years: (() => {
			let arr = []
			let i = 0;
			let year = new Date().getFullYear();
			while (i <= 15) {
				arr.push(year + i);
				i++;
			}
			return arr
		})(),
		chevrons: {
			languages: false,
			dresses: false,
			amenities: false,
			images: false,
			taxnrates: false,
		}
	}

	LCTelObject: any
	PaxTelObject: any
	DrvTelObject: any
	LATelObject: any

	BookingForm: FormGroup
	RatesForm: any
	ReturnRatesForm: any

	booking_id: number = 0

	driver_image: Record<string, any> = {}
	vehicle_image: Record<string, any> = {}

	BigData: any
	BigData_COPY: any
	AffiliateInformation: Record<string, any> = {}
	ClientAccounts: Array<Record<string, any>> = []
	AffiliateAccounts: Array<Record<string, any>> = []
	VehicleList: Array<Record<string, any>> = []
	DriverList: Array<Record<string, any>> = []

	chosen_user: Record<string, any>

	distance: number = 0
	return_distance: number = 0
	distance_for_rates: string = ''
	amenities: Array<string> = []

	init_rates: boolean = false
	init_return_rates: boolean = false
	is_loose_customer_unique: boolean = false
	is_booking_edit_case: boolean = false
	reset_button: boolean = false


	constructor(
		private $form: FormBuilder,
		private $api: AdminService,
		private $shared: SharedModule,
		private $spinner: NgxSpinnerService,
		private $mapsapi: MapsAPILoader,
		private $errors: ErrorDialogService,
		private $router: Router,
		private $routeurl: ActivatedRoute,
		private customValidator: CustomvalidationService
	) { }

	openAutoCompletePanel() {
		this.triggerAutoCompleteInput.openPanel();
	}
	ngOnInit(): void {

		// build the form first 
		this.buildBookingForm()
		this.$routeurl.queryParams.subscribe((params: any) => {
			if (params && params.bookingId && !this.booking_id) {
				this.is_booking_edit_case = true
				this.SetFormValue('reservation_id', params.bookingId)
				params.updateType ? this.SetFormValue('updateType', params.updateType) : this.SetFormValue('updateType', 'edit')
			}
			else {
				this.resetFields()
			}
			// place in query params to reinitialise things when modes of new and edit are toggled
			// Subscriptions
			this.Subscriptions()
			this.fetchClientAccounts('individual')
			this.fetchAffiliates('affiliate')
			this.select(true, 'driver_languages', 1)
		})

		// fetch the big data
		this.fetchAirportsAndBigData()

	}

	dateFormat(value: any) {
		return moment(value, 'YYYY-MM-DD').format('ll')
	}

	dateFormat2(value: any) {
		return moment(value, 'YYYY-MM-DD').format('L')
	}

	timeFormat(value: any) {
		if (value.toUpperCase() == '12:00 AM') {
			return '0000 h'
		}
		let hours = moment(moment(value, 'hh:mm a').format('HH'), 'HH').hours();
		let mins = moment(value, 'hh:mm a').minutes().toString();
		if (Number(mins) == 0 || Number(mins) < 10) {
			mins = '0' + mins.toString();
		}

		return hours < 10 ? '0' + hours.toString() + mins.toString() + ' h' : hours.toString() + mins.toString() + ' h'
		//return value.replace(':', '').substring(0, 5) + 'h';
	}

	timeFormat2(value: string) {
		return moment(value, 'HH:mm a').format('h:mm a');
	}

	textFormatter(text: string) {
		try {
			return text.replace(/[\\\_$]+/g, ' ')
		}
		catch
		{
			return text
		}
	}

	mToMi(distance: number): string {
		return (distance / 1609).toFixed(2)
	}

	mToKm(distance: number): string {
		return (distance / 1000).toFixed(2)
	}

	/**
	* Returns true/false depending on the existence of search_string in text.
	* @param text [Required] text where to search ?
	* @param search_string [Required] text what to search ?
	* @param start [Optional] search starting point. Default 0
	* @returns boolean
	*/
	searchSubstring(text: string, search_string: string, start: number = 0): boolean {
		return text.indexOf(search_string, start) != -1
	}


	/**
	* Booking Form
	*/
	buildBookingForm() {
		this.BookingForm = this.$form.group({
			service_type: ['one_way', Validators.required],
			transfer_type: ['city_to_city', Validators.required],
			return_transfer_type: ['city_to_city', Validators.required],
			number_of_hours: ['0'],
			acc_id: [''],
			account_type: ['individual'],
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
			passenger_name: ['', Validators.pattern("^[A-Za-z0-9]*( [A-Za-z0-9]+)*$")],
			passenger_email: ['', Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$")],
			passenger_cell: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			passenger_cell_isd: ['+1'],
			passenger_cell_country: ['us'],
			total_passengers: [1],
			luggage_count: [0],
			booking_instructions: [''],
			affiliate_type: ['affiliate'],
			affiliate_id: [''],
			lose_affiliate_name: ['', Validators.pattern("^[A-Za-z0-9]*( [A-Za-z0-9]+)*$")],
			lose_affiliate_phone: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			lose_affiliate_phone_isd: ['+1'],
			lose_affiliate_phone_country: ['us'],
			lose_affiliate_email: ['', Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$")],
			vehicle_type: [''],
			vehicle_id: [''],
			vehicle_make: [''],
			vehicle_model: [''],
			vehicle_year: [''],
			vehicle_color: [''],
			vehicle_license_plate: ['', Validators.pattern("^[A-Za-z0-9]*( [A-Za-z0-9]+)*$")],
			vehicle_seats: ['4', Validators.pattern("^[0-9]*$")],
			driver_id: [''],
			driver_name: ['', Validators.pattern("^[A-Za-z0-9]*( [A-Za-z0-9]+)*$")],
			driver_gender: [''],
			driver_cell: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			driver_cell_isd: ['+1'],
			driver_cell_country: ['us'],
			driver_email: ['', Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$")],
			driver_phone_type: [''],
			driver_image_id: [''],
			vehicle_image_id: [''],
			meet_greet_choices: [''],
			number_of_vehicles: [''],
			pickup_date: [''],
			pickup_time: ['12:00 am'],
			extra_stops: this.$form.array([]),
			pickup: [''],
			pickup_latitude: [''],
			pickup_longitude: [''],
			pickup_airport_option: [''],
			pickup_airport: [''],
			pickup_airport_name: [''],
			pickup_airport_latitude: [''],
			pickup_airport_longitude: [''],
			pickup_airline_option: [''],
			pickup_airline: [''],
			pickup_airline_name: [''],
			pickup_flight: [''],
			origin_airport_city: [''],
			cruise_port: [''],
			cruise_name: [''],
			cruise_time: [''],
			dropoff: [''],
			dropoff_latitude: [''],
			dropoff_longitude: [''],
			dropoff_airport_option: [''],
			dropoff_airport: [''],
			dropoff_airport_name: [''],
			dropoff_airport_latitude: [''],
			dropoff_airport_longitude: [''],
			dropoff_airline_option: [''],
			dropoff_airline: [''],
			dropoff_airline_name: [''],
			dropoff_flight: [''],
			return_meet_greet_choices: [''],
			return_pickup_date: [''],
			return_pickup_time: ['12:00 pm'],
			return_extra_stops: this.$form.array([]),
			return_pickup: [''],
			return_pickup_latitude: [''],
			return_pickup_longitude: [''],
			return_pickup_airport_option: [''],
			return_pickup_airport: [''],
			return_pickup_airport_name: [''],
			return_pickup_airport_latitude: [''],
			return_pickup_airport_longitude: [''],
			return_pickup_airline_option: [''],
			return_pickup_airline: [''],
			return_pickup_airline_name: [''],
			return_pickup_flight: [''],
			return_cruise_port: [''],
			return_cruise_name: [''],
			return_cruise_time: [''],
			return_dropoff: [''],
			return_dropoff_latitude: [''],
			return_dropoff_longitude: [''],
			return_dropoff_airport_option: [''],
			return_dropoff_airport: [''],
			return_dropoff_airport_name: [''],
			return_dropoff_airport_latitude: [''],
			return_dropoff_airport_longitude: [''],
			return_dropoff_airline_option: [''],
			return_dropoff_airline: [''],
			return_dropoff_airline_name: [''],
			return_dropoff_flight: [''],
			driver_languages: this.$form.array([]),
			driver_dresses: this.$form.array([]),
			amenities: this.$form.array([]),
			chargedAmenities: this.$form.array([]),
			journeyDistance: [''],
			journeyTime: [''],
			returnJourneyDistance: [''],
			returnJourneyTime: [''],
			reservation_id: [''],
			updateType: [''],
		})

		let month = new Date().getMonth()
		let date: string | number = new Date().getDate() + 1
		let year = new Date().getFullYear()


		let full_date = new Date(year, month, date).toISOString()
		// 10 days later
		let future_full_date = new Date(year, month, date).toISOString()
		this.SetFormValue('pickup_date', full_date.slice(0, full_date.indexOf('T')))
		this.SetFormValue('return_pickup_date', future_full_date.slice(0, future_full_date.indexOf('T')))
		this.SetFormValue('number_of_vehicles', 1)
		this.SetFormValue('booking_instructions', 'Text client day before each booking to confirm driver name and cell #');
	}

	prefillViaBookingID(booking_id: number) {
		// console.warn('Prefilling via Booking Id')
		this.$spinner.show('normalspinner');
		this.$api.getBookingDataForEdit(booking_id, this.Form.updateType.value).subscribe((response: any) => {
			let editing_data = response.data
			this.autofillData('cruise', editing_data);
			console.log(editing_data, "check big data")
			for (let item in editing_data) {
				if (item.includes('extra_stops') || item.includes('languages') || item.includes('dresses'), item.toLowerCase().includes('amenities')) {
					// console.log('Skipping in the case of Extra Stops. ')
				}
				if (editing_data[item]) {
					if (isNaN(Number(editing_data[item]))) {
						this.SetFormValue(item, editing_data[item]);
					} else {
						this.SetFormValue(item, Number(editing_data[item]));
					}
				}
			}
			this.SetFormValue('pickup_airport_option', this.BigData.airportsData.find((item: any) => item.id == this.Form.pickup_airport.value));
			this.SetFormValue('pickup_airline_option', this.BigData.airlinesData.find((item: any) => item.id == this.Form.pickup_airline.value));
			this.SetFormValue('dropoff_airport_option', this.BigData.airportsData.find((item: any) => item.id == this.Form.dropoff_airport.value));
			this.SetFormValue('dropoff_airline_option', this.BigData.airlinesData.find((item: any) => item.id == this.Form.dropoff_airline.value));
			this.SetFormValue('return_pickup_airport_option', this.BigData.airportsData.find((item: any) => item.id == this.Form.return_pickup_airport.value));
			this.SetFormValue('return_pickup_airline_option', this.BigData.airlinesData.find((item: any) => item.id == this.Form.return_pickup_airline.value));
			this.SetFormValue('return_dropoff_airport_option', this.BigData.airportsData.find((item: any) => item.id == this.Form.return_dropoff_airport.value));
			this.SetFormValue('return_dropoff_airline_option', this.BigData.airlinesData.find((item: any) => item.id == this.Form.return_dropoff_airline.value));

			if (editing_data.driver_image) {
				this.SetFormValue('driver_image_id', editing_data.driver_image.id);
				this.driver_image['image'] = editing_data.driver_image.image;
			}
			if (editing_data.vehicle_image) {
				this.SetFormValue('vehicle_image_id', editing_data.vehicle_image.id);
				this.vehicle_image['image'] = editing_data.vehicle_image.image;
			}

			['driver_languages', 'driver_dresses', 'amenities', 'chargedAmenities'].forEach((item: string) => {
				if (editing_data[item] && editing_data[item].length > 0) {
					editing_data[item].forEach((id: number) => {
						this.select(true, item, id)
					})
				}
			})

			if (editing_data.extra_stops && editing_data.extra_stops.length > 0) {
				editing_data.extra_stops.forEach((item: any, index: number) => {
					if (item.hasOwnProperty('address')) {
						item['formatted_address'] = item.address;
						this.addExtraStop();
						this.fillExtraStop(false, index, item, item);
						console.log(this.BookingForm);
					}
				})
			}
			else {
				console.error('No Extra Stops found.')
			}
			this.BookingForm.updateValueAndValidity()

			// override specific value
			this.BookingForm.patchValue({
				service_type: response.data.service_type == 'oneway' ? 'one_way' : response.data['service_type'] == 'roundtrip' ? 'round_trip' : 'charter_tour',
			})

			if (this.Form.updateType.value == 'edit') {
				this.booking_params.client_account_types.pop()
			}
			this.booking_id = this.Form.reservation_id.value;
			this.Form.affiliate_id.value != 0 ? this.chooseAffiliate() : ''
			try {
				this.PaxTelObject.setCountry(this.BookingForm.get('passenger_cell_country').value);
			} catch
			{
				console.error('Set Country Value is null.')
			}
			if (this.Form.affiliate_type.value == 'loose_affiliate') {
				setTimeout(() => {
					this.LATelObject.setCountry(this.BookingForm.get('lose_affiliate_phone_country').value);
					this.DrvTelObject.setCountry(this.BookingForm.get('driver_cell_country').value);
				}, 2000)
			}

			this.$spinner.hide('normalspinner')
		})
	}

	SetFormValue(form_control: string, value: any) {
		if (!value || !form_control) {
			console.info(`No Value to set for ${form_control}. Returning ...`)
			return
		}
		console.log('Setting Form Value for ', form_control, ' : ', value);
		try {

			this.BookingForm.get(form_control).setValue(value)
			this.BookingForm.updateValueAndValidity()
		}
		catch (err) {
			console.error('NFC Error: ')
			return
		}
	}

	SetLCFormValue(form_control: string, value: any) {
		if (!value || !form_control) {
			console.info(`No Value to set for ${form_control}. Returning ...`)
			return
		}
		console.log('Setting Form Value for ', form_control, ' : ', value);
		try {

			(this.BookingForm.get('loose_customer')).get(form_control).setValue(value)
			this.BookingForm.updateValueAndValidity()
		}
		catch (err) {
			console.error('NFC Error: ')
			return
		}
	}


	MapController(is_return: boolean = false) {
		// console.log('Map has been initialised.')
		let waypoints = []
		let origin: google.maps.LatLng
		let destination: google.maps.LatLng
		let map: google.maps.Map

		this.$mapsapi.load().then(() => {
			if (is_return) {
				// console.log('Return Map has been initialised. ')
				// map
				map = new google.maps.Map(document.getElementById('return_map'), {
					zoom: 7,
					center: new google.maps.LatLng(41.850033, -87.6500523),
					scaleControl: true
				})

				// waypoints
				if (this.ReturnExtraStops.length > 0) {
					for (let i = 0; i < this.ReturnExtraStops.length; i++) {
						let stop = (<FormGroup>(<FormArray>this.BookingForm.get('return_extra_stops')).at(i))
						waypoints.push({
							location: new google.maps.LatLng(stop.get('latitude').value, stop.get('longitude').value),
							stopover: true
						})
					}
				}

				// defaults for Source/Target - City
				origin = new google.maps.LatLng(this.Form.return_pickup_latitude.value, this.Form.return_pickup_longitude.value)
				destination = new google.maps.LatLng(this.Form.return_dropoff_latitude.value, this.Form.return_dropoff_longitude.value)

				// Overrides
				if (this.Form.return_transfer_type.value.includes('airport_')) {
					// override for Source - Airport
					// console.log('Return Override for Source Airport')
					origin = new google.maps.LatLng(this.Form.return_pickup_airport_latitude.value, this.Form.return_pickup_airport_longitude.value)
				}
				if (this.Form.return_transfer_type.value.includes('_airport')) {
					// override for Target - Airport
					// console.log('Return Override for Target Airport')
					destination = new google.maps.LatLng(this.Form.return_dropoff_airport_latitude.value, this.Form.return_dropoff_airport_longitude.value)
				}
			}
			else {
				map = new google.maps.Map(document.getElementById("map"), {
					zoom: 7,
					center: new google.maps.LatLng(41.850033, -87.6500523),
					scaleControl: true
				})

				// waypoints
				if (this.ExtraStops.length > 0) {
					for (let i = 0; i < this.ExtraStops.length; i++) {
						let stop = (<FormGroup>(<FormArray>this.BookingForm.get('extra_stops')).at(i))
						waypoints.push({
							location: new google.maps.LatLng(stop.get('latitude').value, stop.get('longitude').value),
							stopover: true
						})
					}
				}

				//defaults for Source/Target - City
				origin = new google.maps.LatLng(this.Form.pickup_latitude.value, this.Form.pickup_longitude.value)
				destination = new google.maps.LatLng(this.Form.dropoff_latitude.value, this.Form.dropoff_longitude.value)

				// Overrides
				if (this.Form.transfer_type.value.includes('airport_')) {
					// override for Source - Airport
					// console.log('Override for Source Airport')
					origin = new google.maps.LatLng(this.Form.pickup_airport_latitude.value, this.Form.pickup_airport_longitude.value)
				}
				if (this.Form.transfer_type.value.includes('_airport')) {
					// override for Target - Airport
					// console.log('Override for Target Airport')
					destination = new google.maps.LatLng(this.Form.dropoff_airport_latitude.value, this.Form.dropoff_airport_longitude.value)
				}

			}
			this.drawMap(map, {
				origin,
				destination,
				waypoints,
				optimizeWaypoints: true,
				travelMode: google.maps.TravelMode.DRIVING
			}, is_return)
		})
	}


	drawMap(map: google.maps.Map, request: Object, is_return: boolean) {
		if (request && !request.hasOwnProperty('waypoints') && !request.hasOwnProperty('origin') && !request.hasOwnProperty('destination')) {
			console.error('Request Object is not properly according to specified requirements.')
			return
		}

		this.$mapsapi.load().then(() => {
			const directionsRenderer = new google.maps.DirectionsRenderer()
			const directionsService = new google.maps.DirectionsService()
			directionsRenderer.setMap(map)

			directionsService.route(request, (response: any, status: string) => {
				if (status == google.maps.DirectionsStatus.OK) {
					// console.log('Directions Service Response: ', response)
					directionsRenderer.setDirections(response)

					this.fetchDistanceAndTime(response).then((response: { distance: number, time: number }) => {
						if (is_return) {
							this.return_distance = response.distance
							this.BookingForm.patchValue({
								returnJourneyDistance: response.distance,
								returnJourneyTime: response.time
							})
						} else {
							this.distance = response.distance
							this.BookingForm.patchValue({
								journeyDistance: response.distance,
								journeyTime: response.time
							})
						}
						// this.distance_for_rates = ((): string =>
						// {
						// 	return (this.mToKm(this.distance))
						// })()
					})
				}
			})

		})
	}

	get Form() {
		return this.BookingForm.controls;
	}

	get LooseCustomer() {
		return (<FormGroup>this.BookingForm.get('loose_customer')).controls;
	}

	get ExtraStops(): FormArray {
		return (<FormArray>this.BookingForm.get('extra_stops'));
	}

	get ReturnExtraStops() {
		return (<FormArray>this.BookingForm.get('return_extra_stops'));
	}


	fillAddress(form_control: string, address: any) {
		// console.log('Address: ', address)
		this.SetFormValue(form_control, address.formatted_address)
	}

	fillLocationPoints(form_control: string, location: any) {
		// console.log('Location Points', location)
		this.SetFormValue(form_control + '_latitude', location.latitude)
		this.SetFormValue(form_control + '_longitude', location.longitude)
		this.MapController()
		if (this.Form.service_type.value == 'round_trip') {
			this.MapController(true)
		}
	}

	fetchAirportsAndBigData(): void {
		let s = setInterval(() => {
			if (this.$api.getAirportsAndBigData()) {
				this.$spinner.hide('fetchspinner');
				this.BigData = JSON.parse(JSON.stringify(this.$api.getAirportsAndBigData()));
				this.BigData_COPY = JSON.parse(JSON.stringify(this.BigData));
				// format the name of each airports/airlines data as 'code - name, city, country'
				this.BigData.airportsData.map((item: any) => item['formatted_name'] = `${item.code} - ${item.name}, ${item.city}, ${item.country}`);
				this.BigData.airlinesData.map((item: any) => item['formatted_name'] = `${item.code} - ${item.name}, ${item.country}`);
				this.BigData_COPY.airportsData.map((item: any) => item['formatted_name'] = `${item.code} - ${item.name}, ${item.city}, ${item.country}`);
				this.BigData_COPY.airlinesData.map((item: any) => item['formatted_name'] = `${item.code} - ${item.name}, ${item.country}`);

				this.MapController();
				this.Form.reservation_id.value ? this.prefillViaBookingID(this.Form.reservation_id.value) : '';
				clearInterval(s);
			}
			else {
				this.$spinner.show('fetchspinner');
			}
		}, 2000);
	}


	fetchClientAccounts(account_type: string) {
		const legend = {
			individual: 'individual',
			corporate: 'corporate',
			travel_planner: 'travel'
		}

		// fail-safe
		if (!legend.hasOwnProperty(account_type)) {
			// console.error('Invalid Account type: ', account_type)
			return
		}
		else {
			this.$spinner.show()
			this.$api.getAccountBytype(legend[account_type]).subscribe((response: any) => {
				if (response.success && response.data.length > 0) {
					this.ClientAccounts = response.data;
				}
				this.$spinner.hide()
			})
		}
	}



	chooseUser(account_id: number) {
		this.$spinner.show()
		this.chosen_user = {}
		this.$api.chooseUser(account_id, this.Form.account_type.value).subscribe((response: any) => {
			if (response.success && Object.keys(response.data).length > 0) {
				this.chosen_user = response.data
				this.chosen_user['name'] = `${response.data.first_name} ${response.data.middle_name ?? ''} ${response.data.last_name}`
				if (!this.Form.reservation_id.value) {
					this.autofillData('passenger', this.chosen_user);
				}
			}
			this.$spinner.hide();
		})
	}

	fetchAffiliates(affiliate_type: 'affiliate' | 'loose_affiliate') {
		if (affiliate_type == 'loose_affiliate') {
			return
		}
		else {
			this.AffiliateAccounts = []
			this.$spinner.show()
			this.$api.getAccountBytype('driver').subscribe((response: any) => {
				if (response.success && response.data.length > 0) {
					this.AffiliateAccounts = response.data

					//lose all affiliate vehicle and driver data on change of affiliate type
					// for (let key in this.Form)
					// {
					// 	if (this.BookingForm.get(key) instanceof FormControl && (this.searchSubstring(key, 'vehicle') || this.searchSubstring(key, 'driver')))
					// 	{
					// 		this.BookingForm.get(key).reset()
					// 	}
					// }
				}
				this.$spinner.hide()
			})
		}
	}
	// custom search function
	airportSearchFunction(term: string, item: any) {
		term = term.toLowerCase();

		// Creating and array of space saperated term and removinf the empty values using filter
		let splitTerm = term.split(' ').filter(t => t);

		let isWordThere = [];

		// Pushing True/False if match is found
		splitTerm.forEach(arr_term => {
			if (arr_term.length <= 3) {
				let search = item['formatted_name'].toLowerCase();
				isWordThere.push(search.startsWith(arr_term));
			}
			if (arr_term.length > 3) {
				let search = item['formatted_name'].toLowerCase();
				isWordThere.push(search.indexOf(arr_term) != -1);
			}
		});
		const all_words = (this_word) => this_word;
		// Every method will return true if all values are true in isWordThere.
		return isWordThere.every(all_words);
	}

	// custom search function
	airlineSearchFunction(term: string, item: any) {
		term = term.toLowerCase();

		// Creating and array of space saperated term and removinf the empty values using filter
		let splitTerm = term.split(' ').filter(t => t);

		let isWordThere = [];

		// Pushing True/False if match is found
		splitTerm.forEach(arr_term => {
			if (arr_term.length <= 2) {
				let search = item['formatted_name'].toLowerCase();
				isWordThere.push(search.startsWith(arr_term));
			}
			if (arr_term.length > 2) {
				let search = item['formatted_name'].toLowerCase();
				isWordThere.push(search.indexOf(arr_term) != -1);
			}
		});



		const all_words = (this_word) => this_word;
		// Every method will return true if all values are true in isWordThere.
		return isWordThere.every(all_words);
	}
	chooseAffiliate() {
		// console.warn('Fetching Affiliate vehicles and drivers')
		this.fetchAffiliateVehicles(this.BookingForm.get('affiliate_id').value)
		this.fetchAffiliateDrivers(this.BookingForm.get('affiliate_id').value)
	}

	fetchAffiliateInformation(affiliate_id: number) {
		this.$spinner.show('normalspinner');
		this.$api.getAffiliateAccount(affiliate_id).pipe(pluck('data')).subscribe((response: any) => {
			isDevMode() && console.info('Affiliate Information', response);
			this.AffiliateInformation = response;
			this.$spinner.hide('normalspinner');
		})
	}

	fetchAffiliateVehicles(affiliate_id: number) {
		if (!affiliate_id) {
			console.error('Invalid Paramater affiliate_data', affiliate_id)
			return
		}
		this.$spinner.show()
		this.$api.adminAffiliateVehicleList(affiliate_id).then((response: any) => {
			if (response.success && response.data.vehicleList.length > 0) {
				this.VehicleList = response.data.vehicleList
				// add a key with formatted name to every value
				this.VehicleList.map((item: any) => item['formatted_name'] = `${item.vehicleType} - ${item.make} (${item.model})`);

				// autofill data
				if (this.VehicleList.length == 1) {
					let vehicle_type_id = this.BigData['vehicleCategories'].find(item => item.name == this.VehicleList[0].vehicleType)['id']
					this.SetFormValue('vehicle_type', vehicle_type_id)
					this.SetFormValue('vehicle_id', this.VehicleList[0].ID);
					this.autofillData('vehicle', this.VehicleList[0]);
				}
			}
			this.$spinner.hide()
		})
	}

	fetchAffiliateDrivers(affiliate_id: number) {
		if (!affiliate_id) {
			console.error('Invalid Paramater affiliate_data', affiliate_id)
			return
		}

		this.$spinner.show()
		this.$api.driverList(affiliate_id).then((response: any) => {
			if (response.success && response.data?.data.length > 0) {
				this.DriverList = response.data.data

				// autofill data
				if (this.DriverList.length == 1) {
					this.SetFormValue('driver_id', this.DriverList[0].id)
					this.autofillData('driver', this.DriverList[0])
				}
			}
			this.$spinner.hide();
		})
	}

	chooseDriver(driver_data: any) {
		this.autofillData('driver', driver_data)
	}

	fetchVehiclesFromVehicleType(vehicleType_id: any) {
		// Todo: autofill data 
	}

	fetchModels(make_id: number) {
		this.BigData['vehicleModels'] = this.BigData['vehicleModels'].filter(item => item.make_id == make_id)
		return
	}

	searchValue(list_name: string, search_value: string, search_with: string, form_control?: string) {
		if (form_control) {
			this.BookingForm.get(form_control).reset()
			this.BookingForm.updateValueAndValidity()
		}
		if (!this.BigData) {
			return
		}
		if (list_name == 'vehicleModels') {
			this.BigData['vehicleModels'] = this.BigData_COPY['vehicleModels'].filter((item: any) => item.make_id == this.Form.vehicle_make.value)
		} else {
			this.BigData[list_name] = this.BigData_COPY[list_name]
		}
		if (search_value == '') {
			return
		}

		if (list_name === 'airportsData' || list_name === 'airlinesData') {
			// match with code
			this.BigData[list_name] = this.BigData[list_name].filter((item: any) => item['code'].toLowerCase().startsWith(search_value.toLowerCase()))
			// match with name 
			if (this.BigData[list_name].length == 0) {
				this.BigData[list_name] = this.BigData_COPY[list_name]
				this.BigData[list_name] = this.BigData[list_name].filter((item: any) => item['name'].toLowerCase().startsWith(search_value.toLowerCase()))
			}

			// match with country
			if (this.BigData[list_name].length == 0) {
				this.BigData[list_name] = this.BigData_COPY[list_name]
				this.BigData[list_name] = this.BigData[list_name].filter((item: any) => item['country'].toLowerCase().startsWith(search_value.toLowerCase()))
			}
			return	// for only airport/airlines data
		}

		// for other cases
		this.BigData[list_name] = this.BigData[list_name].filter((item: any) => item[search_with].toLowerCase().startsWith(search_value.toLowerCase()))
	}


	fillValue(list: Array<Record<string, any> | string> | null = null, form_control: string, return_key: string = null, sep?: string): string | number {
		// fail-safe
		if (!this.BigData) {
			return ''
		}

		if (list === null && return_key === null) {
			return this.BookingForm.get(form_control).value ?? ''
		}

		// fail-safes
		if (!list && !form_control && !return_key) {
			// console.trace('Invalid Parameters Passed. ')
			return ''
		}

		if (list && typeof list[0] === 'string') {
			return list.find((item: string) => item == this.Form[form_control].value)[return_key]
		}

		if (!this.BookingForm.get(form_control).value) {
			return null
		}

		let temp = list.find(item => item['id'] == this.BookingForm.get(form_control).value)
		if (return_key.includes('+') && temp) {
			let keys = return_key.split('+')
			let ret_str = ""
			for (let i = 0; i < keys.length; i++) {
				ret_str = ret_str + temp[keys[i].trim()] + sep
			}
			return ret_str.replace(/(\,)$/g, '').trim()
		}
		return temp ? temp[return_key] : ''

	}


	fetchStopValue(form_group_name: string, index: number) {
		try {
			return (<FormArray>this.BookingForm.get(form_group_name)).at(index).get('address').value
		}
		catch
		{
			return ''
		}
	}

	autofillData(filling_for: string, data: any) {
		if (filling_for === 'passenger') {
			data.middle_name ?
				this.SetFormValue('passenger_name', `${data?.first_name} ${data?.middle_name} ${data?.last_name}`) : this.SetFormValue('passenger_name', `${data?.first_name} ${data?.last_name}`)
			this.SetFormValue('passenger_email', data.email)
			this.SetFormValue('passenger_cell', data.mobile)
			this.SetFormValue('passenger_cell_isd', data.mobileIsd)
			this.SetFormValue('passenger_cell_country', data.mobileCountry)
			this.SetFormValue('origin_airport_city', data.origin_airport_city)
			this.SetFormValue('pickup_flight', data.pickup_flight)
			this.SetFormValue('dropoff_flight', data.dropoff_flight)
		}

		if (filling_for === 'cruise') {
			if (data?.cruise_port == null) {
				this.SetFormValue('cruise_port', data?.return_cruise_port);
			} else {
				this.SetFormValue('cruise_port', data?.cruise_port)
			}
			if (data?.cruise_name == null) {
				this.SetFormValue('cruise_name', data?.return_cruise_name)
			} else {
				this.SetFormValue('cruise_name', data?.cruise_name)
			}
			if (data?.cruise_time == null) {
				this.SetFormValue('cruise_time', data?.return_cruise_time)
			} else {
				this.SetFormValue('cruise_time', data?.cruise_time)
			}
		}

		if (filling_for == 'vehicle') {
			this.SetFormValue('vehicle_license_plate', data.licensePlate)
			this.SetFormValue('vehicle_seats', data.seats)

			// fill values of make/model/year/color
			let i = 0
			let legend = ['make', 'model', 'year', 'color']
			for (let item of ['vehicleMakes', 'vehicleModels', 'vehicleYears', 'vehicleColors']) {
				let id = this.BigData[item].find(item => item.name == data[legend[i]])['id']
				this.SetFormValue('vehicle_' + legend[i], id)
				i++;
			}
		}

		if (filling_for == 'driver') {
			this.SetFormValue('driver_name', `${data.FirstName} ${data.MiddleName ?? ''} ${data.LastName}`)
			this.SetFormValue('driver_gender', data.Gender)
			this.SetFormValue('driver_cell', data.CellNumber)
			this.SetFormValue('driver_cell_isd', data.CellIsd)
			this.SetFormValue('driver_cell_country', data.CellNumberCountry)
			this.SetFormValue('driver_email', data.Email)
			this.SetFormValue('driver_phone_type', data.PhoneType ?? '');
			this.DrvTelObject.setCountry(this.BookingForm.get('driver_cell_country').value);
		}
	}



	addExtraStop(is_return: boolean = false) {
		// console.log('Adding Extra Stop ...')
		if (is_return) {
			let index = Object.keys(this.ReturnExtraStops).length + 1;
			(<FormArray>this.BookingForm.get('return_extra_stops')).push(new FormGroup({
				address: new FormControl(''),
				latitude: new FormControl(''),
				longitude: new FormControl('')
			}))
		}
		else {
			let index = Object.keys(this.ExtraStops).length + 1;
			(<FormArray>this.BookingForm.get('extra_stops')).push(new FormGroup({
				address: new FormControl(''),
				latitude: new FormControl(''),
				longitude: new FormControl('')
			}))
		}
	}

	deleteExtraStop(is_return: boolean, stop_index: number) {
		if (is_return) {
			(<FormArray>this.BookingForm.get('return_extra_stops')).removeAt(stop_index)
			this.MapController(true)
		}
		else {
			(<FormArray>this.BookingForm.get('extra_stops')).removeAt(stop_index)
			this.MapController()
		}
	}



	fillExtraStop(is_return: boolean, index: number, address: any, location: any) {
		console.log(is_return, index, address, location);
		if (is_return) {
			if (address) {
				(<FormArray>this.BookingForm.get('return_extra_stops')).at(index).patchValue({
					address: address.formatted_address
				})
			}
			if (location) {
				(<FormArray>this.BookingForm.get('return_extra_stops')).at(index).patchValue({
					latitude: location.latitude,
					longitude: location.longitude
				})
			}
			this.BookingForm.updateValueAndValidity();
			this.MapController(true)
		}
		else {
			if (address) {
				(<FormArray>this.BookingForm.get('extra_stops')).at(index).patchValue({
					address: address.formatted_address
				});
			}

			if (location) {
				(<FormArray>this.BookingForm.get('extra_stops')).at(index).patchValue({
					latitude: location.latitude,
					longitude: location.longitude
				})
			}

			this.BookingForm.updateValueAndValidity();
			this.MapController()
		}
	}


	select(is_checked: boolean, form_control: string, value: any) {
		let amenity_name: string = ''
		amenity_name = this.BigData?.amenity.find(item => item.id == value)['name']

		if (is_checked) {
			if (!this.BookingForm.get(form_control).value.includes(value)) {
				this.amenities.push(amenity_name);
				(<FormArray>this.BookingForm.get(form_control)).push(new FormControl(value));
			}
		} else {
			// remove from list
			let list_index = this.BookingForm.get(form_control).value.findIndex((item: number) => item == value);
			this.amenities = this.amenities.filter((item: any) => item != amenity_name);
			(<FormArray>this.BookingForm.get(form_control)).removeAt(list_index)
		}
	}





	isChecked(form_control: string, object: any) {
		let list = (<FormArray>this.BookingForm.get(form_control)).value
		return list.includes(object)
	}




	submitForm(preview: boolean) {
		console.log('\n\n Submitting Form');
		console.log(this.BookingForm);

		if (this.BookingForm.invalid) {
			return;
		}

		if (preview) {
			let value = this.BookingForm.value
			if (this.RatesForm) {
				value['rateArray'] = JSON.parse(JSON.stringify(this.RatesForm))
				value['grand_total'] = value['rateArray']['grand_total']
				value['sub_total'] = value['rateArray']['sub_total']
				delete value['rateArray']['grand_total']
				delete value['rateArray']['sub_total']
				// Return Rates Form
				if (this.Form.service_type.value == 'round_trip' && this.ReturnRatesForm) {
					value['returnRateArray'] = JSON.parse(JSON.stringify(this.ReturnRatesForm))
					value['return_grand_total'] = value['returnRateArray']['r_grandtotal']
					value['return_sub_total'] = value['returnRateArray']['r_subtotal']
					delete value['returnRateArray']['r_grandtotal']
					delete value['returnRateArray']['r_subtotal']
				}
			}

			this.$spinner.show()
			this.$api.createBooking(value, this.Form.updateType.value).subscribe((response: any) => {
				this.$errors.openDialog({
					errors: {
						error: `<span class='text-success'>${response.message}</span>`
					}
				})
				this.$router.navigate(['/admin/daily-bookings-admin'])
				this.$spinner.hide()
			})
		}
		else {
			$('#previewBooking').modal('handleUpdate').modal('show')
		}
	}

	resetFields() {
		this.chosen_user = null
		this.buildBookingForm()
		this.MapController()
		this.driver_image = {}
		this.vehicle_image = {}

		if (!this.booking_params['client_account_types'].includes('loose_customer')) {
			this.booking_params['client_account_types'].push('loose_customer')
		}

		// if directly navigated to create new booking mode from edit booking mode
		if (this.BigData_COPY) {
			this.BigData = this.BigData_COPY
		}
		this.reset_button = !this.reset_button
	}

	returnZero() {
		return 0	// for keeping the order
	}

	/**
	* upload image with the specified name and set form value with its id.
	* @param event input event
	* @param image_type String [Required] type of the image being uploaded
	* @param image_id [Optional] id of the image to be edited
	*/
	uploadImage(event: any, image_type: string) {
		let image: any
		console.log(event.target.files)
		if (event.target.files && event.target.files.length > 0) {
			const reader = new FileReader()
			const file = event.target.files[0]
			reader.readAsDataURL(file)
			reader.onload = () => {
				image = reader.result as string
				this.$spinner.show();
				this.$api.uploadVehicleImage(image).subscribe((response: any) => {
					this[image_type] = { image: response.data.image, id: response.data.ID }
					this.SetFormValue(image_type + '_id', this[image_type]['id'])
					this.$spinner.hide();
				})
			}
		}
	}


	/**
	* Delete the image from the form. Basically sets the form value, empty.
	* @param image_type String [Required] type of the image to delete
	*/
	deleteImage(image_type: string) {
		this[image_type] = {};
		this.SetFormValue(image_type + '_id', 0);
	}


	modal_image: any
	showImageModal(image: string) {
		this.modal_image = image
		$("#imageModal").addClass("showImage");
		$("#imageModal").removeClass("d-none");
	}

	close_image_modal: EventEmitter<any> = new EventEmitter()
	closeImageModal() {
		this.close_image_modal.emit()
	}


	fetchDistanceAndTime(data: any): Promise<{ [key: string]: number }> {
		let total_distance = 0.0
		let total_time = 0
		return new Promise((resolve) => {
			data.routes[0].legs.forEach((item: any) => {
				if (item.distance.value == 0) {
					this.$errors.openDialog({
						errors: {
							error: 'Please select a valid location point.'
						}
					})
					return
				}
				else {
					total_distance += item.distance.value
					total_time += item.duration.value
				}
			})
			resolve({
				distance: total_distance,
				time: total_time
			})
		})
	}


	toggleDropdown(type: string) {
		// console.log('Toggle Dropdown ', type)
		this.booking_params['chevrons'][type] = !this.booking_params['chevrons'][type]
	}

	Subscriptions() {
		// Service Type
		this.BookingForm.get('service_type').valueChanges.subscribe((value: string) => {
			this.init_return_rates = false;
			if (value == 'round_trip') {
				this.init_return_rates = true;
				setTimeout(() => {
					this.MapController(true)
				}, 2000)
			}
			if (value != 'charter_tour') {
				this.BookingForm.get('number_of_hours').setValue(0)
				this.BookingForm.updateValueAndValidity()
				console.log(this.BookingForm.get('number_of_hours').value);
			}
		})

		// Transfer Type
		this.BookingForm.get('transfer_type').valueChanges.subscribe((value: string) => {
			const reverseStringChars = (text: string) => {
				let temp = text.split('_')
				return temp.reverse().join('_')
			}
			this.SetFormValue('return_transfer_type', reverseStringChars(value))
		})

		// Account Type Subscription
		this.BookingForm.get('account_type').valueChanges.subscribe((value: string) => {
			if (value == 'loose_customer') {
				const loose_customer = (this.BookingForm.get('loose_customer') as FormGroup)
				// for every 'item' in loose_customer
				for (let item in loose_customer.controls) {
					// if 'item' in loose_customer is a formgroup, like card_details
					if ((<FormGroup>this.BookingForm.get('loose_customer')).get(item) instanceof FormGroup) {
						console.log(item)
						// for every 'key' in card_details formgroup
						for (let key in (loose_customer.get(item) as FormGroup).controls) {
							// set validators in card_details
							(<FormGroup>loose_customer.get(item)).get(key).setValidators([Validators.required]);
							(<FormGroup>loose_customer.get(item)).get(key).updateValueAndValidity();

						}
					}

					if (item != 'middle_name' && item != 'address') {
						loose_customer.get(item).setValidators([Validators.required]);
					}
				}

				(<FormGroup>loose_customer.get('card_details')).get('card_number').setValidators([Validators.required, Validators.pattern("^[0-9]*$"), , Validators.minLength(16), Validators.maxLength(16),]);
				(<FormGroup>loose_customer.get('card_details')).get('name').setValidators(Validators.pattern("^[A-Za-z0-9]*( [A-Za-z0-9]+)*$"));
				(<FormGroup>loose_customer.get('card_details')).get('cvv').setValidators([Validators.required, Validators.pattern("^[0-9]*$"), , Validators.minLength(3), Validators.maxLength(3),]);
				loose_customer.get('email').setValidators([Validators.required, Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$")])
				loose_customer.get('phone').setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)])
				loose_customer.get('first_name').setValidators(Validators.pattern("^[A-Za-z0-9]*( [A-Za-z0-9]+)*$"))
				loose_customer.get('middle_name').setValidators(Validators.pattern("^[A-Za-z0-9]*( [A-Za-z0-9]+)*$"))
				loose_customer.get('last_name').setValidators(Validators.pattern("^[A-Za-z0-9]*( [A-Za-z0-9]+)*$"))
				loose_customer.get('address').setValidators(Validators.pattern("^[A-Za-z0-9]*( [A-Za-z0-9]+)*$"))

			}
			else {
				const loose_customer = (this.BookingForm.get('loose_customer') as FormGroup)
				// for every 'item' in loose_customer
				for (let item in loose_customer.controls) {
					// if 'item' in loose_customer is a formgroup, like card_details
					if (loose_customer.get(item) instanceof FormGroup) {
						// for every 'key' in card_details formgroup
						for (let key in (loose_customer.get(item) as FormGroup).controls) {
							// clear validators in card_details
							loose_customer.get(item).get(key).clearValidators()
							loose_customer.get(item).get(key).updateValueAndValidity()
						}
					}
					loose_customer.get(item).clearValidators()
					loose_customer.get(item).updateValueAndValidity()
				}

				this.fetchClientAccounts(value)
			}
		})

		this.BookingForm.get('acc_id').valueChanges.subscribe((value: number) => {
			if (value) {
				this.chooseUser(value)
			}
		})

		// Affiliate Type
		this.BookingForm.get('affiliate_type').valueChanges.subscribe((value: string) => {
			if (value == 'loose_affiliate') {
				this.toggleDropdown(null)
				this.init_rates = true
				if (this.Form.service_type.value === 'round_trip') {
					this.init_return_rates = true;
				}
			}
			else {
				this.init_rates = false;
				this.init_return_rates = false;
				this.fetchAffiliates('affiliate')
				this.chooseAffiliate()
			}
		})

		this.BookingForm.get('affiliate_id').valueChanges.subscribe((value: number) => {
			if (value) {
				this.chooseAffiliate()
				this.fetchAffiliateInformation(value)
			}
		})

		// this.BookingForm.get('vehicle_id').valueChanges.subscribe((value: any) =>
		// {
		// 	if (value && this.VehicleList)
		// 	{
		// 		let v = this.VehicleList.find(item => item.ID == value)
		// 		this.autofillData('vehicle', v);
		// 	}
		// })

		this.BookingForm.get('vehicle_make').valueChanges.subscribe((value: any) => {
			if (value) {
				this.BigData['vehicleModels'] = this.BigData_COPY?.vehicleModels.filter(item => item.make_id == value)
			}
		})

		// Pickup Airport
		this.BookingForm.get('pickup_airport').valueChanges.subscribe((value: number) => {
			if (value) {
				let airport_selected = this.BigData?.airportsData.find(item => item.id == value)
				this.SetFormValue('pickup_airport_name', airport_selected.formatted_name);
				this.SetFormValue('pickup_airport_latitude', airport_selected.lat);
				this.SetFormValue('pickup_airport_longitude', airport_selected.long);
				this.SetFormValue('return_dropoff_airport_option', airport_selected);
				this.SetFormValue('return_dropoff_airport', value);
				this.MapController();
				if (this.Form.service_type.value == 'round_trip') {
					setTimeout(() => {
						this.MapController(true);
					}, 2000);
				}
			}
		});

		// Pickup Airlines
		this.BookingForm.get('pickup_airline').valueChanges.subscribe((value: string) => {
			if (value) {
				let airline_selected = this.BigData?.airlinesData.find(item => item.id == value)
				this.SetFormValue('pickup_airline_name', airline_selected.formatted_name);
				this.SetFormValue('return_dropoff_airline_option', airline_selected);
				this.SetFormValue('return_dropoff_airline', value)
			}
		})

		// Dropoff Airport
		this.BookingForm.get('dropoff_airport').valueChanges.subscribe((value: string) => {
			if (value) {
				let airport_selected = this.BigData?.airportsData.find(item => item.id == value)
				this.SetFormValue('dropoff_airport_name', airport_selected.formatted_name);
				this.SetFormValue('dropoff_airport_latitude', airport_selected.lat)
				this.SetFormValue('dropoff_airport_longitude', airport_selected.long)
				this.SetFormValue('return_pickup_airport_option', airport_selected);
				this.SetFormValue('return_pickup_airport', value)
				this.MapController()
				if (this.Form.service_type.value == 'round_trip') {
					setTimeout(() => {
						this.MapController(true)
					}, 2000)
				}
			}
		})

		// Dropoff Airlines
		this.BookingForm.get('dropoff_airline').valueChanges.subscribe((value: string) => {
			let airline_selected = this.BigData?.airlinesData.find(item => item.id == value)
			this.SetFormValue('dropoff_airline_name', airline_selected.formatted_name);
			this.SetFormValue('return_pickup_airline_option', airline_selected);
			this.SetFormValue('return_pickup_airline', value);
		})

		// Return Pickup Airport
		this.BookingForm.get('return_pickup_airport').valueChanges.subscribe((value: string) => {
			if (value) {
				let airport_selected = this.BigData?.airportsData.find(item => item.id == value)
				this.SetFormValue('return_pickup_airport_name', airport_selected.formatted_name);
				this.SetFormValue('return_pickup_airport_latitude', airport_selected.lat);
				this.SetFormValue('return_pickup_airport_longitude', airport_selected.long);
				setTimeout(() => this.MapController(), 2000)
				if (this.Form.service_type.value == 'round_trip') {
					setTimeout(() => {
						this.MapController(true)
					}, 2000)
				}
			}
		})

		// Return Pickup Airlines
		this.BookingForm.get('return_pickup_airline').valueChanges.subscribe((value: string) => {
			if (value) {
				let airline_selected = this.BigData?.airlinesData.find(item => item.id == value)
				this.SetFormValue('return_pickup_airline_name', airline_selected.formatted_name);
			}
		})

		// Return Dropoff Airport
		this.BookingForm.get('return_dropoff_airport').valueChanges.subscribe((value: string) => {
			if (value) {
				let airport_selected = this.BigData?.airportsData.find(item => item.id == value);
				this.SetFormValue('return_dropoff_airport_name', airport_selected.formatted_name);
				this.SetFormValue('return_dropoff_airport_latitude', airport_selected.lat);
				this.SetFormValue('return_dropoff_airport_longitude', airport_selected.long);
				setTimeout(() => this.MapController(), 2000)
				if (this.Form.service_type.value == 'round_trip') {
					setTimeout(() => {
						this.MapController(true)
					}, 2000)
				}
			}
		})

		// Return Dropoff Airlines
		this.BookingForm.get('return_dropoff_airline').valueChanges.subscribe((value: string) => {
			if (value) {
				let airline_selected = this.BigData?.airlinesData.find(item => item.id == value)
				this.SetFormValue('return_dropoff_airline_name', airline_selected.formatted_name);
			}
		})

		// Pickup Address
		this.BookingForm.get('pickup').valueChanges.subscribe((value: string) => {
			setTimeout(() => {
				this.SetFormValue('return_dropoff', value)
				this.SetFormValue('return_dropoff_latitude', this.Form.pickup_latitude.value)
				this.SetFormValue('return_dropoff_longitude', this.Form.pickup_longitude.value)
				this.MapController()
			}, 1000)
			if (this.Form.service_type.value == 'round_trip') {
				setTimeout(() => {
					this.MapController(true)
				}, 2000)
			}
		})

		// Dropoff Address
		this.BookingForm.get('dropoff').valueChanges.subscribe((value: string) => {
			setTimeout(() => {
				this.SetFormValue('return_pickup', value)
				this.SetFormValue('return_pickup_latitude', this.Form.dropoff_latitude.value)
				this.SetFormValue('return_pickup_longitude', this.Form.dropoff_longitude.value)
				this.MapController()
			}, 1000)
			if (this.Form.service_type.value == 'round_trip') {
				setTimeout(() => {
					this.MapController(true)
				}, 2000)
			}
		})
	}

	resetDriverAndVehicle(affiliate_type: string) {
		if (affiliate_type == 'loose_affiliate') {
			['vehicle_type', 'vehicle_id', 'vehicle_make', 'vehicle_model', 'vehicle_color', 'vehicle_year', 'driver_name', 'driver_email', 'driver_gender', 'driver_cell', 'vehicle_license_plate'].forEach((item: any) => {
				this.BookingForm.get(item).reset();
				this.BookingForm.updateValueAndValidity();
			})
			this.SetFormValue('driver_cell_isd', '+1');
			this.SetFormValue('driver_cell_country', 'us');
		}
	}

	RateFormValue(data: any) {
		// console.log('Rates Form: ', data)
		this.RatesForm = data
	}
	ReturnRateFormValue(data: any) {
		// console.log('Return Rates Form: ', data)
		this.ReturnRatesForm = data
	}

	checkUniqueness() {
		this.$api.checkUniquePhoneNumberForLooseCustomer({
			phoneISD: this.LooseCustomer.phone_isd.value,
			phoneNumber: this.LooseCustomer.phone.value
		}).pipe(
			pluck('data'),
			pluck('is_exist')
		).subscribe((is_exist: boolean) => {
			// console.log(is_exist)
			this.is_loose_customer_unique = is_exist;
			return
		})
	}

	fillLooseCustomerAddress(value: any) {
		(<FormGroup>this.BookingForm.get('loose_customer')).get('address').setValue(value);
		(<FormGroup>this.BookingForm.get('loose_customer')).updateValueAndValidity();
		this.BookingForm.updateValueAndValidity();
	}



	onLCTeleCountryChange(event: any) {
		(<FormGroup>this.BookingForm.get('loose_customer')).get('phone_country').setValue(event.iso2);
		(<FormGroup>this.BookingForm.get('loose_customer')).get('phone_isd').setValue('+' + event.dialCode);
		this.BookingForm.updateValueAndValidity()
	}

	LCTelInputObject(event: any) {
		this.LCTelObject = event;
	}

	PaxTelInputObject(event: any) {
		this.PaxTelObject = event;
	}

	LATelInputObject(event: any) {
		this.LATelObject = event;
	}

	DrvTelInputObject(event: any) {
		this.DrvTelObject = event;
	}

	EmailDomainValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			let value = control.value;
			console.log(value)
			if (!value) {
				return null
			}
			value = value.split('@')[1]
			let domain = value?.substring(value.indexOf('.') + 1)
			console.log(domain)
			const domains = ['com', 'net', 'in', 'co', 'uk', 'br', 'us']
			if (domains.includes(domain)) {
				return null
			}
			else if (domain?.includes('.')) {
				console.log(domain)
				return domain.split('.').every(item => domains.includes(item)) ? null : { domain: true }
			}
			else {
				return { domain: true }
			}
		}
	}

	change(event: any, form_control: string) {
		console.log(event, form_control)
		event && this.SetFormValue(form_control, event.id);
	}
}

