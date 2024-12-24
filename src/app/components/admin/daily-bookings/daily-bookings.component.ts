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
import { DatePickerComponent } from "../../shared/date-picker/date-picker.component";
import { MapsAPILoader } from "@agm/core";
import { UploadService } from "src/app/services/upload.service";

@Component({
	selector: "app-daily-bookings",
	templateUrl: "./daily-bookings.component.html",
	styleUrls: ["./daily-bookings.component.scss"],
})
export class DailyBookingsComponent implements OnInit {
	exampleHeader = DatePickerComponent;
	@ViewChild("inputmsg", { static: false }) message: ElementRef;
	@ViewChild('fileInput') fileInput!: ElementRef;
	@ViewChild("select") select: MatSelect;
	@ViewChild("sendEmailModalFocus") sendEmailModalFocus: any;
	outputDateFormat = "YYYY-MM-DD";
	color: ThemePalette = "primary";
	public firstPage: Number;
	public lastPage: Number;
	public totalPage: Number;
	public totalRecords: any;
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
	public bookings: any = [];
	public bookingStatusColor: string;
	public startDate: string;
	public endDate: string;
	public orderBy: string = "pickup_date_desc";
	// public returnRepeatForm: FormGroup;
	public changeStatusForm: FormGroup;
	public sendEmailForm: FormGroup;
	public submitted: boolean = false;
	searchText: string = "";
	filtertype: string = "";

