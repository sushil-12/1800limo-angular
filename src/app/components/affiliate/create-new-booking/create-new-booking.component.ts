import { Component, OnInit, ViewChild, ElementRef, NgZone, EventEmitter, isDevMode } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError, pluck } from 'rxjs/operators';
import { from, interval, throwError } from 'rxjs';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';

import { SharedModule } from 'src/app/components/shared/shared.module'

import { constant_data } from 'src/assets/js/data.js'



import { StateManagementService } from 'src/app/services/statemanagement.service';
import PlaceResult = google.maps.places.PlaceResult
import { isIdentifier } from '@angular/compiler';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { EventListenerFocusTrapInertStrategy } from '@angular/cdk/a11y';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import * as moment from 'moment';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { AdminService } from 'src/app/services/admin.service';
import { CommonService } from 'src/app/services/common.service';
declare var $: any


@Component({
	selector: 'app-create-new-booking',
	templateUrl: './create-new-booking.component.html',
	styleUrls: ['./create-new-booking.component.scss']
})
export class CreateNewBookingComponent implements OnInit {
	@ViewChild('searchInput', { read: MatAutocompleteTrigger }) triggerAutoCompleteInput: MatAutocompleteTrigger

	todays_date: string = moment().format('YYYY-MM-DD');

