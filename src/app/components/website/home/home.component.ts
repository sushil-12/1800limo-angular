import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { WebsiteService } from '../../../services/website.service';
import { AuthService } from '../../../services/auth.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { ErrorDialogService } from '../../../services/error-dialog/errordialog.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";
import { QuotebotService } from 'src/app/services/quotebot.service';

import { SharedModule } from 'src/app/components/shared/shared.module';


// data for select fields
import { constant_data } from 'src/assets/js/data.js'
import * as moment from 'moment';


declare var $: any;
declare var SpinnerPicker: any




@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
	vehicles: any;
	vehiclesRes: any;
	minDate = new Date();
	currentUser: string;
	modalHeading: string;
	modalInstructions: string;
	modalType: string;
	modalInformation: boolean = true;
	selectedModal: string;
	steps: string = "";
	accountStatus: string = "";
	value: any;
	splitSteps: any;
	public innerWidth: any;
	oneWayAddress: boolean = false;
	roundTripAddress: boolean = false;

	countriesList: Array<String> = constant_data.countries
	PersonalilzedList: Array<String> = constant_data.personallist
	hour_values: Array<any> = constant_data.hour_values
	time_values: Array<any> = constant_data.time_values

	// PersonalilzedList
	PersonalilzedList1: Array<String>;
	PersonalilzedList2: Array<String>;

	// countriesList
	countriesList1: Array<String>;
	countriesList2: Array<String>;
	countriesList3: Array<String>;
	countriesListData1: Array<String>;
	countriesListData2: Array<String>;

	airports_data: Array<any>
	airports_data_copy: Array<any>
	airports_data_pickup: Array<any>
	airports_data_dropoff: Array<any>
	airports_data_r_pickup: Array<any>
	airports_data_r_dropoff: Array<any>

	//For reactive form
	quoteBotForm: FormGroup;
	roundForm: FormGroup;
	charterTourForm: FormGroup;
	getInTouchForm: FormGroup;
	submitted = false;


	homePageData: any;
	checkdata: any;

	time_value_for_phone_only: string

	vars: Object = {}
	desktopWidth: any;


	constructor(
		private mapsAPILoader: MapsAPILoader,
		private ngZone: NgZone,
		private formBuilder: FormBuilder,
		private router: Router,
		private websiteService: WebsiteService,
		private stateManagementService: StateManagementService,
		private spinner: NgxSpinnerService,
		private authService: AuthService,
		private errorDialogService: ErrorDialogService,
		private quotebotService: QuotebotService,
		private globalFunctions: SharedModule,
		private elementRef: ElementRef,

	) { }


	//google map autocomplete
	title: string = 'AGM project';
	latitude: number;
	longitude: number;
	zoom: number;
	address: string;

	ngOnInit() {
		this.fetchAirportsData()


		setTimeout(() => {

			$('[data-toggle="modal"]').tooltip();//Bootstrap tooltip

		}, 500);
		this.innerWidth = window.innerWidth; //window inner width

		$('#countriestooltip').tooltip();//Bootstrap tooltip
		// // hide tooltip in Mobile View
		$(".showCountries").click(function () {
			$(this).tooltip('hide');
		});

		this.currentUser = this.stateManagementService.getUser()

		this.steps = localStorage.getItem("stepCompleted");
		this.accountStatus = localStorage.getItem("account_approval");

		if (this.accountStatus == "completed" || this.accountStatus == "accepted") {
			this.value = "Manage / Daily Bookings";
		}
		else {
			this.value = "Continue Affiliate Set-Up";
		}

		// PersonalilzedList
		const halfPersonalized = Math.ceil(this.PersonalilzedList.length / 2);
		this.PersonalilzedList1 = this.PersonalilzedList.splice(0, halfPersonalized);
		this.PersonalilzedList2 = this.PersonalilzedList.splice(-halfPersonalized);

		// Display CountryList
		if (this.innerWidth >= 767) {
			console.log(this.innerWidth, 'fall in above 767')
			// countriesList for desktop    
			const oneThirdCountries = Math.ceil(this.countriesList.length / 3);
			this.countriesList3 = this.countriesList.splice(-oneThirdCountries);
			this.countriesList2 = this.countriesList.splice(-oneThirdCountries);
			this.countriesList1 = this.countriesList;
		}
		else {
			console.log(this.innerWidth, 'fall in below 767')
			// countriesList for mobile 
			const halfCountries = Math.ceil(this.countriesList.length / 2);
			this.countriesListData1 = this.countriesList.splice(0, halfCountries);
			this.countriesListData2 = this.countriesList.splice(-halfCountries);

		}


		this.initialiseQuotebot()  	// initialise Quote Bot

		//Get In Touch Form
		this.getInTouchForm = this.formBuilder.group({
			getInTouchName: ['', Validators.required],
			getInTouchEmail: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			getInTouchMessage: ['', Validators.required]
		});

		// Load Our vehicles using API
		this.websiteService.getOurVehicles().then(result => {
			this.vehiclesRes = result;
			this.vehicles = this.vehiclesRes.data;
			// console.log(result);
			// console.log(this.vehicles);
			// console.log(JSON.stringify(this.vehicles));
			$(document).ready(function () {
				$('.chk_vehicles').owlCarousel({
					loop: true,
					margin: 10,
					autoplay: true,
					autoplayTimeout: 3000,
					autoplayHoverPause: true,
					responsiveClass: true,
					navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
						'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve">  <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
					responsive: {
						0: {
							items: 1,
							nav: false,
							loop: true,
							dots: false
						},
						575: {
							items: 2,
							nav: true
						},
						992: {
							items: 3,
							loop: true,
							nav: true,
							margin: 20
						}
					}
				});

			})
		});

		this.fetchHomePageData();

		// $('.scrollDownButton').css('left', '3px');
		// $('.scrollDownButton').css('right', '');
		// $('.scrollTopButton').css('left', '3px');
		// $('.scrollTopButton').css('right', '');

	}

	// ngOnInit() ends
	ngAfterViewInit(): void {
		this.desktopWidth = window.innerWidth;
		if (this.desktopWidth <= '767') {
			//google translate
			console.log('-----google translate element for mobile view-------->>>>')
			var v = document.createElement("script");
			v.type = "text/javascript";
			v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en',layout: google.translate.TranslateElement.InlineLayout.VERTICAL}, 'google_translate_element_home_mobile'); } ";
			this.elementRef.nativeElement.appendChild(v);
			var s = document.createElement("script");
			s.type = "text/javascript";
			s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
			this.elementRef.nativeElement.appendChild(s);

			$('.goog-te-gadget').html($('.goog-te-gadget').children());
			$("#google-translate").fadeIn('1000');


			function cleartimer() {
				setTimeout(function () {
					window.clearInterval(myVar);
				}, 500);
			}
			function myTimer() {
				if ($('.goog-te-combo option:first').length) {
					$('.goog-te-combo option:first').html('Translate');
					cleartimer();
				}
			}
			var myVar = setInterval(function () { myTimer() }, 0);
		}

		if (this.desktopWidth > '767') {
			//google translate
			console.log('<<<<<<<-------select language------>>>>>>>>')
			var v = document.createElement("script");
			v.type = "text/javascript";
			v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false, layout: google.translate.TranslateElement.InlineLayout.VERTICAL }, 'google_translate_element_home_desktop'); } ";
			this.elementRef.nativeElement.appendChild(v);
			var s = document.createElement("script");
			s.type = "text/javascript";
			s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
			this.elementRef.nativeElement.appendChild(s);
			$('.goog-te-gadget').html($('.goog-te-gadget').children());
			$("#google-translate").fadeIn('1000');


			function cleartimer() {
				setTimeout(function () {
					window.clearInterval(myVar);
				}, 500);
			}
			function myTimer() {
				if ($('.goog-te-combo option:first').length) {
					$('.goog-te-combo option:first').html('Translate');
					cleartimer();
				}
			}
			var myVar = setInterval(function () { myTimer() }, 0);

		}

	}


	fetchPageData(section: string) {
		if (section != undefined && this.homePageData != undefined) {
			if (this.homePageData) {
				for (let item in this.homePageData) {
					if (this.homePageData[item].hasOwnProperty('title') && this.homePageData[item]['title'].toLowerCase() == section.toLowerCase()) {
						return this.homePageData[item]
					}
				}
			}
		}
	}

	fetchHomePageData() {
		this.spinner.show()

		this.websiteService.fetchHomePageData()
			.pipe(
				catchError(err => {
					this.spinner.hide()
					return throwError(err)
				})
			).subscribe(({ data }: any) => {
				this.spinner.hide()
				console.log(data, "gsducgjsdgcfugsdu")
				this.homePageData = data

				$(document).ready(function () {
					$('.owl-carousel').owlCarousel({
						loop: true,
						autoplay: true,
						autoplayTimeout: 2000,
						autoplayHoverPause: true,
						margin: 10,
						responsiveClass: true,
						navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
							'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff">  <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
						responsive: {
							0: {
								items: 1,
								nav: false,
								loop: true,
								dots: false
							},
							600: {
								items: 3,
								nav: true
							},
							1000: {
								items: 3,
								nav: true,
								loop: true,
								autoplay: true,
								margin: 20
							}
						}
					});
				})


				$(document).ready(function () {
					$('.client_logo').owlCarousel({
						loop: true,
						margin: 10,
						autoplay: true,
						autoplayTimeout: 1000,
						autoplayHoverPause: true,
						responsiveClass: true,
						navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
							'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff">  <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
						responsive: {
							0: {
								items: 1,
								nav: false,
								loop: true,
								dots: false
							}
						}
					});

				});
			})
	}







	// --------------------------------- 	Quotebot Data 		----------------------------------------------

	/**
	 * after generating Form, prefills and fetches airport data
	 */
	initialiseQuotebot() {
		if (this.generateQBForm()) {
			this.prefillQuotebot()
		}
	}


	/**
	 * fill the location coordinates from google maps autocomplete
	 * @param event [any] Required. input event
	 * @param field_name [string] Required. input field and key of the form
	 */
	onAutocompleteSelected(location: any, field_name: string) {
		this.SetFormValue(field_name, location.formatted_address)

		// fill return address and airport for round trip
		this.QBForm.service_type.value == 'round_trip' && !field_name.includes('return_') && this.fillReturnDetails()
	}

	/**
	 * fill the formatted address from google maps autocomplete
	 * @param event [any] Required. input event
	 * @param field_name [string] Required. input field and key of the form
	 */
	onLocationSelected(coordinates: any, field_name: string) {
		this.SetFormValue(field_name + '_lat', coordinates['latitude'])
		this.SetFormValue(field_name + '_long', coordinates['longitude'])

		this.QBForm.service_type.value == 'round_trip' && !field_name.includes('return_') && this.fillReturnDetails()

	}

	/**
	 * Fill Return Details for the form
	 */
	fillReturnDetails() {
		this.quoteBotForm.patchValue({
			return_pickup_address: this.QBForm.dropoff_address.value,
			return_pickup_address_lat: this.QBForm.dropoff_address_lat.value,
			return_pickup_address_long: this.QBForm.dropoff_address_long.value,
			return_dropoff_address: this.QBForm.pickup_address.value,
			return_dropoff_address_lat: this.QBForm.pickup_address_lat.value,
			return_dropoff_address_long: this.QBForm.pickup_address_long.value,
			return_pickup_airport: this.QBForm.dropoff_airport.value,
			return_pickup_airport_lat: this.QBForm.dropoff_airport_lat.value,
			return_pickup_airport_long: this.QBForm.dropoff_airport_long.value,
			return_dropoff_airport: this.QBForm.pickup_airport.value,
			return_dropoff_airport_lat: this.QBForm.pickup_airport_lat.value,
			return_dropoff_airport_long: this.QBForm.pickup_airport_long.value,
		})
	}

	/**
	 * generating Quote Bot Form only
	 */
	generateQBForm() {
		this.quoteBotForm = this.formBuilder.group({
			service_type: ['', Validators.required],		// form type
			booking_hour: ['', Validators.required],	// charte tour
			pickup_type: ['', Validators.required],
			dropoff_type: ['', Validators.required],
			pickup_date: ['', Validators.required],
			pickup_time: ['', Validators.required],
			pickup_airport: ['', Validators.required],
			pickup_airport_name: [''],
			pickup_airport_lat: ['', Validators.required],
			pickup_airport_long: ['', Validators.required],
			pickup_address: ['', Validators.required],
			pickup_address_lat: ['', Validators.required],
			pickup_address_long: ['', Validators.required],
			dropoff_airport: ['', Validators.required],
			dropoff_airport_name: [''],
			dropoff_airport_lat: ['', Validators.required],
			dropoff_airport_long: ['', Validators.required],
			dropoff_address: ['', Validators.required],
			dropoff_address_lat: ['', Validators.required],
			dropoff_address_long: ['', Validators.required],
			return_pickup_date: ['', Validators.required],
			return_pickup_time: ['', Validators.required],
			return_pickup_airport: ['', Validators.required],
			return_pickup_airport_name: [''],
			return_pickup_airport_lat: ['', Validators.required],
			return_pickup_airport_long: ['', Validators.required],
			return_pickup_address: ['', Validators.required],
			return_pickup_address_lat: ['', Validators.required],
			return_pickup_address_long: ['', Validators.required],
			return_dropoff_airport: ['', Validators.required],
			return_dropoff_airport_name: [''],
			return_dropoff_airport_lat: ['', Validators.required],
			return_dropoff_airport_long: ['', Validators.required],
			return_dropoff_address: ['', Validators.required],
			return_dropoff_address_lat: ['', Validators.required],
			return_dropoff_address_long: ['', Validators.required],
			no_of_passenger: ['', Validators.required],
			no_of_luggage: ['', Validators.required],
			location_info: this.formBuilder.array([], Validators.required),
		});

		if (this.quoteBotForm) {
			return true
		}
	}
	roundToNearest15(minutes) {
		const quarterHour = 15;
		return Math.round(minutes / quarterHour) * quarterHour;
	}

	prefillQuotebot() {
		if (localStorage.getItem('quotebot_form')) {
			let previous_quotebot = JSON.parse(localStorage.getItem('quotebot_form'))
			// fill previous values if localStorage has item
			this.quoteBotForm.patchValue({
				service_type: previous_quotebot.service_type,
				booking_hour: previous_quotebot.booking_hour,
				pickup_type: previous_quotebot.pickup_type,
				dropoff_type: previous_quotebot.dropoff_type,
				pickup_date: previous_quotebot.pickup_date,
				pickup_time: previous_quotebot.pickup_time,
				pickup_airport: previous_quotebot.pickup_airport,
				pickup_airport_name: previous_quotebot?.other_details?.pickup_airport_name,
				pickup_airport_lat: previous_quotebot.pickup_airport_lat,
				pickup_airport_long: previous_quotebot.pickup_airport_long,
				pickup_address: previous_quotebot.pickup_address,
				pickup_address_lat: previous_quotebot.pickup_address_lat,
				pickup_address_long: previous_quotebot.pickup_address_long,
				dropoff_airport: previous_quotebot.dropoff_airport,
				dropoff_airport_name: previous_quotebot?.other_details?.dropoff_airport_name,
				dropoff_airport_lat: previous_quotebot.dropoff_airport_lat,
				dropoff_airport_long: previous_quotebot.dropoff_airport_long,
				dropoff_address: previous_quotebot.dropoff_address,
				dropoff_address_lat: previous_quotebot.dropoff_address_lat,
				dropoff_address_long: previous_quotebot.dropoff_address_long,
				return_pickup_date: new Date().toISOString().substring(0, 10),
				return_pickup_time: previous_quotebot.return_pickup_time ?? '12:00:00',
				return_pickup_airport: previous_quotebot.return_pickup_airport,
				return_pickup_airport_name: previous_quotebot?.other_details?.return_pickup_airport_name,
				return_pickup_airport_lat: previous_quotebot.return_pickup_airport_lat,
				return_pickup_airport_long: previous_quotebot.return_pickup_airport_long,
				return_pickup_address: previous_quotebot.return_pickup_address ?? previous_quotebot.dropoff_address,
				return_pickup_address_lat: previous_quotebot.return_pickup_address_lat,
				return_pickup_address_long: previous_quotebot.return_pickup_address_long,
				return_dropoff_airport: previous_quotebot.return_dropoff_airport,
				return_dropoff_airport_name: previous_quotebot?.other_details?.return_dropoff_airport_name,
				return_dropoff_airport_lat: previous_quotebot.return_dropoff_airport_lat,
				return_dropoff_airport_long: previous_quotebot.return_dropoff_airport_long,
				return_dropoff_address: previous_quotebot.return_dropoff_address ?? previous_quotebot.pickup_address,
				return_dropoff_address_lat: previous_quotebot.return_dropoff_address_lat,
				return_dropoff_address_long: previous_quotebot.return_dropoff_address_long,
				no_of_passenger: previous_quotebot.no_of_passenger,
				no_of_luggage: previous_quotebot.no_of_luggage,
				location_info: previous_quotebot.location_info
			})
			this.vars = previous_quotebot.other_details
			console.warn('pickup_time: ', this.QBForm.pickup_time.value)
			this.quoteBotSwitch(previous_quotebot.service_type)

			if (new Date(this.QBForm.pickup_date.value).getDate() < new Date().getDate() || new Date(this.QBForm.pickup_date.value).getMonth() + 1 < new Date().getMonth() + 1) {
				console.log('----------ssssssssssssssetttttttttt', this.getTimeHHMMSS(this.QBForm.pickup_date.value, true))
				this.SetFormValue('pickup_date', this.getTimeHHMMSS(this.QBForm.pickup_date.value, true))
			}

			// set values for data receiving from data.js
			// $('pickupTime option:selected').attr('selected', null)
			// $(`#pickupTime option[value=\"${previous_quotebot.pickup_time}\"]`).attr('selected', 'selected')
		} else {
			// fill default values



			this.quoteBotForm.patchValue({
				service_type: 'one_way',
				booking_hour: '2',
				pickup_type: 'city',
				dropoff_type: 'airport',
				pickup_date: new Date().toISOString().split('T')[0],
				pickup_time: this.getTimeHHMMSS('', false),
				return_pickup_date: new Date().toISOString().split('T')[0],
				return_pickup_time: '12:00:00',
				no_of_passenger: 1,
				no_of_luggage: 0,
			})

			this.quoteBotSwitch('one_way')
		}
	}

	getTimeHHMMSS(date, isExist) {
		let now = new Date();
		if (isExist) {
			now = new Date(date)
		}

		// Get the current time components
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const seconds = now.getSeconds();

		// Pad single digits with leading zeros
		const formattedHours = hours.toString().padStart(2, '0');
		const formattedMinutes = this.roundToNearest15(minutes.toString().padStart(2, '0'));

		// Combine the time components into a string
		const currentTime = `${formattedHours}:${formattedMinutes}:00`;
		console.log('----------nnnnnnnnnnnnnnnnnt', currentTime)

		return currentTime
	}

	/**
	 * Fetches only Airports Data
	 */
	fetchAirportsData() {
		this.quotebotService.getAirportsData().subscribe((response: any) => {
			this.airports_data = response.success ? response.data : []
			this.airports_data_copy = JSON.parse(JSON.stringify(this.airports_data))
			this.airports_data_pickup = JSON.parse(JSON.stringify(this.airports_data))
			this.airports_data_dropoff = JSON.parse(JSON.stringify(this.airports_data))
			this.airports_data_r_pickup = JSON.parse(JSON.stringify(this.airports_data))
			this.airports_data_r_dropoff = JSON.parse(JSON.stringify(this.airports_data))
		})
	}
	returnSearchAirport(searchText: any) {
		console.log('search text is->', searchText)
		if (searchText.length == 3) {
			return JSON.parse(JSON.stringify(this.airports_data_copy.filter((item: any) => {
				return item['airport'].slice(0, 3).toLowerCase().startsWith(searchText.toLowerCase());
			})))
		}
		else {
			return JSON.parse(JSON.stringify(this.airports_data_copy.filter((item: any) => {
				return (item.city.toLowerCase().includes(searchText.toLowerCase()) || item.airport.split('-')[0].toLowerCase().includes(searchText.toLowerCase()) || item?.name.toLowerCase().includes(searchText.toLowerCase()))
			})))
		}
	}

	searchAirport(letter: string, form_control: string) {
		if (form_control == 'pickup_airport') {

			this.airports_data_pickup = (letter == '') ? JSON.parse(JSON.stringify(this.airports_data_copy)) : this.returnSearchAirport(letter)
		}
		if (form_control == 'dropoff_airport') {

			this.airports_data_dropoff = (letter == '') ? JSON.parse(JSON.stringify(this.airports_data_copy)) : this.returnSearchAirport(letter)
		}
		if (form_control == 'return_pickup_airport') {

			this.airports_data_r_pickup = (letter == '') ? JSON.parse(JSON.stringify(this.airports_data_copy)) : this.returnSearchAirport(letter)
		}
		if (form_control == 'return_dropoff_airport') {

			this.airports_data_r_dropoff = (letter == '') ? JSON.parse(JSON.stringify(this.airports_data_copy)) : this.returnSearchAirport(letter)
		}

		// console.log('airport data-------->>>>>>>>>', this.airports_data)

		// assign the value to form control if airport code is entered, as the code will give zero results for airport.
		if (this.airports_data.length == 0) {
			this.SetFormValue(form_control, letter)
		}
	}


	fillAirportData(list: any, form_control: string, comparitive_key: string, returning_key: string): string {
		// fetch form value
		let form_value = this.quoteBotForm.get(form_control).value
		console.log('fillAirportData executes-->>', form_value)

		// validation check for form value to not be empty
		if (form_value == null || form_value == '' || this.airports_data == undefined) {
			return ''
		}

		// return the returning name
		const object = list.find((item: any) => item[comparitive_key] == form_value)
		if (object) {
			return object[returning_key]
		}
		return ''
	}

	selectedAirport(list: any, value: any, field_name: string): void {
		console.log('selectedAirport-->>' , value)
		if(field_name=='pickup_airport'){
			this.SetFormValue('return_dropoff_airport_name', value.airport)
		}
		else if(field_name=='dropoff_airport'){
			this.SetFormValue('return_pickup_airport_name', value.airport)
		}
		else if(field_name=='return_pickup_airport'){
			this.SetFormValue('dropoff_airport_name', value.airport)
		}
		else if(field_name=='return_dropoff_airport'){
			this.SetFormValue('pickup_airport_name', value.airport)
		}
		this.SetFormValue(field_name, value.id)
		this.SetFormValue(field_name + '_name', value.airport)
		this.SetFormValue(field_name + '_lat', value.lat)
		this.SetFormValue(field_name + '_long', value.lon)
		console.log(this.quoteBotForm.value)
		this.vars[field_name + '_name'] = value.airport
		if (field_name.includes('pickup_airport')) this.vars['return_dropoff_airport_name'] = value.airport
		if (field_name.includes('dropoff_airport')) this.vars['return_pickup_airport_name'] = value.airport
		this.fillReturnDetails()
	}

	SetFormValue(field_name: string, value: string | number) {
		console.log(`Filling ${value} into ${field_name}`)
		this.quoteBotForm.get(field_name).setValue(value)
		this.quoteBotForm.updateValueAndValidity()
	}

	SetFormValidator(field_name: string, validators: Array<any>): void {
		this.quoteBotForm.get(field_name).setValidators(validators)
		this.quoteBotForm.updateValueAndValidity()
	}


	get QBForm() {
		return this.quoteBotForm.controls;
	}


	// $(".classChange").removeClass("col-12 col-md-12").addClass("col-6 col-md-6");
	// $(".returnClassChange").removeClass("col-12 col-md-12").addClass("col-6 col-md-6");
	// reset the input fields on click of cross svg
	reset(field_name: string) {
		switch (field_name) {
			case 'pickup_address':
				this.quoteBotForm.patchValue({
					pickup_address: '',
					pickup_address_lat: '',
					pickup_address_long: '',
					return_dropoff_address: '',
					return_dropoff_address_lat: '',
					return_dropoff_address_long: ''
				})
				break
			case 'pickup_airport':
				console.log('resseting pickup address')
				this.quoteBotForm.patchValue({
					pickup_airport:'',
					pickup_airport_name: '',
					pickup_airport_lat: '',
					pickup_airport_long: '',
				})
				break
			case 'dropoff_airport':
				console.log('resseting dropoff_airport address')
				this.quoteBotForm.patchValue({
					dropoff_airport: '',
					dropoff_airport_name: '',
					dropoff_airport_lat: '',
					dropoff_airport_long: '',
				})
				break
			case 'return_pickup_airport':
				console.log('resseting return_pickup_airport address')
				this.quoteBotForm.patchValue({
					return_pickup_airport: '',
					return_pickup_airport_name: '',
					return_pickup_airport_lat: '',
					return_pickup_airport_long: '',
				})
				break
			case 'return_dropoff_airport':
				console.log('resseting return_dropoff_airport address')
				this.quoteBotForm.patchValue({
					return_dropoff_airport: '',
					return_dropoff_airport_name: ''
				})
				break
			case 'dropoff_address':
				this.quoteBotForm.patchValue({
					dropoff_address: '',
					dropoff_address_lat: '',
					dropoff_address_long: '',
					return_pickup_address: '',
					return_pickup_address_lat: '',
					return_pickup_address_long: '',
				})
				break
			case 'pickup_airport':
				this.quoteBotForm.patchValue({
					pickup_airport: '',
					pickup_airport_lat: '',
					pickup_airport_long: '',
					return_dropoff_airport: '',
					return_dropoff_airport_lat: '',
					return_dropoff_airport_long: '',
				})
				break
			case 'dropoff_airport':
				this.quoteBotForm.patchValue({
					dropoff_airport: '',
					dropoff_airport_lat: '',
					dropoff_airport_long: '',
					return_pickup_airport: '',
					return_pickup_airport_lat: '',
					return_pickup_airport_long: ''
				})
				break
			case 'return_pickup_address':
				this.quoteBotForm.patchValue({
					return_pickup_address: ''
				})
				break
			case 'return_pickup_airport':
				this.quoteBotForm.patchValue({
					return_pickup_airport: ''
				})
				break
			case 'return_dropoff_address':
				this.quoteBotForm.patchValue({
					return_dropoff_address: ''
				})
				break
			case 'return_dropoff_airport':
				this.quoteBotForm.patchValue({
					return_dropoff_airport: ''
				})
				break
		}
	}



	/**
	 * Change quotebot type
	 * 
	 * @param quoteBotType type to change to
	 */
	quoteBotSwitch(quoteBotType: string) {
		this.QBForm.service_type.setValue(quoteBotType)
		if (quoteBotType == 'round_trip') {
			this.fillReturnDetails()
		}
	}


	/**
	 * update values of specific function calls to form
	 */
	changeDetection = {
		pickupDate: (value: any) => {
			this.SetFormValue('pickup_date', value)
		},
		pickupTime: (event: any = null, form_control: string) => {
			if (event == null) {
				return ''
			}
			console.log('Pickup Time Event: ', event.target.value)
			this.SetFormValue(form_control, event.target.value)
		},
		return_pickup_date: (value: any) => {
			this.SetFormValue('return_pickup_date', value)
		},

		bookingHours: (event: any) => {
			this.SetFormValue('booking_hours', event.target.value)
		}
	}

	locationInfo(rows: Array<any>, index: number) {
		let group = this.formBuilder.group({
			distance: [rows[index].elements[index].distance.value, Validators.required],
			duration: [rows[index].elements[index].duration.value, Validators.required]
		})
		console.log(group)
		return group
	}

	calculateDistance(pickup_coordinates: string | any[], dropoff_coordinates: string | any[]) {
		console.group(`\n\nCalculating Distance between\n\n`, pickup_coordinates, dropoff_coordinates)
		const newPromise = new Promise((resolve, reject) => {
			this.mapsAPILoader.load().then(() => {
				const distanceMatrixService = new google.maps.DistanceMatrixService()

				// generate request for distance matrix service
				const request = {
					origins: [pickup_coordinates[0]],
					destinations: [dropoff_coordinates[0]],
					travelMode: google.maps.TravelMode.DRIVING,
					unitSystem: google.maps.UnitSystem.METRIC,
					avoidHighways: false,
					avoidTolls: false
				}

				if (pickup_coordinates.length > 1 || dropoff_coordinates.length > 1) {
					request.origins = [pickup_coordinates[0], pickup_coordinates[1]]
					request.destinations = [dropoff_coordinates[0], dropoff_coordinates[1]]
				}

				// get distance matrix of that route
				distanceMatrixService.getDistanceMatrix(request, (response) => {
					console.log(response)
					if (response) {
						try {
							if ((response.rows[0].elements[0].status == 'ZERO_RESULTS') || (pickup_coordinates.length > 1 && response.rows[1].elements[1].status == 'ZERO_RESULTS')) {
								reject('InvalidLocationPoints')
								return
							}
							// push into the desired field
							(<FormArray>this.QBForm.location_info).push(this.formBuilder.group({
								distance: [response.rows[0].elements[0].distance, Validators.required],
								duration: [response.rows[0].elements[0].duration, Validators.required]
							}));
							if (response.rows.length > 1) {
								(<FormArray>this.QBForm.location_info).push(this.formBuilder.group({
									distance: [response.rows[1].elements[1].distance, Validators.required],
									duration: [response.rows[1].elements[1].duration, Validators.required]
								}));
							}
							resolve(true)
							return
						} catch (err) {
							reject(err)
							return
						}
					}
				})
			}, (error) => {
				console.log('Error while calculating distance. \n', error)
			})
			return
		})
		console.groupEnd()
		return newPromise
	}

	ValidateForm(form: FormGroup) {
		// remove return keys for other than round_trip
		if (form.get('service_type').value == "one_way" || form.get('service_type').value == 'charter_tour') {
			console.log('Removing Controls ...')
			for (const key in form.controls) {
				if (key.includes('return_')) {
					// clear all validators 
					this.quoteBotForm.removeControl(key)
					this.quoteBotForm.updateValueAndValidity()
				}
			}


			if (form.get('pickup_type').value == 'airport') {
				this.clearValidatorsAndReset(['pickup_address', 'pickup_address_lat', 'pickup_address_long'])
			}
			else if (this.QBForm.dropoff_type.value == 'airport') {
				this.clearValidatorsAndReset(['dropoff_address', 'dropoff_address_lat', 'dropoff_address_long'])
			}
			else if (this.QBForm.pickup_type.value != 'airport') {
				this.clearValidatorsAndReset(['pickup_airport', 'pickup_airport_lat', 'pickup_airport_long'])
			}
			else {
				this.clearValidatorsAndReset(['dropoff_airport', 'dropoff_airport_lat', 'dropoff_airport_long'])
			}
			this.quoteBotForm.updateValueAndValidity()
		}
	}
	clearValidatorsAndReset(arr: Array<string>) {
		arr.forEach((item: string) => {
			this.quoteBotForm.get(item).clearValidators()
			this.quoteBotForm.get(item).reset()
		})
	}

	async fileTheQuote() {
		this.submitted = true
		this.ValidateForm(this.quoteBotForm)

		console.log(this.quoteBotForm);

		// enter only if values excluding location_info presents invalid status
		if (this.quoteBotForm.invalid && this.QBForm.location_info.valid) {
			console.log(this.quoteBotForm)
			return
		}



		// calculate distance and duration of locations entered and wait before navigating to next page for successful operation 
		// intialize array instances of coordinates
		let pickup_coordinates = []; let dropoff_coordinates = []

		let a = this.QBForm.pickup_type.value,
			b = this.QBForm.dropoff_type.value

		// -------------------- if airport ?? ------------------
		if (a == 'airport') {
			pickup_coordinates.push({
				lat: this.QBForm.pickup_airport_lat.value,
				lng: this.QBForm.pickup_airport_long.value
			})
		} else {
			// push for address
			pickup_coordinates.push({
				lat: this.QBForm.pickup_address_lat.value,
				lng: this.QBForm.pickup_address_long.value
			})
		}

		if (b == 'airport') {
			dropoff_coordinates.push({
				lat: this.QBForm.dropoff_airport_lat.value,
				lng: this.QBForm.dropoff_airport_long.value
			})
		} else {
			//  push for address
			dropoff_coordinates.push({
				lat: this.QBForm.dropoff_address_lat.value,
				lng: this.QBForm.dropoff_address_long.value
			})
		}

		if (this.QBForm.service_type.value == 'round_trip') {
			if (a == 'airport') {
				dropoff_coordinates.push({
					lat: this.QBForm.return_dropoff_airport_lat.value,
					lng: this.QBForm.return_dropoff_airport_long.value
				})
			} else {
				dropoff_coordinates.push({
					lat: this.QBForm.return_dropoff_address_lat.value,
					lng: this.QBForm.return_dropoff_address_long.value
				})
			}
			if (b == 'airport') {
				pickup_coordinates.push({
					lat: this.QBForm.return_pickup_airport_lat.value,
					lng: this.QBForm.return_pickup_airport_long.value
				})
			} else {
				pickup_coordinates.push({
					lat: this.QBForm.return_pickup_address_lat.value,
					lng: this.QBForm.return_pickup_address_long.value
				})
			}
		}

		console.log(pickup_coordinates, dropoff_coordinates)
		// return


		this.spinner.show();
		// finally calculate the distance between the coordinates and proceed after success only else show error
		(pickup_coordinates.length > 0 || dropoff_coordinates.length > 0) && this.calculateDistance(pickup_coordinates, dropoff_coordinates).then((response: any) => {
			//store data in localstorage after succesfully sending request to backend 
			this.quoteBotForm.value['other_details'] = this.vars

			console.log(`\n\n\n Receiving Response after filing the quote .....\n ${response} \n\n\n`, this.quoteBotForm.value)
			localStorage.setItem('quotebot_form', JSON.stringify(this.quoteBotForm.value));
			this.router.navigate(['quotebot/select-vehicle']);
			return
		}, (error) => {
			console.group('Facing Some Issues while calculating distance .... Error fetched ->\n')
			console.warn(error)
			console.log('\n ------ Quote Bot Form ------- \n', this.quoteBotForm.value)
			this.errorDialogService.openDialog({
				errors: {
					error: "Please provide valid location points."
				}
			})
			console.groupEnd()
		})
		this.spinner.hide()





	}

	swapPickupDropoff(value: any) {
		try {
			this.spinner.show()
			let temp_dropoff = {
				dropoff_address: this.quoteBotForm.get('dropoff_address')?.value,
				dropoff_airport: this.quoteBotForm.get('dropoff_airport')?.value,
				dropoff_airport_name: this.ReturnNameOfAirportById(this.quoteBotForm.get('dropoff_airport')?.value),
				dropoff_airport_lat: this.quoteBotForm.get('dropoff_airport_lat')?.value,
				dropoff_airport_long: this.quoteBotForm.get('dropoff_airport_long')?.value,
				dropoff_address_lat: this.quoteBotForm.get('dropoff_address_lat')?.value,
				dropoff_address_long: this.quoteBotForm.get('dropoff_address_long')?.value,
			}
			this.quoteBotForm.patchValue({
				pickup_type: this.quoteBotForm.get('dropoff_type')?.value,
				dropoff_type: this.quoteBotForm.get('pickup_type')?.value,
	
				dropoff_airport: this.quoteBotForm.get('pickup_airport')?.value,
				dropoff_airport_name: this.ReturnNameOfAirportById(this.quoteBotForm.get('pickup_airport')?.value),
				dropoff_address: this.quoteBotForm.get('pickup_address')?.value,
				dropoff_airport_lat: this.quoteBotForm.get('pickup_airport_lat')?.value,
				dropoff_airport_long: this.quoteBotForm.get('pickup_airport_long')?.value,
				dropoff_address_lat: this.quoteBotForm.get('pickup_address_lat')?.value,
				dropoff_address_long: this.quoteBotForm.get('pickup_address_long')?.value,
				pickup_address: temp_dropoff?.dropoff_address,
				pickup_airport: temp_dropoff?.dropoff_airport,
				pickup_airport_name: temp_dropoff?.dropoff_airport_name,
				pickup_airport_lat: temp_dropoff?.dropoff_airport_lat,
				pickup_airport_long: temp_dropoff?.dropoff_airport_long,
				pickup_address_lat: temp_dropoff?.dropoff_address_lat,
				pickup_address_long: temp_dropoff?.dropoff_address_long,
	
	
				return_pickup_airport: this.quoteBotForm.get('return_dropoff_airport')?.value,
				return_pickup_airport_name: this.quoteBotForm.get('return_dropoff_airport_name')?.value,
				return_pickup_address: this.quoteBotForm.get('return_dropoff_address')?.value,
				return_dropoff_airport: this.quoteBotForm.get('return_pickup_airport')?.value,
				return_dropoff_airport_name: this.quoteBotForm.get('return_pickup_airport_name')?.value,
				return_dropoff_address: this.quoteBotForm.get('return_pickup_address')?.value,
				return_pickup_airport_lat: this.quoteBotForm.get('return_dropoff_airport_lat')?.value,
				return_pickup_airport_long: this.quoteBotForm.get('return_dropoff_airport_long')?.value,
				return_pickup_address_lat: this.quoteBotForm.get('return_dropoff_address_lat')?.value,
				return_pickup_address_long: this.quoteBotForm.get('return_dropoff_address_long')?.value,
				return_dropoff_airport_lat: this.quoteBotForm.get('return_pickup_airport_lat')?.value,
				return_dropoff_airport_long: this.quoteBotForm.get('return_pickup_airport_long')?.value,
				return_dropoff_address_lat: this.quoteBotForm.get('return_pickup_address_lat')?.value,
				return_dropoff_address_long: this.quoteBotForm.get('return_pickup_address_long')?.value,
			})
			
		} catch (error) {
			this.spinner.hide()
			console.log(error)
		}
		// need to set values of vars
		this.vars = {
			dropoff_airport_name: this.ReturnNameOfAirportById(this.quoteBotForm.get('dropoff_airport')?.value),
			pickup_airport_name: this.ReturnNameOfAirportById(this.quoteBotForm.get('pickup_airport')?.value),
		}
		// if round trip selected

		if (this.QBForm.service_type.value == 'round_trip') {
			this.vars['return_dropoff_airport_name'] = this.vars['pickup_airport_name']
			this.vars['return_pickup_airport_name'] = this.vars['dropoff_airport_name']
		}
		this.spinner.hide()

	}
	ReturnNameOfAirportById(id: any) {
		let airport = this.airports_data.find((item) => item.id == id)
		console.log('airport found-->>>',id,airport)
		return airport ? airport.airport : ''
	}



	// --------------------------------- 	Quotebot Data Ends 	----------------------------------------------










	//modal values
	modalSwitch(modalType, onRefresh = null) {
		switch (modalType) {
			case 'modal_1': {
				this.modalInformation = true;
				this.selectedModal = 'modal_1';
				this.modalHeading = "The Best Drivers and Nicest Vehicles";
				this.modalInstructions = "1-800-LIMO.COM’s mission is to match the best drivers with the best customers. Like any business,great drivers are hard to come by and keep. Drivers want to serve you but they are also in business to earn a living wage. We believe in offering our drivers and customers the opportunity to serve each other in the best partnership possible. Our drivers want to give you the safest and smoothest ride in a nicer, larger vehicle that they take pride in owning and maintaining. <br> If you don’t like a particular driver, no worries, we’ll match the right driver for next time. We don’t fire drivers, you do. Rate your driver with a thumbs for a great ride. Rate your driver thumbs down and let us know the details. Is it major or minor? Minor can be fixed, but a major problem will get immediate action to fix or inactive the driver. <br> We want all of our drivers to go the extra mile and give you a great experience. We encourage them to help you with your luggage to and from the vehicle, assist with the door if you prefer and just be as helpful as possible. If you’re from out of town, we encourage our drivers to know the best sights to see, dine out and the best hot spots. It doesn’t matter if you are abled or disabled, our drivers will treat you with respect and courtesy. <br> Drivers will carry insurance determined by local regulations.";
				break;
			}
			case 'modal_2': {
				this.modalInformation = true;
				this.selectedModal = 'modal_2';
				this.modalHeading = "Strong Background Checks, Fingerprinting and Vehicle Inspections";
				this.modalInstructions = "We believe our clients deserve to feel safe no matter which vehicle, driver or rate they choose. We pride ourselves in the fact that all of our drivers follow all local city, state and country regulations to insure you only get the best. Our drivers must pass our thorough requirement’s along with their vehicles passing bi-annual/annual safety inspections. We like demanding clients because we’re demanding too.";
				break;
			}
			case 'modal_3': {
				this.modalInformation = true;
				this.selectedModal = 'modal_3';
				this.modalHeading = "The Best Value";
				this.modalInstructions = "Our Quotebot is easy to use to find a rate. Rates are based primarily by size of the vehicle and number of passenger/luggage. We use Google Maps to estimate route and distance. We are not like other TNC that also charge you time like a taxi meter. <br> Just enter the pickup and drop off address and number of passengers and luggage. Our bot will recommend the best group of vehicles and rates that are acceptable to you. Ride by budget or ride in maximum comfort. Everyone is different! We will never Surge Price you and the quote is an all-inclusive rate. We do our best to figure taxes and tolls. Waiting time, extra stops and any other in route requests will be additional. You can touch the Pay button with the final total before you exit your vehicle for on-demand rides. Prearranged rides are prepaid and nothing to do but say thanks to your driver. <br> Our unique algorithm is designed to offer you the lowest available rate for any type vehicle,for any number of passengers, for any time you need quality transportation. We do allow our drivers to charge slightly higher rates during early morning, late night, holidays, high demand times and days of the week. But you will always see the lowest available rates.";
				break;
			}
			case 'modal_4': {
				this.modalInformation = true;
				this.selectedModal = 'modal_4';
				this.modalHeading = "Consistent Quality Service";
				this.modalInstructions = "Other TNCs claim to be Good, Fast and Cheap. We all know you can’t be all three and most would be happy to choose only two and hope for the best. <br> What’s the point of being in business if you’re not consistently Good, Cheap, or Fast? You can’t	afford to be late for a meeting, a plane, or a group or business event! You don’t want to over pay, ever! You want service to be consistent! Does your TNC do all three? How about two? <br> 1-800-LIMO.COM’s only goal is to be Good, all of the time, for worry-free transportation! <br> <strong>Fast Invoicing</strong> Just get in and go. You’ll get a very accurate all-inclusive rate when you book a ride and you’ll get a receipt by the time you exit your ride. We started the cashless transaction 16 years ago. You’ll know the total cost of your ride before leaving your vehicle. Just click the Pay button. <br> If your driver blows you away with kindness and personality, tip your driver extra in cash or on the app, and you can request that same great driver whenever you travel. What could be better than an extra tip and a repeat booking? We love clients like you and share that love and let	your friends know how good we are.";
				break;
			}
		}
		if (!onRefresh) {
			$('#myModal').modal('show');
		}
	}

	// fragment
	scroll(el: HTMLElement) {
		el.scrollIntoView();
	}

	//increment/decrement in ONE WAY form
	change(changeType: 'i' | 'd', fieldName: 'l' | 'p') {
		let max_length = 75
		if (fieldName == 'p') {
			// for passenger
			$('#no_of_passenger').addClass('highlight-text')
			setTimeout(() => {
				$('#no_of_passenger').removeClass('highlight-text')
			}, 1000)
			if (changeType == 'i' && this.quoteBotForm.value.no_of_passenger < max_length) {
				this.QBForm.no_of_passenger.setValue(this.quoteBotForm.value.no_of_passenger + 1)
			} else if (changeType == 'd' && this.quoteBotForm.value.no_of_passenger > 1) {
				this.QBForm.no_of_passenger.setValue(this.quoteBotForm.value.no_of_passenger - 1)
			}
		} else {
			// for luggage
			$('#no_of_luggage').addClass('highlight-text')
			setTimeout(() => {
				$('#no_of_luggage').removeClass('highlight-text')
			}, 1000)
			if (changeType == 'i' && this.quoteBotForm.value.no_of_luggage < max_length) {
				this.QBForm.no_of_luggage.setValue(this.quoteBotForm.value.no_of_luggage + 1)
			} else if (changeType == 'd' && this.quoteBotForm.value.no_of_luggage >= 1) {
				this.QBForm.no_of_luggage.setValue(this.quoteBotForm.value.no_of_luggage - 1)
			}
		}
	}


	// loginbuttons
	loginButtons(role: string) {
		if (role != 'driver' && role != 'sub_admin') {
			this.errorDialogService.openDialog({
				errors: {
					error: 'Currently only Drivers are allowed to Sign In. User accounts coming soon! Recruiting quality vetted drivers, and chauffeurs, only at this time. Refer a trusted driver/ chauffeur to 1-800 - LIMO.COM now! You deserve the best.'
				}
			})
			return
		}
		//navigate to login screen
		this.router.navigateByUrl('/login/' + role);
	}

	get fGetInTouch() { return this.getInTouchForm.controls; }
	onSubmitGetInTouch() {
		console.log(this.getInTouchForm);
		this.submitted = true;
	}

	clearField() {
		$('#clearInput').value = '';
		console.log("clear 1415155")
	}


	// UNUSABLE
	onReset() {
		this.submitted = false;
		this.quoteBotForm.reset();
	}

	dashboard(role) {
		if (role == 'affiliate') {
			let isAffiliate_approved = localStorage.getItem('account_approval')
			this.spinner.show();//show spinner
			if (isAffiliate_approved == "accepted") {
				this.router.navigateByUrl('/affiliate/my-bookings');
			}
			else {
				this.router.navigateByUrl('/affiliate');
				console.log("step 0  dashboard")
			}
		}
		else if (role == 'admin') {
			this.spinner.show();//show spinner
			this.router.navigateByUrl('/admin/daily-bookings-admin');
			console.log("step 0  dashboard");

		}
	}

	logout() {
		this.spinner.show();//show spinner
		this.authService.logout()
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(({ success }: any) => {
				this.spinner.hide();//hide spinner
				if (success) {
					this.stateManagementService.removeUser();
					this.router.navigate(['/home']);
					location.reload()
					console.log("Logout Successfully");
				}
			});
	}
}





