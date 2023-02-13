import { Component, OnInit } from "@angular/core";
import { AdminService } from "../../../services/admin.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";
import
{
	DateAdapter,
	MAT_DATE_LOCALE,
	ThemePalette,
} from "@angular/material/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
declare var $: any;
import * as moment from "moment";

@Component({
	selector: "app-daily-bookings",
	templateUrl: "./daily-bookings.component.html",
	styleUrls: ["./daily-bookings.component.scss"],
})
export class DailyBookingsComponent implements OnInit
{
	outputDateFormat = "YYYY-MM-DD";
	color: ThemePalette = "primary";
	public firstPage: Number;
	public lastPage: Number;
	public totalPage: Number;
	public totalRecords: Number;
	public currentPage: Number;
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
	// public isRepeat: boolean=false;
	// public isRepeatRoundTrip: boolean=false;

	passengerDetails: any;
	senderValue: string;
	sendInformation: any;
	reciptentName: any;
	notification_msg: any;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private http: HttpClient
	) { }

	ngOnInit(): void
	{
		this.resetDates()

		// Override Start Date
		if (this.adminService.checkCookie('startDate'))
		{
			this.startDate = this.adminService.getCookie('startDate');
		}

		// Override End Date
		if (this.adminService.checkCookie('endDate'))
		{
			this.endDate = this.adminService.getCookie('endDate');
		}


		this.loadBookings(null, this.startDate, this.endDate, null);

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

	/**
	 * Configure date as per todays date and the future +7 days
	 */
	resetDates()
	{
		let date = new Date();

		date.setDate(date.getDate() - 7);
		this.startDate = date.toISOString().substring(0, 10);
		date.setDate(date.getDate() + 14);
		this.endDate = date.toISOString().substring(0, 10);

		console.log('Dates reset Successfully. ');
	}

	messageField(format)
	{
		this.show = true;
		switch (format)
		{
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

	submit(message, format)
	{
		this.show = false;
		if (this.passengerDetails.selection_button == "Passenger")
		{
			this.sendInformation = format
				? this.passengerDetails.passenger_cell_isd +
				this.passengerDetails.passenger_cell
				: this.passengerDetails.passenger_email;
			this.reciptentName = this.passengerDetails.passenger_name;
		} else if (this.passengerDetails.selection_button == "Affiliate")
		{
			this.sendInformation = format
				? this.passengerDetails.affiliate_dispatch_isd +
				this.passengerDetails.affiliate_dispatch_number
				: this.passengerDetails.dispatchEmail;
			this.reciptentName =
				this.passengerDetails.driver_first_name +
				this.passengerDetails.driver_last_name;
		} else
		{
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
				catchError((err) =>
				{
					return throwError(err);
				})
			)
			.subscribe(({ message }: any) =>
			{
				this.notification_msg = message;
				$("#notificationModal").modal("show");
				console.log(message);
				$("textarea").val("");
			});
		$("#closeModal").click(() =>
		{
			$("#notificationModal").modal("hide");
		});
		$("#closeModal1").click(() =>
		{
			$("#notificationModal").modal("hide");
		});
	}

	loadBookings(pageUrl = null, start_date: string, end_date: string, search_value: string = '')
	{
		// Load Our bookings using API
		this.adminService.loadBookings(pageUrl, start_date, end_date, search_value ?? '').then((result) =>
		{
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
			this.spinner.hide();
		})
	}

	show = false;
	openModal(booking: any, selection_button: string)
	{
		this.passengerDetails = booking;
		this.passengerDetails["selection_button"] = selection_button;
	}

	//for pagination
	counter()
	{
		var currentPage;
		var startFrom;
		var endTo;

		if (this.currentPage < 5)
		{
			startFrom = 0;
			endTo = this.totalPage;
		} else if (this.currentPage < this.totalPage)
		{
			currentPage = this.currentPage;
			endTo = currentPage + 1;
			startFrom = endTo - 5;
		} else
		{
			endTo = this.totalPage;
			startFrom = endTo - 5;
		}

		var i;
		var udpArr = new Array();
		for (i = startFrom; i < endTo; i++)
		{
			udpArr.push(i + 1);
		}
		return udpArr;
	}

	changeDate(dateType, date)
	{
		this[dateType] = date
	}

	enableDisableClicked(event, id)
	{
		this.spinner.show(); //show spinner
		console.log(event.checked);
		if (event.checked)
		{
			var status = "enable";
		} else
		{
			var status = "disable";
		}
		this.adminService
			.reservationStatus(id, status)
			.pipe(
				catchError((err) =>
				{
					this.spinner.hide(); //hide spinner
					return throwError(err);
				})
			)
			.subscribe((result) =>
			{
				this.spinner.hide(); //hide spinner
			});
	}

	get changeStatusF()
	{
		return this.changeStatusForm.controls;
	}

	changeBookingStatus(bookingId)
	{
		this.changeStatusForm.patchValue({
			reservation_id: bookingId,
		});
	}

	submitChangeStatusForm()
	{
		this.submitted = true;
		console.log(this.changeStatusForm);
		// stop here if form is invalid
		if (this.changeStatusForm.invalid)
		{
			return;
		}

		this.spinner.show();
		// this.disableSubmitButton=true; //disable submit button

		this.adminService.changeStatusBooking(this.changeStatusForm.value)
			.pipe(
				catchError((err) =>
				{
					this.spinner.hide(); //hide spinner
					$("#change_status_booking_Modal").modal("hide");
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) =>
			{
				if (success == true)
				{
					$("#change_status_booking_Modal").modal("hide");
					this.loadBookings(null, this.startDate, this.endDate)
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

	sendEmailClicked(bookingId, emailTarget)
	{
		this.sendEmailForm.patchValue({
			reservation_id: bookingId,
			emailTarget: emailTarget,
		});
	}

	emailForm()
	{
		this.submitted = true;
		console.log(this.sendEmailForm);
		// stop here if form is invalid
		if (this.sendEmailForm.invalid)
		{
			return;
		}

		this.spinner.show();
		// this.disableSubmitButton=true; //disable submit button

		this.adminService
			.sendEmail(this.sendEmailForm.value)
			.pipe(
				catchError((err) =>
				{
					this.spinner.hide(); //hide spinner
					$("#emailModal").modal("hide");
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) =>
			{
				if (success == true)
				{
					this.spinner.hide(); //hide spinner
					$("#emailModal").modal("hide");
					this.router
						.navigateByUrl("/RefreshComponent", {
							skipLocationChange: true,
						})
						.then(() =>
						{
							this.router.navigate([
								"/admin/daily-bookings-admin",
							]);
						});
				}
			});
	}

	FormatDate(date: string)
	{
		return moment(date).format("ll");
	}

	FormatTime(time: string)
	{
		return moment(time, "HH:mm:ss").format("LT");
	}


	dateFormat(value: any)
	{
		return moment(value, 'YYYY-MM-DD').format('ll')
	}

	dateFormat2(value: any)
	{
		return moment(value, 'YYYY-MM-DD').format('L')
	}

	timeFormat(value: any)
	{
		if (value.toUpperCase() == '12:00 AM')
		{
			return '0000 h'
		}
		let hours = moment(moment(value, 'hh:mm a').format('HH'), 'HH').hours();
		let mins = moment(value, 'hh:mm a').minutes().toString();
		if (Number(mins) == 0 || Number(mins) < 10)
		{
			mins = '0' + mins.toString();
		}

		return hours < 10 ? '0' + hours.toString() + mins.toString() + ' h' : hours.toString() + mins.toString() + ' h'
		//return value.replace(':', '').substring(0, 5) + 'h';
	}

	timeFormat2(value: string)
	{
		return moment(value, 'HH:mm a').format('h:mm a');
	}

	textFormatter(text: string)
	{
		try
		{
			return text.replace(/[\\\_$]+/g, ' ')
		}
		catch
		{
			return text
		}
	}

	bookingPreview: any
	showBookingPreviewModal(booking_id: number)
	{
		this.spinner.show();
		this.adminService.getBookingPreview(booking_id).subscribe((response: any) =>
		{
			this.spinner.hide();
			this.bookingPreview = response.data;
		})
	}


	timer: any
	searchInBookings(search_value: string)
	{
		clearTimeout(this.timer);
		this.timer = setTimeout(() =>
		{
			this.spinner.show()
			this.loadBookings(null, this.startDate, this.endDate, search_value)
		}, 100)
	}

	handleKeypressEvents()
	{
		clearTimeout(this.timer)
	}

	saveCookie(key: string, value: string)
	{
		this.adminService.setCookie(key, value, 30);
	}
}
