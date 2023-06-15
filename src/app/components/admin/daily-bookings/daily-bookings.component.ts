import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AdminService } from "../../../services/admin.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";
import {
	DateAdapter,
	MAT_DATE_LOCALE,
	ThemePalette,
} from "@angular/material/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
declare var $: any;
import * as moment from "moment";
import { ErrorDialogService } from "src/app/services/error-dialog/errordialog.service";
import { MatSelect } from "@angular/material/select";

@Component({
	selector: "app-daily-bookings",
	templateUrl: "./daily-bookings.component.html",
	styleUrls: ["./daily-bookings.component.scss"],
})
export class DailyBookingsComponent implements OnInit {
	@ViewChild('inputmsg', { static: false }) message: ElementRef;
	@ViewChild('select') select: MatSelect;
	outputDateFormat = "YYYY-MM-DD";
	color: ThemePalette = "primary";
	public firstPage: Number;
	public lastPage: Number;
	public totalPage: Number;
	public totalRecords: Number;
	public currentPage: any;
	public from: Number;
	public to: Number;
	public path: string;
	public firstPageUrl: string;
	public lastPageUrl: string;
	public prevPageUrl: string;
	public nextPageUrl: string;
	public sendMessageField: boolean = null;
	public bookingsRes: any;
	public bookings: any;
	public bookingStatusColor: string;
	public startDate: string;
	public endDate: string;
	// public returnRepeatForm: FormGroup;
	public changeStatusForm: FormGroup;
	public sendEmailForm: FormGroup;
	public submitted: boolean = false;
	searchText: string = "";
	// filtertype: string = "";

