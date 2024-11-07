import { Component, EventEmitter, OnInit, ViewChild, isDevMode, ElementRef } from '@angular/core';
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
import { param } from 'jquery';
import { CommonService } from 'src/app/services/common.service';
import { HttpClient } from '@angular/common/http';

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
		client_account_types: ['individual', 'travel_planner', 'loose_customer'],
		client_account_types_subscriber: ['individual', 'loose_customer'],
		affiliate_accounts: ['affiliate', 'loose_affiliate'],
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
	numbers: any = [...this.booking_params.numbers];
	luggage_options: any = [...this.booking_params.numbers];

	//[{value:'01'},{value:'02'},{value:'03'},{value:'04'},{value:'05'},{value:'06'},{value:'07'},{value:'08'},{value:'09'},{value:'10'},{value:'11'},{value:'12'}]

	LCTelObject: any
	PaxTelObject: any
	driverCellTelInput: any
	loseAffiliateTelInput: any

	BookingForm: FormGroup
	RatesForm: any
	ReturnRatesForm: any

	booking_id: number = 0

	driver_image: Record<string, any> = {}
	vehicle_image: Record<string, any> = {}

	BigData: any
	BigData_COPY: any
	AffiliateInformation: Record<string, any> = {}
	ReturnAffiliateInformation: Record<string, any> = {}
	ClientAccounts: Array<Record<string, any>> = []
	AffiliateAccounts: Array<Record<string, any>> = []
	LooseAffiliateAccounts: Array<Record<string, any>> = []
	Return_AffiliateAccounts: Array<Record<string, any>> = []
	Return_LooseAffiliateAccounts: Array<Record<string, any>> = []
	VehicleList: Array<Record<string, any>> = []
	DriverList: Array<Record<string, any>> = []
	vehicleType_arr: any;
	vehicleMake_arr: any;
	vehicleModal_arr: any;
	vehicleYear_arr: any;
	vehicleColor_arr: any;
	return_VehicleList: Array<Record<string, any>> = []
	return_DriverList: Array<Record<string, any>> = []
	return_vehicleType_arr: any;
	return_vehicleMake_arr: any;
	return_vehicleModal_arr: any;
	return_vehicleYear_arr: any;
	return_vehicleColor_arr: any;
	firstLoadVehicleId: any;
	proceed: boolean = true
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
	affiliate_id: any;
	newBooking: boolean = false;
	QB_vehicle_id: any = null;
	unique_key: any;
	return_unique_key: any;
	firstLoadAffiliateId: void;
	updateType: any = 'create';
	bookingResponse: any;
	service_type: any = 'one_way';
	transfer_type: any = 'city_to_city'
	return_transfer_type: any = 'city_to_city'
	number_of_hours: any = '2';
	confirmMsg: any;
	booking_data: any;
	extraStops_rate: any = 0
	selectedVehicle: any;
	return_selectedVehicle: any;
	is_master_vehicle: boolean = JSON.parse(sessionStorage.getItem('selected_vehicle'))?.is_master_vehicle || false
	isTravelShare: boolean = false
	travelStaffAccounts: any;
	manual_change_aff_veh: boolean = false;
	isCreatedByAdmin: boolean = true;
	shareArray: any;
	r_shareArray: any;
	adminSharePercent: number = 25;
	isFarmoutBooking: boolean = false;
	AffiliateAccounts_copy: any;
	public canceloptions: Array<Object>;
	currencySymbol: any;
	currencyObj: any;
	currentUser: any;
	booking_created_from: string = 'admin';
	veh_created_by: any;

	constructor(
		private $form: FormBuilder,
		private $api: AdminService,
		private $shared: SharedModule,
		private $spinner: NgxSpinnerService,
		private $mapsapi: MapsAPILoader,
		private $errors: ErrorDialogService,
		private $router: Router,
		private $routeurl: ActivatedRoute,
		private commonServices: CommonService,
		private customValidator: CustomvalidationService,
		private el: ElementRef,
		private httpClient: HttpClient,
	) { }

	openAutoCompletePanel() {
		this.triggerAutoCompleteInput.openPanel();
	}
	ngOnInit(): void {

		this.currentUser = JSON.parse(localStorage.getItem("currentUser"))
		// build the form first 
		this.buildBookingForm()
		this.$routeurl.queryParams.subscribe((params: any) => {
			if (params && params.bookingId && !this.booking_id) {
				this.is_booking_edit_case = true
				this.updateType = params.updateType
				this.SetFormValue('reservation_id', params.bookingId)
				params.updateType ? this.SetFormValue('updateType', params.updateType) : this.SetFormValue('updateType', 'edit')
			}
			else if (params && params.new == 'true') {
				this.newBooking = params.new == 'true'
				this.affiliate_id = parseInt(params?.affiliate_id)
				this.booking_created_from = params?.created_by
			}
			else if (params?.reaffiliate_book_id) {
				this.updateType = params?.updateType
				this.newBooking = true
				console.log("in reaffiliate update type book id", params?.reaffiliate_book_id)
				this.SetFormValue('reservation_id', params.reaffiliate_book_id)
			}
			else {
				this.resetFields()
			}
			// this.currencyObj = JSON.parse(sessionStorage.getItem('currencyData')) ? JSON.parse(sessionStorage.getItem('currencyData')) : null
			this.currencySymbol = JSON.parse(localStorage.getItem('currencySymbol'))

			// place in query params to reinitialise things when modes of new and edit are toggled
			// Subscriptions
			this.Subscriptions()
			this.fetchClientAccounts('individual')
			this.fetchAffiliates('affiliate')
			this.fetchReturnAffiliates('affiliate')
			this.select(true, 'driver_languages', 1)
		})
		// fetch the big data
		this.fetchAirportsAndBigData()

		this.httpClient.get("assets/json/charterOptions.json").subscribe((data: any) => {
			this.canceloptions = data;
		});

		// if susbcriber then add companmy name in read only field and call vehicles by their account id
		if (this.currentUser?.created_by_role == 'subscriber' && !this.newBooking) {
			this.BookingForm.patchValue({
				susbcriber_name: this.currentUser?.name,
				driver_name: this.currentUser?.name,
				driver_email: this.currentUser.email,
				driver_cell_isd: this.currentUser?.isd,
				driver_cell: this.currentUser?.phone,
				driver_cell_country: this.currentUser?.phoneCountry
			})
			this.fetchAffiliateVehicles(this.currentUser?.account_id)
			this.booking_created_from = 'subscriber'
		}

	}
	buildBookingData() {
		console.log('rebuild booking data')
		this.booking_data = {
			vehicle_id: this.BookingForm.get('vehicle_id').value,
			return_vehicle_id: this.BookingForm.get('return_vehicle_id').value,
			transfer_type: this.transfer_type,
			service_type: this.service_type,
			numberOfVehicles: 1,
			distance: this.distance,
			return_distance: this.return_distance,
			no_of_hours: this.number_of_hours,
			is_master_vehicle: this.is_master_vehicle,
			extra_stops: this.BookingForm.get('extra_stops').value,
			return_extra_stops: this.BookingForm.get('return_extra_stops').value,
			manual_change_aff_veh: this.manual_change_aff_veh,
			pickup_time: this.BookingForm.get('pickup_time').value,
			return_pickup_time: this.BookingForm.get('return_pickup_time').value,
			affiliate_type: this.BookingForm.get('affiliate_type').value,
			return_affiliate_type: this.BookingForm.get('return_affiliate_type').value
		}
	}
	ngAfterViewInit(): void {
		console.log('<<<<<<<<<<<<<<<<<<<<<-----------ng after view init--------------->>>>>>>>>>>>>')
		if (this.updateType == 'repeat' || this.updateType == 'return' || this.updateType == 'edit' || this.updateType == 'round') {
			this.scroll('pickup_adress')
			this.SetFormValue('pickup_date', moment().format('YYYY-MM-DD'))
		}
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
		catch {
			return text
		}
	}
	textFormatterClientAccounts(text: string) {
		try {
			return text == 'travel_planner' ? 'Travel Agent' : text.replace(/[\\\_$]+/g, ' ')
		}
		catch {
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
			travel_client_id: [''],
			travel_client_acc: ['travel_individual'],
			change_individual_data: [false],
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
			passenger_name: ['', [Validators.required, this.customValidator.whitespace()]],
			passenger_email: ['', [Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
			passenger_cell: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			passenger_cell_isd: ['+1'],
			passenger_cell_country: ['us'],
			total_passengers: [1],
			luggage_count: [0],
			booking_instructions: [''],
			return_booking_instructions: [''],
			affiliate_type: ['affiliate'],
			affiliate_id: [''],
			return_affiliate_type: ['affiliate'],
			return_affiliate_id: [''],
			loose_affiliate_id: [''],
			is_old_loose_affiliate: [false],
			return_loose_affiliate_id: [''],
			return_is_old_loose_affiliate: [false],
			lose_affiliate_name: ['', [this.customValidator.whitespace()]],
			lose_affiliate_phone: [''],
			lose_affiliate_phone_isd: ['+1'],
			lose_affiliate_phone_country: ['us'],
			lose_affiliate_email: [''],
			return_lose_affiliate_name: ['', [this.customValidator.whitespace()]],
			return_lose_affiliate_phone: [''],
			return_lose_affiliate_phone_isd: ['+1'],
			return_lose_affiliate_phone_country: ['us'],
			return_lose_affiliate_email: [''],
			cancellation_hours: ['24', [Validators.required]],
			return_cancellation_hours: ['24'],
			vehicle_type: ['', [Validators.required]],
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
			driver_name: [''],
			driver_gender: [''],
			driver_cell: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			driver_cell_isd: ['+1'],
			driver_cell_country: ['us'],
			driver_email: ['', Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)],
			return_vehicle_type: [''],
			return_vehicle_type_name: [''],
			return_vehicle_id: [''],
			return_vehicle_make: [''],
			return_vehicle_make_name: [''],
			return_vehicle_model: [''],
			return_vehicle_model_name: [''],
			return_vehicle_year: [''],
			return_vehicle_year_name: [''],
			return_vehicle_color: [''],
			return_vehicle_color_name: [''],
			return_vehicle_license_plate: ['', this.customValidator.whitespace()],
			return_vehicle_seats: ['4', Validators.pattern("^[0-9]*$")],
			return_driver_id: [''],
			return_driver_name: [''],
			return_driver_gender: [''],
			return_driver_cell: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			return_driver_cell_isd: ['+1'],
			return_driver_cell_country: ['us'],
			return_driver_email: ['', Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)],
			driver_phone_type: [''],
			return_driver_phone_type: [''],
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
			return_meet_greet_choices_name: ['Driver -  Airport - Text/call after plane lands with curbside meet location'],
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
			susbcriber_name: [''],
			return_susbcriber_name: ['']
		})

		// let month = new Date().getMonth()
		// let date: string | number = new Date().getDate() + 1
		// let year = new Date().getFullYear()


		// let full_date = new Date(year, month, date).toISOString()
		// // 10 days later
		// let future_full_date = new Date(year, month, date).toISOString()
		// this.SetFormValue('pickup_date', full_date.slice(0, full_date.indexOf('T')))
		// this.SetFormValue('return_pickup_date', future_full_date.slice(0, future_full_date.indexOf('T')))

		let date = new Date();
		let timestamp = date.getTime();

		this.SetFormValue('pickup_date', moment(timestamp).format("YYYY-MM-DD"))
		this.SetFormValue('return_pickup_date', moment(timestamp).format("YYYY-MM-DD"))

		this.SetFormValue('number_of_vehicles', 1)
		this.SetFormValue('booking_instructions', "1. Pax- Text driver when first landing for easy pickup instructions. 2. Driver- Call on Location. Text the client the day before each booking, and confirm the driver's name and cell number. Text client with ETA when en route. Text the client when on location.");
		this.SetFormValue('return_booking_instructions', "1. Pax- Text driver when first landing for easy pickup instructions. 2. Driver- Call on Location. Text the client the day before each booking, and confirm the driver's name and cell number. Text client with ETA when en route. Text the client when on location.");

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
			this.SetFormValue('return_meet_greet_choices_name', "Driver -  Airport - Text/call after plane lands with curbside meet location")
		}
	}
	changeTransferType(type: string) {
		console.log("transfer type", type)
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

	handleChangeMonth(value: any) {
		console.log('value', value)
		if (value) {
			this.monthOptions = this.months.filter(i => i.value.includes(value))
		}
	}
	handleChangeNoPasengers(value: any) {
		console.log('value', value)
		if (value) {
			this.booking_params.numbers = this.numbers.filter(i => i.toString().includes(value))
		}
		else {
			this.booking_params.numbers = this.numbers
		}
		console.log('passenger options---->', this.booking_params?.numbers)
	}
	handleChangeLuggaeCOunt(value: any) {
		console.log('value', value)
		if (value) {
			this.luggage_options = this.numbers.filter(i => i.toString().includes(value))
		}
		else {
			this.luggage_options = this.numbers
		}
		console.log('luggage options---->', this.booking_params?.numbers)
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
	handleNoOfHours(value) {
		this.number_of_hours = value
		console.log('in function handle no of hours->', value, value > 0)
		this.number_of_hours > 0 ? this.buildBookingData() : ''

	}
	prefillViaBookingID(booking_id: number) {
		// console.warn('Prefilling via Booking Id')
		this.$spinner.show('normalspinner');
		this.$api.getBookingDataForEdit(booking_id, this.Form.updateType.value).subscribe((response: any) => {
			response.data.booking_instructions = response.data.booking_instructions.replaceAll('<br />', '')
			console.log('response <><><><><', response.data)
			let editing_data = response.data
			let currency = editing_data?.currency
			this.httpClient.get("assets/json/currencyOptions.json").subscribe(data => {
				for (const key of Object.keys(data)) {
					if (data[key].currency === currency.toUpperCase()) {
						this.currencyObj = data[key]
						this.currencySymbol = data[key].symbol
					}
				}
			})
			console.log("this.currencyObj?.currency", this.currencyObj)
			this.bookingResponse = response.data
			this.firstLoadVehicleId = response.data.vehicle_id
			this.firstLoadAffiliateId = response.data.affiliate_id
			this.number_of_hours = response?.data?.number_of_hours
			this.isTravelShare = response?.data?.account_type == 'travel_planner' ? true : false
			this.isFarmoutBooking = response?.data?.reservation_type == 'farmout' ? true : false
			this.isCreatedByAdmin = response?.data?.created_by == 1 ? true : false

			this.booking_created_from = response?.data?.affiliate_id != this.currentUser?.account_id ? 'admin' : 'subscriber'

			if (response?.data?.account_type == 'travel_planner') {
				this.getTravelClientAccounts(response?.data?.acc_id)
			}
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
				if (editing_data[item] && item != "passenger_cell_isd") {
					if (isNaN(Number(editing_data[item]))) {
						this.SetFormValue(item, editing_data[item]);
					} else {
						this.SetFormValue(item, Number(editing_data[item]));
					}
				}
			}
			// if (editing_data?.loose_customer) {
			// 	console.log('n function fill loose customer data', editing_data?.loose_customer)
			// 	try {
			// 		for (let item in editing_data?.loose_customer) {
			// 			if (editing_data?.loose_customer[item]) {
			// 				console.log('LC set value for', item, editing_data?.loose_customer[item])
			// 				this.SetLCFormValue(item, editing_data?.loose_customer[item])
			// 			}
			// 		}
			// 		this.SetLCFormValue('phone' ,editing_data?.loose_customer?.mobile )
			// 		this.fillLooseCustomerAddress(editing_data?.loose_customer?.address)
			// 		const loose_customer = (this.BookingForm.get('loose_customer') as FormGroup)
			// 		loose_customer.get('email').setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)])
			// 		loose_customer.get('phone').setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)])
			// 		loose_customer.get('first_name').setValidators([Validators.required])
			// 		// loose_customer.get('middle_name').setValidators(this.customValidator.whitespace())
			// 		loose_customer.get('last_name').setValidators([Validators.required])
			// 		loose_customer.get('address').setValidators(this.customValidator.whitespace())
			// 		loose_customer.updateValueAndValidity()
			// 	}
			// 	catch (error) {
			// 		console.log('error--->>>>>>', error)
			// 	}
			// }
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
			this.BookingForm.patchValue({
				cancellation_hours: response?.data?.cancellation_hours.toString()
			})

			// if (this.Form.updateType.value == 'edit') {
			// 	this.booking_params.client_account_types.pop()
			// }
			this.booking_id = this.Form.reservation_id.value;
			this.Form.affiliate_id.value != 0 ? this.chooseAffiliate() : ''
			try {
				this.PaxTelObject.setCountry(this.BookingForm.get('passenger_cell_country').value);
			} catch {
				console.error('Set Country Value is null.')
			}
			if (this.Form.affiliate_type.value == 'loose_affiliate') {
				setTimeout(() => {
					this.loseAffiliateTelInput.setCountry(this.BookingForm.get('lose_affiliate_phone_country').value);
					this.driverCellTelInput.setCountry(this.BookingForm.get('driver_cell_country').value);
				}, 2000)
			}

			this.$spinner.hide('normalspinner')
			console.log('<<<<<<<<<<<-----------set pickup date------->>>>', moment().format('YYYY-MM-DD'), this.updateType)
			if (this.updateType == 'edit') {
				this.scroll('pickup_adress')
				// this.SetFormValue('pickup_date', moment().format('YYYY-MM-DD'))
				this.SetFormValue('pickup_date', this.bookingResponse?.pickup_date)
			}
			if (this.updateType == 'repeat' || this.updateType == 'return' || this.updateType == 'round') {
				this.scroll('pickup_adress')
				if (new Date(this.bookingResponse?.pickup_date).getTime() < new Date().getTime()) {
					this.SetFormValue('pickup_date', moment().format('YYYY-MM-DD'))
				}
				else {
					this.SetFormValue('pickup_date', this.bookingResponse?.pickup_date)
				}
			}

		})

	}
	scroll(id) {
		// let el = document.getElementById(id);
		// let elementRect = el.getBoundingClientRect();
		// let absoluteElementTop = elementRect.top + window.pageYOffset;
		// let topElement = absoluteElementTop - 200;

		// console.log(`scrolling to ${id}`, el , absoluteElementTop ,window.innerHeight);
		// window.scrollTo({
		// 	top: topElement,
		// 	behavior: 'smooth'
		// });

		let el = document.getElementById(id);
		console.log(`scrolling to ${id}`, el);
		el.scrollIntoView({ behavior: 'smooth' });
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

	convertToMinutes(value) {
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
							if (!this.BookingForm.get('return_extra_stops')?.value?.length || this.BookingForm.get('return_extra_stops')?.value[0]['rate']?.length) {
								this.buildBookingData()
							}
							this.BookingForm.patchValue({
								returnJourneyDistance: response.distance,
								returnJourneyTime: response.time
							})
							console.log("returnJourneyTime=========>", this.BookingForm.get('returnJourneyTime').value)
						} else {
							this.distance = response.distance
							if (!this.BookingForm.get('extra_stops')?.value?.length || this.BookingForm.get('extra_stops')?.value[0]['rate']?.length) {
								this.buildBookingData()
							}
							this.BookingForm.patchValue({
								journeyDistance: response.distance,
								journeyTime: response.time
							})
							console.log("returnJourneyTime=========>", this.BookingForm.get('journeyTime').value)
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
		console.log('Address: ', address)
		let address_components = address?.address_components
		// //setting currency based on pickup address country
		if (form_control == 'dropoff' || form_control == 'return_dropoff')
			this.httpClient.get("assets/json/currencyOptions.json").subscribe(data => {
				for (const key of Object.keys(data)) {
					if (address_components.find(component => component.long_name === data[key].countryName)) {
						console.log("Address:", data[key])
						this.currencyObj = data[key]
						this.currencySymbol = data[key].symbol
					}
				}
			})
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
				this.newBooking ? this.setValueByBookNow() : "";
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
			// corporate: 'corporate',
			travel_planner: 'travel'
		}

		// fail-safe
		if (!legend.hasOwnProperty(account_type)) {
			// console.error('Invalid Account type: ', account_type)
			return
		}
		else {
			this.$spinner.show()
			console.log("client acc", this.ClientAccounts)
			this.$api.getAccountBytype(legend[account_type]).subscribe((response: any) => {
				if (response.success && response.data.length > 0) {
					this.ClientAccounts = response.data;
				}
				else {
					this.ClientAccounts = []
				}
				console.log("client acc", this.ClientAccounts)
				this.$spinner.hide()
			})
		}
	}

	onSelectionChangeServiceType(event: any) {
		console.log("in service type change--->", event.value)
		this.service_type = event.value;
		this.buildBookingData()
	}

	changeReturnTransferType(event: any) {
		console.log("return transfer type", event)
		this.return_transfer_type = event
	}

	chooseUser(account_id: number) {
		console.log("in affiliate info")
		this.$spinner.show()
		this.chosen_user = {}
		this.$api.chooseUser(account_id, this.Form.account_type.value).subscribe((response: any) => {
			if (response.success && Object.keys(response.data).length > 0) {
				this.chosen_user = response.data
				this.chosen_user['name'] = `${response.data.first_name} ${response.data.middle_name ?? ''} ${response.data.last_name}`
				this.autofillData('passenger', this.chosen_user);
				// this.fillLCDetails(this.chosen_user)
				if (!this.Form.reservation_id.value) {
					// this.autofillData('passenger', this.chosen_user);
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
	getTravelClientAccounts(id) {
		this.$api.getTravelClientAccount(id).subscribe((response: any) => {
			console.log("accounts->>>>>>>>>>", response)
			this.travelStaffAccounts = response?.data
		})
	}
	handleClientAccChange(selectedAcc) {
		this.isTravelShare = selectedAcc == 'travel_planner' ? true : false
		this.BookingForm.get('acc_id').setValue(null);
		this.chosen_user = null
		this.BookingForm.patchValue({
			passenger_name: '',
			passenger_email: '',
			passenger_cell: '',
			passenger_cell_isd: '+1',
			passenger_cell_country: 'us',
		})
		if (selectedAcc == 'travel_planner') {
			this.BookingForm.get('travel_client_id').setValidators([Validators.required]);
			this.BookingForm.get('travel_client_id').updateValueAndValidity();
		}
		else {
			this.BookingForm.get('travel_client_id').clearValidators();
			this.BookingForm.get('travel_client_id').updateValueAndValidity();
		}
	}

	handleClientAccount(value: any) {
		console.log('---------------------_>>>>>>>>>>>>>> client acc value', value)
		this.chooseUser(value.id)
		if (this.BookingForm.get('account_type').value == 'travel_planner') {
			this.BookingForm.patchValue({
				travel_client_id: ''
			})
			this.getTravelClientAccounts(value.id)
		}

	}

	handleChangeTravelAccounts(selectedAcc) {
		console.log('handleChangeTravelAccounts-->>', selectedAcc)
		if (selectedAcc == 'travel_individual') {
			this.BookingForm.get('travel_client_id').setValidators([Validators.required]);
			this.BookingForm.get('travel_client_id').updateValueAndValidity();
		}
		else {
			this.BookingForm.get('travel_client_id').clearValidators();
			this.BookingForm.get('travel_client_id').updateValueAndValidity();
		}

	}
	handleTravelStaffAccounts(value: any) {
		console.log('handleTravelStaffAccounts--->>>', value)
		this.$api.getTravelClientDetailById(value.id).subscribe((response: any) => {
			console.log("detail ->>>>>>>", response)
			this.autofillData('passenger', response?.data);
		})

	}

	handleLooseCustomerPhone(event) {
		console.log('handleLooseCustomerPhone->>', event, event.target.value)
		const loose_customer = this.BookingForm.get('loose_customer') as FormGroup
		this.BookingForm.patchValue({
			passenger_cell: event.target.value,
			passenger_cell_isd: loose_customer.get('phone_isd').value,
			passenger_cell_country: loose_customer.get('phone_country').value
		})
	}
	handleLooseCustomerName(event) {
		const loose_customer = (this.BookingForm.get('loose_customer') as FormGroup)
		this.BookingForm.patchValue({
			passenger_name: loose_customer.get('first_name').value + ' ' + loose_customer.get('last_name').value
		})
	}

	handleLooseAffiliateName() {
		this.BookingForm.patchValue({
			driver_name: this.BookingForm.get('lose_affiliate_name').value
		})

	}

	handleLooseAffiliatePhone() {
		this.BookingForm.patchValue({
			driver_cell: this.BookingForm.get('lose_affiliate_phone').value
		})
	}


	fetchAffiliates(affiliate_type: 'affiliate' | 'loose_affiliate') {
		if (affiliate_type == 'loose_affiliate') {
			this.$spinner.show()
			this.$api.getAccountBytype('loose_affiliate').subscribe((response: any) => {
				this.LooseAffiliateAccounts = response?.data
				this.$spinner.hide()
			})
		}
		else {
			this.AffiliateAccounts = []
			this.$spinner.show()
			this.$api.getAccountBytype('driver').subscribe((response: any) => {
				if (response.success && response.data.length > 0) {
					this.AffiliateAccounts = response.data.map((item) => {
						item.bindNameAffiliate = item.name + ' / ' + item.driver_name
						return item
					})
					console.log('affiliate accounts', this.AffiliateAccounts)
					this.AffiliateAccounts_copy = [...this.AffiliateAccounts]
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

	fetchReturnAffiliates(return_affiliate_type: 'affiliate' | 'loose_affiliate') {
		if (return_affiliate_type == 'loose_affiliate') {
			this.$spinner.show()
			this.$api.getAccountBytype('loose_affiliate').subscribe((response: any) => {
				this.Return_LooseAffiliateAccounts = response?.data
				this.$spinner.hide()
			})
		}
		else {
			this.Return_AffiliateAccounts = []
			this.$spinner.show()
			this.$api.getAccountBytype('driver').subscribe((response: any) => {
				if (response.success && response.data.length > 0) {
					this.Return_AffiliateAccounts = response.data.map((item) => {
						item.bindNameAffiliate = item.name + ' / ' + item.driver_name
						return item
					})
					console.log('affiliate accounts', this.Return_AffiliateAccounts)
					this.AffiliateAccounts_copy = [...this.Return_AffiliateAccounts]
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

	changeAffiliateAccount(event) {
		console.log('in change aff acc', event)
		this.AffiliateAccounts = this.AffiliateAccounts_copy.filter((item) =>
			item.name.toLowerCase().includes(event.target.value.toLowerCase()) ||
			item.driver_name.toLowerCase().includes(event.target.value.toLowerCase())
		)
		console.log('in change aff acc', this.AffiliateAccounts)

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
	handleAffiliateChange(value) {
		console.log('in function handleAffiliateChange-->>', value)
	}
	handleLooseAffiliateChange(looseAffData) {
		console.log('in function handlelooseAffiliateChange-->>', looseAffData)
		if (looseAffData) {
			this.BookingForm.patchValue({
				driver_name: looseAffData?.driver_name,
				driver_cell: looseAffData?.driver_phone,
				driver_email: looseAffData?.driver_email,
				loose_affiliate_id: looseAffData?.id,
				is_old_loose_affiliate: true
			})
			this.SetFormValue('lose_affiliate_name', looseAffData?.driver_name)
			this.SetFormValue('lose_affiliate_phone', looseAffData?.driver_phone)
			this.SetFormValue('lose_affiliate_email', looseAffData?.driver_email)
			this.SetFormValue('lose_affiliate_phone_isd', looseAffData?.driver_isd)
			this.SetFormValue('lose_affiliate_phone_country', looseAffData?.driver_phone_country)
		}
		else {
			this.BookingForm?.patchValue({
				is_old_loose_affiliate: false
			})
			this.SetFormValue('lose_affiliate_name', '')
			this.SetFormValue('lose_affiliate_phone', '')
			this.SetFormValue('lose_affiliate_email', '')
			this.SetFormValue('lose_affiliate_phone_isd', '')
			this.SetFormValue('lose_affiliate_phone_country', 'us')
		}
		console.log('booking form value after selecting loose aff--->', this.BookingForm.value)
	}
	handleReturnLooseAffiliateChange(looseAffData) {
		console.log('in function handleReturnlooseAffiliateChange-->>', looseAffData)
		if (looseAffData) {
			this.BookingForm.patchValue({
				return_driver_name: looseAffData?.driver_name,
				return_driver_cell: looseAffData?.driver_phone,
				return_driver_email: looseAffData?.driver_email,
				return_loose_affiliate_id: looseAffData?.id,
				return_is_old_loose_affiliate: true
			})
			this.SetFormValue('return_lose_affiliate_name', looseAffData?.driver_name)
			this.SetFormValue('return_lose_affiliate_phone', looseAffData?.driver_phone)
			this.SetFormValue('return_lose_affiliate_email', looseAffData?.driver_email)
			this.SetFormValue('return_lose_affiliate_phone_isd', looseAffData?.driver_isd)
			this.SetFormValue('return_lose_affiliate_phone_country', looseAffData?.driver_phone_country)
		}
		else {
			this.BookingForm?.patchValue({
				return_is_old_loose_affiliate: false
			})
			this.SetFormValue('return_lose_affiliate_name', '')
			this.SetFormValue('return_lose_affiliate_phone', '')
			this.SetFormValue('return_lose_affiliate_email', '')
			this.SetFormValue('return_lose_affiliate_phone_isd', '')
			this.SetFormValue('return_lose_affiliate_phone_country', 'us')
		}
		console.log('booking form value after selecting loose aff--->', this.BookingForm.value)
	}
	chooseAffiliate() {
		// console.warn('Fetching Affiliate vehicles and drivers')
		this.fetchAffiliateVehicles(this.BookingForm.get('affiliate_id').value)
		this.fetchAffiliateDrivers(this.BookingForm.get('affiliate_id').value)
	}

	chooseReturnAffiliate() {
		// console.warn('Fetching Affiliate vehicles and drivers')
		this.fetchReturnAffiliateVehicles(this.BookingForm.get('return_affiliate_id').value)
		this.fetchReturnAffiliateDrivers(this.BookingForm.get('return_affiliate_id').value)
	}

	fetchAffiliateInformation(affiliate_id: number) {
		console.log("in affiliate info")
		this.$spinner.show('normalspinner');
		this.$api.getAffiliateAccount(affiliate_id).pipe(pluck('data')).subscribe((response: any) => {
			isDevMode() && console.info('Affiliate Information', response);
			this.AffiliateInformation = response;
			if(this.booking_created_from == 'admin'){
				console.log("in affiliate info")
				this.BookingForm.patchValue({
					susbcriber_name : this.AffiliateInformation?.FirstName + ' ' + this.AffiliateInformation?.LastName
				})
			}
			this.$spinner.hide('normalspinner');
		})
	}
	fetchReturnAffiliateInformation(return_affiliate_id: number) {
		this.$spinner.show('normalspinner');
		this.$api.getAffiliateAccount(return_affiliate_id).pipe(pluck('data')).subscribe((response: any) => {
			isDevMode() && console.info('Affiliate Information', response);
			this.ReturnAffiliateInformation = response;
			this.$spinner.hide('normalspinner');
		})
	}
	handleSelectVehicleType(selectedVehicle: any) {
		this.selectedVehicle = selectedVehicle
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
		//set cancellation period
		if (!this.booking_id) {
			if (this.BookingForm.get('service_type').value == 'charter_tour') {
				this.BookingForm.patchValue({
					cancellation_hours: selectedVehicle?.charter_cancellation_hours.toString()
				})
			}
			else {
				this.BookingForm.patchValue({
					cancellation_hours: selectedVehicle?.non_charter_cancellation_hours.toString()
				})
			}
		}
		else if (this.updateType == 'repeat' || this.updateType == 'return' || this.updateType == 'round') {
			if (this.BookingForm.get('service_type').value == 'charter_tour') {
				this.BookingForm.patchValue({
					cancellation_hours: selectedVehicle?.charter_cancellation_hours.toString()
				})
			}
			else {
				this.BookingForm.patchValue({
					cancellation_hours: selectedVehicle?.non_charter_cancellation_hours.toString()
				})
			}
		}
		this.buildBookingData()
	}

	handleReturnSelectVehicleType(selectedVehicle: any) {
		this.return_selectedVehicle = selectedVehicle
		console.log('selectweed vehicle-->>>>', selectedVehicle, selectedVehicle.licensePlate === null)
		this.SetFormValue('return_vehicle_id', selectedVehicle.ID);
		this.SetFormValue('return_vehicle_type_name', selectedVehicle.vehicleType)
		this.SetFormValue('return_vehicle_make', selectedVehicle.make_id);
		this.SetFormValue('return_vehicle_make_name', selectedVehicle.make);
		this.SetFormValue('return_vehicle_model', selectedVehicle.model_id);
		this.SetFormValue('return_vehicle_model_name', selectedVehicle.model);
		this.SetFormValue('return_vehicle_year', selectedVehicle.year_id);
		this.SetFormValue('return_vehicle_year_name', selectedVehicle.year);
		this.SetFormValue('return_vehicle_color', selectedVehicle.color_id);
		this.SetFormValue('return_vehicle_color_name', selectedVehicle.color);
		selectedVehicle.licensePlate === null ? this.BookingForm.get('return_vehicle_license_plate').setValue('') : this.SetFormValue('return_vehicle_license_plate', selectedVehicle.licensePlate)
		this.SetFormValue('return_vehicle_seats', selectedVehicle.seats)
		//set cancellation period
		if (!this.booking_id) {
			if (this.BookingForm.get('service_type').value == 'charter_tour') {
				this.BookingForm.patchValue({
					return_cancellation_hours: selectedVehicle?.charter_cancellation_hours.toString()
				})
			}
			else {
				this.BookingForm.patchValue({
					return_cancellation_hours: selectedVehicle?.non_charter_cancellation_hours.toString()
				})
			}
		}
		else if (this.updateType == 'repeat' || this.updateType == 'return' || this.updateType == 'round') {
			if (this.BookingForm.get('service_type').value == 'charter_tour') {
				this.BookingForm.patchValue({
					return_cancellation_hours: selectedVehicle?.charter_cancellation_hours.toString()
				})
			}
			else {
				this.BookingForm.patchValue({
					return_cancellation_hours: selectedVehicle?.non_charter_cancellation_hours.toString()
				})
			}
		}
		this.buildBookingData()
	}

	fetchAffiliateVehicles(affiliate_id: any) {
		if (!affiliate_id) {
			console.error('Invalid Paramater affiliate_data', affiliate_id)
			return
		}
		this.$spinner.show()
		this.$api.adminAffiliateVehicleList(affiliate_id, false).then((response: any) => {
			console.log('get affiliate vehicle data----->>>>>>>>>', response.data)
			if (response.success && response.data.vehicleList.length > 0) {
				this.VehicleList = response.data.vehicleList
				// add a key with formatted name to every value
				this.VehicleList.map((item: any) => item['formatted_name'] = `${item.vehicleType} - ${item.make} (${item.model})`);
				// autofill data if isRatesCompleted:true
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
				// else if(this.VehicleList.length){
				// 	// need to re-code this condition #just a patch
				// 	let vehicle_type_id = this.BigData['vehicleCategories'].find(item => item.name == this.VehicleList[0].vehicleType)['id']
				// 	this.SetFormValue('vehicle_type', vehicle_type_id)
				// 	this.SetFormValue('vehicle_id', this.VehicleList[0].ID);
				// 	this.autofillData('vehicle', this.VehicleList[0]);
				// }
			}
			this.$spinner.hide()
		})
	}

	fetchReturnAffiliateVehicles(return_affiliate_id: any) {
		if (!return_affiliate_id) {
			console.error('Invalid Paramater affiliate_data', return_affiliate_id)
			return
		}
		this.$spinner.show()
		this.$api.adminAffiliateVehicleList(return_affiliate_id, false).then((response: any) => {
			console.log('get affiliate vehicle data----->>>>>>>>>', response.data)
			if (response.success && response.data.vehicleList.length > 0) {
				this.return_VehicleList = response.data.vehicleList
				// add a key with formatted name to every value
				this.return_VehicleList.map((item: any) => item['formatted_name'] = `${item.vehicleType} - ${item.make} (${item.model})`);
				// autofill data if isRatesCompleted:true
				this.return_vehicleType_arr = this.return_VehicleList = this.return_vehicleMake_arr = this.return_VehicleList = this.return_vehicleModal_arr = this.return_VehicleList = this.return_vehicleYear_arr = this.return_VehicleList = this.return_vehicleColor_arr = this.return_VehicleList
				for (let i = 0; i < this.return_VehicleList.length; i++) {
					if (this.return_VehicleList[i].isRatesCompleted) {
						// let vehicle_type_id = this.BigData['vehicleCategories'].find(item => item.name == this.return_VehicleList[i].vehicleType)['id']
						if (return_affiliate_id == this.firstLoadAffiliateId) {
							if (this.return_VehicleList[i].ID == this.firstLoadVehicleId) {
								console.log('selected vehicle on first load---------------------------------->>>>>', this.return_VehicleList[i])
								this.SetFormValue('return_vehicle_id', this.return_VehicleList[i].ID);
								this.SetFormValue('return_vehicle_type', this.return_VehicleList[i].vehicleType_id)
								this.SetFormValue('return_vehicle_type_name', this.return_VehicleList[i].vehicleType)
								this.return_unique_key = this.return_VehicleList[i].return_unique_key
								this.handleReturnSelectVehicleType(this.return_VehicleList[i])
								// this.autofillData('vehicle', this.return_VehicleList[i]);
								break;
							}
						}
						else {
							console.log('new affiliate seleted')
							this.SetFormValue('return_vehicle_id', this.return_VehicleList[i].ID);
							this.SetFormValue('return_vehicle_type', this.return_VehicleList[i].vehicleType_id)
							this.SetFormValue('return_vehicle_type_name', this.return_VehicleList[i].vehicleType)
							this.return_unique_key = this.return_VehicleList[i].return_unique_key
							this.handleReturnSelectVehicleType(this.return_VehicleList[i])
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
				// else if(this.VehicleList.length){
				// 	// need to re-code this condition #just a patch
				// 	let vehicle_type_id = this.BigData['vehicleCategories'].find(item => item.name == this.VehicleList[0].vehicleType)['id']
				// 	this.SetFormValue('vehicle_type', vehicle_type_id)
				// 	this.SetFormValue('vehicle_id', this.VehicleList[0].ID);
				// 	this.autofillData('vehicle', this.VehicleList[0]);
				// }
			}
			this.$spinner.hide()
		})
	}

	fetchQBAffiliateVehicles(affiliate_id: number) {
		if (!affiliate_id) {
			console.error('Invalid Paramater affiliate_data', affiliate_id)
			return
		}
		this.$spinner.show()
		this.$api.adminAffiliateVehicleList(affiliate_id, false).then((response: any) => {
			console.log('get affiliate vehicle data----->>>>>>>>>', response.data)
			if (response.success && response.data.vehicleList.length > 0) {
				this.VehicleList = response.data.vehicleList
				// add a key with formatted name to every value
				this.VehicleList.map((item: any) => item['formatted_name'] = `${item.vehicleType} - ${item.make} (${item.model})`);

				// autofill data if isRatesCompleted:true
				this.vehicleType_arr = this.VehicleList = this.vehicleMake_arr = this.VehicleList = this.vehicleModal_arr = this.VehicleList = this.vehicleYear_arr = this.VehicleList = this.vehicleColor_arr = this.VehicleList
				for (let i = 0; i < this.VehicleList.length; i++) {
					if (this.VehicleList[i].isRatesCompleted) {
						if (this.QB_vehicle_id) {
							if (this.VehicleList[i].ID == this.QB_vehicle_id) {
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

		this.$spinner.show()
		this.$api.driverList(affiliate_id).then((response: any) => {
			if (response.success && response.data?.data.length > 0) {
				this.DriverList = response.data.data
				console.log('driver list', this.DriverList)
				let isValueSet = false
				for (let i = 0; i < this.DriverList.length; i++) {
					if (this.bookingResponse?.driver_id && this.DriverList[i]?.id == this.bookingResponse?.driver_id) {
						this.SetFormValue('driver_id', this.DriverList[i]?.id)
						this.autofillData('driver', this.DriverList[i])
						isValueSet = true
						break;
					}
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

	fetchReturnAffiliateDrivers(return_affiliate_id: number) {
		if (!return_affiliate_id) {
			console.error('Invalid Paramater affiliate_data', return_affiliate_id)
			return
		}

		this.$spinner.show()
		this.$api.driverList(return_affiliate_id).then((response: any) => {
			if (response.success && response.data?.data.length > 0) {
				this.return_DriverList = response.data.data
				console.log('driver list', this.return_DriverList)
				let isValueSet = false
				for (let i = 0; i < this.return_DriverList.length; i++) {
					if (this.bookingResponse?.driver_id && this.return_DriverList[i]?.id == this.bookingResponse?.driver_id) {
						this.SetFormValue('return_driver_id', this.return_DriverList[i]?.id)
						this.autofillData('return_driver', this.return_DriverList[i])
						isValueSet = true
						break;
					}
				}
				if (!isValueSet) {
					this.SetFormValue('return_driver_id', this.return_DriverList[0].id)
					this.autofillData('return_driver', this.return_DriverList[0])
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
		catch {
			return ''
		}
	}
	fetchSpecialInstruction(form_group_name: string, index: number) {
		try {
			return (<FormArray>this.BookingForm.get(form_group_name)).at(index).get('booking_instructions').value
		}
		catch {
			return ''
		}
	}

	autofillData(filling_for: string, data: any) {
		if (filling_for === 'passenger') {
			console.log('--->>>> filling passenger info', data)
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
		// 	console.log('auto fill vehicle data is---->>>' , data)
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
			console.log('autofill data driver info-->>>', data, this.DriverList)
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
			this.driverCellTelInput.setCountry(this.BookingForm.get('driver_cell_country').value);
		}
		if (filling_for == 'return_driver') {
			console.log('autofill data driver info-->>>', data, this.return_DriverList)
			let info = data
			if (!isNaN(data)) {
				for (let i = 0; i < this.return_DriverList.length; i++) {
					if (this.return_DriverList[i].id == data) {
						info = { ...this.return_DriverList[i] }
					}
				}
			}
			this.SetFormValue('return_driver_name', `${info?.FirstName} ${info?.MiddleName ?? ''} ${info?.LastName}`)
			this.SetFormValue('return_driver_gender', info?.Gender)
			this.SetFormValue('return_driver_cell', info?.CellNumber)
			this.SetFormValue('return_driver_cell_isd', info?.CellIsd)
			this.SetFormValue('return_driver_cell_country', info?.CellNumberCountry)
			this.SetFormValue('return_driver_email', info?.Email)
			this.SetFormValue('return_driver_phone_type', info?.PhoneType ?? '');
			this.driverCellTelInput.setCountry(this.BookingForm.get('return_driver_cell_country').value);
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
				rate: new FormControl(''),
				booking_instructions: new FormControl('')
			}))
		}
		else {
			let index = Object.keys(this.ExtraStops).length + 1;
			(<FormArray>this.BookingForm.get('extra_stops')).push(new FormGroup({
				address: new FormControl(''),
				latitude: new FormControl(''),
				longitude: new FormControl(''),
				rate: new FormControl(''),
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
		this.buildBookingData()
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
				this.checkExtraStopInTown(return_pickup_location, address.formatted_address, 'return_extra_stops', index)
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
					address: address.formatted_address,
				});
				let pickup_location = this.Form.pickup.value
				if (this.Form.transfer_type.value.includes('airport_')) {
					pickup_location = this.Form.pickup_airport_name.value
				}
				this.checkExtraStopInTown(pickup_location, address.formatted_address, 'extra_stops', index)
			}

			if (location) {
				(<FormArray>this.BookingForm.get('extra_stops')).at(index).patchValue({
					latitude: location.latitude,
					longitude: location.longitude,
				})
			}
			this.BookingForm.updateValueAndValidity();
			this.MapController()
		}
	}

	// recalculateExtraStopRates(){
	// 	this.extraStops_rate = 0
	// 	if (this.ExtraStops.length > 0) {
	// 		for (let i = 0; i < this.ExtraStops.length; i++) {
	// 			console.log('ExtraStops-->>' , i)
	// 			let stop = (<FormGroup>(<FormArray>this.BookingForm.get('extra_stops')).at(i))
	// 			let pickup_location = this.Form.pickup.value
	// 			if (this.Form.transfer_type.value.includes('airport_')) {
	// 				pickup_location = this.Form.pickup_airport.value
	// 			}
	// 			let extra_stop_location = stop.get('address').value 
	// 			this.checkExtraStopInTown(pickup_location,extra_stop_location)
	// 		}
	// 	}
	// }
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
	checkExtraStopInTown(location1: string, location2: string, formKey: string, index: any) {
		console.log('in function check extra stop in town', location1, location2)
		const geocoder = new google.maps.Geocoder();
		geocoder.geocode({ address: location1 }, (results1, status1) => {
			if (status1 === 'OK' && results1.length > 0) {
				const town1 = this.getTown(results1);
				geocoder.geocode({ address: location2 }, async (results2, status2) => {
					if (status2 === 'OK' && results2.length > 0) {
						const town2 = this.getTown(results2);

						if (town1 === town2) {
							console.log('Both locations are in the same town/city.', this.extraStops_rate);
							await (<FormArray>this.BookingForm.get([formKey])).at(index).patchValue({
								rate: 'in_town'
							});
						} else {
							console.log('Locations are in different towns/cities.', this.extraStops_rate);
							(<FormArray>this.BookingForm.get([formKey])).at(index).patchValue({
								rate: 'out_town'
							});
						}
						setTimeout(() => {
							this.buildBookingData()
						}, 300)
					} else {
						console.error('Geocoding for Location 2 failed:', status2);
					}
				});
			} else {
				console.error('Geocoding for Location 1 failed:', status1);
			}
		});
	}




	fillExtraStopInstruction(is_return: boolean, index: number, event: any) {
		console.log(is_return, index, event.target.value);
		if (is_return) {
			(<FormArray>this.BookingForm.get('return_extra_stops')).at(index).patchValue({
				booking_instructions: event.target.value
			})
		}
		else {
			(<FormArray>this.BookingForm.get('extra_stops')).at(index).patchValue({
				booking_instructions: event.target.value
			});
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


	navigateToDailyBooking() {
		this.$router.navigate(['/admin/daily-bookings-admin'])
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
	createReservationShareArray() {
		console.log('in function createReservationShareArray')
		if (this.RatesForm) {
			let base_rate = 0
			if (this.BookingForm.value?.service_type == 'charter_tour' && !this.BookingForm.value.rateArray?.min_rate_involved) {
				base_rate += this.RatesForm.all_inclusive_rates["Base_Rate"].baserate * this.number_of_hours
			}
			else {
				base_rate += this.RatesForm.all_inclusive_rates["Base_Rate"].baserate
			}
			['ELH_Charges', 'Stops', 'Wait'].map((key) => {
				base_rate += this.RatesForm.all_inclusive_rates[key].baserate
			});
			for (const key of Object.keys(this.RatesForm.amenities)) {
				base_rate += this.RatesForm.amenities[key].baserate;
			}
			console.log("extra gratutiy", this.BookingForm.value.rateArray.misc.Extra_Gratuity.amount, "min rate", this.BookingForm.value.rateArray?.min_rate_involved)
			let grandTotal = this.BookingForm.value.rateArray.grand_total
			let stripeFee = grandTotal * 0.05 + 0.30
			let adminShare = (base_rate * this.adminSharePercent) / 100
			adminShare = adminShare + (this.BookingForm.value.rateArray.misc.Extra_Gratuity.amount * 0.25)
			let deducted_admin_share = adminShare - stripeFee
			let shareArray = {
				baseRate: base_rate,
				grandTotal: grandTotal,
				stripeFee: stripeFee,
				adminShare: adminShare,
				deducted_admin_share: deducted_admin_share,  // Admin will get this amount only
				affiliateShare: grandTotal - base_rate * 0.25
			}
			// travelAgentShare : 
			if (this.BookingForm.value?.account_type == 'travel_planner' && !this.isCreatedByAdmin) {
				this.adminSharePercent = 15
				shareArray['adminShare'] = (base_rate * this.adminSharePercent) / 100
				shareArray['deducted_admin_share'] = shareArray['adminShare'] - shareArray['stripeFee']
				shareArray['travelAgentShare'] = base_rate * 0.10
			}
			else if (this.isFarmoutBooking) {
				this.adminSharePercent = 15
				shareArray['adminShare'] = (base_rate * this.adminSharePercent) / 100
				shareArray['deducted_admin_share'] = shareArray['adminShare'] - shareArray['stripeFee']
				shareArray['farmoutShare'] = base_rate * 0.10
			}
			else if (this.booking_created_from == 'subscriber') {
				this.adminSharePercent = 0
				shareArray['adminShare'] = (base_rate * this.adminSharePercent) / 100
				shareArray['deducted_admin_share'] = 0
				shareArray['affiliateShare'] = grandTotal - stripeFee
			}
			this.shareArray = shareArray
			// console.log('in function createReservationShareArray-->>>' , base_rate, shareArray )
			return shareArray;
			// value['rateArray'] = JSON.parse(JSON.stringify(this.RatesForm))
		}
	}
	createReservationReturnShareArray() {
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
			adminShare = adminShare + (this.BookingForm.value.returnRateArray.misc.Extra_Gratuity.amount * 0.25)
			let returnShareArray = {
				baseRate: base_rate,
				returnGrandTotal: returnGrandTotal,
				stripeFee: stripeFee,
				adminShare: adminShare,
				affiliateShare: returnGrandTotal - adminShare
			}
			// travelAgentShare : 
			if (this.BookingForm.value?.account_type == 'travel_planner' && this.BookingForm.value?.affiliate_type == 'affiliate') {
				returnShareArray['adminShare'] = (base_rate * this.adminSharePercent) / 100
				returnShareArray['deducted_admin_share'] = returnShareArray['adminShare'] - returnShareArray['stripeFee']
				returnShareArray['travelAgentShare'] = base_rate * 0.10
			}
			else if (this.isFarmoutBooking) {
				this.adminSharePercent = 15
				returnShareArray['adminShare'] = (base_rate * this.adminSharePercent) / 100
				returnShareArray['deducted_admin_share'] = returnShareArray['adminShare'] - returnShareArray['stripeFee']
				returnShareArray['farmoutShare'] = base_rate * 0.10
			}
			else if (this.booking_created_from == 'subscriber') {
				this.adminSharePercent = 0
				returnShareArray['adminShare'] = (base_rate * this.adminSharePercent) / 100
				returnShareArray['deducted_admin_share'] = 0
				returnShareArray['affiliateShare'] = returnGrandTotal - stripeFee
			}

			this.r_shareArray = returnShareArray
			// console.log('in function createReservationreturnShareArray-->>>' , base_rate, returnShareArray )
			return returnShareArray;
			// value['returnRateArray'] = JSON.parse(JSON.stringify(this.ReturnRatesForm))
		}
	}

	handleCountryChangeLA(event: any) {
		const dialCode = '+' + event.dialCode;

		this.BookingForm.patchValue({
			lose_affiliate_phone_isd: dialCode,
			lose_affiliate_phone_country: event.iso2,
			driver_cell_isd: dialCode, // Update driver_cell ISD
			driver_cell_country: event.iso2
		});
		this.loseAffiliateTelInput.setCountry(event.iso2); // Update flag in lose_affiliate_phone
		this.driverCellTelInput.setCountry(event.iso2); // Update flag in driver_cell

	}



	submitForm(preview: boolean) {
		this.submitBookingForm = true
		// this.BookingForm['currency'] = this.currencyObj?.currency
		if (this.service_type == 'round_trip') {
			this.BookingForm.get('return_vehicle_type').setValidators([Validators.required]);
			this.BookingForm.get('return_vehicle_type').updateValueAndValidity()
		}
		else {
			this.BookingForm.get('return_vehicle_type').clearValidators()
			this.BookingForm.get('return_vehicle_type').updateValueAndValidity()
		}
		console.log(this.BookingForm);
		console.log(this.BookingForm.status);
		// let EditedKeys = []
		// Object.keys(this.bookingResponse)?.map(i=>{
		// 	let value = this.bookingResponse[`${i}`] === null ? '' :this.bookingResponse[`${i}`]
		// 	let value1 = this.BookingForm.value[`${i}`] === undefined ? '' :this.BookingForm.value[`${i}`]
		// 	console.log('value',i,'--->>>',value1,'--->>>' , value )
		// 	if(value1 != value && this.BookingForm.value[`${i}`] !== undefined){
		// 		EditedKeys.push(i)
		// 	} 
		// })

		// console.log(' Edited keys  ---->>>>' , EditedKeys)
		if (this.BookingForm.invalid) {
			return;
		}

		if (this.booking_created_from == 'subscriber') {
			this.BookingForm.patchValue({
				affiliate_id: this.currentUser?.account_id
			})
			if (this.service_type == 'round_trip') {
				this.BookingForm.patchValue({
					return_affiliate_id: this.currentUser?.account_id
				})
			}
		}

		let value = this.BookingForm.value
		console.log("in reservation type", this.isFarmoutBooking, this.booking_created_from == 'admin', this.currentUser?.created_by_role == 'subscriber')
		if (this.isFarmoutBooking && this.booking_created_from == 'admin' && this.currentUser?.created_by_role == 'subscriber') {
			console.log("in reservation type")
			value["reservation_type"] = 'farmout'
		}
		value["booking_created_from"] = this.booking_created_from
		value['proceed'] = this.proceed
		value['currency'] = this.currencyObj?.currency
		if (this.RatesForm) {
			value['rateArray'] = JSON.parse(JSON.stringify(this.RatesForm))
			value['grand_total'] = value['rateArray']['grand_total']
			value['sub_total'] = value['rateArray']['sub_total']
			value['min_rate_involved'] = value['rateArray']['min_rate_involved']
			value['shares_array'] = this.createReservationShareArray()
			delete value['rateArray']['grand_total']
			delete value['rateArray']['sub_total']
			delete value['rateArray']['min_rate_involved']
			// Return Rates Form
			if (this.Form.service_type.value == 'round_trip' && this.ReturnRatesForm) {
				value['returnRateArray'] = JSON.parse(JSON.stringify(this.ReturnRatesForm))
				value['return_grand_total'] = value['returnRateArray']['r_grandtotal']
				value['return_sub_total'] = value['returnRateArray']['r_subtotal']
				delete value['returnRateArray']['r_grandtotal']
				delete value['returnRateArray']['r_subtotal']
				value['return_shares_array'] = this.createReservationReturnShareArray()
			}
		}

		if (preview) {
			if (this.RatesForm.all_inclusive_rates["Base_Rate"].baserate <= 0) {
				console.log("in if base rate less than 0")
				this.$errors.openDialog({
					errors: {
						error: 'Base rate can not be empty.'
					}
				})
			}
			else {
				this.$spinner.show()
				this.$api.createBooking(value, this.Form.updateType.value).subscribe((response: any) => {
					// this.$errors.openDialog({
					// 	errors: {
					// 		error: `<span class='text-success'>${response.message}</span>`
					// 	}
					// })
					if (response.data?.is_confirm == false) {
						this.confirmMsg = response?.message
						this.$spinner.hide()
						$('#confirmationModal').modal('show')
					}
					else {
						this.$router.navigate(['/admin/daily-bookings-admin'])
					}
				})
			}

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
		if (!await this.commonServices.handleFile(event)) {
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
				console.log('cal distance--->> this.BookingForm.get', this.BookingForm.get('service_type').value)
				if (item.distance.value == 0 && this.BookingForm.get('service_type').value != 'charter_tour') {
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
		console.log('in function handle change vehicle type', event.unique_key)
		this.VehicleList.map(i => (i.unique_key == event.unique_key) ? this.handleSelectVehicleType(i) : '')
	}
	handleReturnChangeVehicleType(event) {
		console.log('in function handle change vehicle type', event.unique_key)
		this.return_VehicleList.map(i => (i.unique_key == event.unique_key) ? this.handleReturnSelectVehicleType(i) : '')
	}

	Subscriptions() {
		//pickup time change 
		this.BookingForm.get('pickup_time').valueChanges.subscribe((value: string) => {
			this.buildBookingData()
		})
		this.BookingForm.get('return_pickup_time').valueChanges.subscribe((value: string) => {
			this.buildBookingData()
		})

		// Service Type
		this.BookingForm.get('service_type').valueChanges.subscribe((value: string) => {
			this.init_return_rates = false;
			if (value == 'round_trip') {
				this.init_return_rates = true;
				setTimeout(() => {
					this.MapController(true)
				}, 2000)
				this.BookingForm.patchValue({
					cancellation_hours: this.selectedVehicle?.non_charter_cancellation_hours.toString(),
					return_cancellation_hours: this.return_selectedVehicle?.non_charter_cancellation_hours.toString(),
					return_affiliate_id: this.BookingForm.get('affiliate_id').value
				})
				if (this.booking_created_from == 'subscriber') {
					this.BookingForm.patchValue({
						return_susbcriber_name: this.BookingForm.get('susbcriber_name').value,
						return_driver_name: this.currentUser?.name,
						return_driver_email: this.currentUser.email,
						return_driver_cell_isd: this.currentUser?.isd,
						return_driver_cell: this.currentUser?.phone,
						return_driver_cell_country: this.currentUser?.phoneCountry
					})
					this.fetchReturnAffiliateVehicles(this.currentUser?.account_id)
				}
				if(this.booking_created_from == 'admin' && this.currentUser?.created_by_role == 'subscriber'){
					this.BookingForm.patchValue({
						return_susbcriber_name: this.BookingForm.get('susbcriber_name').value,
					})
				}
				this.SetFormValue('return_pickup_date', moment().format('YYYY-MM-DD'))
				this.SetFormValue('return_pickup_time', '12:00 pm')

			}
			if (value != 'charter_tour') {
				this.BookingForm.get('number_of_hours').setValue(0)
				this.BookingForm.updateValueAndValidity()
				console.log(this.BookingForm.get('number_of_hours').value);
				this.BookingForm.patchValue({
					cancellation_hours: this.selectedVehicle?.charter_cancellation_hours.toString(),
					return_cancellation_hours: this.return_selectedVehicle?.charter_cancellation_hours.toString()
				})
			}
			if (value == 'one_way') {
				console.log("setting value of return cruise port and name not mandatory")
				this.BookingForm.get('return_cruise_name').clearValidators();
				this.BookingForm.get('return_cruise_port').clearValidators();
				// this.BookingForm.get('return_dropoff_flight').clearValidators();
				// this.BookingForm.get('return_dropoff_flight').updateValueAndValidity();
				this.BookingForm.get('return_dropoff_airport_option').clearValidators();
				this.BookingForm.get('return_dropoff_airport_option').updateValueAndValidity();
				this.BookingForm.get('return_dropoff_airline_option').clearValidators();
				this.BookingForm.get('return_dropoff_airline_option').updateValueAndValidity();
				this.BookingForm.get('return_pickup_flight').clearValidators();
				this.BookingForm.get('return_pickup_flight').updateValueAndValidity();
				this.BookingForm.get('return_pickup_airline_option').clearValidators();
				this.BookingForm.get('return_pickup_airline_option').updateValueAndValidity();
				this.BookingForm.get('return_pickup_airport_option').clearValidators();
				this.BookingForm.get('return_pickup_airport_option').updateValueAndValidity();
				this.BookingForm.get('return_cruise_name').updateValueAndValidity();
				this.BookingForm.get('return_cruise_port').updateValueAndValidity();
				this.BookingForm.patchValue({
					cancellation_hours: this.selectedVehicle?.non_charter_cancellation_hours.toString(),
					return_cancellation_hours: this.return_selectedVehicle?.non_charter_cancellation_hours.toString()
				})
			}
		})

		// Transfer Type
		this.BookingForm.get('transfer_type').valueChanges.subscribe((value: string) => {
			console.log("in transfer_type value changes", value)

			// set cruise ship name and cruise port mandatory
			if (value.includes('_cruise') || value.includes('cruise_')) {
				console.log("setting value of cruise port and name mandatory")
				this.BookingForm.get('cruise_name').setValidators([Validators.required]);
				this.BookingForm.get('cruise_port').setValidators([Validators.required]);
				this.BookingForm.get('cruise_name').updateValueAndValidity();
				this.BookingForm.get('cruise_port').updateValueAndValidity();
			} else {
				console.log("setting value of cruise port and name not mandatory")
				this.BookingForm.get('cruise_name').clearValidators();
				this.BookingForm.get('cruise_port').clearValidators();
				this.BookingForm.get('cruise_name').updateValueAndValidity();
				this.BookingForm.get('cruise_port').updateValueAndValidity();
			}

			// set flight number mandatory
			if (value.includes('_airport')) {
				console.log("setting value of dropoff flight mandatory")
				// this.BookingForm.get('dropoff_flight').setValidators([Validators.required]);
				// this.BookingForm.get('dropoff_flight').updateValueAndValidity();
				this.BookingForm.get('dropoff_airline_option').setValidators([Validators.required]);
				this.BookingForm.get('dropoff_airline_option').updateValueAndValidity();
				this.BookingForm.get('dropoff_airport_option').setValidators([Validators.required]);
				this.BookingForm.get('dropoff_airport_option').updateValueAndValidity();
			} else {
				console.log("setting value of dropoff flight not mandatory")
				// this.BookingForm.get('dropoff_flight').clearValidators();
				// this.BookingForm.get('dropoff_flight').updateValueAndValidity();
				this.BookingForm.get('dropoff_airline_option').clearValidators();
				this.BookingForm.get('dropoff_airline_option').updateValueAndValidity();
				this.BookingForm.get('dropoff_airport_option').clearValidators();
				this.BookingForm.get('dropoff_airport_option').updateValueAndValidity();

			}

			if (value.includes('airport_')) {
				console.log("setting value of pickup flight mandatory")
				this.BookingForm.get('pickup_flight').setValidators([Validators.required]);
				this.BookingForm.get('pickup_flight').updateValueAndValidity();
				this.BookingForm.get('pickup_airline_option').setValidators([Validators.required]);
				this.BookingForm.get('pickup_airline_option').updateValueAndValidity();
				this.BookingForm.get('pickup_airport_option').setValidators([Validators.required]);
				this.BookingForm.get('pickup_airport_option').updateValueAndValidity();
				this.BookingForm.get('origin_airport_city').setValidators([Validators.required]);
				this.BookingForm.get('origin_airport_city').updateValueAndValidity();
			} else {
				console.log("setting value of pickup flight not mandatory")
				this.BookingForm.get('pickup_flight').clearValidators();
				this.BookingForm.get('pickup_flight').updateValueAndValidity();
				this.BookingForm.get('pickup_airline_option').clearValidators();
				this.BookingForm.get('pickup_airline_option').updateValueAndValidity();
				this.BookingForm.get('pickup_airport_option').clearValidators();
				this.BookingForm.get('pickup_airport_option').updateValueAndValidity();
				this.BookingForm.get('origin_airport_city').clearValidators();
				this.BookingForm.get('origin_airport_city').updateValueAndValidity();

			}

			const reverseStringChars = (text: string) => {
				let temp = text.split('_')
				return temp.reverse().join('_')
			}
			this.SetFormValue('return_transfer_type', reverseStringChars(value))
			this.return_transfer_type = reverseStringChars(value)

		})


		this.BookingForm.get('return_transfer_type').valueChanges.subscribe((value: string) => {
			console.log("in return_transfer_type value changes", value)

			if (this.BookingForm.get('service_type').value == 'round_trip') {

				// set cruise ship name and cruise port mandatory
				if (value.includes('_cruise') || value.includes('cruise_')) {
					console.log("setting value of return cruise port and name mandatory")
					this.BookingForm.get('return_cruise_name').setValidators([Validators.required]);
					this.BookingForm.get('return_cruise_port').setValidators([Validators.required]);
					this.BookingForm.get('return_cruise_name').updateValueAndValidity();
					this.BookingForm.get('return_cruise_port').updateValueAndValidity();
				} else {
					console.log("setting value of return cruise port and name not mandatory")
					this.BookingForm.get('return_cruise_name').clearValidators();
					this.BookingForm.get('return_cruise_port').clearValidators();
					this.BookingForm.get('return_cruise_name').updateValueAndValidity();
					this.BookingForm.get('return_cruise_port').updateValueAndValidity();
				}

				// set flight number mandatory
				if (value.includes('_airport')) {
					console.log("setting value of return dropoff flight mandatory")
					// this.BookingForm.get('return_dropoff_flight').setValidators([Validators.required]);
					// this.BookingForm.get('return_dropoff_flight').updateValueAndValidity();
					this.BookingForm.get('return_dropoff_airline_option').setValidators([Validators.required]);
					this.BookingForm.get('return_dropoff_airline_option').updateValueAndValidity();
					this.BookingForm.get('return_dropoff_airport_option').setValidators([Validators.required]);
					this.BookingForm.get('return_dropoff_airport_option').updateValueAndValidity();
				} else {
					console.log("setting value of return dropoff flight not mandatory")
					// this.BookingForm.get('return_dropoff_flight').clearValidators();
					// this.BookingForm.get('return_dropoff_flight').updateValueAndValidity();
					this.BookingForm.get('return_dropoff_airline_option').clearValidators();
					this.BookingForm.get('return_dropoff_airline_option').updateValueAndValidity();
					this.BookingForm.get('return_dropoff_airport_option').clearValidators();
					this.BookingForm.get('return_dropoff_airport_option').updateValueAndValidity();
				}

				if (value.includes('airport_')) {
					console.log("setting value of return pickup flight mandatory")
					this.BookingForm.get('return_pickup_flight').setValidators([Validators.required]);
					this.BookingForm.get('return_pickup_flight').updateValueAndValidity();
					this.BookingForm.get('return_pickup_airline_option').setValidators([Validators.required]);
					this.BookingForm.get('return_pickup_airline_option').updateValueAndValidity();
					this.BookingForm.get('return_pickup_airport_option').setValidators([Validators.required]);
					this.BookingForm.get('return_pickup_airport_option').updateValueAndValidity();
				} else {
					console.log("setting value of return pickup flight not mandatory")
					this.BookingForm.get('return_pickup_flight').clearValidators();
					this.BookingForm.get('return_pickup_flight').updateValueAndValidity();
					this.BookingForm.get('return_pickup_airline_option').clearValidators();
					this.BookingForm.get('return_pickup_airline_option').updateValueAndValidity();
					this.BookingForm.get('return_pickup_airport_option').clearValidators();
					this.BookingForm.get('return_pickup_airport_option').updateValueAndValidity();
				}
			}

			const reverseStringChars = (text: string) => {
				let temp = text.split('_')
				return temp.reverse().join('_')
			}
			this.SetFormValue('transfer_type', reverseStringChars(value))
			this.transfer_type = reverseStringChars(value)
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

				(<FormGroup>loose_customer.get('card_details')).get('card_number').setValidators([Validators.pattern("^[0-9]*$"), Validators.minLength(12), Validators.maxLength(20),]);
				(<FormGroup>loose_customer.get('card_details')).get('name').setValidators([]);
				(<FormGroup>loose_customer.get('card_details')).get('cvv').setValidators([Validators.pattern("^[0-9]*$")]);
				(<FormGroup>loose_customer.get('card_details')).get('exp_month').setValidators([]);
				(<FormGroup>loose_customer.get('card_details')).get('exp_year').setValidators([]);
				loose_customer.get('email').setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)])
				loose_customer.get('phone').setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)])
				loose_customer.get('first_name').setValidators([Validators.required])
				// loose_customer.get('middle_name').setValidators(this.customValidator.whitespace())
				loose_customer.get('last_name').setValidators([Validators.required])
				loose_customer.get('address').setValidators(this.customValidator.whitespace())
				loose_customer.updateValueAndValidity()

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
			if (value && this.updateType == 'repeat' && this.updateType == 'return' && this.updateType == 'edit' && this.updateType == 'round') {
				this.chooseUser(value)
			}
		})

		this.BookingForm.get('travel_client_id').valueChanges.subscribe((value: number) => {
			if (value && this.updateType == 'repeat' && this.updateType == 'return' && this.updateType == 'edit' && this.updateType == 'round') {
				this.handleTravelStaffAccounts({ id: value })
			}
		})
		this.BookingForm.get('travel_client_acc').valueChanges.subscribe((value: any) => {
			if (value == 'travel_loose_customer') {
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

				(<FormGroup>loose_customer.get('card_details')).get('card_number').setValidators([Validators.pattern("^[0-9]*$"), Validators.minLength(12), Validators.maxLength(20),]);
				(<FormGroup>loose_customer.get('card_details')).get('name').setValidators([]);
				(<FormGroup>loose_customer.get('card_details')).get('cvv').setValidators([Validators.pattern("^[0-9]*$")]);
				(<FormGroup>loose_customer.get('card_details')).get('exp_month').setValidators([]);
				(<FormGroup>loose_customer.get('card_details')).get('exp_year').setValidators([]);
				loose_customer.get('email').setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)])
				loose_customer.get('phone').setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)])
				loose_customer.get('first_name').setValidators([Validators.required])
				// loose_customer.get('middle_name').setValidators(this.customValidator.whitespace())
				loose_customer.get('last_name').setValidators([Validators.required])
				loose_customer.get('address').setValidators(this.customValidator.whitespace())
				loose_customer.updateValueAndValidity()

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
			}
		})


		// Affiliate Type
		this.BookingForm.get('affiliate_type').valueChanges.subscribe((value: string) => {
			if (value == 'loose_affiliate' && this.currentUser?.created_by_role == 'subscriber') {
				this.isFarmoutBooking = false
				this.booking_created_from = 'subscriber'
			}
			else if (this.currentUser?.created_by_role == 'subscriber' && value == 'affiliate' && this.veh_created_by == 1) {
				this.isFarmoutBooking = true
				this.booking_created_from = 'admin'
			}
			if (value == 'loose_affiliate') {
				this.fetchAffiliates('loose_affiliate')
				this.toggleDropdown(null)
				this.BookingForm.get('lose_affiliate_name').setValidators([Validators.required])
				this.BookingForm.get('lose_affiliate_phone').setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)])
				this.BookingForm.get('lose_affiliate_email').setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)])
				// this.BookingForm.get('cancellation_hours').setValidators([Validators.required])
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

				// this.BookingForm.get('cancellation_hours').clearValidators()
				// this.BookingForm.get('cancellation_hours').updateValueAndValidity()


				console.log('clear validation')
				this.init_rates = true;
				if (this.Form.service_type.value === 'round_trip') {
					this.init_return_rates = true;
				}
				this.fetchAffiliates('affiliate')
				this.chooseAffiliate()
			}
		})

		// Affiliate Type
		this.BookingForm.get('return_affiliate_type').valueChanges.subscribe((value: string) => {
			if (value == 'loose_affiliate' && this.currentUser?.created_by_role == 'subscriber') {
				this.booking_created_from = 'subscriber'
			}
			else if (this.currentUser?.created_by_role == 'subscriber' && value == 'affiliate' && this.veh_created_by == 1) {
				this.booking_created_from = 'admin'
				this.fetchReturnAffiliateVehicles((this.BookingForm.get('return_affiliate_id').value))
			}
			if (value == 'loose_affiliate') {
				this.BookingForm.patchValue({
					return_affiliate_id: ''
				})
				this.fetchReturnAffiliates('loose_affiliate')
				this.toggleDropdown(null)
				this.BookingForm.get('return_lose_affiliate_name').setValidators([Validators.required])
				this.BookingForm.get('return_lose_affiliate_phone').setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)])
				this.BookingForm.get('return_lose_affiliate_email').setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)])
				// this.BookingForm.get('cancellation_hours').setValidators([Validators.required])
				this.BookingForm.updateValueAndValidity()
				this.init_rates = true
				if (this.Form.service_type.value === 'round_trip') {
					this.init_return_rates = true;
				}
				if (this.Form.updateType.value != 'edit' && this.Form.updateType.value != 'repeat' && this.Form.updateType.value != 'return') {
					this.SetFormValue('return_vehicle_type_name', '');
					this.BookingForm.get('return_vehicle_make').setValue('')
					this.BookingForm.get('return_vehicle_make_name').setValue('')
					this.BookingForm.get('return_vehicle_model').setValue('')
					this.BookingForm.get('return_vehicle_model_name').setValue('')
					this.BookingForm.get('return_vehicle_year').setValue('')
					this.BookingForm.get('return_vehicle_year_name').setValue('')
					this.BookingForm.get('return_vehicle_color').setValue('')
					this.BookingForm.get('return_vehicle_color_name').setValue('')
					this.BookingForm.updateValueAndValidity();
				}
			}
			else {
				console.log('value--->> clearing validations for--> ', value)
				this.BookingForm.get('return_lose_affiliate_name').clearValidators()
				this.BookingForm.get('return_lose_affiliate_name').updateValueAndValidity()

				this.BookingForm.get('return_lose_affiliate_phone').clearValidators()
				this.BookingForm.get('return_lose_affiliate_phone').updateValueAndValidity()


				this.BookingForm.get('return_lose_affiliate_email').clearValidators()
				this.BookingForm.get('return_lose_affiliate_email').updateValueAndValidity()

				// this.BookingForm.get('cancellation_hours').clearValidators()
				// this.BookingForm.get('cancellation_hours').updateValueAndValidity()


				console.log('clear validation')
				this.init_rates = true;
				if (this.Form.service_type.value === 'round_trip') {
					this.init_return_rates = true;
				}
				this.fetchReturnAffiliates('affiliate')
				this.chooseReturnAffiliate()
			}
		})

		this.BookingForm.get('affiliate_id').valueChanges.subscribe((value: number) => {
			console.log("in affiliate info", this.booking_created_from)
			if (value && this.booking_created_from == 'admin') {
				console.log("in affiliate info")
				this.chooseAffiliate()
				this.fetchAffiliateInformation(value)
				if (this.Form.updateType.value != 'edit' && this.Form.updateType.value != 'repeat' && this.Form.updateType.value != 'return') {
					this.scroll('booking_detail_section')
				}
				if (this.BookingForm.get('service_type').value == 'round_trip') {
					this.BookingForm.patchValue({
						return_affiliate_id: value
					})
				}
			}
		})

		this.BookingForm.get('return_affiliate_id').valueChanges.subscribe((value: number) => {
			if (value && this.booking_created_from == 'admin') {
				this.chooseReturnAffiliate()
				this.fetchReturnAffiliateInformation(value)
				if (this.Form.updateType.value != 'edit' && this.Form.updateType.value != 'repeat' && this.Form.updateType.value != 'return') {
					this.scroll('booking_detail_section')
				}
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
			console.log('on change of vehicle type-->>> value', value)
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


		this.BookingForm.get('return_vehicle_type').valueChanges.subscribe((value: string) => {
			console.log('on change of vehicle type-->>> value', value)
			if (this.Form.return_affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate vehicle_type', value)
				if (value) {
					this.return_VehicleList.map(i => (i.unique_key == this.return_unique_key) ? this.handleSelectVehicleType(i) : '')
				}
				else {
					this.SetFormValue('return_vehicle_type_name', '');
					this.BookingForm.get('return_vehicle_make').setValue('')
					this.BookingForm.get('return_vehicle_make_name').setValue('')
					this.BookingForm.get('return_vehicle_model').setValue('')
					this.BookingForm.get('return_vehicle_model_name').setValue('')
					this.BookingForm.get('return_vehicle_year').setValue('')
					this.BookingForm.get('return_vehicle_year_name').setValue('')
					this.BookingForm.get('return_vehicle_color').setValue('')
					this.BookingForm.get('return_vehicle_color_name').setValue('')
					this.BookingForm.updateValueAndValidity();
				}

			} else {
				if (value && this.BigData) {
					let name = this.BigData['vehicleCategories'].find(item => item.id == value)['name']
					this.BookingForm.get('return_vehicle_make').setValue('')
					this.BookingForm.get('return_vehicle_make_name').setValue('')
					this.BookingForm.get('return_vehicle_model').setValue('')
					this.BookingForm.get('return_vehicle_model_name').setValue('')
					this.BookingForm.get('return_vehicle_year').setValue('')
					this.BookingForm.get('return_vehicle_year_name').setValue('')
					this.BookingForm.get('return_vehicle_color').setValue('')
					this.BookingForm.get('return_vehicle_color_name').setValue('')
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

		this.BookingForm.get('return_vehicle_make').valueChanges.subscribe((value: string) => {
			if (this.Form.return_affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate  vehicle_make')
			} else {
				if (value && this.BigData) {
					this.BigData['vehicleModels'] = this.BigData_COPY?.vehicleModels.filter(item => item.make_id == value)
					let name = this.BigData['vehicleMakes'].find(item => item.id == value)['name']
					this.SetFormValue('return_vehicle_model', this.BigData?.vehicleModels[0]['id'])
					this.SetFormValue('return_vehicle_make_name', name)
				}
				else {
					this.BookingForm.get('return_vehicle_make_name').setValue('')
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

		this.BookingForm.get('return_vehicle_model').valueChanges.subscribe((value: string) => {
			if (this.Form.return_affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate return_vehicle_model')

			} else {
				if (value && this.BigData) {
					let name = this.BigData['vehicleModels'].find(item => item.id == value)['name']
					this.SetFormValue('return_vehicle_model_name', name)
				}
				else {
					this.BookingForm.get('return_vehicle_model_name').setValue('')
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

		this.BookingForm.get('return_vehicle_year').valueChanges.subscribe((value: string) => {
			if (this.Form.return_affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate return_vehicle_year')
			} else {
				if (value && this.BigData) {
					let name = this.BigData['vehicleYears'].find(item => item.id == value)['name']
					this.SetFormValue('return_vehicle_year_name', name)
				}
				else {
					this.BookingForm.get('return_vehicle_year_name').setValue('')
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

		this.BookingForm.get('return_vehicle_color').valueChanges.subscribe((value: string) => {
			if (this.Form.return_affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate return_vehicle_color')

			} else {
				if (value && this.BigData) {
					let name = this.BigData['vehicleColors'].find(item => item.id == value)['name']
					this.SetFormValue('return_vehicle_color_name', name)
				}
				else {
					this.BookingForm.get('return_vehicle_color_name').setValue('')
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
		// this.BookingForm.get('driver_id').valueChanges.subscribe((value: string) => {
		// 	this.DriverList
		// 	this.SetFormValue('driver_name', `${data.FirstName} ${data.MiddleName ?? ''} ${data.LastName}`)
		// 	this.SetFormValue('driver_gender', data.Gender)
		// 	this.SetFormValue('driver_cell', data.CellNumber)
		// 	this.SetFormValue('driver_cell_isd', data.CellIsd)
		// 	this.SetFormValue('driver_cell_country', data.CellNumberCountry)
		// 	this.SetFormValue('driver_email', data.Email)
		// 	this.SetFormValue('driver_phone_type', data.PhoneType ?? '');
		// 	this.driverCellTelInput.setCountry(this.BookingForm.get('driver_cell_country').value);
		// })


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

	resetReturnDriverAndVehicle(return_affiliate_type: string) {
		if (return_affiliate_type == 'loose_affiliate') {
			['return_vehicle_type', 'return_vehicle_id', 'return_vehicle_make', 'return_vehicle_model', 'return_vehicle_color', 'return_vehicle_year', 'return_driver_name', 'return_driver_email', 'return_driver_gender', 'return_driver_cell', 'return_vehicle_license_plate'].forEach((item: any) => {
				this.BookingForm.get(item).reset();
				this.BookingForm.updateValueAndValidity();
			})
			this.SetFormValue('return_driver_cell_isd', '+1');
			this.SetFormValue('return_driver_cell_country', 'us');
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
		console.log('Addresss-->>>', value);
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
		console.log("in mobile", event.dialCode, event.iso2)
		this.BookingForm.updateValueAndValidity()
	}

	// onCountryChange(event, type)
	// {
	// 	console.log(event)
	// 	if (type == 'mobile')
	// 	{
	// 		console.log("in mobile",event.dialCode,event.iso2)
	// 		this.addIndividualAccountForm.patchValue({
	// 			mobileIsd: '+' + event.dialCode,
	// 			mobileCountry: event.iso2
	// 		});
	// 	}
	// 	else
	// 	{
	// 		this.addIndividualAccountForm.patchValue({
	// 			workIsd: '+' + event.dialCode,
	// 			workCountry: event.iso2
	// 		});
	// 	}
	// 	// console.log(this.countryCode);
	// }

	LCTelInputObject(event: any) {
		console.log('LCTelInputObject', event)
		this.LCTelObject = event;
	}

	LCTelInputObjectUSA(event: any) {
		event.setCountry('us');
	}

	PaxTelInputObject(event: any) {
		this.PaxTelObject = event;
	}

	LATelInputObject(event: any) {
		this.loseAffiliateTelInput = event;
	}

	DrvTelInputObject(event: any) {
		this.driverCellTelInput = event;
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


	showLocationPointOnMap(address: any) {
		let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		console.log('isSafari', isSafari)
		if (address) {
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

	textFormatterTransferType(text: any) {
		try {
			return text.replace(/[\\\_$]+/g, ' ') + '?'
		}
		catch {
			return text
		}
	}

	change(event: any, form_control: string) {
		console.log(event, form_control)
		//setting currency based on airport country
		// form_control == 'pickup_airport' || form_control == 'return_pickup_airport' ||
		if (form_control == 'dropoff_airport' || form_control == 'return_dropoff_airport') {
			console.log("in if form control airport then change currwency")
			this.httpClient.get("assets/json/currencyOptions.json").subscribe(data => {
				for (const key of Object.keys(data)) {
					if (data[key].countryName === event.country) {
						this.currencyObj = data[key]
						this.currencySymbol = data[key].symbol
					}
				}
			})
		}
		event && this.SetFormValue(form_control, event.id);
	}
	FormatTime(time: string) {
		return moment(time, "HH:mm:ss").format("LT");
	}

	setValueByBookNow() {
		if (this.updateType == 'reaffiliate') {
			console.log("in reaffiliate update type")
			this.$api.getBookingDataForEdit(this.Form.reservation_id.value, this.updateType).subscribe((response: any) => {
				response.data.booking_instructions = response.data.booking_instructions.replaceAll('<br />', '')
				console.log('response <><><><><', response.data)
				let editing_data = response.data
				delete editing_data.affiliate_id
				this.number_of_hours = response?.data?.number_of_hours
				this.isTravelShare = response?.data?.account_type == 'travel_planner' ? true : false
				if (response?.data?.account_type == 'travel_planner') {
					this.getTravelClientAccounts(response?.data?.acc_id)
				}
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
					if (editing_data[item] && item != "passenger_cell_isd" && item != "affiliate_type") {
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

				try {
					this.PaxTelObject.setCountry(this.BookingForm.get('passenger_cell_country').value);
				} catch {
					console.error('Set Country Value is null.')
				}

				this.$spinner.hide('normalspinner')
				console.log('<<<<<<<<<<<-----------set pickup date------->>>>', moment().format('YYYY-MM-DD'), this.updateType)
				if (this.updateType == 'edit') {
					this.scroll('pickup_adress')
					// this.SetFormValue('pickup_date', moment().format('YYYY-MM-DD'))
					this.SetFormValue('pickup_date', editing_data?.pickup_date)
				}
				if (this.updateType == 'repeat' || this.updateType == 'return' || this.updateType == 'round') {
					this.scroll('pickup_adress')
					if (new Date(editing_data?.pickup_date).getTime() < new Date().getTime()) {
						this.SetFormValue('pickup_date', moment().format('YYYY-MM-DD'))
					}
					else {
						this.SetFormValue('pickup_date', editing_data?.pickup_date)
					}
				}
			})
		}
		let QB: any = JSON.parse(localStorage.getItem('quotebot_form'))
		let selected_vehicle: any = JSON.parse(sessionStorage.getItem('selected_vehicle'))
		// for (const key in QB) {
		//   console.log(`QB______${key}: ${QB[key]}`);
		//   this.SetFormValue(key ,QB[key])
		// }    
		this.affiliate_id = selected_vehicle?.affiliate_id
		this.veh_created_by = selected_vehicle?.created_by

		if (selected_vehicle?.created_by != 1) {
			console.log("in affiliate info")
			this.booking_created_from == 'subscriber'
			this.BookingForm.patchValue({
				susbcriber_name: selected_vehicle?.affiliate_name,
				driver_name: this.currentUser?.name,
				driver_email: this.currentUser.email,
				driver_cell_isd: this.currentUser?.isd,
				driver_cell: this.currentUser?.phone,
				driver_cell_country: this.currentUser?.phoneCountry
			})

			if (this.service_type == 'round_trip') {
				this.BookingForm.patchValue({
					return_susbcriber_name: selected_vehicle?.affiliate_name,
				})
			}
		}
		else if (selected_vehicle?.created_by == 1 && this.currentUser?.created_by_role == 'subscriber') {
			this.isFarmoutBooking = true
			this.booking_created_from == 'admin'
			this.BookingForm.patchValue({
				susbcriber_name: selected_vehicle?.affiliate_name,
			})
			if (this.service_type == 'round_trip') {
				this.BookingForm.patchValue({
					return_susbcriber_name: selected_vehicle?.affiliate_name,
				})
			}
		}

		this.currencyObj = JSON.parse(sessionStorage.getItem('currencyData'))
		this.currencySymbol = this.currencyObj?.symbol
		//dropOFF
		this.SetFormValue('service_type', QB?.service_type)
		if (QB?.service_type == 'charter_tour') {
			this.SetFormValue('number_of_hours', QB?.booking_hour)
			this.number_of_hours = QB?.booking_hour
		}
		//set no of vehicles
		this.SetFormValue('number_of_vehicles', selected_vehicle?.number_of_vehicles)
		//set cancellation period
		this.BookingForm.patchValue({
			cancellation_hours: selected_vehicle?.cancellation_policy.toString(),
			return_cancellation_hours: selected_vehicle?.cancellation_policy.toString()
		})
		let transfer_type_value = QB?.pickup_type + '_to_' + QB?.dropoff_type
		let return_transfer_type_value = QB?.dropoff_type + '_to_' + QB?.pickup_type
		this.SetFormValue('transfer_type', transfer_type_value)
		this.SetFormValue('return_transfer_type', return_transfer_type_value)
		this.SetFormValue('total_passengers', QB?.no_of_luggage)
		this.SetFormValue('luggage_count', QB?.no_of_passenger)
		this.SetFormValue('affiliate_type', 'affiliate')
		this.SetFormValue('affiliate_id', this.affiliate_id)
		this.SetFormValue('return_affiliate_id', this.affiliate_id)
		//vehicle id when chossing vehicle from Quote bot screen
		this.QB_vehicle_id = selected_vehicle?.id || null
		//pickup
		this.SetFormValue('pickup_date', moment(QB?.pickup_date).format('YYYY-MM-DD'))
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
		// this.SetFormValue('dropoff_airline_option', QB?.dropoff_airline);


		//return pickup
		this.SetFormValue('return_pickup_date', moment(QB?.return_pickup_date).format('YYYY-MM-DD'))
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
				latitude: QB?.pickup_airport_lat,
				longitude: QB?.pickup_airport_long
			}
			this.fillLocationPoints('airport', location)
		}
		this.MapController()
		this.MapController(true)
		setTimeout(() => {
			console.log('settimeout finction---------------------------------------------------------------')
			this.fetchQBAffiliateVehicles(selected_vehicle?.affiliate_id)
			this.fetchAffiliateDrivers(this.affiliate_id)
		}, 5000)
	}

	// numbers in red and seperated to next line
	highlightNumbers(text: string): string {
		const parts = text.split(/\b(\d+\.\s)/); // Split by number followed by dot and space

		// Process parts and apply formatting
		let formattedText = '';
		for (let i = 0; i < parts.length; i++) {
			if (i % 2 === 0) {
				formattedText += parts[i]; // Regular text part
			} else {
				formattedText += `<br><span class="text-danger font-weight-bolder">${parts[i]}</span>`; // Numbered instruction part
			}
		}

		return formattedText;
	}
}