	booking_params: any = {
		transfer_types: ["airport_to_city", "airport_to_airport", "airport_to_cruise", "city_to_city", "city_to_airport", "city_to_cruise", "cruise_to_airport", "cruise_to_city"],
		client_account_types: ['individual', 'corporate', 'loose_customer'],
		affiliate_accounts: ['affiliate'],
		numbers: (() => {
			let arr = []
			for (let i = 0; i <= 1000; i++) {
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

	months: any = [{ value: '01' }, { value: '02' }, { value: '03' }, { value: '04' }, { value: '05' }, { value: '06' }, { value: '07' }, { value: '08' }, { value: '09' }, { value: '10' }, { value: '11' }, { value: '12' }]
	monthOptions: any = [...this.months]
	//[{value:'01'},{value:'02'},{value:'03'},{value:'04'},{value:'05'},{value:'06'},{value:'07'},{value:'08'},{value:'09'},{value:'10'},{value:'11'},{value:'12'}]

	LCTelObject: any
	PaxTelObject: any
	DrvTelObject: any
	LATelObject: any

	BookingForm: FormGroup
	RatesForm: any
	ReturnRatesForm: any

	booking_id: number = 0
	affiliate_id: any = null;

	driver_image: Record<string, any> = {}
	vehicle_image: Record<string, any> = {}

	BigData: any
	BigData_COPY: any
	AffiliateInformation: Record<string, any> = {}
	ClientAccounts: Array<Record<string, any>> = []
	AffiliateAccounts: Array<Record<string, any>> = []
	VehicleList: Array<Record<string, any>> = []
	DriverList: Array<Record<string, any>> = []
	vehicleType_arr: any;
	vehicleMake_arr: any;
	vehicleModal_arr: any;
	vehicleYear_arr: any;
	vehicleColor_arr: any;
	firstLoadVehicleId: any;

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
	submitBookingForm: boolean;
	newBooking: boolean = false;
	QB_vehicle_id: any = null;
	params_QB_vehicle_id :any = null
	updateType: any='create';
	bookingResponse: any;
	unique_key: any;
	firstLoadAffiliateId: any;
	service_type: any = 'one_way';
	transfer_type: any = 'city_to_city'
	return_transfer_type: any = 'city_to_city'
	number_of_hours: any = '0';
	booking_data:any={}
	is_master_vehicle: boolean = JSON.parse(sessionStorage.getItem('selected_vehicle'))?.is_master_vehicle || false
	extraStops_rate:any = 0
	isTravelShare: boolean;
	isCreatedByAdmin: boolean = true;
	adminSharePercent: number = 25;
	shareArray:any;
	r_shareArray:any;


	constructor(
		private $form: FormBuilder,
		private $api: AdminService,
		private affiliateService: AffiliateService,
		private $shared: SharedModule,
		private $spinner: NgxSpinnerService,
		private $mapsapi: MapsAPILoader,
		private $errors: ErrorDialogService,
		private $router: Router,
		private $routeurl: ActivatedRoute,
		private commonServices: CommonService,
		private customValidator: CustomvalidationService,
		private el: ElementRef
	) { }

	openAutoCompletePanel() {
		this.triggerAutoCompleteInput.openPanel();
	}
	ngOnInit(): void {

		// build the form first 
		localStorage.removeItem('QB_redirectUrl')
		this.buildBookingForm()
		this.$routeurl.queryParams.subscribe((params: any) => {
			if (params && params.bookingId && !this.booking_id) {
				this.is_booking_edit_case = true
				this.updateType = params.updateType
				this.SetFormValue('reservation_id', params.bookingId)
				params.updateType ? this.SetFormValue('updateType', params.updateType) : this.SetFormValue('updateType', 'edit')
			}
			else if (params && params.new == 'true') {
				console.log('in create new booking through QB------------->>', params)
				this.newBooking = params.new == 'true'
				this.affiliate_id = parseInt(params.affiliate_id)
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
				country: [''],
				state: [''],
				city: [''],
				zipCode: [''],
				card_details: this.$form.group({
					name: [''],
					card_number: [''],
					exp_month: [''],
					exp_year: [''],
					cvv: ['']
				})
			}),
			passenger_name: ['', this.customValidator.whitespace()],
			passenger_email: ['', Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)],
			passenger_cell: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			passenger_cell_isd: ['+1'],
			passenger_cell_country: ['us'],
			total_passengers: [1],
			luggage_count: [0],
			booking_instructions: [''],
			return_booking_instructions: [''],
			affiliate_type: ['affiliate'],
			affiliate_id: [''],
			lose_affiliate_name: ['', this.customValidator.whitespace()],
			lose_affiliate_phone: [''],
			lose_affiliate_phone_isd: ['+1'],
			lose_affiliate_phone_country: ['us'],
			lose_affiliate_email: [''],
			vehicle_type: [''],
			vehicle_type_name: [''],
			vehicle_id: [''],
			vehicle_make: [''],
			vehicle_make_name: [''],
			vehicle_model: [''],
			vehicle_model_name: [''],
			vehicle_year: [''],
			vehicle_year_name: [''],
			vehicle_color: [''],
			vehicle_color_name: [''],
			vehicle_license_plate: ['', this.customValidator.whitespace()],
			vehicle_seats: ['4', Validators.pattern("^[0-9]*$")],
			driver_id: [''],
			driver_name: ['', this.customValidator.whitespace()],
			driver_gender: [''],
			driver_cell: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			driver_cell_isd: ['+1'],
			driver_cell_country: ['us'],
			driver_email: ['', Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)],
			driver_phone_type: [''],
			driver_image_id: [''],
			vehicle_image_id: [''],
			meet_greet_choices: [2],
			meet_greet_choices_name: ['Driver -  Airport - Text/call after plane lands with curbside meet location'],
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
			cruise_time: ['12:00 am'],
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
			return_meet_greet_choices: [2],
			return_pickup_date: [''],
			return_pickup_time: ['12:00 pm'],
			return_meet_greet_choices_name: ['Driver -  Airport - Text/call after plane lands with curbside meet location'],
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
			return_cruise_time: ['12:00 pm'],
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


		if (this.BookingForm.value.transfer_type.includes('city_')) {
			this.SetFormValue('meet_greet_choices', 1)
			this.SetFormValue('meet_greet_choices_name', "Driver - Text/call when on location")
		} else {
			this.SetFormValue('meet_greet_choices', 2)
			this.SetFormValue('meet_greet_choices_name', "Driver -  Airport - Text/call after plane lands with curbside meet location")
		}

		if (this.BookingForm.value.transfer_type.includes('_city')) {
			this.SetFormValue('return_meet_greet_choices', 1)
			this.SetFormValue('return_meet_greet_choices_name', "Driver - Text/call when on location")
		} else {
			this.SetFormValue('return_meet_greet_choices', 2)
			this.SetFormValue('meet_greet_choices_name', "Driver -  Airport - Text/call after plane lands with curbside meet location")
		}
	}
	changeTransferType(type: string) {
		this.transfer_type = type
		if (type.includes('city_')) {
			this.SetFormValue('meet_greet_choices', 1)
			this.SetFormValue('meet_greet_choices_name', "Driver - Text/call when on location")
		} else {
			this.SetFormValue('meet_greet_choices', 2)
			this.SetFormValue('meet_greet_choices_name', "Driver -  Airport - Text/call after plane lands with curbside meet location")
		}

		if (type.includes('_city')) {
			this.SetFormValue('return_meet_greet_choices', 1)
			this.SetFormValue('return_meet_greet_choices_name', "Driver - Text/call when on location")
		} else {
			this.SetFormValue('return_meet_greet_choices', 2)
			this.SetFormValue('return_meet_greet_choices_name', "Driver -  Airport - Text/call after plane lands with curbside meet location")
		}
	}
	handleClientAccChange(selectedAcc){
		this.isTravelShare =  selectedAcc=='travel_planner' ? true : false
		this.BookingForm.get('acc_id').setValue(null);
		this.chosen_user = null
		this.BookingForm.patchValue({
			passenger_name: '',
			passenger_email:'',
			passenger_cell: '',
			passenger_cell_isd: '+1',
			passenger_cell_country: 'us',
		})
	}

	handleChangeMonth(value: any) {
		console.log('value', value)
		if (value) {
			this.monthOptions = this.months.filter(i => i.value.includes(value))
		}
	}
	handleChangeMeetAndGreet(event: any, type: string) {
		console.log('in function meet and greet-->>>', event.source.triggerValue, type)
		if (type == 'return') {
			this.BookingForm.patchValue({
				return_meet_greet_choices_name: event.source.triggerValue
			})
		}
		else {
			this.BookingForm.patchValue({
				meet_greet_choices_name: event.source.triggerValue
			})
		}
	}

	prefillViaBookingID(booking_id: number) {
		// console.warn('Prefilling via Booking Id')
		this.$spinner.show('normalspinner');
		this.$api.getBookingDataForEdit(booking_id, this.Form.updateType.value).subscribe((response: any) => {
			response.data.booking_instructions = response.data.booking_instructions.replaceAll('<br />', '')
			this.isTravelShare =  response?.data?.account_type=='travel_planner' ? true : false
			this.isCreatedByAdmin = response?.data?.created_by==1 ? true : false
			console.log('response <><><><><', response.data)
			let editing_data = response.data
			this.bookingResponse = response.data
			this.firstLoadVehicleId = response.data.vehicle_id
			this.firstLoadAffiliateId = response.data.affiliate_id
			this.number_of_hours = response?.data?.number_of_hours
			this.SetFormValue('affiliate_type', response.data.affiliate_type)
			this.autofillData('cruise', editing_data);
			console.log(editing_data, "check big data")
			for (let item in editing_data) {
				if (item.includes('extra_stops') || item.includes('languages') || item.includes('dresses'), item.toLowerCase().includes('amenities')) {
					// console.log('Skipping in the case of Extra Stops. ')
				}
				if (item == "passenger_cell_isd") {
					console.log('passenger_cell_isd-->>', item, editing_data[item])
					let value = editing_data[item].includes('+') ? editing_data[item] : '+'.concat(editing_data[item])
					this.SetFormValue(item, value);
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

			// if (this.Form.updateType.value == 'edit') {
			// 	this.booking_params.client_account_types.pop()
			// }
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
	FormatTime(time: string) {
		return moment(time, "HH:mm:ss").format("LT");
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
							if(!this.BookingForm.get('return_extra_stops')?.value?.length || this.BookingForm.get('return_extra_stops')?.value[0]['rate']?.length){
								this.buildBookingData()
							}
							this.BookingForm.patchValue({
								returnJourneyDistance: response.distance,
								returnJourneyTime: response.time
							})
						} else {
							this.distance = response.distance
							if(!this.BookingForm.get('extra_stops')?.value?.length || this.BookingForm.get('extra_stops')?.value[0]['rate']?.length){
								this.buildBookingData()
							}
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

	convertToMinutes(value){
		const days = Math.floor(value / (24 * 60 * 60));
		const remainingSeconds = value % (24 * 60 * 60);
		const hours = Math.floor(remainingSeconds / (60 * 60));
		const remainingMinutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
	
		let result = "";

		if (days > 0) {
			result += `${days} days, `;
		}
	
		if (hours > 0 || (days === 0 && hours === 0)) {
			result += `${hours} hours, `;
		}
	
		result += `${remainingMinutes} minutes`;
	
		return result;
	}

	fillAddress(form_control: string, address: any) {
		// console.log('Address: ', address)
		this.SetFormValue(form_control, address?.formatted_address)
	}

	fillLocationPoints(form_control: string, location: any) {
		// console.log('Location Points', location)
		this.SetFormValue(form_control + '_latitude', location?.latitude)
		this.SetFormValue(form_control + '_longitude', location?.longitude)
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
				this.newBooking ? this.setValueByBookNow() : "";
				clearInterval(s);
			}
			else {
				this.$spinner.show('fetchspinner');
			}
		}, 2000);
	}


	fetchClientAccounts(account_type: string) {
		console.log('in function fetch client account--------------------')
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
			this.affiliateService.getAccountBytype(legend[account_type]).subscribe((response: any) => {
				if (response.success && response.data.length > 0) {
					this.ClientAccounts = response.data;
				}
				this.$spinner.hide()
			})
		}
	}

	changeReturnTransferType(event: any) {
		this.return_transfer_type = event
	}


	chooseUser(account_id: number) {
		console.log('in function choose user---------------------------')
		this.$spinner.show()
		this.chosen_user = {}
		this.affiliateService.chooseUser(account_id, this.Form.account_type.value).subscribe((response: any) => {
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

	fillLCDetails(choose_user: any) {
		this.SetLCFormValue('first_name', choose_user?.first_name)
		this.SetLCFormValue('middle_name', choose_user?.middle_name)
		this.SetLCFormValue('last_name', choose_user?.last_name)
		this.SetLCFormValue('email', choose_user?.email)
		this.SetLCFormValue('phone', choose_user?.mobile)
	}

	handleClientAccount(value: any) {
		console.log('---------------------_>>>>>>>>>>>>>> client acc value', value)
		this.chooseUser(value.id)
	}

	fetchAffiliates(affiliate_type: 'affiliate' | 'loose_affiliate') {
		if (affiliate_type == 'loose_affiliate') {
			return
		}
		else {
			console.log('in function fetch affiliates---------------------')
			this.AffiliateAccounts = []
			this.$spinner.show()
			this.affiliateService.getAccountBytype('driver').subscribe((response: any) => {
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
		console.log('in finction fetch affliate infosrmation------------------------------')
		this.$spinner.show('normalspinner');
		this.affiliateService.getAffiliateAccount(affiliate_id).pipe(pluck('data')).subscribe((response: any) => {
			isDevMode() && console.info('Affiliate Information', response);
			this.AffiliateInformation = response;
			this.$spinner.hide('normalspinner');
		})
	}
	handleSelectVehicleType(selectedVehicle: any) {
		console.log('selectweed vehicle-->>>>', selectedVehicle, selectedVehicle.licensePlate === null)
		this.SetFormValue('vehicle_id', selectedVehicle.ID);
		this.SetFormValue('vehicle_type_name', selectedVehicle.vehicleType)
		this.SetFormValue('vehicle_make', selectedVehicle.make_id);
		this.SetFormValue('vehicle_make_name', selectedVehicle.make);
		this.SetFormValue('vehicle_model', selectedVehicle.model_id);
		this.SetFormValue('vehicle_model_name', selectedVehicle.model);
		this.SetFormValue('vehicle_year', selectedVehicle.year_id);
		this.SetFormValue('vehicle_year_name', selectedVehicle.year);
		this.SetFormValue('vehicle_color', selectedVehicle.color_id);
		this.SetFormValue('vehicle_color_name', selectedVehicle.color);
		selectedVehicle.licensePlate === null ? this.BookingForm.get('vehicle_license_plate').setValue('') : this.SetFormValue('vehicle_license_plate', selectedVehicle.licensePlate)
		this.SetFormValue('vehicle_seats', selectedVehicle.seats)
		this.buildBookingData()
	}

	handleLooseCustomerPhone(event){
		console.log('handleLooseCustomerPhone->>', event, event.target.value)
		this.BookingForm.patchValue({
			passenger_cell : event.target.value
		})
	}
	handleLooseCustomerName(event){
		const loose_customer = (this.BookingForm.get('loose_customer') as FormGroup)
		this.BookingForm.patchValue({
			passenger_name : loose_customer.get('first_name').value + ' ' + loose_customer.get('last_name').value
		})
	}

	handleLooseAffiliateName(){
		this.BookingForm.patchValue({
			driver_name : this.BookingForm.get('lose_affiliate_name').value
		})
		 
	}

	handleLooseAffiliatePhone(){
		this.BookingForm.patchValue({
			driver_cell : this.BookingForm.get('lose_affiliate_phone').value
		})
	}

	fetchAffiliateVehicles(affiliate_id: number) {
		if (!affiliate_id) {
			console.error('Invalid Paramater affiliate_data', affiliate_id)
			return
		}
		this.$spinner.show()
		this.affiliateService.getVehicleDataByAffiliateId(affiliate_id).then((response: any) => {
			console.log('get vehicle data response------------------->>>>>>>>>>>>>>>', response.success && response.data?.vehicleList.length > 0, response.data)
			if (response.success && response.data?.vehicleList.length > 0) {
				this.VehicleList = response.data?.vehicleList
				console.log('in else vehicle list ---->>>>>>', this.VehicleList)
				// add a key with formatted name to every value
				this.VehicleList.map((item: any) => item['formatted_name'] = `${item.vehicleType} - ${item.make} (${item.model})`);

				this.vehicleType_arr = this.VehicleList = this.vehicleMake_arr = this.VehicleList = this.vehicleModal_arr = this.VehicleList = this.vehicleYear_arr = this.VehicleList = this.vehicleColor_arr = this.VehicleList
				for (let i = 0; i < this.VehicleList.length; i++) {
					if (this.VehicleList[i].isRatesCompleted) {
						// let vehicle_type_id = this.BigData['vehicleCategories'].find(item => item.name == this.VehicleList[i].vehicleType)['id']
						if (affiliate_id == this.firstLoadAffiliateId) {
							if (this.VehicleList[i].ID == this.firstLoadVehicleId) {
								console.log('selected vehicle on first load---------------------------------->>>>>', this.VehicleList[i])
								this.SetFormValue('vehicle_id', this.VehicleList[i].ID);
								this.SetFormValue('vehicle_type', this.VehicleList[i].vehicleType_id)
								this.SetFormValue('vehicle_type_name', this.VehicleList[i].vehicleType)
								this.unique_key = this.VehicleList[i].unique_key
								this.handleSelectVehicleType(this.VehicleList[i])
								// this.autofillData('vehicle', this.VehicleList[i]);
								break;
							}
						}
						else {
							console.log('new affiliate seleted')
							this.SetFormValue('vehicle_id', this.VehicleList[i].ID);
							this.SetFormValue('vehicle_type', this.VehicleList[i].vehicleType_id)
							this.SetFormValue('vehicle_type_name', this.VehicleList[i].vehicleType)
							this.unique_key = this.VehicleList[i].unique_key
							this.handleSelectVehicleType(this.VehicleList[i])
							// this.autofillData('vehicle', this.VehicleList[i]);
							break;
						}

					}
				}

				// if (this.VehicleList.length == 1) {
				// 	let vehicle_type_id = this.BigData['vehicleCategories'].find(item => item.name == this.VehicleList[0].vehicleType)['id']
				// 	this.SetFormValue('vehicle_type', vehicle_type_id)
				// 	this.SetFormValue('vehicle_id', this.VehicleList[0].ID);
				// 	this.autofillData('vehicle', this.VehicleList[0]);
				// }
				// else{
				// 	//need to re-work
				// 	let vehicle_type_id = this.BigData['vehicleCategories'].find(item => item.name == this.VehicleList[0].vehicleType)['id']
				// 	this.SetFormValue('vehicle_type', vehicle_type_id)
				// 	this.SetFormValue('vehicle_id', this.VehicleList[0].ID);
				// 	this.autofillData('vehicle', this.VehicleList[0]);
				// }


			}
			// else if (response.success && response.data?.vehicleList.length > 0) {
			// 	this.VehicleList = response.data?.vehicleList
			// 	console.log('vehicle list ---->>>>>>', this.VehicleList)
			// 	// add a key with formatted name to every value
			// 	this.VehicleList.map((item: any) => item['formatted_name'] = `${item.vehicleType} - ${item.make} (${item.model})`);

			// 	// autofill data
			// 	if (this.VehicleList.length == 1) {
			// 		let vehicle_type_id = this.BigData['vehicleCategories'].find(item => item.name == this.VehicleList[0].vehicleType)['id']
			// 		this.SetFormValue('vehicle_type', vehicle_type_id)
			// 		this.SetFormValue('vehicle_id', this.VehicleList[0].ID);
			// 		this.autofillData('vehicle', this.VehicleList[0]);
			// 	}
			// }
			this.$spinner.hide()
		})
	}

	fetchQBAffiliateVehicles(affiliate_id: number) {
		if (!affiliate_id) {
			console.error('Invalid Paramater affiliate_data', affiliate_id)
			return
		}
		this.$spinner.show()
		// this.$api.adminAffiliateVehicleList(affiliate_id).then((response: any) => {
		this.affiliateService.getVehicleDataByAffiliateId(affiliate_id).then((response: any) => {
			console.log('get affiliate vehicle data----->>>>>>>>>' , response.data)
			if (response.success && response.data.vehicleList.length > 0) {
				this.VehicleList = response.data.vehicleList
				// add a key with formatted name to every value
				this.VehicleList.map((item: any) => item['formatted_name'] = `${item.vehicleType} - ${item.make} (${item.model})`);

				// autofill data if isRatesCompleted:true
				this.vehicleType_arr = this.VehicleList = this.vehicleMake_arr = this.VehicleList = this.vehicleModal_arr = this.VehicleList = this.vehicleYear_arr = this.VehicleList = this.vehicleColor_arr = this.VehicleList

				for(let i=0;i<this.VehicleList.length;i++){
					if(this.VehicleList[i].isRatesCompleted){
						if(this.QB_vehicle_id){
							if(this.VehicleList[i].ID == this.QB_vehicle_id ){
								let vehicle_type_id = this.BigData['vehicleCategories'].find(item => item.name == this.VehicleList[i].vehicleType)['id']
								this.SetFormValue('vehicle_type', vehicle_type_id)
								// this.SetFormValue('vehicle_id', this.VehicleList[i].ID);
								// this.autofillData('vehicle', this.VehicleList[i]);
								this.handleSelectVehicleType(this.VehicleList[i])
								break;
							}
						}
					}
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
		console.log('in function fectch driver info -------------------')

		this.$spinner.show()
		this.affiliateService.driverList(affiliate_id).then((response: any) => {
			if (response.success && response.data?.data.length > 0) {
				this.DriverList = response.data.data
				let isValueSet = false
				for(let i =0;i<this.DriverList.length;i++){
					this.SetFormValue('driver_id', this.DriverList[i].id)
					console.log('autofill driver info--->>', this.DriverList[i])
					this.autofillData('driver', this.DriverList[i])
					isValueSet = true
					break;
				}
				if (!isValueSet) {
					this.SetFormValue('driver_id', this.DriverList[0].id)
					this.autofillData('driver', this.DriverList[0])
				}
				// autofill data
				// if (this.DriverList.length == 1) {
				// 	this.SetFormValue('driver_id', this.DriverList[0].id)
				// 	this.autofillData('driver', this.DriverList[0])
				// }
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
	fetchSpecialInstruction(form_group_name: string, index: number) {
		try {
			return (<FormArray>this.BookingForm.get(form_group_name)).at(index).get('booking_instructions').value
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

		// if (filling_for == 'vehicle') {
		// 	this.SetFormValue('vehicle_license_plate', data.licensePlate)
		// 	this.SetFormValue('vehicle_seats', data.seats)

		// 	// fill values of make/model/year/color
		// 	let i = 0
		// 	let legend = ['make', 'model', 'year', 'color']
		// 	for (let item of ['vehicleMakes', 'vehicleModels', 'vehicleYears', 'vehicleColors']) {
		// 		let obj = this.BigData[item].find(j => j.name == data[legend[i]])
		// 		console.log('loop for -->>' , legend[i] , item , obj)
		// 		if(obj){
		// 			this.SetFormValue('vehicle_' + legend[i], obj?.id)
		// 			let name = obj['name']; // name
		// 			this.SetFormValue("vehicle_" + legend[i] + "_name", name);
		// 		}
		// 		i++;
		// 	}
		// }

		if (filling_for == 'driver') {
			let info = data
			if (!isNaN(data)) {
				for (let i = 0; i < this.DriverList.length; i++) {
					if (this.DriverList[i].id == data) {
						info = { ...this.DriverList[i] }
					}
				}
			}
			this.SetFormValue('driver_name', `${info?.FirstName} ${info?.MiddleName ?? ''} ${info?.LastName}`)
			this.SetFormValue('driver_gender', info?.Gender)
			this.SetFormValue('driver_cell', info?.CellNumber)
			this.SetFormValue('driver_cell_isd', info?.CellIsd)
			this.SetFormValue('driver_cell_country', info?.CellNumberCountry)
			this.SetFormValue('driver_email', info?.Email)
			this.SetFormValue('driver_phone_type', info?.PhoneType ?? '');
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
				longitude: new FormControl(''),
				rate:  new FormControl(''),
				booking_instructions: new FormControl('')
			}))
		}
		else {
			let index = Object.keys(this.ExtraStops).length + 1;
			(<FormArray>this.BookingForm.get('extra_stops')).push(new FormGroup({
				address: new FormControl(''),
				latitude: new FormControl(''),
				longitude: new FormControl(''),
				rate:  new FormControl(''),
				booking_instructions: new FormControl('')
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
				let return_pickup_location = this.Form.return_pickup?.value
				if (this.Form.transfer_type.value.includes('_airport')) {
					return_pickup_location = this.Form.return_pickup_airport_name?.value
				}
				this.checkExtraStopInTown(return_pickup_location,address.formatted_address ,'return_extra_stops',index )
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
				let pickup_location = this.Form.pickup.value
				if (this.Form.transfer_type.value.includes('airport_')) {
					pickup_location = this.Form.pickup_airport_name.value
				}
				this.checkExtraStopInTown(pickup_location,address.formatted_address ,'extra_stops',index )
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
	getTown(geocodeResult) {
		for (let i = 0; i < geocodeResult.length; i++) {
			const addressComponents = geocodeResult[i].address_components;
			for (let j = 0; j < addressComponents.length; j++) {
				const types = addressComponents[j].types;
				if (types.includes('locality')) {
					return addressComponents[j].long_name;
				}
			}
		}
		return null;
	}

	checkExtraStopInTown(location1: string, location2: string,formKey:string,index:any) {
		console.log('in function check extra stop in town' , location1 , location2)
		const geocoder = new google.maps.Geocoder();
		geocoder.geocode({ address: location1 }, (results1, status1) => {
		  if (status1 === 'OK' && results1.length > 0) {
			const town1 = this.getTown(results1);
			geocoder.geocode({ address: location2 },async (results2, status2) => {
			  if (status2 === 'OK' && results2.length > 0) {
				const town2 = this.getTown(results2);
	  
				if (town1 === town2) {
					console.log('Both locations are in the same town/city.',this.extraStops_rate);
					await (<FormArray>this.BookingForm.get([formKey])).at(index).patchValue({
						rate : 'in_town'
					});
				} else {
					console.log('Locations are in different towns/cities.',this.extraStops_rate);
					(<FormArray>this.BookingForm.get([formKey])).at(index).patchValue({
						rate : 'out_town'
					});
				}
				setTimeout(()=>{
					this.buildBookingData()
				},300)
			  } else {
				console.error('Geocoding for Location 2 failed:', status2);
			  }
			});
		  } else {
			console.error('Geocoding for Location 1 failed:', status1);
		  }
		});
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

	getTopOffset(controlEl: HTMLElement): number {
		// console.log(controlEl.getBoundingClientRect());
		const labelOffset = 90;
		return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
	}
	createReservationShareArray(){
		console.log('in function createReservationShareArray')
		if (this.RatesForm) {
		let base_rate = 0
		if(this.BookingForm.value?.service_type == 'charter_tour'){
			base_rate +=  this.RatesForm.all_inclusive_rates["Base_Rate"].baserate * this.number_of_hours
		}
		else{
			base_rate +=  this.RatesForm.all_inclusive_rates["Base_Rate"].baserate
		}
		['ELH_Charges', 'Stops', 'Wait'].map((key) => {
			base_rate += this.RatesForm.all_inclusive_rates[key].baserate
		});
		for (const key of Object.keys(this.RatesForm.amenities)) {
			base_rate += this.RatesForm.amenities[key].baserate;
		}
			let grandTotal = this.BookingForm.value.rateArray.grand_total
			let stripeFee = grandTotal * 0.05 + 0.30
			let adminShare = (base_rate * this.adminSharePercent) / 100 
			let deducted_admin_share = adminShare-stripeFee
			let shareArray = {
				baseRate : base_rate,
				grandTotal : grandTotal,
				stripeFee : stripeFee,
				adminShare : adminShare,
				deducted_admin_share: deducted_admin_share,  // Admin will get this amount only
				affiliateShare : (grandTotal - adminShare)
			}

			// add conditions here to change share percentage
			this.adminSharePercent = 15
			shareArray['adminShare'] = (base_rate * this.adminSharePercent) / 100 
			shareArray['deducted_admin_share'] = shareArray['adminShare']- shareArray['stripeFee']
			shareArray['farmoutShare'] = base_rate * 0.10  
			this.shareArray = shareArray
			// console.log('in function createReservationShareArray-->>>' , base_rate, shareArray )
			return shareArray;
			// value['rateArray'] = JSON.parse(JSON.stringify(this.RatesForm))
		}
	}
	createReservationReturnShareArray(){
		console.log('createReservationReturnShareArray', this.BookingForm.value.return_grand_total)
		if (this.Form.service_type.value == 'round_trip' && this.ReturnRatesForm) {
			
			let base_rate = 0
		for (const key of Object.keys(this.ReturnRatesForm.all_inclusive_rates)) {
			base_rate += this.ReturnRatesForm.all_inclusive_rates[key].baserate;
		}
		for (const key of Object.keys(this.ReturnRatesForm.amenities)) {
			base_rate += this.ReturnRatesForm.amenities[key].baserate;
		}
			let returnGrandTotal = this.BookingForm.value.return_grand_total
			let stripeFee = returnGrandTotal * 0.05 + 0.30
			let adminShare = (base_rate * this.adminSharePercent) / 100  
			let returnShareArray = {
				baseRate : base_rate,
				returnGrandTotal : returnGrandTotal,
				stripeFee : stripeFee,
				adminShare : adminShare,
				affiliateShare : returnGrandTotal - adminShare
			}
			// travelAgentShare : 
			this.adminSharePercent = 15
			returnShareArray['adminShare'] = (base_rate * this.adminSharePercent) / 100 
			returnShareArray['deducted_admin_share'] = returnShareArray['adminShare']- returnShareArray['stripeFee']
			returnShareArray['farmoutShare'] = base_rate * 0.10  

			this.r_shareArray = returnShareArray
			// console.log('in function createReservationreturnShareArray-->>>' , base_rate, returnShareArray )
			return returnShareArray;
			// value['returnRateArray'] = JSON.parse(JSON.stringify(this.ReturnRatesForm))
			}
	}

	submitForm(preview: boolean) {
		this.submitBookingForm = true
		console.log(this.BookingForm);
		console.log(this.BookingForm.status);

		if (this.BookingForm.invalid) {
			return;
		}

		let value = this.BookingForm.value
		if (this.RatesForm) {
				value['rateArray'] = JSON.parse(JSON.stringify(this.RatesForm))
				value['grand_total'] = value['rateArray']['grand_total']
				value['sub_total'] = value['rateArray']['sub_total']
				value['shares_array'] = this.createReservationShareArray()
				delete value['rateArray']['grand_total']
				delete value['rateArray']['sub_total']

				// Return Rates Form
				if (this.Form.service_type.value == 'round_trip' && this.ReturnRatesForm) {
					value['returnRateArray'] = JSON.parse(JSON.stringify(this.ReturnRatesForm))
					value['return_grand_total'] = value['returnRateArray']['r_grandtotal']
					value['return_sub_total'] = value['returnRateArray']['r_subtotal']
					value['return_shares_array'] = this.createReservationReturnShareArray()
					delete value['returnRateArray']['r_grandtotal']
					delete value['returnRateArray']['r_subtotal']
				}
			}
			
			if (preview) {
			this.$spinner.show()
			this.affiliateService.createBooking(value).subscribe((response: any) => {
				// this.$errors.openDialog({
				// 	errors: {
				// 		error: `<span class='text-success'>${response.message}</span>`
				// 	}
				// })
				this.$router.navigate(['/affiliate/farm-out'])
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
	async uploadImage(event: any, image_type: string) {
		if(!await this.commonServices.handleFile(event)) {
			return;
		}
		let image: any
		console.log(event.target.files)
		if (event.target.files && event.target.files.length > 0) {
			const reader = new FileReader()
			const file = event.target.files[0]
			reader.readAsDataURL(file)
			reader.onload = () => {
				image = reader.result as string
				this.$spinner.show();
				this.affiliateService.uploadVehicleImage(image).subscribe((response: any) => {
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
	handleChangeVehicleType(event) {
		console.log('in function handle change vehicle type', event,event.unique_key)
		this.VehicleList.map(i => (i.unique_key == event.unique_key) ? this.handleSelectVehicleType(i) : '')

	}

	Subscriptions() {
		// Service Type
		this.BookingForm.get('service_type').valueChanges.subscribe((value: string) => {
			this.init_return_rates = false;
			if (value == 'round_trip') {
				this.init_return_rates = true;
				console.log('init_return_rates---------->>>>>>>>' , this.init_return_rates)
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

				(<FormGroup>loose_customer.get('card_details')).get('card_number').setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(14), Validators.maxLength(20)]);
				(<FormGroup>loose_customer.get('card_details')).get('name').setValidators([Validators.required]);
				(<FormGroup>loose_customer.get('card_details')).get('cvv').setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(5)]);
				loose_customer.get('email').setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)])
				loose_customer.get('phone').setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)])
				loose_customer.get('first_name').setValidators([Validators.required])
				// loose_customer.get('middle_name').setValidators()
				loose_customer.get('last_name').setValidators([Validators.required])
				loose_customer.get('address').setValidators(this.customValidator.whitespace())

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
				this.BookingForm.get('lose_affiliate_name').setValidators([Validators.required])
				this.BookingForm.get('lose_affiliate_phone').setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)])
				this.BookingForm.get('lose_affiliate_email').setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)])
				this.BookingForm.updateValueAndValidity()
				this.init_rates = true
				if (this.Form.service_type.value === 'round_trip') {
					this.init_return_rates = true;
				}
				if (this.Form.updateType.value != 'edit' && this.Form.updateType.value != 'repeat' && this.Form.updateType.value != 'return') {
					this.SetFormValue('vehicle_type_name', '');
					this.BookingForm.get('vehicle_make').setValue('')
					this.BookingForm.get('vehicle_make_name').setValue('')
					this.BookingForm.get('vehicle_model').setValue('')
					this.BookingForm.get('vehicle_model_name').setValue('')
					this.BookingForm.get('vehicle_year').setValue('')
					this.BookingForm.get('vehicle_year_name').setValue('')
					this.BookingForm.get('vehicle_color').setValue('')
					this.BookingForm.get('vehicle_color_name').setValue('')
					this.BookingForm.updateValueAndValidity();
				}
			}
			else {
				console.log('value--->> clearing validations for--> ', value)
				this.BookingForm.get('lose_affiliate_name').clearValidators()
				this.BookingForm.get('lose_affiliate_name').updateValueAndValidity()

				this.BookingForm.get('lose_affiliate_phone').clearValidators()
				this.BookingForm.get('lose_affiliate_phone').updateValueAndValidity()


				this.BookingForm.get('lose_affiliate_email').clearValidators()
				this.BookingForm.get('lose_affiliate_email').updateValueAndValidity()

				console.log('clear validation')
				this.init_rates = true;
				if (this.Form.service_type.value === 'round_trip') {
					this.init_return_rates = true;
				}
				this.fetchAffiliates('affiliate')
				this.chooseAffiliate()
			}
		})

		this.BookingForm.get('affiliate_id').valueChanges.subscribe((value: number) => {
			if (value) {
				console.log('affiliate _id changed----->>>>>>', value)
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

		this.BookingForm.get('vehicle_type').valueChanges.subscribe((value: string) => {
			if (this.Form.affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate vehicle_type', value)
				if (value) {
					this.VehicleList.map(i => (i.unique_key == this.unique_key) ? this.handleSelectVehicleType(i) : '')
				}
				else {
					this.SetFormValue('vehicle_type_name', '');
					this.BookingForm.get('vehicle_make').setValue('')
					this.BookingForm.get('vehicle_make_name').setValue('')
					this.BookingForm.get('vehicle_model').setValue('')
					this.BookingForm.get('vehicle_model_name').setValue('')
					this.BookingForm.get('vehicle_year').setValue('')
					this.BookingForm.get('vehicle_year_name').setValue('')
					this.BookingForm.get('vehicle_color').setValue('')
					this.BookingForm.get('vehicle_color_name').setValue('')
					this.BookingForm.updateValueAndValidity();
				}

			} else {
				if (value && this.BigData) {
					let name = this.BigData['vehicleCategories'].find(item => item.id == value)['name']
					this.SetFormValue('vehicle_type_name', name);
					this.BookingForm.get('vehicle_make').setValue('')
					this.BookingForm.get('vehicle_make_name').setValue('')
					this.BookingForm.get('vehicle_model').setValue('')
					this.BookingForm.get('vehicle_model_name').setValue('')
					this.BookingForm.get('vehicle_year').setValue('')
					this.BookingForm.get('vehicle_year_name').setValue('')
					this.BookingForm.get('vehicle_color').setValue('')
					this.BookingForm.get('vehicle_color_name').setValue('')
					this.BookingForm.updateValueAndValidity();
				}
			}
		})

		this.BookingForm.get('vehicle_make').valueChanges.subscribe((value: string) => {
			if (this.Form.affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate  vehicle_make')
			} else {
				if (value && this.BigData) {
					this.BigData['vehicleModels'] = this.BigData_COPY?.vehicleModels.filter(item => item.make_id == value)
					let name = this.BigData['vehicleMakes'].find(item => item.id == value)['name']
					this.SetFormValue('vehicle_model', this.BigData?.vehicleModels[0]['id'])
					this.SetFormValue('vehicle_make_name', name)
				}
				else {
					this.BookingForm.get('vehicle_make_name').setValue('')
					this.BookingForm.updateValueAndValidity();
				}
			}
		})

		this.BookingForm.get('vehicle_model').valueChanges.subscribe((value: string) => {
			if (this.Form.affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate vehicle_model')

			} else {
				if (value && this.BigData) {
					let name = this.BigData['vehicleModels'].find(item => item.id == value)['name']
					this.SetFormValue('vehicle_model_name', name)
				}
				else {
					this.BookingForm.get('vehicle_model_name').setValue('')
					this.BookingForm.updateValueAndValidity();
				}
			}
		})

		this.BookingForm.get('vehicle_year').valueChanges.subscribe((value: string) => {
			if (this.Form.affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate vehicle_year')
			} else {
				if (value && this.BigData) {
					let name = this.BigData['vehicleYears'].find(item => item.id == value)['name']
					this.SetFormValue('vehicle_year_name', name)
				}
				else {
					this.BookingForm.get('vehicle_year_name').setValue('')
					this.BookingForm.updateValueAndValidity();
				}
			}
		})
		this.BookingForm.get('vehicle_color').valueChanges.subscribe((value: string) => {
			if (this.Form.affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate vehicle_color')

			} else {
				if (value && this.BigData) {
					let name = this.BigData['vehicleColors'].find(item => item.id == value)['name']
					this.SetFormValue('vehicle_color_name', name)
				}
				else {
					this.BookingForm.get('vehicle_color_name').setValue('')
					this.BookingForm.updateValueAndValidity();

				}
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
	HandleReturnNumberOfHr(data: any) {
		console.log('____<><><><><><><><>', data)
		this.BookingForm.get('number_of_hours').setValue(data)
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
		console.log('Addresss-->>>' , value);
		(<FormGroup>this.BookingForm.get('loose_customer')).get('address').setValue(value?.formatted_address);
		value.address_components.forEach(component => {
			const types = component.types;
			if (types.includes('postal_code')) {
				(<FormGroup>this.BookingForm.get('loose_customer')).get('zipCode').setValue(component.long_name);
			} else if (types.includes('locality')) {
				(<FormGroup>this.BookingForm.get('loose_customer')).get('city').setValue(component.long_name);
			} else if (types.includes('administrative_area_level_1')) {
				(<FormGroup>this.BookingForm.get('loose_customer')).get('state').setValue(component.long_name);
			} else if (types.includes('country')) {
				(<FormGroup>this.BookingForm.get('loose_customer')).get('country').setValue(component.long_name);
			}
		  });
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
	// addLineBreak(){
	// 	console.log('add line break __>>' , this.BookingForm.get('booking_instructions').value)
	// 	// this.BookingForm.patchValue({
	// 	// 	booking_instructions: this.BookingForm.get('booking_instructions').value +'\n'
	// 	// })
	// }

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

	iOS() {
		return [
			'iPad Simulator',
			'iPhone Simulator',
			'iPod Simulator',
			'iPad',
			'iPhone',
			'iPod'
		].includes(navigator.platform)
			// iPad on iOS 13 detection
			|| (navigator.userAgent.includes("Mac") && "ontouchend" in document)
	}


	showLocationPointOnMap(address:any) {
		let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		console.log('isSafari', isSafari)
		this.$spinner.show()
			this.$spinner.hide();
			if(address){
				let googleDirectionUrl;
				let iosDirectionUrl;
					googleDirectionUrl = 'https://www.google.com/maps/dir/?api=1' + '&destination=' +
						encodeURIComponent(address) + '&travelmode=driving'
					iosDirectionUrl = 'http://maps.apple.com/?daddr=' +
						encodeURIComponent(address)
				if (this.iOS()) {
					setTimeout(() => {
						window.location.href = iosDirectionUrl;
					})
				}
				else {
					window.open(googleDirectionUrl, '_blank');
				}
			} else {
				throw new Error('Error: Location Points Not Specified Properly. ');
			}
	}

	change(event: any, form_control: string) {
		console.log(event, form_control)
		event && this.SetFormValue(form_control, event.id);
	}

	textFormatterTransferType(text:any){
		try {
			return text.replace(/[\\\_$]+/g, ' ')+'?'
		}
		catch
		{
			return text
		}
	}
	buildBookingData(){
		console.log('rebuild booking data')
		this.booking_data = {
			vehicle_id: this.BookingForm.get('vehicle_id').value,
			transfer_type: this.transfer_type,
			service_type :this.service_type,
			numberOfVehicles :1,
			distance : this.distance, 
			return_distance : this.return_distance,
			no_of_hours : this.number_of_hours,
			is_master_vehicle : this.is_master_vehicle,
			extra_stops: this.BookingForm.get('extra_stops').value,
			return_extra_stops : this.BookingForm.get('return_extra_stops').value
		}
	}
	handleNoOfHours(value) {
		this.number_of_hours = value
		console.log('in function handle no of hours->' , value , value > 0)
		this.number_of_hours > 0 ? this.buildBookingData() : ''
	}
	onSelectionChangeServiceType(event: any) {
		this.service_type = event.value;
		this.buildBookingData()
	}

	setValueByBookNow() {
		let QB: any = JSON.parse(localStorage.getItem('quotebot_form'))
		let selected_vehicle :any = JSON.parse(sessionStorage.getItem('selected_vehicle'))
		// for (const key in QB) {
		//   console.log(`QB______${key}: ${QB[key]}`);
		//   this.SetFormValue(key ,QB[key])
		// }    
		this.affiliate_id = selected_vehicle?.affiliate_id


		//dropOFF
		this.SetFormValue('service_type', QB?.service_type)
		if(QB?.service_type == 'charter_tour'){
			this.SetFormValue('number_of_hours', QB?.booking_hour)
			this.number_of_hours = QB?.booking_hour
		}
		let transfer_type_value = QB?.pickup_type + '_to_' + QB?.dropoff_type
		let return_transfer_type_value = QB?.dropoff_type + '_to_' + QB?.pickup_type
		this.service_type = QB?.service_type
		this.transfer_type = transfer_type_value
		this.SetFormValue('transfer_type', transfer_type_value)
		this.SetFormValue('return_transfer_type', return_transfer_type_value)
		this.SetFormValue('total_passengers', QB?.no_of_luggage)
		this.SetFormValue('luggage_count', QB?.no_of_passenger)
		this.SetFormValue('affiliate_type', 'affiliate')
		this.SetFormValue('affiliate_id', this.affiliate_id)
		//vehicle id when chossing vehicle from Quote bot screen
		this.QB_vehicle_id = selected_vehicle?.id
		this.params_QB_vehicle_id = selected_vehicle?.id || null
		//pickup
		this.SetFormValue('pickup_date', QB?.pickup_date)
		this.SetFormValue('pickup', QB?.pickup_address)
		this.SetFormValue('pickup_latitude', QB?.pickup_address_lat)
		this.SetFormValue('pickup_longitude', QB?.pickup_address_long)
		this.SetFormValue('pickup_airport', QB?.pickup_airport)
		this.SetFormValue('pickup_airport_option', QB?.other_details?.pickup_airport_name)
		this.SetFormValue('pickup_airport_latitude', QB?.pickup_airport_lat)
		this.SetFormValue('pickup_airport_longitude', QB?.pickup_airport_long)
		this.SetFormValue('dropoff', QB?.dropoff_address)
		this.SetFormValue('dropoff_latitude', QB?.dropoff_address_lat)
		this.SetFormValue('dropoff_longitude', QB?.dropoff_address_long)
		this.SetFormValue('dropoff_airport', QB?.dropoff_airport)
		this.SetFormValue('dropoff_airport_option', QB?.other_details?.dropoff_airport_name)
		this.SetFormValue('dropoff_airport_latitude', QB?.dropoff_airport_lat)
		this.SetFormValue('dropoff_airport_longitude', QB?.dropoff_address_long)


		//return pickup
		this.SetFormValue('return_pickup_date', QB?.return_pickup_date)
		this.SetFormValue('return_pickup', QB?.return_dropoff_address)
		this.SetFormValue('return_pickup_latitude', QB?.return_dropoff_address_lat)
		this.SetFormValue('return_pickup_longitude', QB?.return_dropoff_address_long)
		this.SetFormValue('return_pickup_airport', QB?.return_pickup_airport)
		this.SetFormValue('return_pickup_airport_option', QB?.other_details?.return_pickup_airport_name)
		this.SetFormValue('return_pickup_airport_latitude', QB?.return_pickup_airport_lat)
		this.SetFormValue('return_pickup_airport_longitude', QB?.return_pickup_airport_long)

		//return dropOff
		this.SetFormValue('return_dropoff', QB?.return_dropoff_address)
		this.SetFormValue('return_dropoff_latitude', QB?.return_dropoff_address_lat)
		this.SetFormValue('return_dropoff_longitude', QB?.return_dropoff_address_long)
		this.SetFormValue('return_dropoff_airport', QB?.return_dropoff_airport)
		this.SetFormValue('return_dropoff_airport_option', QB?.other_details?.return_dropoff_airport_name)
		this.SetFormValue('return_dropoff_airport_latitude', QB?.return_dropoff_airport_lat)
		this.SetFormValue('return_dropoff_airport_longitude', QB?.return_dropoff_airport_long)
		this.SetFormValue('pickup_time', this.FormatTime(QB?.pickup_time))
		this.SetFormValue('return_pickup_time', this.FormatTime(QB?.return_pickup_time))
		this.SetFormValue('cruise_time', this.FormatTime(QB?.pickup_time))
		this.SetFormValue('return_cruise_time', this.FormatTime(QB?.return_pickup_time))
		if (QB?.pickup_type == 'airport') {
			let location = {
				latitude : QB?.pickup_airport_lat,
				longitude : QB?.pickup_airport_long
			}
			this.fillLocationPoints('airport',location)
		}
		this.MapController()
		this.MapController(true)
		setTimeout(() => {
			console.log('settimeout finction---------------------------------------------------------------')
			this.fetchQBAffiliateVehicles(selected_vehicle?.affiliate_id)
			this.fetchAffiliateDrivers(this.affiliate_id)
		}, 5000)
	}
}
