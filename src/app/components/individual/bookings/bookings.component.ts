import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AffiliateService } from 'src/app/services/affiliate.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { TravelAgentService } from 'src/app/services/travel-agent.service';
import { DatePickerComponent } from '../../shared/date-picker/date-picker.component';
import { HttpClient } from '@angular/common/http';
import { IndividualService } from 'src/app/services/individual.service';
declare var $: any;

@Component({
	selector: 'app-bookings',
	templateUrl: './bookings.component.html',
	styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {

	@ViewChild('inputmsg', { static: false }) message: ElementRef;
	@ViewChild('sendEmailModalFocus') sendEmailModalFocus: any;
	exampleHeader = DatePickerComponent

	color: ThemePalette = 'primary';
	outputDateFormat = 'YYYY-MM-DD';
	public totalRecords: any;
	public firstPage: Number;
	public lastPage: Number;
	public totalPage: Number;
	public currentPage: any;
	submittedForm: boolean;
	public from: Number;
	public to: Number;
	public path: string;
	public firstPageUrl: string;
	public lastPageUrl: string;
	public prevPageUrl: string;
	public nextPageUrl: string;
	public bookingsRes: any;
	public bookings: any;
	public bookingStatusColor: string;
	public startDate: string;
	public endDate: string;
	public date: Date;
	public changeStatusForm: FormGroup;
	inviteAgentForm: FormGroup;
	public sendEmailForm: FormGroup;
	public submitted: boolean = false;
	passengerDetails: any;
	sendMessageField: boolean;
	sendInformation: any;
	reciptentName: any;
	notification_msg: any;
	noError: boolean = false;
	searchText: string = "";
	timer: any
	isAffiliate: boolean = false
	isLooseAffiliate: boolean = false;
	audit_Trail: any;
	company_name: any = JSON.parse(localStorage.getItem('currentUser'))?.affiliate_company || ''
	cancelBookingId: any = null
	useDateFilter: boolean = true;
	shareArray: any;
	rates_preview: any;
	adminSharePercent: number;
	currentUser: any;
	cardDetails: any;
	response: any;
	paymentMethod: string = 'card';
	selectedCard: any;
	bookingId: any;
	responseRate: any;
	rateArray: any;

	constructor(
		private affiliateService: AffiliateService,
		private travelAgentService: TravelAgentService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
		private formBuilder: FormBuilder,
		private individualService: IndividualService,
		private http: HttpClient) { }

	ngOnInit(): void {

		this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
		let date = new Date();
		// Set Search Filters According to cookies or the intial state
		this.startDate = this.affiliateService.checkCookie('indv_startDate') ?
			this.affiliateService.getCookie('indv_startDate') :
			date.toISOString().substring(0, 10);

		date.setDate(date.getDate() + 7);
		this.endDate = this.affiliateService.checkCookie('indv_endDate') ?
			this.affiliateService.getCookie('indv_endDate') :
			date.toISOString().substring(0, 10);

		this.searchText = this.affiliateService.checkCookie('indv_search') ?
			this.affiliateService.getCookie('indv_search')
			: "";

		this.useDateFilter = localStorage.getItem('indvUseDateFilter') ?
			(localStorage.getItem('indvUseDateFilter') == 'true' ? true : false)
			: true;
		if (this.currentUser?.roleName == 'sub_travel_agent') {
			this.useDateFilter = false;
			localStorage.setItem('indvUseDateFilter', 'false')
		}
		console.log('indvUseDateFilter-->', this.useDateFilter)

		this.loadBookings();

		this.changeStatusForm = this.formBuilder.group({
			reservation_id: ['', Validators.required],
			booking_status: ['', Validators.required]
		});

		//send email booking form validation
		this.sendEmailForm = this.formBuilder.group({
			reservation_id: ['', Validators.required],
			emailTarget: ['', Validators.required]
		});

		$("#search-field-my-booking").addClass("box-outline")
	}

	ngAfterViewInit(): void {
		$("#search-field-my-booking").addClass("box-outline")
	}


	scroll(id) {
		let el = document.getElementById(id);
		console.log(`scrolling to ${id}`, el);
		el.scrollIntoView({ behavior: 'smooth' });
	}

	loadBookings(pageUrl = null) {
		$('.HeadingH1').css({ display: "none" })
		/** spinner starts on init */
		if (pageUrl) {
			console.log("pageurl", pageUrl)
			this.scroll('indv_bookings_table')
		}
		this.spinner.show();

		// var keyword = ((document.getElementById("keyword") as HTMLInputElement).value);
		// Load Our bookings using API
		this.individualService.loadBookings(pageUrl, this.searchText, this.startDate, this.endDate, this.useDateFilter).then(result => {
			this.spinner.hide()
			this.bookingsRes = result;
			this.bookings = this.bookingsRes?.data?.data;
			this.totalRecords = this.bookingsRes?.data?.total;
			this.noError = false
			this.firstPage = 1;
			this.lastPage = this.bookingsRes?.data?.last_page;
			this.totalPage = this.bookingsRes?.data?.last_page;
			this.currentPage = this.bookingsRes?.data?.current_page;
			this.from = this.bookingsRes?.data?.from;
			this.to = this.bookingsRes?.data.to;
			this.path = this.bookingsRes?.data?.path;
			this.firstPageUrl = this.bookingsRes?.data?.first_page_url;
			this.lastPageUrl = this.bookingsRes?.data?.last_page_url;
			this.prevPageUrl = this.bookingsRes?.data?.prev_page_url;
			this.nextPageUrl = this.bookingsRes?.data?.next_page_url;
			console.log('result------------------------->>>', result)
			
		})
			.catch(err => {
				this.spinner.hide();//hide spinner
			});
	}

	FormatDate(date: string) {
		return moment(date).format("ll");
	}
	searchInBookings(search_value: string) {
		this.searchText = search_value
		console.log('--->>>>>', search_value)
		this.saveCookie('indv_search', search_value)
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			this.loadBookings(null)
		}, 700)
	}

	highlighText(args: string) {
		if (!this.searchText) { return args; }
		if (args) {
			args = args.toString()
			var re = new RegExp(this.searchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
			return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
		}
	}
	saveCookie(key: string, value: string) {
		console.log('in function set cookies for', key, value)
		this.affiliateService.setCookie(key, value, 30);
	}
	formatPhoneNumber(ph: any) {
		if (!ph.includes('+')) {
			return '+' + ph
		}
		return ph;

	}

	reset() {
		let date = new Date();
		this.startDate = date.toISOString().substring(0, 10);
		date.setDate(date.getDate() + 7);
		this.endDate = date.toISOString().substring(0, 10);
		this.affiliateService.deleteCookie('indv_startDate')
		this.affiliateService.deleteCookie('indv_endDate')
		this.affiliateService.deleteCookie('indv_search')
		// this.affiliateService.deleteCookie('filtertype')
		this.searchText = "";
		localStorage.removeItem('indvUseDateFilter')
		this.useDateFilter = true
		// this.filtertype = 'bookingid';

		console.log('Reset Successfully. ');
	}

	handleChangeCheckbox(value: any) {
		console.log('event---->> ', value)
		this.useDateFilter = value
		// this.saveCookie('useDateFilter',value)
		localStorage.setItem('indvUseDateFilter', value)
		this.loadBookings();
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
	auditTrail(bookingId: any) {
		console.log('In function audit trail', bookingId)
		this.spinner.show()
		this.travelAgentService.auditTrailInfo(bookingId)
			.pipe(
				catchError((err) => {
					return throwError(err);
				})
			)
			.subscribe((response: any) => {
				this.spinner.hide()
				console.log('audit trail --->>>>>>>>', response)
				this.audit_Trail = response.data
				// $("#AuditTrailModal").modal("hide");
			});
	}

	bookingPreview: any;
	showBookingPreviewModal(booking_id: number) {
		console.log("hii im here")
		this.spinner.show()
		this.individualService.getBookingPreview(booking_id)
			.pipe(
				catchError((err) => {
					this.spinner.hide(); //hide spinner
					return throwError(err);
				})
			).subscribe((response: any) => {
				console.log("respinse", response.data)
				this.bookingPreview = response.data;
				if (this.bookingPreview?.account_type == 'travel_planner' && this.bookingPreview?.created_by != 1) {
					console.log("in if created by ta")
					this.adminSharePercent = 15
				}
				else {
					console.log("in if created by admin")
					this.adminSharePercent = 25
				}
				if (this.bookingPreview?.payment_status == "unpaid") {

					console.log("in if share array", this.bookingPreview.affiliate_type === 'affiliate' && this.bookingPreview.payment_status == 'unpaid' && this.bookingPreview?.share_array?.length != 0)
					this.shareArray = this?.bookingPreview?.share_array

					this.rates_preview = this.bookingPreview?.rates_preview;
				}
				this.isAffiliate = this.bookingPreview.affiliate_type == "affiliate" ? true : false;
				this.isLooseAffiliate = this.bookingPreview.affiliate_type == "loose_affiliate" ? true : false;
				this.bookingPreview['booking_instructions'] = this.bookingPreview?.booking_instructions.replaceAll('<br />', ' ')
				console.log('get preview data-->>>', this.bookingPreview.affiliate_type, this.isAffiliate)
				$('#previewBookingOnID').modal('show');
				this.spinner.hide();
			})
	}


	handleKeypressEvents() {
		clearTimeout(this.timer)
	}


	closeModal() {
		this.message.nativeElement.value = ""
		this.show = false
	}
	messageField(format) {
		this.show = true;
		switch (format) {
			case "Phone": {
				this.sendMessageField = true;
				break;
			}
			case "Email": {
				this.sendMessageField = false;
				break;
			}
		}
	}



	submit(message, format) {
		console.log('format', format, this.passengerDetails)
		if (this.passengerDetails.selection_button == "Passenger") {
			this.sendInformation = format
				? this.passengerDetails.pax_tel
				: this.passengerDetails.passenger_email;
			this.reciptentName = this.passengerDetails.passenger_name;
		} else if (this.passengerDetails.selection_button == "Driver") {
			console.log('driver')
			this.sendInformation = format
				? this.passengerDetails?.driver_cell_isd +
				this.passengerDetails?.driver_cell_number
				: this.passengerDetails?.driver_email ? this.passengerDetails?.driver_email : this.passengerDetails?.dispatchEmail;
			this.reciptentName = this.passengerDetails?.driver_name;
		}
		else {
			this.sendInformation = format
				? this.passengerDetails.loose_affiliate_phone_isd +
				this.passengerDetails.loose_affiliate_phone
				: this.passengerDetails.loose_affiliate_email;
			this.reciptentName = this.passengerDetails.loose_affiliate_name;
		}
		let obj = {
			bookingId: this.passengerDetails.booking_id,
			reciptentName: this.reciptentName,
			sendTo: this.passengerDetails.selection_button,
			sendThrough: format ? "Phone" : "Email",
			sendValue: this.sendInformation,
			sendContent: message,
		};
		console.log('submit modal values---->>', obj)
		this.travelAgentService.travelAgentNotification(obj)
			.pipe(
				catchError((err: any) => {
					console.log('err------->>>>>>>', err)
					return throwError(err)
				})
			).subscribe(({ message }: any) => {
				this.notification_msg = message;
				$("#notificationModal").modal("show");
				$("textarea").val("");
			})
		$("#closeModal").click(() => {
			$("#notificationModal").modal("hide");
		});
		$("#closeModal1").click(() => {
			$("#notificationModal").modal("hide");
		});
		this.message.nativeElement.value = ""
		this.show = false
	}


	//for pagination
	counter() {
		var currentPage;
		var startFrom;
		var endTo;

		if (this.currentPage < 5) {
			startFrom = 0;
			endTo = this.totalPage;
		}
		else if (this.currentPage < this.totalPage) {
			currentPage = this.currentPage
			endTo = currentPage + 1;
			startFrom = endTo - 5;
		}
		else {
			endTo = this.totalPage;
			startFrom = endTo - 5;
		}

		var i;
		var udpArr = new Array();
		for (i = startFrom; i < endTo; i++) {
			udpArr.push(i + 1);
		}
		return udpArr;
	}

	changeDate(dateType, date) {
		if (dateType == 'startDate') {
			this.startDate = date;
		}
		else {
			this.endDate = date;
		}
	}
	dateFormat(value: any) {
		return moment(value, 'YYYY-MM-DD').format('ll')
	}

	dateFormat2(value: any) {
		return moment(value, 'YYYY-MM-DD').format('L')
	}
	FormatTime(time: string) {
		return moment(time, "HH:mm:ss").format("LT");
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

	show = false
	openModal(booking: any, selection_button: string) {
		try {
			setTimeout(() => {
				// $('textarea').attr('autofocus', 'autofocus');
				this.sendEmailModalFocus.nativeElement.querySelector('textarea').focus();
			}, 1000)
		} catch (error) {
			console.log('----------error------->>>>>> ', error)

		}
		console.log('open modal-->>>>>>>', booking, selection_button)
		this.passengerDetails = booking;
		this.passengerDetails['selection_button'] = selection_button
	}


	editAction(bookingId, updateType) {
		if (updateType == 'change') {
			this.router.navigate([`/${this.currentUser?.roleName}/create-new-booking`], { queryParams: { bookingId: bookingId, updateType: updateType, nav: 'true' } });
		}
		else {
			this.router.navigate([`/${this.currentUser?.roleName}/create-new-booking`], { queryParams: { bookingId: bookingId, updateType: updateType, nav: 'true' } });
		}
	}

	emailPassenger() {
		console.log('In function email passenger', this.sendEmailForm.value.reservation_id)
		let data = {
			reservation_id: this.sendEmailForm.value.reservation_id
		}
		this.spinner.show()
		this.travelAgentService.passengerBooking(data)
			.pipe(
				catchError((err) => {
				this.spinner.hide()
				return throwError(err);
				})
			)
			.subscribe((response: any) => {
				console.log('response--------->>>>>>>>', response)
				this.spinner.hide()
				$("#emailPassenger").modal("hide");
			});
	}
	emailAll() {
		console.log('In function email all', this.sendEmailForm.value.reservation_id, this.sendEmailForm.value.emailTarget)
		let data = {
			reservation_id: this.sendEmailForm.value.reservation_id
		}
		this.spinner.show()
		this.travelAgentService.bookingEmailAll(data)
			.pipe(
				catchError((err) => {
					this.spinner.hide()
					return throwError(err);
				})
			)
			.subscribe((response: any) => {
				console.log('response--------->>>>>>>>', response)
				this.spinner.hide()
				$("#emailAll").modal("hide");
			});
	}

	returnRepeatAction(bookingId, actionType) {
		console.log(actionType, bookingId,);

		if (actionType == 'return') {
			this.router.navigate([`/${this.currentUser?.roleName}/create-new-booking`], { queryParams: { bookingId: bookingId, updateType: 'return' } });
		}
		else {
			this.router.navigate([`/${this.currentUser?.roleName}/create-new-booking`], { queryParams: { bookingId: bookingId, updateType: 'repeat' } });
		}
	}

	get changeStatusF() {
		return this.changeStatusForm.controls;
	}


	submitChangeStatusForm() {
		this.submitted = true;
		console.log(this.changeStatusForm);
		// stop here if form is invalid
		if (this.changeStatusForm.invalid) {
			return;
		}

		this.spinner.show();

		this.affiliateService.changeStatusBooking(this.changeStatusForm.value)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					$('#change_status_booking_Modal').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) => {
				if (success == true) {
					this.spinner.hide();//hide spinner
					$('#change_status_booking_Modal').modal('hide');
					this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
						this.router.navigate([`/${this.currentUser?.roleName}/bookings`]);
					});
				}
			});
	}


	sendEmailClicked(bookingId, emailTarget) {
		this.sendEmailForm.patchValue({
			reservation_id: bookingId,
			emailTarget: emailTarget
		});
	}

	emailForm() {
		this.submitted = true;
		console.log(this.sendEmailForm);
		// stop here if form is invalid
		if (this.sendEmailForm.invalid) {
			return;
		}

		this.spinner.show();

		this.travelAgentService.sendEmail(this.sendEmailForm.value)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					$('#emailModal').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) => {
				if (success == true) {
					this.spinner.hide();//hide spinner
					$('#emailModal').modal('hide');
					this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
						this.router.navigate([`/${this.currentUser?.roleName}/bookings`]);
					});
				}
			});
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

	showLocationPointOnMap(booking_id: number, type: string) {

		let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		console.log('isSafari', isSafari)
		// this.spinner.show()
		this.travelAgentService.getLocationPoints(booking_id).subscribe((response: any) => {
			this.spinner.hide();
			if ("lat" in response?.data?.pickupDetail && "long" in response?.data?.pickupDetail && "lat" in response?.data?.dropoffDetail && "long" in response?.data?.dropoffDetail) {
				sessionStorage.setItem('pickup', JSON.stringify(response?.data?.pickupDetail.address));
				sessionStorage.setItem('dropoff', JSON.stringify(response?.data?.dropoffDetail.address));
				if (type == 'pickup') {
					const googleDirectionUrl = 'https://www.google.com/maps/dir/?api=1' + '&destination=' +
						encodeURIComponent(response?.data?.pickupDetail.address) + '&travelmode=driving'
					const iosDirectionUrl = 'http://maps.apple.com/?daddr=' +
						encodeURIComponent(response?.data?.pickupDetail.address)
					if (this.iOS()) {
						setTimeout(() => {
							window.location.href = iosDirectionUrl;
						})
					}
					else {
						window.open(googleDirectionUrl, '_blank');
					}
				}
				else if (type == 'dropoff') {
					const googleDirectionUrl = 'https://www.google.com/maps/dir/?api=1' + '&destination=' +
						encodeURIComponent(response?.data?.dropoffDetail.address) + '&travelmode=driving'
					const iosDirectionUrl = 'http://maps.apple.com/?daddr=' +
						encodeURIComponent(response?.data?.dropoffDetail.address)
					if (this.iOS()) {
						setTimeout(() => {
							window.location.href = iosDirectionUrl;
						})
					}
					else {
						window.open(googleDirectionUrl, '_blank');
					}
				}

			} else {
				throw new Error('Error: Location Points Not Specified Properly. ');
			}
		})
	}
	showLocationPointOnMapByAddress(address: any) {
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

	getIndividualCardDetails() {
		this.spinner.show()
		this.individualService.getIndividualAccountDetails()
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result => {
				this.response = result
				this.cardDetails = this.response?.data?.cards
				this.spinner.hide();//hide spinner

			});
	}
	payBooking(id) {
		this.bookingId = id
		this.showRatesArray()
		this.getIndividualCardDetails()
	}
	showRatesArray() {
		this.spinner.show()
		this.individualService.showRatesArray(this.bookingId)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result => {
				this.responseRate = result
				this.rateArray = this.responseRate?.data
				this.spinner.hide();//hide spinner

			});

	}

	handleChangeCard(card: any) {
		console.log("selected card",card)

		this.selectedCard = card
		console.log("selected card",this.selectedCard)
	}

	changeDetection(method: string) {
		this.paymentMethod = method
	}


	makePayment() {

		console.log('-----=====?>>>>>', this.cardDetails.length > 0)
		let dataToSend: any

		if(this.paymentMethod == 'card'){
			console.log('<<<<<----payment through card-->>>>',this.selectedCard?.ID,this.cardDetails[0]?.ID,this.bookingId,this.rateArray?.grandTotal)
			dataToSend = {
				isExistingCard: true,
				paymentMethod: 'credit_card',
				CreditCardsDetail: {
					cardID: this.selectedCard ? this.selectedCard?.ID : this.cardDetails[0]?.ID
				},
				reservation_id: this.bookingId,
				grand_total: this.rateArray?.grandTotal
			}
			console.log('selected card-->>>')
		}
		else{
			console.log('<<<<<----payment through cash-->>>>')
			dataToSend = {
				reservation_id: this.bookingId,
				grand_total: this.rateArray?.grandTotal,
				paymentMethod: 'cash'
			}
		}
			this.spinner.show()
			this.individualService.paymentProcessing(dataToSend).subscribe((response: any) => {
				$('#paymentModal').modal('hide')
				console.log(response)
				this.router.navigate([`/individual/invoice-summary`],{queryParams:{bookingId:this.bookingId}});

				console.log('response---------------------->>', response)
				this.spinner.hide()
			})
	}
}