	passengerDetails: any;
	senderValue: string;
	sendInformation: any;
	reciptentName: any;
	notification_msg: any;
	status_list: any = [];
	audit_Trail: any = [];
	currentUser: any = JSON.parse(localStorage.getItem("currentUser")) || "";
	subModules: any = localStorage.getItem("sub_modules") || "";
	useDateFilter: boolean = false;
	use_created_at: boolean = false;
	rates_preview: any;
	quotebotNewData: any;
	shareArray: any;
	adminSharePercent: any;
	previewCopyData: any;
	accept_charge_id: any;
	public is_stripe_added: any;
	public stripeResp: any;
	public stripeErroMsg: string = '';
	subs_end_date: any;
	isCancelled: boolean = false;
	fileUrl: String;
	fileName: String;
	fileType: String;
	uploadedFile: any;
	deducted_stripe_fee:any;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private $errorDialog: ErrorDialogService,
		private $mapsapi: MapsAPILoader,
		private uploadService: UploadService,
	) { }

	ngOnInit(): void {
		let date = new Date();
		let timestamp = date.getTime();
		//     const options:any = {
		// 		year: 'numeric',
		// 		month: '2-digit',
		// 		day: '2-digit',
		// 	};
		// const localeDateString = date.toLocaleDateString(undefined, options).
		// replace(/(\d+)\/(\d+)\/(\d+)/,'$3-$1-$2');
		// Set Search Filters According to cookies or the intial state
		this.startDate = localStorage.getItem("admin_startDate")
			? localStorage.getItem("admin_startDate")
			: moment(timestamp).format("YYYY-MM-DD");

		// this.startDate = moment(timestamp).format("YYYY-MM-DD");

		date.setDate(date.getDate() + 7);
		timestamp = date.getTime();
		this.endDate = localStorage.getItem("admin_endDate")
			? localStorage.getItem("admin_endDate")
			: moment(timestamp).format("YYYY-MM-DD");

		// this.endDate = moment(timestamp).format("YYYY-MM-DD");

		this.searchText = localStorage.getItem("DBSearch")
			? localStorage.getItem("DBSearch")
			: "";
		console.log(
			"usedatefilter---->>>>>>>",
			localStorage.getItem("useDateFilter")
		);
		this.useDateFilter = localStorage.getItem('useDateFilter') ?
			(localStorage.getItem('useDateFilter') == 'true' ? true : false)
			: false;
		console.log("useDateFilter-->", this.useDateFilter);
		this.orderBy = localStorage.getItem("orderByCreatedAt") ? localStorage.getItem("orderByCreatedAt") : "pickup_date_desc"
		this.use_created_at = localStorage.getItem("orderByCreatedAt") ? true : false


		this.adminService
			.getStatusList()
			.pipe(
				catchError((err) => {
					this.spinner.hide(); //hide spinner
					return throwError(err);
				})
			)
			.subscribe(({ data }: any) => {
				this.status_list = data;
			});

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

		this.MapController()
		if (this.currentUser?.created_by_role == 'subscriber') {
			this.stripeDetailsCheck()
			this.subs_end_date = localStorage.getItem('current_period_end_date')
			this.isCancelled = JSON.parse(localStorage.getItem('is_subscription_cancelled'))
		}

	}
	ngAfterViewInit(): void {
		this.subModules = localStorage.getItem("sub_modules");
		$("#search-field").addClass("box-outline");
		// $('#layoutSidenav_content').addClass("layout_shadow")
		this.sendEmailModalFocus.nativeElement
			.querySelector("textarea")
			.focus();
	}

	stripeDetailsCheck() {
		this.is_stripe_added = localStorage.getItem('is_stripe_account_added') ? JSON.parse(localStorage.getItem('is_stripe_account_added')) : '';
		console.log("is stripe", this.is_stripe_added)
		this.spinner.show()
		this.adminService.getSubsriberBank(this.currentUser?.account_id)
			.pipe(
				catchError(err => {
					// this.stateManagementService.setprogressBar(false);
					this.spinner.hide()
					return throwError(err);
				})
			).subscribe(result => {
				this.spinner.hide()
				this.stripeResp = result
				console.log(this.stripeResp)
				console.log(this.stripeResp?.data?.stripe_account_status == 'unverified')
				if (this.stripeResp?.data?.stripe_account_status == 'unverified' && this.is_stripe_added) {
					console.log("in if")
					this.stripeErroMsg = 'Your Stripe/Bank account is currently unverified. Please check for any issues or wait for 24 hours.'
				}
				else if (!this.is_stripe_added) {
					this.stripeErroMsg = 'Please fill out the bank details to activate payments.'
				}
				else {
					this.stripeErroMsg = ''
				}

				console.log('Error msg:', this.stripeErroMsg)
			})
	}

	MapController() {
		console.log('Map has been initialised.')
		let waypoints = []
		let origin: google.maps.LatLng
		let destination: google.maps.LatLng
		let map: google.maps.Map

		this.$mapsapi.load().then(() => {

			// console.log('Return Map has been initialised. ')
			// map
			map = new google.maps.Map(document.getElementById('map'), {
				zoom: 7,
				center: new google.maps.LatLng(41.850033, -87.6500523),
				scaleControl: true
			})


			// defaults for Source/Target - City
			origin = new google.maps.LatLng(this.bookingPreview?.pickup_latitude, this.bookingPreview?.pickup_longitude)
			destination = new google.maps.LatLng(this.bookingPreview?.dropoff_airport_latitude, this.bookingPreview?.dropoff_airport_longitude)

			//defaults for Source/Target - City
			origin = new google.maps.LatLng(this.bookingPreview?.pickup_latitude, this.bookingPreview?.pickup_longitude)
			destination = new google.maps.LatLng(this.bookingPreview?.dropoff_latitude, this.bookingPreview?.dropoff_longitude)

			// Overrides
			if (this.bookingPreview?.transfer_type.includes('airport_')) {
				// override for Source - Airport
				// console.log('Override for Source Airport')
				origin = new google.maps.LatLng(this.bookingPreview?.pickup_airport_latitude, this.bookingPreview?.pickup_airport_longitude)
			}
			if (this.bookingPreview?.transfer_type.includes('_airport')) {
				// override for Target - Airport
				// console.log('Override for Target Airport')
				destination = new google.maps.LatLng(this.bookingPreview?.dropoff_airport_latitude, this.bookingPreview?.dropoff_airport_longitude)
			}

			this.drawMap(map, {
				origin,
				destination,
				waypoints,
				optimizeWaypoints: true,
				travelMode: google.maps.TravelMode.DRIVING
			})
		})
	}


	drawMap(map: google.maps.Map, request: Object) {
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
					console.log('Directions Service Response: ', response)
					directionsRenderer.setDirections(response)
				}
			})

		})
	}

	handleChangeCheckbox(value: any) {
		console.log("event---->> ", value);
		this.useDateFilter = value;
		this.saveCookie("useDateFilter", value);
		let date = new Date();
		date.setDate(date.getDate());
		let timestamp = date.getTime();
		this.startDate = moment(timestamp).format("YYYY-MM-DD");
		// let date = new Date();
		date.setDate(date.getDate() + 7);
		timestamp = date.getTime();
		this.endDate = moment(timestamp).format("YYYY-MM-DD");
		this.loadBookings(null, this.startDate, this.endDate, this.searchText);
	}
	handleCheckboxSort(value: any) {
		if (value) {
			this.orderBy = "created_at_desc";
			localStorage.setItem('orderByCreatedAt', 'created_at_desc')
		}
		else {
			this.orderBy = "pickup_date_desc";
			localStorage.removeItem('orderByCreatedAt')
		}
		this.loadBookings(null, this.startDate, this.endDate, this.searchText);
		// this.useDateFilter = value
		// this.saveCookie('useDateFilter',value)
		// this.loadBookings(null, this.startDate, this.endDate, this.searchText);
	}
	/**
	 * Configure date as per todays date and the future +7 days
	 */
	reset() {
		let date = new Date();
		let timestamp = date.getTime();
		// const options:any = {
		// 	year: 'numeric',
		// 	month: '2-digit',
		// 	day: '2-digit',
		// };
		this.startDate = moment(timestamp).format("YYYY-MM-DD");
		date.setDate(date.getDate() + 7);
		timestamp = date.getTime();
		this.endDate = moment(timestamp).format("YYYY-MM-DD");
		localStorage.removeItem("admin_startDate");
		localStorage.removeItem("admin_endDate");
		// this.adminService.deleteCookie('search')
		localStorage.removeItem("DBSearch");
		localStorage.removeItem("useDateFilter");
		this.useDateFilter = false;
		// this.adminService.deleteCookie('filtertype')
		this.searchText = "";
		// this.filtertype = 'bookingid';

		console.log("Reset Successfully. ");
	}

	messageField(format) {
		setTimeout(() => {
			this.sendEmailModalFocus.nativeElement
				.querySelector("textarea")
				.focus();
		}, 1000);
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
		if (!this.searchText) {
			return args;
		}
		if (args) {
			args = args.toString();
			var re = new RegExp(this.searchText, "gi"); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
			return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
		}
	}
	updatedEmailAll() {
		console.log(
			"In function updatedEmailAll all",
			this.sendEmailForm.value.reservation_id,
			this.sendEmailForm.value.emailTarget
		);
		let data = {
			reservation_id: this.sendEmailForm.value.reservation_id,
		};
		this.spinner.show();
		this.adminService
			.bookingEmailAllUpdated(this.sendEmailForm.value.reservation_id)
			.pipe(
				catchError((err) => {
					return throwError(err);
				})
			)
			.subscribe((response: any) => {
				console.log("response--------->>>>>>>>", response);
				this.spinner.hide();
				$("#updatedEmailAll").modal("hide");
			});
	}

	emailAll() {
		console.log(
			"In function email all",
			this.sendEmailForm.value.reservation_id,
			this.sendEmailForm.value.emailTarget
		);
		let data = {
			reservation_id: this.sendEmailForm.value.reservation_id,
		};
		this.spinner.show();
		this.adminService
			.bookingEmailAll(data)
			.pipe(
				catchError((err) => {
					return throwError(err);
				})
			)
			.subscribe((response: any) => {
				console.log("response--------->>>>>>>>", response);
				this.spinner.hide();
				$("#emailAll").modal("hide");
			});
	}

	emailPassenger() {
		console.log(
			"In function email passenger",
			this.sendEmailForm.value.reservation_id
		);
		let data = {
			reservation_id: this.sendEmailForm.value.reservation_id,
		};
		this.spinner.show();
		this.adminService
			.passengerBooking(data)
			.pipe(
				catchError((err) => {
					return throwError(err);
				})
			)
			.subscribe((response: any) => {
				console.log("response--------->>>>>>>>", response);
				this.spinner.hide();
				$("#emailPassenger").modal("hide");
			});
	}
	auditTrail(bookingId: any) {
		console.log("In function audit trail", bookingId);
		this.spinner.show();
		this.adminService
			.auditTrailInfo(bookingId)
			.pipe(
				catchError((err) => {
					return throwError(err);
				})
			)
			.subscribe((response: any) => {
				this.spinner.hide();
				console.log("audit trail --->>>>>>>>", response);
				this.audit_Trail = response.data;
				// $("#AuditTrailModal").modal("hide");
			});
	}

	async submit(message, format) {
		console.log("format", format)
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
		}
		else {
			this.sendInformation = format
				? (this.passengerDetails.loose_affiliate_phone_isd ? this.passengerDetails.loose_affiliate_phone_isd : '+1') +
				(this.passengerDetails.loose_affiliate_phone ? this.passengerDetails.loose_affiliate_phone : '8005466266')
				: (this.passengerDetails.loose_affiliate_email ? this.passengerDetails.loose_affiliate_email : 'info@1800limo.com');
			this.reciptentName = (this.passengerDetails.loose_affiliate_name ? this.passengerDetails.loose_affiliate_name : '1800Limo Chauffeurs');
		}

		if (this.uploadedFile) {
			this.spinner.show()
			let dataS = await this.uploadService.uploadFile(this.uploadedFile);
			this.fileUrl = dataS.Location;
			console.log("fileUrl", this.fileUrl)
		}

		let obj = {
			bookingId: this.passengerDetails.booking_id,
			reciptentName: this.reciptentName,
			sendTo: this.passengerDetails.selection_button,
			sendThrough: format ? "Phone" : "Email",
			sendValue: this.sendInformation,
			sendContent: message,
			fileUrl: this.fileUrl,
			filetype: this.fileType
		};
		this.adminService
			.adminNotification(obj)
			.pipe(
				catchError((err) => {
					this.spinner.hide();
					return throwError(err);
				})
			)
			.subscribe(({ message }: any) => {
				this.spinner.hide();
				this.notification_msg = message;
				$("#notificationModal").modal("show");
				console.log(message);
				$("textarea").val("");
			});

		// Clear file input after success
		this.uploadedFile = null;
		this.fileUrl = null;
		this.fileType = null;
		if (this.fileInput) {
			this.fileInput.nativeElement.value = ''; // Reset file input
		}

		$("#closeModal").click(() => {
			this.fileInput.nativeElement.value = '';
			this.uploadedFile = null;
			this.fileType = null;
			this.fileUrl = null;
			$("#notificationModal").modal("hide");
		});
		$("#closeModal1").click(() => {
			$("#notificationModal").modal("hide");
		});
		$("#sendEmailModal").modal("hide");
		this.message.nativeElement.value = "";
		this.show = false;
	}

	cancelSubscription() {
		this.spinner.show()
		let data = {
			account_id: this.currentUser?.account_id
		}
		this.adminService
			.cancelSubscription(data)
			.pipe(
				catchError((err) => {
					this.spinner.hide()
					return throwError(err);
				})
			)
			.subscribe((response: any) => {
				this.spinner.hide()
				this.$errorDialog.openDialog({
					errors: {
						error: `<span class='text-success font-weight-bolder text-2xl' style="font-size: 24px;">Your subscription have been cancelled successfully!</span>`
					}
				})
				this.isCancelled = true
				$("#cancelModal").modal("hide");
			});
	}


	closeModal() {
		// this.sendEmailModal.nativeElement.querySelector('textarea').blur();
		$("#sendEmailModal").modal("hide");
		this.message.nativeElement.value = "";
		this.fileInput.nativeElement.value = '';
		this.uploadedFile = null;
		this.fileType = null;
		this.fileUrl = null;
		this.show = false;
		// this.sendEmailModal.nativeElement.querySelector('textarea').focus();
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

	noError: boolean = false;
	loadBookings(
		pageUrl = null,
		start_date: string,
		end_date: string,
		search_value: string = ""
	) {
		if (pageUrl) {
			console.log("pageurl", pageUrl)
			this.scroll('daily_bookings_table')
		}

		search_value == "" && this.spinner.show();
		this.noError = false;
		// Load Our bookings using API

		if (this.currentUser.created_by_role == 'admin') {
			this.adminService
				.loadBookings(
					pageUrl,
					start_date,
					end_date,
					this.useDateFilter,
					search_value ?? "",
					this.orderBy
				)
				.then((result: any) => {
					if (result?.data?.data == 0) {
						this.noError = true;
					}
					let date = new Date();
					let timestamp = date.getTime();
					date.setDate(date.getDate() + 7);
					timestamp = date.getTime();
					this.bookingsRes = result;
					this.bookings = this.bookingsRes?.data?.data;
					if (!this.useDateFilter && !this.searchText) {
						this.endDate = this.bookings?.length > 0 ? this.bookings[this.bookings?.length - 1]?.pickup_date : moment(timestamp).format("YYYY-MM-DD")
					}
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
					this.subModules = localStorage.getItem("sub_modules") || "";
					this.spinner.hide();
				});
		}
		else {
			this.adminService
				.loadFarmInBookings(
					pageUrl,
					start_date,
					end_date,
					this.useDateFilter,
					search_value ?? "",
					this.orderBy
				)
				.then((result: any) => {
					if (result?.data?.data == 0) {
						this.noError = true;
					}
					let date = new Date();
					let timestamp = date.getTime();
					date.setDate(date.getDate() + 7);
					timestamp = date.getTime();
					this.bookingsRes = result;
					this.bookings = this.bookingsRes?.data?.data;
					if (!this.useDateFilter && !this.searchText) {
						this.endDate = this.bookings?.length > 0 ? this.bookings[this.bookings?.length - 1]?.pickup_date : moment(timestamp).format("YYYY-MM-DD")
					}
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
					this.subModules = localStorage.getItem("sub_modules") || "";
					this.spinner.hide();
				});
		}


	}

	handleShowMore(
		pageUrl = null,
		start_date: string,
		end_date: string,
		search_value: string = ""
	) {
		search_value == "" && this.spinner.show();
		this.noError = false;
		// Load Our bookings using API
		this.adminService
			.loadBookings(
				pageUrl,
				start_date,
				end_date,
				this.useDateFilter,
				search_value ?? "",
				this.orderBy
			)
			.then((result: any) => {
				if (result?.data?.data == 0) {
					this.noError = true;
				}
				this.bookingsRes = result;
				this.bookings = this.bookings.concat(
					this.bookingsRes.data.data
				);
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
				this.spinner.hide();
			});
	}

	show = false;
	openModal(booking: any, selection_button: string) {
		try {
			setTimeout(() => {
				// $('textarea').attr('autofocus', 'autofocus');
				this.sendEmailModalFocus.nativeElement
					.querySelector("textarea")
					.focus();
			}, 1000);
		} catch (error) {
			console.log("----------error------->>>>>> ", error);
		}
		console.log("passenger details", booking, selection_button)
		this.passengerDetails = booking;
		this.passengerDetails["selection_button"] = selection_button;
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
		return (distance / 1609).toFixed(2);
	}

	mToKm(distance: number): string {
		return (distance / 1000).toFixed(2);
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
		console.log("---------__>>>>>>", dateType, date);
		this[dateType] = date;
	}
	fomatAffiliateType(type: any) {
		if (type == "taxi_operator") {
			return "T";
		} else if (type == "fleet_operator") {
			return "F";
		} else if (type == "black_limo_operator") {
			return "I/O";
		} else if (type == "gig_operator") {
			return "G";
		} else if (type == 'subscriber') {
			return "S";
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

		this.adminService
			.changeStatusBooking(this.changeStatusForm.value)
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
					this.loadBookings(
						null,
						this.startDate,
						this.endDate,
						this.searchText
					);
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
		console.log('in func send email click', bookingId, emailTarget)
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

	showAccountType(value) {
		if (value == "individual") {
			return "(IN)";
		} else if (value == "travel_planner") {
			return "(TA)";
		}
	}

	dateFormat(value: any) {
		return moment(value, "YYYY-MM-DD").format("ll");
	}

	dateFormat2(value: any) {
		return moment(value, "YYYY-MM-DD").format("L");
	}

	timeFormat(value: any) {
		if (value.toUpperCase() == "12:00 AM") {
			return "0000 h";
		}
		let hours = moment(moment(value, "hh:mm a").format("HH"), "HH").hours();
		let mins = moment(value, "hh:mm a").minutes().toString();
		if (Number(mins) == 0 || Number(mins) < 10) {
			mins = "0" + mins.toString();
		}

		return hours < 10
			? "0" + hours.toString() + mins.toString() + " h"
			: hours.toString() + mins.toString() + " h";
		//return value.replace(':', '').substring(0, 5) + 'h';
	}

	timeFormat2(value: string) {
		return moment(value, "HH:mm a").format("h:mm a");
	}

	textFormatter(text: string) {
		try {
			return text.replace(/[\\\_$]+/g, " ");
		} catch {
			return text;
		}
	}
	formatPhoneNumber(ph: any) {
		if (!ph.includes("+")) {
			return "+" + ph;
		}
		return ph;
	}
	formatText(text) {
		return text.replaceAll("_", " ");
	}

	extractTextFromHtml(html: string): string {
		const div = document.createElement('div');
		div.innerHTML = html;

		// Convert paragraph tags to newline
		const paragraphs = div.querySelectorAll('p');
		paragraphs.forEach(p => {
			p.innerHTML += '\n';
		});

		// Replace break tags with new lines
		const breaks = div.querySelectorAll('br');
		breaks.forEach(br => {
			br.outerHTML = '\n';
		});

		// Convert bold tags to uppercase text
		const bolds = div.querySelectorAll('b');
		bolds.forEach(b => {
			b.innerHTML = `${b.innerHTML}`;
		});

		// Return the inner HTML as plain text with preserved formatting
		return div.innerText || div.textContent || '';
	}

	closePreview() {
		$('#previewBookingOnID').modal('hide');
	}

	bookingPreview: any;
	showBookingPreviewModal(booking_id: number) {
		// this.spinner.show();
		this.adminService
			.getBookingPreview(booking_id)
			.subscribe((response: any) => {
				this.spinner.hide();
				this.bookingPreview = response.data;
				this.previewCopyData = this.extractTextFromHtml(this.bookingPreview?.preview_data)
				this.MapController()
				if (this.bookingPreview?.account_type == 'travel_planner' && this.bookingPreview?.created_by != 1) {
					this.adminSharePercent = 15
				}
				else if (this.bookingPreview?.share_array?.farmoutShare) {
					this.adminSharePercent = 15
				}
				else {
					this.adminSharePercent = 25
				}
				
				this.deducted_stripe_fee = ((this?.bookingPreview?.share_array?.grandTotal ? this?.bookingPreview?.share_array?.grandTotal : this?.bookingPreview?.share_array?.returnGrandTotal) * 0.029) + 0.30
				// if (this.bookingPreview?.payment_status == "unpaid") {
				// 	console.log("in shre array", this.bookingPreview?.share_array?.length != 0, this.bookingPreview?.share_array?.length)
				// 	if (this.bookingPreview?.share_array?.length != 0) {
				// 		console.log("in shre array")
				this.shareArray = this?.bookingPreview?.share_array
				// }
				this.rates_preview = this.bookingPreview?.rates_preview;
				// }
				// for(let i in this.bookingPreview?.rates_preview){
				// 	if(!Array.isArray(this.bookingPreview?.rates_preview[i])){
				// 	}
				// }
				this.bookingPreview["booking_instructions"] =
					this.bookingPreview?.booking_instructions.replaceAll(
						"<br />",
						" "
					);
			});
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

	timer: any;
	searchInBookings(search_value: string) {
		this.searchText = search_value;
		console.log("--->>>>>", search_value);
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			// this.saveCookie("search", this.searchText);
			localStorage.setItem("DBSearch", this.searchText);
			this.loadBookings(null, this.startDate, this.endDate, search_value);
		}, 700);
	}

	handleKeypressEvents() {
		clearTimeout(this.timer);
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

	saveCookie(key: string, value: string) {
		// this.adminService.setCookie(key, value, 30);
		localStorage.setItem(key, value);
	}

	// changeFilterType(value: string) {
	// 	console.log(value)
	// 	this.filtertype = value
	// 	this.saveCookie('filtertype', this.filtertype);
	// 	this.loadBookings(null, this.startDate, this.endDate, this.searchText, this.filtertype);
	// }
	iOS() {
		return (
			[
				"iPad Simulator",
				"iPhone Simulator",
				"iPod Simulator",
				"iPad",
				"iPhone",
				"iPod",
			].includes(navigator.platform) ||
			// iPad on iOS 13 detection
			(navigator.userAgent.includes("Mac") && "ontouchend" in document)
		);
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

		let isSafari = /^((?!chrome|android).)*safari/i.test(
			navigator.userAgent
		);
		console.log("isSafari", isSafari);
		this.spinner.show();
		this.adminService
			.getLocationPoints(booking_id)
			.subscribe((response: any) => {
				this.spinner.hide();
				if (
					"lat" in response?.data?.pickupDetail &&
					"long" in response?.data?.pickupDetail &&
					"lat" in response?.data?.dropoffDetail &&
					"long" in response?.data?.dropoffDetail
				) {
					sessionStorage.setItem(
						"pickup",
						JSON.stringify(response?.data?.pickupDetail.address)
					);
					sessionStorage.setItem(
						"dropoff",
						JSON.stringify(response?.data?.dropoffDetail.address)
					);
					let googleDirectionUrl;
					let iosDirectionUrl;
					if (type == "pickup") {
						googleDirectionUrl =
							"https://www.google.com/maps/dir/?api=1" +
							"&destination=" +
							encodeURIComponent(
								response?.data?.pickupDetail.address
							) +
							"&travelmode=driving";
						iosDirectionUrl =
							"http://maps.apple.com/?daddr=" +
							encodeURIComponent(
								response?.data?.pickupDetail.address
							);
					} else {
						googleDirectionUrl =
							"https://www.google.com/maps/dir/?api=1" +
							"&destination=" +
							encodeURIComponent(
								response?.data?.dropoffDetail.address
							) +
							"&travelmode=driving";
						iosDirectionUrl =
							"http://maps.apple.com/?daddr=" +
							encodeURIComponent(
								response?.data?.dropoffDetail.address
							);
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
						});
					} else {
						window.open(googleDirectionUrl, "_blank");
					}
				} else {
					throw new Error(
						"Error: Location Points Not Specified Properly. "
					);
				}
			});
	}

	showLocationPointOnMapByAddress(address: any) {
		let isSafari = /^((?!chrome|android).)*safari/i.test(
			navigator.userAgent
		);
		console.log("isSafari", isSafari);
		if (address) {
			let googleDirectionUrl;
			let iosDirectionUrl;
			googleDirectionUrl =
				"https://www.google.com/maps/dir/?api=1" +
				"&destination=" +
				encodeURIComponent(address) +
				"&travelmode=driving";
			iosDirectionUrl =
				"http://maps.apple.com/?daddr=" + encodeURIComponent(address);
			if (this.iOS()) {
				setTimeout(() => {
					window.location.href = iosDirectionUrl;
				});
			} else {
				window.open(googleDirectionUrl, "_blank");
			}
		} else {
			throw new Error("Error: Location Points Not Specified Properly. ");
		}
	}
	async reAffiliate(booking_id) {
		console.log("in functiuon reaffiliate", booking_id);
		this.spinner.show();
		await this.getQuoteDetails(booking_id);
	}

	getQuoteDetails(id) {
		this.adminService.getQuoteData(id).subscribe((response: any) => {
			console.log("in function get quote data", response.data.quote.location_info);
			this.quotebotNewData = response.data?.quote;

			// let location_info = [];
			// let tempObj = {
			// 	distance: {
			// 		text: this.quotebotNewData?.distance / 1000 + "km",
			// 		value: Number(this.quotebotNewData?.distance),
			// 	},
			// 	duration: {
			// 		text: this.quotebotNewData?.duration / 60 + "mins",
			// 		value: Number(this.quotebotNewData?.duration),
			// 	},
			// };
			// location_info.push(tempObj);
			// this.quotebotNewData["location_info"] = location_info;
			console.log("in location->", response.data?.quote);
			localStorage.setItem(
				"quotebot_form",
				JSON.stringify(response.data?.quote)
			);
			// this.router.navigate(['quotebot/select-vehicle'], { queryParams: { id } });
			// this.Sort.LowToHigh() // default sort to Low-High
			// this.spinner.hide()
		});
		this.adminService.getFilterData(id).subscribe((response: any) => {
			console.log("in function get filter data", response);
			let filters = {
				original: response?.data?.original,
				copy: response?.data?.copy,
				request: response?.data?.request,
				selections: response?.data?.selections,
				vars: response?.data?.vars,
			};

			sessionStorage.setItem('filters', JSON.stringify(filters))
			this.router.navigate(['quotebot/select-vehicle'], { queryParams: { id } });
			// this.Sort.LowToHigh() // default sort to Low-High
			this.spinner.hide();
		});
	}

	searchOnGoogle(query: string) {
		console.log("in search google", query)
		if (query) {
			const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
			window.open(url, '_blank'); // Opens the search in a new tab
		}
	}

	acceptChargeClick(id) {
		this.accept_charge_id = id
	}

	accpetChargeAction() {
		this.spinner.show()
		let data = {
			reservation_id: this.accept_charge_id
		}
		this.adminService
			.acceptCharge(data)
			.pipe(
				catchError((err) => {
					return throwError(err);
				})
			)
			.subscribe((response: any) => {
				this.spinner.hide();
				$("#accept_charge_modal").modal("hide");
				this.$errorDialog.openDialog({
					errors: {
						error: `<span class='text-success font-weight-bolder text-2xl' style="font-size: 24px;">Half payment have been charged successfully!</span>`
					}
				})
				console.log("accept charge action", response);
			});

	}

	chargeBackAction() {
		this.spinner.show()
		let data = {
			reservation_id: this.accept_charge_id
		}
		this.adminService
			.chargeBack(data)
			.pipe(
				catchError((err) => {
					return throwError(err);
				})
			)
			.subscribe((response: any) => {
				this.spinner.hide();
				$("#charge_back_modal").modal("hide");
				this.$errorDialog.openDialog({
					errors: {
						error: `<span class='text-success font-weight-bolder text-2xl' style="font-size: 24px;">Payment have been charged back successfully!</span>`
					}
				})
				console.log("accept charge action", response);
			});

	}

	addBank() {
		this.router.navigate(['/admin/add-bank-details'])
	}

	// redirect to client cards page
	viewClientCardAction(id) {
		this.router.navigate([`/admin/cards`], { queryParams: { accountType: 'individual', accountId: id } });
	}

	// redirect to refund url
	refundAction(url) {
		window.open(url, '_blank'); // Opens the search in a new tab
	}

	myUploader(event) {
		// this.loader = true;

		this.uploadedFile = event.target.files[0]
		console.log("file", this.uploadedFile)
		if (this.uploadedFile) {
			this.fileName = this.uploadedFile['name'];
			this.fileType = this.uploadedFile['type'];
			console.log("file", this.fileName, this.fileType)
		}
	}

}