	passengerDetails: any;
	senderValue: string;
	sendInformation: any;
	reciptentName: any;
	notification_msg: any;
	status_list: any = [];
	audit_Trail: any = [];
	currentUser: any = JSON.parse(localStorage.getItem('userData')) || ''
	subModules: any = localStorage.getItem('sub_modules') || '';
	useDateFilter: Boolean = false;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private $errorDialog: ErrorDialogService,
	) { }

	ngOnInit(): void {

		let date = new Date();
		let timestamp = date.getTime()
		//     const options:any = {
		// 		year: 'numeric',
		// 		month: '2-digit',
		// 		day: '2-digit',
		// 	};
		// const localeDateString = date.toLocaleDateString(undefined, options).
		// replace(/(\d+)\/(\d+)\/(\d+)/,'$3-$1-$2');
		// Set Search Filters According to cookies or the intial state
		this.startDate = this.adminService.checkCookie('startDate') ?
			this.adminService.getCookie('startDate') :
			moment(timestamp).format('YYYY-MM-DD')

		date.setDate(date.getDate() + 7);
		timestamp = date.getTime()
		this.endDate = this.adminService.checkCookie('endDate') ?
			this.adminService.getCookie('endDate') :
			moment(timestamp).format('YYYY-MM-DD')

		this.searchText = this.adminService.checkCookie('search') ?
			this.adminService.getCookie('search')
			: "";

		this.adminService.getStatusList()
			.pipe(
				catchError((err) => {
					this.spinner.hide(); //hide spinner	
					return throwError(err);
				})
			)
			.subscribe(({ data }: any) => {
				this.status_list = data;
			})

		// this.filtertype = this.adminService.checkCookie('filtertype') ?
		// 	this.adminService.getCookie('filtertype') :
		// 	"bookingid";

		// if (this.adminService.checkCookie('startDate'))
		// {
		// 	this.startDate = this.adminService.getCookie('startDate');
		// }

		// Override End Date
		// if (this.adminService.checkCookie('endDate'))
		// {
		// 	this.endDate = this.adminService.getCookie('endDate');
		// }

		// // Override Search Text
		// if (this.adminService.checkCookie('search'))
		// {
		// 	this.searchText = this.adminService.getCookie('search');
		// }

		// Override Filter Type
		// if (this.adminService.checkCookie('filtertype'))
		// {
		// 	this.filtertype = this.adminService.getCookie('filtertype');
		// }


		this.loadBookings(null, this.startDate, this.endDate, this.searchText);


		//change status booking form validation
		this.changeStatusForm = this.formBuilder.group({
			reservation_id: ["", Validators.required],
			booking_status: ["", Validators.required],
		});

		//send email booking form validation
		this.sendEmailForm = this.formBuilder.group({
			reservation_id: ["", Validators.required],
			emailTarget: ["", Validators.required],
		});
	}
	ngAfterViewInit(): void {
		this.subModules = localStorage.getItem('sub_modules')
		$("#search-field").addClass("box-outline")
		// $('#layoutSidenav_content').addClass("layout_shadow")
	}
	handleChangeCheckbox(value:any){
		console.log('event---->> ' ,value)
		this.useDateFilter = value
		this.loadBookings(null, this.startDate, this.endDate, this.searchText);
	}
	/**
	 * Configure date as per todays date and the future +7 days
	 */
	reset() {
		let date = new Date();
		let timestamp = date.getTime()
		// const options:any = {
		// 	year: 'numeric',
		// 	month: '2-digit',
		// 	day: '2-digit',
		// };
		this.startDate = moment(timestamp).format('YYYY-MM-DD')
		date.setDate(date.getDate() + 7);
		timestamp = date.getTime()
		this.endDate = moment(timestamp).format('YYYY-MM-DD')
		this.adminService.deleteCookie('startDate')
		this.adminService.deleteCookie('endDate')
		this.adminService.deleteCookie('search')
		// this.adminService.deleteCookie('filtertype')
		this.searchText = "";
		// this.filtertype = 'bookingid';

		console.log('Reset Successfully. ');
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
	highlighText(args: string) {
		if (!this.searchText) { return args; }
		if (args) {
			args = args.toString()
			var re = new RegExp(this.searchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
			return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
		}
	}
	emailAll() {
		console.log('In function email all', this.sendEmailForm.value.reservation_id, this.sendEmailForm.value.emailTarget)
		let data = {
			reservation_id: this.sendEmailForm.value.reservation_id
		}
		this.spinner.show()
		this.adminService.bookingEmailAll(data)
			.pipe(
				catchError((err) => {
					return throwError(err);
				})
			)
			.subscribe((response: any) => {
				console.log('response--------->>>>>>>>', response)
				this.spinner.hide()
				$("#emailAll").modal("hide");
			});
	}

	emailPassenger() {
		console.log('In function email passenger', this.sendEmailForm.value.reservation_id)
		let data = {
			reservation_id: this.sendEmailForm.value.reservation_id
		}
		this.spinner.show()
		this.adminService.passengerBooking(data)
			.pipe(
				catchError((err) => {
					return throwError(err);
				})
			)
			.subscribe((response: any) => {
				console.log('response--------->>>>>>>>', response)
				this.spinner.hide()
				$("#emailPassenger").modal("hide");
			});
	}
	auditTrail(bookingId: any) {
		console.log('In function audit trail', bookingId)
		this.spinner.show()
		this.adminService.auditTrailInfo(bookingId)
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

	submit(message, format) {

		if (this.passengerDetails.selection_button == "Passenger") {
			this.sendInformation = format
				? this.passengerDetails.passenger_cell_isd +
				this.passengerDetails.passenger_cell
				: this.passengerDetails.passenger_email;
			this.reciptentName = this.passengerDetails.passenger_name;
		} else if (this.passengerDetails.selection_button == "Affiliate") {
			this.sendInformation = format
				? this.passengerDetails.affiliate_dispatch_isd +
				this.passengerDetails.affiliate_dispatch_number
				: this.passengerDetails.dispatchEmail;
			this.reciptentName =
				this.passengerDetails.driver_first_name +
				this.passengerDetails.driver_last_name;
		} else {
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
		this.adminService
			.adminNotification(obj)
			.pipe(
				catchError((err) => {
					return throwError(err);
				})
			)
			.subscribe(({ message }: any) => {
				this.notification_msg = message;
				$("#notificationModal").modal("show");
				console.log(message);
				$("textarea").val("");
			});
		$("#closeModal").click(() => {
			$("#notificationModal").modal("hide");
		});
		$("#closeModal1").click(() => {
			$("#notificationModal").modal("hide");
		});
		this.message.nativeElement.value = ""
		this.show = false
	}

	closeModal() {
		this.message.nativeElement.value = ""
		this.show = false
	}

	noError: boolean = false
	loadBookings(pageUrl = null, start_date: string, end_date: string, search_value: string = '') {
		search_value == '' && this.spinner.show();
		this.noError = false
		// Load Our bookings using API
		this.adminService.loadBookings(pageUrl, start_date, end_date, this.useDateFilter,search_value ?? '').then((result: any) => {
			if (result?.data?.data == 0) {
				this.noError = true
			}
			this.bookingsRes = result;
			this.bookings = this.bookingsRes.data.data;
			this.totalRecords = this.bookingsRes.data.total;
			this.firstPage = 1;
			this.lastPage = this.bookingsRes.data.last_page;
			this.totalPage = this.bookingsRes.data.last_page;
			this.currentPage = this.bookingsRes.data.current_page;
			this.from = this.bookingsRes.data.from;
			this.to = this.bookingsRes.data.to;
			this.path = this.bookingsRes.data.path;
			this.firstPageUrl = this.bookingsRes.data.first_page_url;
			this.lastPageUrl = this.bookingsRes.data.last_page_url;
			this.prevPageUrl = this.bookingsRes.data.prev_page_url;
			this.nextPageUrl = this.bookingsRes.data.next_page_url;
			this.subModules = localStorage.getItem('sub_modules') || ''
			this.currentUser = JSON.parse(localStorage.getItem('userData')) || ''
			this.spinner.hide();

		})
	}

	show = false;
	openModal(booking: any, selection_button: string) {
		this.passengerDetails = booking;
		this.passengerDetails["selection_button"] = selection_button;
	}

	//for pagination
	counter() {
		var currentPage;
		var startFrom;
		var endTo;

		if (this.currentPage < 5) {
			startFrom = 0;
			endTo = this.totalPage;
		} else if (this.currentPage < this.totalPage) {
			currentPage = this.currentPage;
			endTo = currentPage + 1;
			startFrom = endTo - 5;
		} else {
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
		console.log('---------__>>>>>>', dateType, date)
		this[dateType] = date
	}
	fomatAffiliateType(type: any) {
		if (type == 'taxi_operator') {
			return "T"
		}
		else if (type == 'fleet_operator') {
			return "F"
		}
		else if (type == 'black_limo_operator') {
			return "I/O"
		}
		else if (type == 'gig_operator') {
			return "G"
		}
	}
	enableDisableClicked(event, id) {
		this.spinner.show(); //show spinner
		console.log(event.checked);
		if (event.checked) {
			var status = "enable";
		} else {
			var status = "disable";
		}
		this.adminService
			.reservationStatus(id, status)
			.pipe(
				catchError((err) => {
					this.spinner.hide(); //hide spinner
					return throwError(err);
				})
			)
			.subscribe((result) => {
				this.spinner.hide(); //hide spinner
			});
	}

	get changeStatusF() {
		return this.changeStatusForm.controls;
	}

	changeBookingStatus(bookingId) {
		this.changeStatusForm.patchValue({
			reservation_id: bookingId,
		});
		setTimeout(() => {
			this.select.open();
		}, 600);
	}

	submitChangeStatusForm() {
		this.submitted = true;
		console.log(this.changeStatusForm);
		// stop here if form is invalid
		if (this.changeStatusForm.invalid) {
			return;
		}

		this.spinner.show();
		// this.disableSubmitButton=true; //disable submit button

		this.adminService.changeStatusBooking(this.changeStatusForm.value)
			.pipe(
				catchError((err) => {
					this.spinner.hide(); //hide spinner
					$("#change_status_booking_Modal").modal("hide");
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) => {
				if (success == true) {
					$("#change_status_booking_Modal").modal("hide");
					this.loadBookings(null, this.startDate, this.endDate, this.searchText)
					// this.router
					// 	.navigateByUrl("/RefreshComponent", {
					// 		skipLocationChange: true,
					// 	})
					// 	.then(() =>
					// 	{
					// 		this.router.navigate([
					// 			"/admin/daily-bookings-admin",
					// 		]);
					// 	});
				}
			});
	}

	sendEmailClicked(bookingId, emailTarget) {
		this.sendEmailForm.patchValue({
			reservation_id: bookingId,
			emailTarget: emailTarget,
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
		// this.disableSubmitButton=true; //disable submit button

		this.adminService
			.sendEmail(this.sendEmailForm.value)
			.pipe(
				catchError((err) => {
					this.spinner.hide(); //hide spinner
					$("#emailModal").modal("hide");
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) => {
				if (success == true) {
					this.spinner.hide(); //hide spinner
					$("#emailModal").modal("hide");
					this.router
						.navigateByUrl("/RefreshComponent", {
							skipLocationChange: true,
						})
						.then(() => {
							this.router.navigate([
								"/admin/daily-bookings-admin",
							]);
						});
				}
			});
	}

	FormatDate(date: string) {
		return moment(date).format("ll");
	}

	FormatTime(time: string) {
		return moment(time, "HH:mm:ss").format("LT");
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
	formatPhoneNumber(ph: any) {
		if (!ph.includes('+')) {
			return '+' + ph
		}
		return ph;

	}

	bookingPreview: any
	showBookingPreviewModal(booking_id: number) {
		this.spinner.show();
		this.adminService.getBookingPreview(booking_id).subscribe((response: any) => {
			this.spinner.hide();
			this.bookingPreview = response.data;
			this.bookingPreview['booking_instructions'] = this.bookingPreview?.booking_instructions.replaceAll('<br />', ' ')
		})
	}


	timer: any
	searchInBookings(search_value: string) {
		this.searchText = search_value
		console.log('--->>>>>', search_value)
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			this.saveCookie("search", this.searchText);
			this.loadBookings(null, this.startDate, this.endDate, search_value)
		}, 700)
	}

	handleKeypressEvents() {
		clearTimeout(this.timer)
	}

	saveCookie(key: string, value: string) {
		this.adminService.setCookie(key, value, 30);
	}

	// changeFilterType(value: string) {
	// 	console.log(value)
	// 	this.filtertype = value
	// 	this.saveCookie('filtertype', this.filtertype);
	// 	this.loadBookings(null, this.startDate, this.endDate, this.searchText, this.filtertype);
	// }
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
		// const options = {
		// 	enableHighAccuracy: true,
		// 	timeout: 5000,
		// 	maximumAge: 0,
		// };
		// let q: any
		// function success(pos) {
		// 	const crd = pos.coords;
		// 	q = crd
		// 	console.log("Your current position is:");
		// 	console.log(`Latitude : ${crd.latitude}`);
		// 	console.log(`Longitude: ${crd.longitude}`);
		// 	console.log(`More or less ${crd.accuracy} meters.`);
		// }

		// function error(err) {
		// 	console.warn(`ERROR(${err.code}): ${err.message}`);
		// }

		// await navigator.geolocation.getCurrentPosition(success, error, options)

		// if (navigator.geolocation) {
		// 	navigator.geolocation.getCurrentPosition(function (position) {
		// 		var currentLocation =	CURRENT_LAT +","+CURRENT_LONG;
		// 	})
		// 	}

		let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		console.log('isSafari', isSafari)
		this.spinner.show()
		this.adminService.getLocationPoints(booking_id).subscribe((response: any) => {
			this.spinner.hide();
			if ("lat" in response?.data?.pickupDetail && "long" in response?.data?.pickupDetail && "lat" in response?.data?.dropoffDetail && "long" in response?.data?.dropoffDetail) {
				sessionStorage.setItem('pickup', JSON.stringify(response?.data?.pickupDetail.address));
				sessionStorage.setItem('dropoff', JSON.stringify(response?.data?.dropoffDetail.address));
				let googleDirectionUrl;
				let iosDirectionUrl;
				if (type == 'pickup') {
					googleDirectionUrl = 'https://www.google.com/maps/dir/?api=1' + '&destination=' +
						encodeURIComponent(response?.data?.pickupDetail.address) + '&travelmode=driving'
					iosDirectionUrl = 'http://maps.apple.com/?daddr=' +
						encodeURIComponent(response?.data?.pickupDetail.address)
				}
				else {
					googleDirectionUrl = 'https://www.google.com/maps/dir/?api=1' + '&destination=' +
						encodeURIComponent(response?.data?.dropoffDetail.address) + '&travelmode=driving'
					iosDirectionUrl = 'http://maps.apple.com/?daddr=' +
						encodeURIComponent(response?.data?.dropoffDetail.address)
				}
				// this.router.navigate(['/locate-map'], {
				// 	queryParams: {
				// 		plat: response?.data?.pickupDetail?.lat.toString(),
				// 		plng: response?.data?.pickupDetail?.long.toString(),
				// 		dlat: response?.data?.dropoffDetail?.lat.toString(),
				// 		dlng: response.data?.dropoffDetail?.long.toString(),
				// 	},
				// 	queryParamsHandling: 'merge'
				// });
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
		})
	}
}
