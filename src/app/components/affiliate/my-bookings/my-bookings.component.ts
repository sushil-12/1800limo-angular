import { Component, OnInit } from '@angular/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
declare var $: any;

@Component({
	selector: 'app-my-bookings',
	templateUrl: './my-bookings.component.html',
	styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit
{

	color: ThemePalette = 'primary';
	outputDateFormat = 'YYYY-MM-DD';
	public totalRecords: Number;
	public firstPage: Number;
	public lastPage: Number;
	public totalPage: Number;
	public currentPage: Number;
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

	constructor(
		private affiliateService: AffiliateService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder) { }

	ngOnInit(): void
	{
		this.date = new Date();
		this.startDate = this.date.toISOString().substring(0, 10);
		this.date.setDate(this.date.getDate() + 10);
		this.endDate = this.date.toISOString().substring(0, 10);

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
	}


	loadBookings(pageUrl = null)
	{
		/** spinner starts on init */
		this.spinner.show();

		var keyword = ((document.getElementById("keyword") as HTMLInputElement).value);
		// Load Our bookings using API
		this.affiliateService.loadBookings(pageUrl, keyword, this.startDate, this.endDate).then(result =>
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
			this.spinner.hide();//hide spinner
		})
			.catch(err =>
			{
				this.spinner.hide();//hide spinner
			});
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
		}
		else if (this.currentPage < this.totalPage)
		{
			currentPage = this.currentPage
			endTo = currentPage + 1;
			startFrom = endTo - 5;
		}
		else
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
		if (dateType == 'startDate')
		{
			this.startDate = date;
		}
		else
		{
			this.endDate = date;
		}
	}

	show = false
	openModal(booking: any, selection_button: string)
	{
		this.passengerDetails = booking;
		this.passengerDetails['selection_button'] = selection_button
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


	// submit(message, format)
	// {
	// 	this.show = false;
	// 	if (this.passengerDetails.selection_button == 'Passenger')
	// 	{
	// 		this.sendInformation = format ? this.passengerDetails.passenger_cell_isd + this.passengerDetails.passenger_cell : this.passengerDetails.passenger_email;
	// 		this.reciptentName = this.passengerDetails.passenger_name
	// 	}
	// 	else if (this.passengerDetails.selection_button == 'Affiliate')
	// 	{
	// 		this.sendInformation = format ? this.passengerDetails.affiliate_dispatch_isd + this.passengerDetails.affiliate_dispatch_number : this.passengerDetails.dispatchEmail;
	// 		this.reciptentName = this.passengerDetails.driver_first_name + this.passengerDetails.driver_last_name
	// 	} else
	// 	{
	// 		this.sendInformation = format ? this.passengerDetails.loose_affiliate_phone_isd + this.passengerDetails.loose_affiliate_phone : this.passengerDetails.loose_affiliate_email;
	// 		this.reciptentName = this.passengerDetails.loose_affiliate_name
	// 	}

	// 	let obj = {
	// 		bookingId: this.passengerDetails.booking_id,
	// 		reciptentName: this.reciptentName,
	// 		sendTo: this.passengerDetails.selection_button,
	// 		sendThrough: format ? 'Phone' : 'Email',
	// 		sendValue: this.sendInformation,
	// 		sendContent: message
	// 	}
	// 	this.affiliateService.adminNotification(obj)
	// 		.pipe(
	// 			catchError(err =>
	// 			{
	// 				return throwError(err);
	// 			})
	// 		)
	// 		.subscribe(({ message }: any) =>
	// 		{
	// 			this.notification_msg = message;
	// 			$('#notificationModal').modal('show');
	// 			console.log(message)
	// 			$('textarea').val('');
	// 		});
	// 	$('#closeModal').click(() =>
	// 	{
	// 		$('#notificationModal').modal('hide');
	// 	})
	// 	$('#closeModal1').click(() =>
	// 	{
	// 		$('#notificationModal').modal('hide');
	// 	})
	// }


	editAction(bookingId, updateType)
	{
		if (updateType == 'change')
		{
			this.router.navigate(['/affiliate/create-new-booking'], { queryParams: { bookingId: bookingId, updateType: updateType } });
		}
		else
		{
			this.router.navigate(['/affiliate/create-new-booking'], { queryParams: { bookingId: bookingId } });
		}
	}

	finalizeAction(bookingId)
	{
		this.router.navigate(['/affiliate/create-new-booking-detail'], { queryParams: { bookingId: bookingId } });
	}

	returnRepeatAction(actionType, bookingId, serviceType)
	{
		console.log(actionType, bookingId, serviceType);

		if (actionType == 'return')
		{
			this.router.navigate(['/affiliate/create-new-booking'], { queryParams: { bookingId: bookingId, bookingType: 'return' } });
		}
		else
		{
			this.router.navigate(['/affiliate/create-new-booking'], { queryParams: { bookingId: bookingId, bookingType: 'repeat' } });
		}
	}

	get changeStatusF()
	{
		return this.changeStatusForm.controls;
	}

	changeBookingStatus(bookingId)
	{
		this.changeStatusForm.patchValue({
			reservation_id: bookingId
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

		this.affiliateService.changeStatusBooking(this.changeStatusForm.value)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					$('#change_status_booking_Modal').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) =>
			{
				if (success == true)
				{
					this.spinner.hide();//hide spinner
					$('#change_status_booking_Modal').modal('hide');
					this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
					{
						this.router.navigate(['/affiliate/my-bookings']);
					});
				}
			});
	}


	sendEmailClicked(bookingId, emailTarget)
	{
		this.sendEmailForm.patchValue({
			reservation_id: bookingId,
			emailTarget: emailTarget
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

		this.affiliateService.sendEmail(this.sendEmailForm.value)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					$('#emailModal').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) =>
			{
				if (success == true)
				{
					this.spinner.hide();//hide spinner
					$('#emailModal').modal('hide');
					this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
					{
						this.router.navigate(['/affiliate/my-bookings']);
					});
				}
			});
	}
}
