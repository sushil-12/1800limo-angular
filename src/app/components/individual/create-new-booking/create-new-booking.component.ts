import { Component, OnInit, ViewChild, isDevMode } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { AdminService } from 'src/app/services/admin.service';
import { SharedModule } from '../../shared/shared.module';
import { NgxSpinnerService } from 'ngx-spinner';
import { MapsAPILoader } from '@agm/core';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { pluck } from 'rxjs/operators';
import { IndividualService } from 'src/app/services/individual.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { HttpClient } from '@angular/common/http';
declare var $: any

@Component({
	selector: 'app-create-new-booking',
	templateUrl: './create-new-booking.component.html',
	styleUrls: ['./create-new-booking.component.scss']
})
export class CreateNewBookingComponent implements OnInit {

	@ViewChild('searchInput', { read: MatAutocompleteTrigger }) triggerAutoCompleteInput: MatAutocompleteTrigger

	todays_date: string = moment().format('YYYY-MM-DD');
	months: any = [{ value: '01' }, { value: '02' }, { value: '03' }, { value: '04' }, { value: '05' }, { value: '06' }, { value: '07' }, { value: '08' }, { value: '09' }, { value: '10' }, { value: '11' }, { value: '12' }]
	monthOptions: any = [...this.months]
	updateType: any = 'create';

