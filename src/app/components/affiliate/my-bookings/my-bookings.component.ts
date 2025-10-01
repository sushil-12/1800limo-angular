import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ErrorDialogService } from '../../../services/error-dialog/errordialog.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { GoogleMap } from '@angular/google-maps';
declare var $: any;

@Component({
	selector: 'app-my-bookings',
	templateUrl: './my-bookings.component.html',
	styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
	@ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
	@ViewChild('inputmsg', { static: false }) message: ElementRef;

	zoom = 7;
	mapCenter: google.maps.LatLngLiteral = { lat: 41.850033, lng: -87.6500523 };
	directionsRenderer!: google.maps.DirectionsRenderer;

	color: ThemePalette = 'accent';
	outputDateFormat = 'YYYY-MM-DD';
	public totalRecords: any;
	public firstPage: Number;
	public lastPage: Number;
	public totalPage: Number;
	public currentPage: any;
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
	useDateFilter: boolean = false;
	adminSharePercent: number;
	shareArray: any;
	rates_preview: any;
	currencySymbol: any;
	currentUser: any;
	vehiclesRes: any;
	numberOfVehicles: any;
	total_amount: any;
	net_total_amount: any;

	constructor(
		private affiliateService: AffiliateService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
		private stateManagementService: StateManagementService,
		private formBuilder: FormBuilder,
	) { }

	ngOnInit(): void {

		this.currentUser = JSON.parse(localStorage.getItem('currentUser'))

		let date = new Date();
		// Set Search Filters According to cookies or the intial state
		// this.startDate = this.affiliateService.checkCookie('affiliate_startDate') ?
		// 	this.affiliateService.getCookie('affiliate_startDate') :
		// 	date.toISOString().substring(0, 10);

		// date.setDate(date.getDate() + 7);
		// this.endDate = this.affiliateService.checkCookie('affiliate_endDate') ?
		// 	this.affiliateService.getCookie('affiliate_endDate') :
		// 	date.toISOString().substring(0, 10);

		this.startDate = date.toISOString().substring(0, 10);

		date.setDate(date.getDate() + 7);

		this.endDate = date.toISOString().substring(0, 10);


		this.searchText = this.affiliateService.checkCookie('affiliate_search') ?
			this.affiliateService.getCookie('affiliate_search')
			: "";

		this.useDateFilter = localStorage.getItem('farmInuseDateFilter') ?
			(localStorage.getItem('farmInuseDateFilter') == 'true' ? true : false)
			: false;
		console.log('farmInuseDateFilter-->', this.useDateFilter)

		//save currency symbol
		this.currencySymbol = this.stateManagementService.getCurrencySymbol();

		this.loadBookings();
		this.loadVehicles();

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

		// this.MapController()
	}

	ngAfterViewInit(): void {
		$("#search-field-my-booking").addClass("box-outline")
	}

	MapController() {
		console.log('Map has been initialised.')
		let origin: google.maps.LatLng;
		let destination: google.maps.LatLng;
		const waypoints: google.maps.DirectionsWaypoint[] = [];

		// Base values
		origin = new google.maps.LatLng(this.bookingPreview.pickup_latitude, this.bookingPreview.pickup_longitude);
		destination = new google.maps.LatLng(this.bookingPreview.dropoff_latitude, this.bookingPreview.dropoff_longitude);


		// Override based on transfer_type
		if (this.bookingPreview.transfer_type?.includes('airport_')) {
			origin = new google.maps.LatLng(this.bookingPreview.pickup_airport_latitude, this.bookingPreview.pickup_airport_longitude);
		}

		if (this.bookingPreview.transfer_type?.includes('_airport')) {
			destination = new google.maps.LatLng(this.bookingPreview.dropoff_airport_latitude, this.bookingPreview.dropoff_airport_longitude);
		}

		setTimeout(() => {
			this.drawMap({
				origin,
				destination,
				waypoints,
				optimizeWaypoints: true,
				travelMode: google.maps.TravelMode.DRIVING
			})
		}, 100)


		// this.drawMap({
		// 	origin,
		// 	destination,
		// 	waypoints,
		// 	optimizeWaypoints: true,
		// 	travelMode: google.maps.TravelMode.DRIVING
		// })

	}

	drawMap(request: google.maps.DirectionsRequest) {
		const directionsService = new google.maps.DirectionsService();
		this.directionsRenderer = new google.maps.DirectionsRenderer();

		const mapInstance = this.map.googleMap;
		if (!mapInstance) {
			console.error('Map is not initialized yet');
			return;
		}

		this.directionsRenderer.setMap(mapInstance);

		directionsService.route(request, (response, status) => {
			if (status === google.maps.DirectionsStatus.OK) {
				console.log('Directions loaded:', response);
				this.directionsRenderer.setDirections(response);
			} else {
				console.error('Directions request failed due to ' + status);
			}
		});
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


	loadBookings(pageUrl = null) {
		$('.HeadingH1').css({ display: "none" })
		/** spinner starts on init */
		if (pageUrl) {
			console.log("pageurl", pageUrl)
			this.scroll('bookings_affiliate')
		}
		this.spinner.show();

		// var keyword = ((document.getElementById("keyword") as HTMLInputElement).value);
		// Load Our bookings using API
		this.affiliateService.loadBookings(pageUrl, this.searchText, this.startDate, this.endDate, this.useDateFilter).then(result => {
			console.log('result------------------------->>>', result)
			let date = new Date();
			let timestamp = date.getTime();
			date.setDate(date.getDate() + 7);
			timestamp = date.getTime();
			this.bookingsRes = result;
			this.bookings = this.bookingsRes?.data?.reservations?.data;
			if (!this.useDateFilter && !this.searchText) {
				this.endDate = this.bookings?.length > 0 ? this.bookings[this.bookings?.length - 1]?.pickup_date : moment(timestamp).format("YYYY-MM-DD")
			}
			this.totalRecords = this.bookingsRes?.data?.reservations?.total;
			this.total_amount = this.bookingsRes?.data?.total_amount
			this.net_total_amount = this.bookingsRes?.data?.affiliate_total
			this.noError = false
			this.firstPage = 1;
			this.lastPage = this.bookingsRes?.data?.reservations?.last_page;
			this.totalPage = this.bookingsRes?.data?.reservations?.last_page;
			this.currentPage = this.bookingsRes?.data?.reservations?.current_page;
			this.from = this.bookingsRes?.data?.reservations?.from;
			this.to = this.bookingsRes?.data.reservations?.to;
			this.path = this.bookingsRes?.data?.reservations?.path;
			this.firstPageUrl = this.bookingsRes?.data?.reservations?.first_page_url;
			this.lastPageUrl = this.bookingsRes?.data?.reservations?.last_page_url;
			this.prevPageUrl = this.bookingsRes?.data?.reservations?.prev_page_url;
			this.nextPageUrl = this.bookingsRes?.data?.reservations?.next_page_url;
			this.spinner.hide();//hide spinner
			if (this.bookingsRes?.data?.reservations?.data.length == 0) {
				this.noError = true
			}
		})
			.catch(err => {
				this.spinner.hide();//hide spinner
			});
	}


	loadVehicles() {
		this.affiliateService.affiliateVehicleList(true).then(result => {
			this.vehiclesRes = result;
			this.numberOfVehicles = this.vehiclesRes?.data?.totalNumberOfVehicles;
			localStorage.setItem("affiliateVehicles", this.numberOfVehicles)
		});
	}

	FormatDate(date: string) {
		return moment(date).format("ll");
	}
	searchInBookings(search_value: string) {
		this.searchText = search_value
		console.log('--->>>>>', search_value)
		this.saveCookie('affiliate_search', search_value)
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			this.loadBookings(null)
		}, 700)
	}
	formatBaseRate(baseRate: string | number): string {
		// Convert baseRate to a number if it is a string
		const numericValue = typeof baseRate === 'string' ? parseFloat(baseRate) : baseRate;

		// Check if numericValue is a valid number
		if (!isNaN(numericValue)) {
			return numericValue.toFixed(2);
		}

		// Return a default value or an empty string if baseRate is not a valid number
		return '0.00';
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
	handleChangeCheckbox(value: any) {
		console.log('event---->> ', value)
		this.useDateFilter = value
		// this.saveCookie('useDateFilter',value)
		localStorage.setItem('farmInuseDateFilter', value)
		let date = new Date();
		date.setDate(date.getDate() + 7);
		let timestamp = date.getTime();
		this.endDate = moment(timestamp).format("YYYY-MM-DD");
		this.loadBookings();
	}

	reset() {
		let date = new Date();
		this.startDate = date.toISOString().substring(0, 10);
		date.setDate(date.getDate() + 7);
		this.endDate = date.toISOString().substring(0, 10);
		this.affiliateService.deleteCookie('affiliate_startDate')
		this.affiliateService.deleteCookie('affiliate_endDate')
		this.affiliateService.deleteCookie('affiliate_search')
		// this.affiliateService.deleteCookie('filtertype')
		this.searchText = "";
		localStorage.removeItem('farmInuseDateFilter')
		this.useDateFilter = false
		// this.filtertype = 'bookingid';

		console.log('Reset Successfully. ');
	}
	textFormatter(text: string) {
		try {
			return text.replace(/[\\\_$]+/g, ' ')
		}
		catch {
			return text
		}
	}
	auditTrail(bookingId: any) {
		console.log('In function audit trail', bookingId)
		this.spinner.show()
		this.affiliateService.auditTrailInfo(bookingId)
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
		this.affiliateService.getBookingPreview(booking_id)
			.pipe(
				catchError((err) => {
					this.spinner.hide(); //hide spinner
					return throwError(err);
				})
			).subscribe((response: any) => {
				console.log("respinse", response.data)
				this.bookingPreview = response.data;
				this.MapController()
				if (this.bookingPreview?.account_type == 'travel_planner' && this.bookingPreview?.created_by != 1) {
					console.log("in if created by ta")
					this.adminSharePercent = 15
				}
				else if (this.bookingPreview?.share_array?.farmoutShare) {
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
			})
		this.spinner.hide();
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
				: this.passengerDetails?.driver_email;
			this.reciptentName = this.passengerDetails?.driver_name;
		}
		else if (this.passengerDetails.selection_button == "created_by") {
			this.sendInformation = format ? this.passengerDetails.created_by_phone : this.passengerDetails.created_by_email
			this.reciptentName = this.passengerDetails.created_by_name
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
		this.affiliateService.affiliateNotification(obj)
			.pipe(
				catchError((err: any) => {
					console.log('err------->>>>>>>', err)
					return throwError(err)
				})
			).subscribe(({ message }: any) => {
				$('#successModal').modal('show')
				this.notification_msg = message
				setTimeout(() => {
					$('#successModal').modal('hide')
				}, 2000)
				console.log(message);
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

		if (this.currentPage as number < 5) {
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
		console.log('open modal-->>>>>>>', booking, selection_button)
		this.passengerDetails = booking;
		this.passengerDetails['selection_button'] = selection_button
	}
	cancelBooking() {
		console.log('in function cancel booking')
		this.spinner.show();

		this.affiliateService.cancelBooking(this.cancelBookingId)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					$('#cancelBooking').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) => {
				this.spinner.hide();//hide spinner
				this.loadBookings()
				$('#cancelBooking').modal('hide');
				this.$errors.openDialog({
					errors: {
						error: `<span class='text-success'>Cancellation request have been successfully send to admin!</span>`
					}
				})

			});

		// this.affiliateService.rejectBooking(this.cancelBookingId)
		// 	.pipe(
		// 		catchError(err => {
		// 			this.spinner.hide();//hide spinner
		// 			$('#cancelBooking').modal('hide');
		// 			return throwError(err);
		// 		})
		// 	)
		// 	.subscribe(({ data, success, message }: any) => {
		// 		if (success == true) {
		// 			this.spinner.hide();//hide spinner
		// 			this.loadBookings()
		// 			$('#cancelBooking').modal('hide');
		// 			// this.$errors.openDialog({
		// 			// 	errors: {
		// 			// 		error: `<span class='text-success'>${message}</span>`
		// 			// 	}
		// 			// })
		// 		}
		// 	});
	}

	acceptBooking() {
		console.log('in function cancel booking')
		this.spinner.show();

		this.affiliateService.acceptBooking(this.cancelBookingId)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					$('#acceptBooking').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) => {
				if (success == true) {
					this.spinner.hide();//hide spinner
					this.loadBookings()
					$('#acceptBooking').modal('hide');
					// this.$errors.openDialog({
					// 	errors: {
					// 		error: `<span class='text-success'>${message}</span>`
					// 	}
					// })
				}
			});
	}
	// messageField(format)
	// {
	// 	this.show = true;
	// 	switch (format)
	// 	{
	// 		case 'Phone': {
	// 			this.sendMessageField = true;
	// 			break;
	// 		}
	// 		case 'Email': {
	// 			this.sendMessageField = false;
	// 			break;
	// 		}
	// 	}
	// }



	editAction(bookingId, updateType) {
		if (this.currentUser.roleName == 'sub_affiliate') {
			this.router.navigate(['/sub_affiliate/new-booking'], { queryParams: { bookingId: bookingId, updateType: updateType, nav: 'true' } });
		}
		else {
			this.router.navigate(['/affiliate/new-booking'], { queryParams: { bookingId: bookingId, updateType: updateType, nav: 'true' } });
		}
	}

	finalizeAction(bookingId) {
		if (this.currentUser.roleName == 'sub_affiliate') {
			this.router.navigate(['/sub_affiliate/finalize-booking'], { queryParams: { bookingId: bookingId } });
		}
		else {
			this.router.navigate(['/affiliate/finalize-booking'], { queryParams: { bookingId: bookingId } });
		}
	}

	previewRate(bookingId) {
		if (this.currentUser.roleName == 'sub_affiliate') {
			this.router.navigate(['/sub_affiliate/finalize-booking'], { queryParams: { bookingId: bookingId, editRate: true } });
		}
		else {
			this.router.navigate(['/affiliate/finalize-booking'], { queryParams: { bookingId: bookingId, editRate: true } });
		}
	}
	returnRepeatAction(actionType, bookingId, serviceType) {
		console.log(actionType, bookingId, serviceType);

		if (actionType == 'return') {
			if (this.currentUser.roleName == 'sub_affiliate') {
				this.router.navigate(['/sub_affiliate/create-new-booking'], { queryParams: { bookingId: bookingId, bookingType: 'return' } });
			}
			else {
				this.router.navigate(['/affiliate/create-new-booking'], { queryParams: { bookingId: bookingId, bookingType: 'return' } });
			}
		}
		else {
			if (this.currentUser.roleName == 'sub_affiliate') {
				this.router.navigate(['/sub_affiliate/create-new-booking'], { queryParams: { bookingId: bookingId, bookingType: 'repeat' } });
			}
			else {
				this.router.navigate(['/affiliate/create-new-booking'], { queryParams: { bookingId: bookingId, bookingType: 'repeat' } });
			}
		}
	}

	invoiceAction(bookingId) {
		if (this.currentUser.roleName == 'sub_affiliate') {
			this.router.navigate(['/sub_affiliate/invoice-summary'], { queryParams: { bookingId: bookingId } });
		}
		else {
			this.router.navigate(['/affiliate/invoice-summary'], { queryParams: { bookingId: bookingId } });
		}
	}

	get changeStatusF() {
		return this.changeStatusForm.controls;
	}

	// changeBookingStatus(bookingId)
	// {
	// 	this.changeStatusForm.patchValue({
	// 		reservation_id: bookingId
	// 	});
	// }

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
					if (this.currentUser.roleName == 'sub_affiliate') {
						this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
							this.router.navigate(['/sub_affiliate/my-bookings']);
						});
					}
					else {
						this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
							this.router.navigate(['/affiliate/my-bookings']);
						});
					}
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

		this.affiliateService.sendEmail(this.sendEmailForm.value)
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
					if (this.currentUser.roleName == 'sub_affiliate') {
						this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
							this.router.navigate(['/sub_affiliate/my-bookings']);
						});
					}
					else {
						this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
							this.router.navigate(['/affiliate/my-bookings']);
						});
					}

				}
			});
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
	mToMi(distance: number): string {
		return (distance / 1609).toFixed(2)
	}

	mToKm(distance: number): string {
		return (distance / 1000).toFixed(2)
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
		this.affiliateService.getLocationPoints(booking_id).subscribe((response: any) => {
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

	searchOnGoogle(query: string) {
		console.log("in search google", query)
		if (query) {
			const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
			window.open(url, '_blank'); // Opens the search in a new tab
		}
	}

	addSubAffiliate() {
		this.router.navigate(['/affiliate/add-sub-affiliate']);
	}

	upgradePlan() {
		this.router.navigate(['/subscription']);
	}

	// Method to convert hours to days and hours
	getCancellationTime(cancellationHours: number): string {
		if (cancellationHours > 24) {
			const days = Math.floor(cancellationHours / 24);
			const remainingHours = cancellationHours % 24;
			return `${days} days ${remainingHours} hours`;
		} else {
			return `${cancellationHours} hours`;
		}
	}

}