	booking_params: any = {
		transfer_types: ["airport_to_city", "airport_to_airport", "airport_to_cruise", "city_to_city", "city_to_airport", "city_to_cruise", "cruise_to_airport", "cruise_to_city"],
		client_account_types: ['individual', 'corporate', 'travel_planner'],
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
	BigData: any
	BigData_COPY: any
	BookingForm: FormGroup
	service_type: any = 'one_way';
	transfer_type: any = 'city_to_city'
	return_transfer_type: any = 'city_to_city'
	PaxTelObject: any
	number_of_hours: any = '0';
	distance: number = 0
	return_distance: number = 0


	LCTelObject: any
	DrvTelObject: any
	LATelObject: any

	RatesForm: any
	ReturnRatesForm: any

	booking_id: number = 0

	driver_image: Record<string, any> = {}
	vehicle_image: Record<string, any> = {}

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
	proceed: boolean = true
	chosen_user: Record<string, any>

	distance_for_rates: string = ''
	amenities: Array<string> = []

	init_rates: boolean = false
	init_return_rates: boolean = false
	is_booking_edit_case: boolean = false
	reset_button: boolean = false
	submitBookingForm: boolean;
	affiliate_id: any;
	newBooking: boolean = false;
	QB_vehicle_id: any = null;
	unique_key: any;
	firstLoadAffiliateId: void;
	confirmMsg: any;
	bookingResponse: any;
	booking_data: any;
	is_master_vehicle: boolean = JSON.parse(sessionStorage.getItem('selected_vehicle'))?.is_master_vehicle || false
	master_vehicle_id: any;
	bookingType: any;
	subtotal: any = 0
	agentShare: any = 0;
	grandtotal: any = 0
	vehicles: Number = 1
	driverImgUrl: any = '../../../../assets/images/driverImg.jpg';
	vehicleImgUrl: any = '';
	driver_info: any = {};
	r_subtotal: any = 0;
	r_agentShare: any = 0;
	r_grandtotal: any = 0;
	min_rate_involved: any;
	returnRateArray: any;
	rateArray: any;
	travelStaffAccounts: any;
	subAgentAccounts: any;
	isCreatedByAdmin: boolean = false;
	shareArray: any;
	r_shareArray: any;
	adminSharePercent: number = 25;
	currentUser: any;
	currencySymbol: any;
	currencyObj: any;

	constructor(
		private $form: FormBuilder,
		private $api: AdminService,
		private $shared: SharedModule,
		private $spinner: NgxSpinnerService,
		private $mapsapi: MapsAPILoader,
		private $errors: ErrorDialogService,
		private $router: Router,
		private $routeurl: ActivatedRoute,
		private customValidator: CustomvalidationService,
		private individualService: IndividualService,
		private stateManagementService: StateManagementService,
		private httpClient: HttpClient,
	) { }

	ngOnInit(): void {

		this.currentUser = JSON.parse(localStorage.getItem('currentUser'))

		this.buildBookingForm()
		// this.$spinner.show();
		this.$routeurl.queryParams.subscribe((params: any) => {
			console.log('params-->>>', params)
			if (params && params.bookingId && !this.booking_id) {
				this.is_booking_edit_case = true
				this.updateType = params.updateType
				this.SetFormValue('reservation_id', params.bookingId)
				params.updateType ? this.SetFormValue('updateType', params.updateType) : this.SetFormValue('updateType', 'edit')
			}
			if (params && params.new == 'true') {
				this.newBooking = params.new == 'true'
				this.affiliate_id = parseInt(params.affiliate_id)
			}
			if (params && params.is_master_vehicle == 'true') {
				this.master_vehicle_id = params.vehicle_id
				this.is_master_vehicle = true
				console.log('is master vehicle', this.is_master_vehicle)
			}
			if (params && params.updateType) {
				this.bookingType = params.updateType
			}

			//save currency symbol
			// this.currencySymbol = this.stateManagementService.getCurrencySymbol();
			this.currencyObj = JSON.parse(sessionStorage.getItem('currencyData'))
			this.currencySymbol = this.currencyObj?.symbol
			// else {
			// 	this.resetFields()
			// }
			// place in query params to reinitialise things when modes of new and edit are toggled
			// Subscriptions
			this.Subscriptions()
			this.handleTravelStaffAccounts()
			// this.fetchClientAccounts('individual')
			// this.fetchAffiliates('affiliate')
			// this.getTravelClientAccounts()
			this.select(true, 'driver_languages', 1)
		})
		this.fetchAirportsAndBigData()
	}

	buildBookingForm() {
		this.BookingForm = this.$form.group({
			service_type: ['one_way', Validators.required],
			transfer_type: ['city_to_city', Validators.required],
			return_transfer_type: ['city_to_city', Validators.required],
			number_of_hours: ['0'],
			// acc_id: [''],
			account_type: ['individual'],
			// travel_client_id: [''],
			// sub_account_id: [''],
			// travel_client_acc: ['travel_individual'],
			// sub_account_type: ['travel_agent'],
			change_individual_data: [false],
			passenger_name: ['', [Validators.required, this.customValidator.whitespace()]],
			passenger_email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
			passenger_cell: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			passenger_cell_isd: ['+1'],
			passenger_cell_country: ['us'],
			total_passengers: [1],
			luggage_count: [0],
			booking_instructions: [''],
			return_booking_instructions: [''],
			affiliate_type: ['affiliate'],
			affiliate_id: [''],
			lose_affiliate_name: ['', [this.customValidator.whitespace()]],
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
		this.SetFormValue('booking_instructions', "1. For Pax- Text driver when first landing for easy pickup instructions. 2. For Driver- Text the client the day before each booking, and confirm the driver's name and cell number. Text client with ETA when en route. Text the client when on location.");
		this.SetFormValue('return_booking_instructions', "1. For Pax- Text driver when first landing for easy pickup instructions. 2. For Driver- Text the client the day before each booking, and confirm the driver's name and cell number. Text client with ETA when en route. Text the client when on location.");

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
		console.log('booking form init completed--------------------_>>>>>>>>>><><><')
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
	get Form() {
		return this.BookingForm.controls;
	}
	get ExtraStops(): FormArray {
		return (<FormArray>this.BookingForm.get('extra_stops'));
	}
	get ReturnExtraStops() {
		return (<FormArray>this.BookingForm.get('return_extra_stops'));
	}
	searchSubstring(text: string, search_string: string, start: number = 0): boolean {
		return text.indexOf(search_string, start) != -1
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

	prefillViaBookingID(booking_id: number) {
		// console.warn('Prefilling via Booking Id')
		this.$spinner.show('normalspinner');
		this.individualService.getBookingDataForEdit(booking_id, this.Form.updateType.value).subscribe((response: any) => {
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
			this.vehicleImgUrl = response?.data?.vehicle_images[0]
			this.driverImgUrl = response?.data?.driver_image
			this.isCreatedByAdmin = response?.data?.created_by == 1 ? true : false;
			this.SetFormValue('affiliate_type', response.data.affiliate_type)
			this.autofillData('cruise', editing_data);
			this.fillDriverInfo(editing_data);
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
			// this.Form.affiliate_id.value != 0 ? this.chooseAffiliate() : ''
			try {
				this.PaxTelObject.setCountry(this.BookingForm.get('passenger_cell_country').value);
			} catch {
				console.error('Set Country Value is null.')
			}
			if (this.Form.affiliate_type.value == 'loose_affiliate') {
				setTimeout(() => {
					this.LATelObject.setCountry(this.BookingForm.get('lose_affiliate_phone_country').value);
					this.DrvTelObject.setCountry(this.BookingForm.get('driver_cell_country').value);
				}, 2000)
			}

			this.$spinner.hide('normalspinner')
			console.log('<<<<<<<<<<<-----------set pickup date------->>>>', moment().format('YYYY-MM-DD'), this.updateType)
			if (this.updateType == 'repeat' || this.updateType == 'return') {
				this.scroll('pickup_address')
				this.SetFormValue('pickup_date', moment().format('YYYY-MM-DD'))
			}
		})
		this.fetchRates(booking_id)
	}
	fetchRates(bookingId: number = 0) {
		this.$api.fetchAdminNewBookingRates(null, bookingId).subscribe((response: any) => {
			this.subtotal = 0
			this.r_subtotal = 0
			this.min_rate_involved = response?.data?.min_rate_involved
			this.rateArray = response?.data?.rateArray
			this.returnRateArray = response?.data?.retrunRateArray
			for (let outerKey in response?.data?.rateArray) {
				if (response?.data?.rateArray.hasOwnProperty(outerKey)) {
					const innerObject = response?.data?.rateArray[outerKey];
					if (outerKey == 'all_inclusive_rates') {

						for (let innerKey in innerObject) {
							if (innerObject.hasOwnProperty(innerKey)) {
								this.subtotal += innerObject[innerKey].baserate
								console.log("in if allinclusive", this.subtotal)
							}
						}
					}
					else {
						for (let innerKey in innerObject) {
							if (innerObject.hasOwnProperty(innerKey)) {
								this.subtotal += innerObject[innerKey].amount
								console.log("in else allinclusive", this.subtotal)

							}
						}
					}
				}
			}

			let base_rate = 0
			if (this.BookingForm.value?.service_type == 'charter_tour') {

				base_rate += this.rateArray.all_inclusive_rates["Base_Rate"].baserate * this.number_of_hours
				this.subtotal += this.rateArray.all_inclusive_rates["Base_Rate"].baserate * (this.number_of_hours - 1)
				console.log("in if charter tour", base_rate)
			}
			else {
				base_rate += this.rateArray.all_inclusive_rates["Base_Rate"].baserate
			}
			['ELH_Charges', 'Stops', 'Wait'].map((key) => {
				base_rate += this.rateArray.all_inclusive_rates[key].baserate
			});
			for (const key of Object.keys(this.rateArray.amenities)) {
				base_rate += this.rateArray.amenities[key].baserate;
			}
			//calculating subtotal and share of sdmin adn ta if created by TA
			if (this.BookingForm.value?.account_type == 'travel_planner' && !this.isCreatedByAdmin) {
				let adminShare = (base_rate * 15) / 100
				this.agentShare = base_rate * 0.10
				this.subtotal += adminShare + this.agentShare
				console.log("in if created by ta", this.subtotal)
			}
			else if (this.updateType == 'repeat' || this.updateType == 'return') {
				let adminShare = (base_rate * 15) / 100
				this.agentShare = base_rate * 0.10
				this.subtotal += adminShare + this.agentShare
				console.log("in if created by ta in repeat or return", this.subtotal)
			}
			else {
				let adminShare = (base_rate * 25) / 100
				this.subtotal += adminShare
				console.log("in if created by admin", this.subtotal, base_rate, adminShare)
				// this.subtotal = (base_rate + this.subtotal) - adminShare
			}

			this.grandtotal = (parseFloat(this.subtotal))
			console.log('grandtotal->', this.grandtotal)

			//in case of round trip
			if (this.booking_data?.service_type == 'round_trip') {
				for (let outerKey in response?.data?.retrunRateArray) {
					if (response?.data?.retrunRateArray.hasOwnProperty(outerKey)) {
						const innerObject = response?.data?.retrunRateArray[outerKey];
						if (outerKey == 'all_inclusive_rates') {

							for (let innerKey in innerObject) {
								if (innerObject.hasOwnProperty(innerKey)) {
									this.r_subtotal += innerObject[innerKey].baserate
									console.log("in if allinclusive", this.r_subtotal)
								}
							}
						}
						else {
							for (let innerKey in innerObject) {
								if (innerObject.hasOwnProperty(innerKey)) {
									this.r_subtotal += innerObject[innerKey].amount

								}
							}
						}
					}
				}

				let base_rate = 0
				if (this.BookingForm.value?.service_type == 'charter_tour') {
					base_rate += this.returnRateArray.all_inclusive_rates["Base_Rate"].baserate * this.number_of_hours
					this.r_subtotal += this.returnRateArray.all_inclusive_rates["Base_Rate"].baserate * (this.number_of_hours - 1)
				}
				else {
					base_rate += this.returnRateArray.all_inclusive_rates["Base_Rate"].baserate
				}
				['ELH_Charges', 'Stops', 'Wait'].map((key) => {
					base_rate += this.returnRateArray.all_inclusive_rates[key].baserate
				});
				for (const key of Object.keys(this.returnRateArray.amenities)) {
					base_rate += this.returnRateArray.amenities[key].baserate;
				}
				//calculating subtotal and share of sdmin adn ta if created by TA
				if (this.BookingForm.value?.account_type == 'travel_planner' && !this.isCreatedByAdmin) {
					let adminShare = (base_rate * 15) / 100
					this.r_agentShare = base_rate * 0.10
					this.r_subtotal += adminShare + this.r_agentShare
					console.log("in if created by ta", this.r_subtotal)
				}
				else if (this.updateType == 'repeat' || this.updateType == 'return') {
					let adminShare = (base_rate * 15) / 100
					this.r_agentShare = base_rate * 0.10
					this.r_subtotal += adminShare + this.r_agentShare
					console.log("in if created by ta in repeat or return", this.subtotal)
				}
				else {
					let adminShare = (base_rate * 25) / 100
					this.r_subtotal += adminShare
					console.log("in if created by admin", this.r_subtotal)
				}
				this.r_grandtotal = (parseFloat(this.r_subtotal))
			}
		});
	}
	autofillData(filling_for: string, data: any) {
		try {
			if (filling_for === 'passenger') {
				console.log('--->>>> filling passenger info', data)
				data.middle_name ?
					this.SetFormValue('passenger_name', `${data?.first_name} ${data?.middle_name} ${data?.last_name}`) : this.SetFormValue('passenger_name', `${data?.first_name} ${data?.last_name}`)
				this.SetFormValue('passenger_email', data?.email)
				this.SetFormValue('passenger_cell', data?.mobile)
				this.SetFormValue('passenger_cell_isd', data?.mobileIsd)
				this.SetFormValue('passenger_cell_country', data?.mobileCountry)
				this.SetFormValue('origin_airport_city', data?.origin_airport_city)
				this.SetFormValue('pickup_flight', data?.pickup_flight)
				this.SetFormValue('dropoff_flight', data?.dropoff_flight)
			}

		} catch (error) {
			console.log('error----->>>>>>', error)
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
			this.DrvTelObject.setCountry(this.BookingForm.get('driver_cell_country').value);
		}
	}

	fillDriverInfo(data) {
		this.SetFormValue('driver_name', `${data?.driver_name}`)
		this.SetFormValue('driver_gender', data?.driver_gender)
		this.SetFormValue('driver_cell', data?.driver_cell)
		this.SetFormValue('driver_cell_isd', data?.driver_cell_isd)
		this.SetFormValue('driver_cell_country', data?.driver_cell_country)
		this.SetFormValue('driver_email', data?.driver_email)
		this.SetFormValue('driver_phone_type', data?.driver_phone_type ?? '');
		try {
			this.driver_info['name'] = data?.driver_name
			this.driver_info["phone"] = data?.driver_cell_isd + data?.driver_cell
			this.driver_info["gender"] = data?.driver_gender
			this.driver_info["type"] = data?.vehicle_type_name
			this.driver_info["make"] = data?.vehicle_make_name
			this.driver_info["model"] = data?.vehicle_model_name
		} catch (error) {
			console.log('error-->', error)
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
	scroll(id) {
		let el = document.getElementById(id);
		console.log(`scrolling to ${id}`, el);
		el.scrollIntoView(true);
	}

	textFormatter(text: string) {
		try {
			return text.replace(/[\\\_$]+/g, ' ')
		}
		catch {
			return text
		}
	}
	onSelectionChangeServiceType(event: any) {
		this.service_type = event.value;
	}
	changeTransferType(type: string) {
		console.log('in function change transfer type', type)
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
	changeReturnTransferType(event: any) {
		this.return_transfer_type = event
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


	PaxTelInputObject(event: any) {
		this.PaxTelObject = event;
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
	handleNoOfHours(value) {
		this.number_of_hours = value
	}
	addExtraStop(is_return: boolean = false) {
		// console.log('Adding Extra Stop ...')
		if (is_return) {
			let index = Object.keys(this.ReturnExtraStops).length + 1;
			(<FormArray>this.BookingForm.get('return_extra_stops')).push(new FormGroup({
				address: new FormControl(''),
				latitude: new FormControl(''),
				longitude: new FormControl(''),
				booking_instructions: new FormControl('')
			}))
		}
		else {
			let index = Object.keys(this.ExtraStops).length + 1;
			(<FormArray>this.BookingForm.get('extra_stops')).push(new FormGroup({
				address: new FormControl(''),
				latitude: new FormControl(''),
				longitude: new FormControl(''),
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
	mToMi(distance: number): string {
		return (distance / 1609).toFixed(2)
	}
	mToKm(distance: number): string {
		return (distance / 1000).toFixed(2)
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
		event && this.SetFormValue(form_control, event.id);
	}
	FormatTime(time: string) {
		return moment(time, "HH:mm:ss").format("LT");
	}
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
	fillAddress(form_control: string, address: any) {
		// console.log('Address: ', address)
		this.SetFormValue(form_control, address.formatted_address)
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
						} else {
							this.distance = response.distance
							if (!this.BookingForm.get('extra_stops')?.value?.length || this.BookingForm.get('extra_stops')?.value[0]['rate']?.length) {
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
	fillLocationPoints(form_control: string, location: any) {
		// console.log('Location Points', location)
		this.SetFormValue(form_control + '_latitude', location.latitude)
		this.SetFormValue(form_control + '_longitude', location.longitude)
		this.MapController()
		if (this.Form.service_type.value == 'round_trip') {
			this.MapController(true)
		}
	}
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

	SetLCFormValue(form_control: string, value: any) {
		if (!value || !form_control) {
			console.info(`No Value to set for ${form_control}. Returning ...`)
			return
		}
		console.log('Setting Form Value for ', form_control, ' : ', value);
		try {
			this.BookingForm.updateValueAndValidity()
		}
		catch (err) {
			console.error('NFC Error: ')
			return
		}
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


	fillLCDetails(choose_user: any) {
		this.SetLCFormValue('first_name', choose_user?.first_name)
		this.SetLCFormValue('middle_name', choose_user?.middle_name)
		this.SetLCFormValue('last_name', choose_user?.last_name)
		this.SetLCFormValue('email', choose_user?.email)
		this.SetLCFormValue('phone', choose_user?.mobile)
	}

	// handleClientAccount(value: any) {
	// 	console.log('---------------------_>>>>>>>>>>>>>> client acc value', value)
	// 	this.chooseUser(value.id)
	// }

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


	resetFields() {
		this.chosen_user = null
		// this.buildBookingForm()
		this.MapController()
		this.driver_image = {}
		this.vehicle_image = {}


		// if directly navigated to create new booking mode from edit booking mode
		if (this.BigData_COPY) {
			this.BigData = this.BigData_COPY
		}
		this.reset_button = !this.reset_button
	}

	returnZero() {
		return 0	// for keeping the order
	}

	toggleDropdown(type: string) {
		// console.log('Toggle Dropdown ', type)
		this.booking_params['chevrons'][type] = !this.booking_params['chevrons'][type]
	}
	handleChangeVehicleType(event) {
		console.log('in function handle change vehicle type', event.unique_key)
		this.VehicleList.map(i => (i.unique_key == event.unique_key) ? this.handleSelectVehicleType(i) : '')

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
			}
			if (value != 'charter_tour') {
				this.BookingForm.get('number_of_hours').setValue(2)
				this.BookingForm.updateValueAndValidity()
				console.log(this.BookingForm.get('number_of_hours').value);
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
			// this.buildBookingData()
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

		})

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


	handleTravelStaffAccounts() {
		console.log('handleTravelStaffAccounts--->>>')
		this.$spinner.show()
		this.individualService.getAccountDetails().subscribe((response: any) => {
			this.$spinner.hide();
			console.log("detail ->>>>>>>", response)
			this.autofillData('passenger', response?.data);
			this.chosen_user = {}
			this.chosen_user = response?.data
			this.chosen_user['name'] = `${response.data.first_name} ${response.data.middle_name ?? ''} ${response.data.last_name}`

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

	createReservationShareArray() {
		console.log('in function createReservationShareArray')
		if (this.rateArray) {
			console.log('in function createReservationShareArray iffffff')
			let base_rate = 0
			if (this.BookingForm.value?.service_type == 'charter_tour') {
				base_rate += this.rateArray.all_inclusive_rates["Base_Rate"].baserate * this.number_of_hours
			}
			else {
				base_rate += this.rateArray.all_inclusive_rates["Base_Rate"].baserate
			}
			['ELH_Charges', 'Stops', 'Wait'].map((key) => {
				base_rate += this.rateArray.all_inclusive_rates[key].baserate
			});
			for (const key of Object.keys(this.rateArray.amenities)) {
				base_rate += this.rateArray.amenities[key].baserate;
			}
			let grandTotal = this.grandtotal
			if (this.BookingForm?.get('number_of_vehicles').value > 1) {
				grandTotal = grandTotal * this.Form.number_of_vehicles.value
				console.log("changes in number of vehciles if ", grandTotal)
			}
			else {
				grandTotal = this.grandtotal
				console.log("changes in number of vehciles else ", grandTotal)
			}
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
			if (this.updateType == 'repeat' || this.updateType == 'return') {
				this.adminSharePercent = 15
				shareArray['adminShare'] = (base_rate * this.adminSharePercent) / 100
				shareArray['deducted_admin_share'] = shareArray['adminShare'] - shareArray['stripeFee']
				shareArray['travelAgentShare'] = base_rate * 0.10
			}
			this.shareArray = shareArray
			console.log('in function createReservationShareArray-->>>', base_rate, shareArray)

			return shareArray;

			// value['rateArray'] = JSON.parse(JSON.stringify(this.rateArray))
		}
	}
	createReservationReturnShareArray() {
		console.log('createReservationReturnShareArray', this.r_grandtotal)
		if (this.Form.service_type.value == 'round_trip' && this.returnRateArray) {

			let base_rate = 0
			for (const key of Object.keys(this.returnRateArray.all_inclusive_rates)) {
				base_rate += this.returnRateArray.all_inclusive_rates[key].baserate;
			}
			for (const key of Object.keys(this.returnRateArray.amenities)) {
				base_rate += this.returnRateArray.amenities[key].baserate;
			}
			let returnGrandTotal = this.r_grandtotal
			if (this.BookingForm?.get('number_of_vehicles').value > 1) {
				returnGrandTotal = returnGrandTotal * this.Form.number_of_vehicles.value
				console.log("changes in number of vehciles if ", returnGrandTotal)
			}
			else {
				returnGrandTotal = this.r_grandtotal
				console.log("changes in number of vehciles else ", returnGrandTotal)
			}
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

			this.r_shareArray = returnShareArray
			// console.log('in function createReservationreturnShareArray-->>>' , base_rate, returnShareArray )
			return returnShareArray;
			// value['returnRateArray'] = JSON.parse(JSON.stringify(this.returnRateArray))
		}
	}

	submitForm(preview: boolean) {
		this.submitBookingForm = true
		console.log(this.BookingForm);
		console.log(this.BookingForm.status, this.BookingForm.value);
		if (this.BookingForm.invalid) {
			return;
		}

		let value = this.BookingForm.value
		value['currency'] = this.currencyObj?.currency
		value['is_master_vehicle'] = this.is_master_vehicle
		value['proceed'] = this.proceed
		value['rateArray'] = this.rateArray
		value['grand_total'] = this.grandtotal * this.Form.number_of_vehicles.value
		value['sub_total'] = this.subtotal
		value['min_rate_involved'] = this.min_rate_involved
		value['shares_array'] = this.createReservationShareArray()
		delete value['rateArray']['grand_total']/*  */
		delete value['rateArray']['sub_total']
		delete value['rateArray']['min_rate_involved']
		// Return Rates Form
		if (this.Form.service_type.value == 'round_trip') {
			value['returnRateArray'] = this.returnRateArray
			value['return_grand_total'] = this.r_grandtotal * this.Form.number_of_vehicles.value
			value['return_sub_total'] = this.r_subtotal
			delete value['returnRateArray']['r_grandtotal']
			delete value['returnRateArray']['r_subtotal']
			value['return_shares_array'] = this.createReservationReturnShareArray()
		}

		if (preview) {
			this.$spinner.show()
			this.individualService.createBooking(value, this.Form.updateType.value).subscribe((response: any) => {
				this.$spinner.hide()
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
					this.$router.navigate([`/${this.currentUser?.roleName}/bookings`])
				}
			})
		}
		else {
			$('#previewBooking').modal('handleUpdate').modal('show')
		}
	}


	LCTelInputObject(event: any) {
		this.LCTelObject = event;
	}
	LCTelInputObjectUSA(event: any) {
		event.setCountry('us');
	}

	LATelInputObject(event: any) {
		this.LATelObject = event;
	}
	DrvTelInputObject(event: any) {
		this.DrvTelObject = event;
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

	buildBookingData() {
		console.log('rebuild booking data')
		let booking_data = {
			vehicle_id: this.BookingForm.get('vehicle_id').value,
			transfer_type: this.BookingForm.get('transfer_type').value,
			service_type: this.BookingForm.get('service_type').value,
			numberOfVehicles: 1,
			distance: this.distance,
			return_distance: this.return_distance,
			no_of_hours: this.number_of_hours,
			is_master_vehicle: this.is_master_vehicle,
			extra_stops: this.BookingForm.get('extra_stops').value,
			return_extra_stops: this.BookingForm.get('return_extra_stops').value,
			pickup_time: this.BookingForm.get('pickup_time').value,
			return_pickup_time: this.BookingForm.get('return_pickup_time').value,
			return_vehicle_id: this.BookingForm.get('vehicle_id').value,
			return_affiliate_type: this.BookingForm.get('affiliate_type').value,
		}

		let vehicle_id = booking_data?.vehicle_id.toString().length ? booking_data?.vehicle_id : this.master_vehicle_id
		// booking_data['is_master_vehicle'] = booking_data?.vehicle_id.toString().length ? false : true
		this.$api.fetchRatesByAffiliateVeh(vehicle_id, booking_data).subscribe((response: any) => {
			if (this.bookingType != 'edit' && this.bookingType != 'repeat' && this.Form.affiliate_type.value != 'loose_affiliate') {
				this.subtotal = 0
				this.r_subtotal = 0
				this.min_rate_involved = response?.data?.min_rate_involved
				this.rateArray = response?.data?.rateArray
				this.rateArray.all_inclusive_rates.Base_Rate.amount = response?.data?.rateArray?.all_inclusive_rates?.Base_Rate.amount
				for (let outerKey in this.rateArray) {
					if (this.rateArray.hasOwnProperty(outerKey)) {
						const innerObject = this.rateArray[outerKey];
						for (let innerKey in innerObject) {
							if (innerObject.hasOwnProperty(innerKey)) {
								this.subtotal += innerObject[innerKey].amount ? innerObject[innerKey].amount : 0

							}
						}
					}
				}
				let base_rate = 0
				if (this.BookingForm.value?.service_type == 'charter_tour') {
					base_rate += this.rateArray.all_inclusive_rates["Base_Rate"].baserate * this.number_of_hours
				}
				else {
					base_rate += this.rateArray.all_inclusive_rates["Base_Rate"].baserate
				}
				['ELH_Charges', 'Stops', 'Wait'].map((key) => {
					base_rate += this.rateArray.all_inclusive_rates[key].baserate
				});
				for (const key of Object.keys(this.rateArray.amenities)) {
					base_rate += this.rateArray.amenities[key].baserate;
				}
				if (this.BookingForm.value?.account_type == 'travel_planner' && !this.isCreatedByAdmin) {
					this.agentShare = base_rate * 0.10
				}
				// this.agentShare = response?.data?.rateArray?.all_inclusive_rates?.Base_Rate?.baserate * 0.10
				this.grandtotal = (parseFloat(this.subtotal))
			}
			if (booking_data.service_type == 'round_trip') {
				this.returnRateArray = response?.data?.retrunRateArray
				this.returnRateArray.all_inclusive_rates.Base_Rate.amount = response?.data?.retrunRateArray?.all_inclusive_rates?.Base_Rate.amount
				for (let outerKey in this.returnRateArray) {
					if (this.returnRateArray.hasOwnProperty(outerKey)) {
						const innerObject = this.returnRateArray[outerKey];
						for (let innerKey in innerObject) {
							if (innerObject.hasOwnProperty(innerKey)) {
								this.r_subtotal += innerObject[innerKey].amount ? innerObject[innerKey].amount : 0
							}
						}
					}
				}
				let base_rate = 0
				if (this.BookingForm.value?.service_type == 'charter_tour') {
					base_rate += this.returnRateArray.all_inclusive_rates["Base_Rate"].baserate * this.number_of_hours
				}
				else {
					base_rate += this.returnRateArray.all_inclusive_rates["Base_Rate"].baserate
				}
				['ELH_Charges', 'Stops', 'Wait'].map((key) => {
					base_rate += this.returnRateArray.all_inclusive_rates[key].baserate
				});
				for (const key of Object.keys(this.returnRateArray.amenities)) {
					base_rate += this.returnRateArray.amenities[key].baserate;
				}
				if (this.BookingForm.value?.account_type == 'travel_planner' && !this.isCreatedByAdmin) {
					this.r_agentShare = base_rate * 0.10
				}
				//   this.r_agentShare = response?.data?.retrunRateArray?.all_inclusive_rates?.Base_Rate?.baserate * 0.10
				this.r_grandtotal = (parseFloat(this.r_subtotal))
			}
		});
	}

	setValueByBookNow() {
		try {
			let QB: any = JSON.parse(localStorage.getItem('quotebot_form'))
			let selected_vehicle: any = JSON.parse(sessionStorage.getItem('selected_vehicle'))
			// for (const key in QB) {
			//   console.log(`QB______${key}: ${QB[key]}`);
			//   this.SetFormValue(key ,QB[key])
			// }    
			this.affiliate_id = selected_vehicle?.affiliate_id


			//dropOFF
			this.SetFormValue('service_type', QB?.service_type)
			this.service_type = QB?.service_type
			if (QB?.service_type == 'charter_tour') {
				this.SetFormValue('number_of_hours', QB?.booking_hour)
				this.number_of_hours = QB?.booking_hour
			}
			//set no of vehicles
			this.SetFormValue('number_of_vehicles', selected_vehicle?.number_of_vehicles)
			let transfer_type_value = QB?.pickup_type + '_to_' + QB?.dropoff_type
			let return_transfer_type_value = QB?.dropoff_type + '_to_' + QB?.pickup_type
			this.transfer_type = transfer_type_value
			this.return_transfer_type = return_transfer_type_value
			this.SetFormValue('transfer_type', transfer_type_value)
			this.SetFormValue('return_transfer_type', return_transfer_type_value)
			this.SetFormValue('total_passengers', QB?.no_of_luggage)
			this.SetFormValue('luggage_count', QB?.no_of_passenger)
			this.SetFormValue('affiliate_type', 'affiliate')
			this.SetFormValue('affiliate_id', this.affiliate_id)
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

			//driver information from selected vehicle
			this.SetFormValue('driver_id', selected_vehicle?.driverInformation?.id)
			this.SetFormValue('driver_name', selected_vehicle?.driverInformation?.name)
			this.SetFormValue('driver_email', selected_vehicle?.driverInformation?.email)
			this.SetFormValue('driver_cell', selected_vehicle?.driverInformation?.cell_number)
			this.SetFormValue('driver_cell_isd', selected_vehicle?.driverInformation?.cell_isd)
			this.SetFormValue('driver_gender', selected_vehicle?.driverInformation?.gender)
			this.SetFormValue('vehicle_id', selected_vehicle?.id)

			// driver_cell_isd: ['+1'],
			// driver_cell_country: ['us'],

			if (QB?.pickup_type == 'airport') {
				let location = {
					latitude: QB?.pickup_airport_lat,
					longitude: QB?.pickup_airport_long
				}
				this.fillLocationPoints('airport', location)
			}
			this.MapController(this.transfer_type == 'round_trip' ? true : false)
			this.driverImgUrl = selected_vehicle?.driverInformation?.imageUrl || "../../../../assets/images/driverImg.jpg"
			this.vehicleImgUrl = selected_vehicle?.vehicle_images[0] || ""
			this.driver_info = selected_vehicle?.driverInformation || {}
			this.driver_info['type'] = selected_vehicle?.name || ""
			this.driver_info['make'] = selected_vehicle?.vehicle_details?.make || ""
			this.driver_info['model'] = selected_vehicle?.vehicle_details?.model || ""
			this.driver_info['year'] = selected_vehicle?.vehicle_details?.year || ""
		} catch (error) {
			console.log('error---------->>>>>>>>>', error)
		}
		// setTimeout(() => {
		// 	console.log('settimeout finction---------------------------------------------------------------')
		// 	this.fetchQBAffiliateVehicles(selected_vehicle?.affiliate_id)
		// 	this.fetchAffiliateDrivers(this.affiliate_id)
		// }, 5000)
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
