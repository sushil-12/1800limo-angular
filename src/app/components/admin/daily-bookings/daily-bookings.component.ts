import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { DateAdapter, MAT_DATE_LOCALE, ThemePalette } from '@angular/material/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
declare var $: any;
import * as moment from 'moment';


@Component({
	selector: 'app-daily-bookings',
	templateUrl: './daily-bookings.component.html',
	styleUrls: ['./daily-bookings.component.scss'],
})
export class DailyBookingsComponent implements OnInit
{

	outputDateFormat = 'YYYY-MM-DD';
	color: ThemePalette = 'primary';
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
	public date: Date;
	// public returnRepeatForm: FormGroup;
	public changeStatusForm: FormGroup;
	public sendEmailForm: FormGroup;
	public submitted: boolean = false;
	// public isRepeat: boolean=false;
	// public isRepeatRoundTrip: boolean=false;

	passengerDetails: any
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
		private http: HttpClient) { }

	ngOnInit(): void
	{
		this.date = new Date();
		this.startDate = this.date.toISOString().substring(0, 10);
		this.date.setDate(this.date.getDate() + 10);
		this.endDate = this.date.toISOString().substring(0, 10);

		this.activatedRoute.queryParams.subscribe((params: any) =>
		{
			if (Object.keys(params).length != 0)
			{
				this.startDate = params.startDate
				this.endDate = params.endDate
			}
		})

		this.loadBookings();

		//repeat return booking form validation
		// this.returnRepeatForm = this.formBuilder.group({
		//   reservation_id: ['', Validators.required],
		//   action_type: ['', Validators.required],
		//   pickup_date: ['', Validators.required],
		//   pickup_time: ['12:00 PM', Validators.required],
		//   return_pickup_date: [''],
		//   return_pickup_time: ['12:00 PM']
		// });

		//change status booking form validation
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

	messageField(format)
	{
		this.show = true;
		switch (format)
		{
			case 'Phone': {
				this.sendMessageField = true;
				break;
			}
			case 'Email': {
				this.sendMessageField = false;
				break;
			}
		}
	}

	submit(message, format)
	{
		this.show = false;
		if (this.passengerDetails.selection_button == 'Passenger')
		{
			this.sendInformation = format ? this.passengerDetails.passenger_cell_isd + this.passengerDetails.passenger_cell : this.passengerDetails.passenger_email;
			this.reciptentName = this.passengerDetails.passenger_name
		}
		else if (this.passengerDetails.selection_button == 'Affiliate')
		{
			this.sendInformation = format ? this.passengerDetails.affiliate_dispatch_isd + this.passengerDetails.affiliate_dispatch_number : this.passengerDetails.dispatchEmail;
			this.reciptentName = this.passengerDetails.driver_first_name + this.passengerDetails.driver_last_name
		} else
		{
			this.sendInformation = format ? this.passengerDetails.loose_affiliate_phone_isd + this.passengerDetails.loose_affiliate_phone : this.passengerDetails.loose_affiliate_email;
			this.reciptentName = this.passengerDetails.loose_affiliate_name
		}

		let obj = {
			bookingId: this.passengerDetails.booking_id,
			reciptentName: this.reciptentName,
			sendTo: this.passengerDetails.selection_button,
			sendThrough: format ? 'Phone' : 'Email',
			sendValue: this.sendInformation,
			sendContent: message
		}
		this.adminService.adminNotification(obj)
			.pipe(
				catchError(err =>
				{
					return throwError(err);
				})
			)
			.subscribe(({ message }: any) =>
			{
				this.notification_msg = message;
				$('#notificationModal').modal('show');
				console.log(message)
				$('textarea').val('');
			});
		$('#closeModal').click(() =>
		{
			$('#notificationModal').modal('hide');
		})
		$('#closeModal1').click(() =>
		{
			$('#notificationModal').modal('hide');
		})
	}

	loadBookings(pageUrl = null)
	{
		console.log(pageUrl);
		/** spinner starts on init */
		this.spinner.show();
		this.router.navigate([], {
			queryParams: {
				startDate: this.startDate,
				endDate: this.endDate
			},
			queryParamsHandling: 'merge'
		})

		var keyword = ((document.getElementById("keyword") as HTMLInputElement).value);
		// Load Our bookings using API
		this.adminService.loadBookings(pageUrl, keyword, this.startDate, this.endDate).then(result =>
		{
			console.log(pageUrl, keyword, this.startDate, this.endDate, "?????????????")
			this.bookingsRes = result;
			this.bookings = this.bookingsRes.data.data;
			this.totalRecords = this.bookingsRes.data.total;
			console.log(this.bookings);

			this.firstPage = 1;
			this.lastPage = this.bookingsRes.data.last_page;
			this.totalPage = this.bookingsRes.data.last_page;
			this.currentPage = this.bookingsRes.data.current_page;
			this.from = this.bookingsRes.data.from;
			this.to = this.bookingsRes.data.to;
			this.path = this.bookingsRes.data.path;
			this.firstPageUrl = this.bookingsRes.data.first_page_url;
			this.lastPageUrl = this.bookingsRes.data.last_page_url;
			console.log(this.lastPageUrl, "////////////////////////////////////")
			this.prevPageUrl = this.bookingsRes.data.prev_page_url;
			console.log(this.prevPageUrl, "//////////////////////////////////////////////////////")
			this.nextPageUrl = this.bookingsRes.data.next_page_url;
			console.log(this.nextPageUrl, "//////////////////////////////////////////////////////////////////////////")
			// sessionStorage.setItem('bookings',JSON.stringify(this.bookings));
			// this.bookings.forEach((item: any) =>
			// {
			// 	this.getAddress(item.pickup_address).then((data: any) =>
			// 	{
			// 		console.log(data)
			// 	})
			// })
			this.spinner.hide();//hide spinner
		})
			.catch(err =>
			{
				this.spinner.hide();//hide spinner
			});
	}

	show = false
	openModal(booking: any, selection_button: string)
	{
		this.passengerDetails = booking;
		this.passengerDetails['selection_button'] = selection_button
	}

	// getAddress(address: string)
	// {
	// 	console.log("getAddress api hit by google")
	// 	if (address)
	// 	{
	// 		console.log("11111111111111111111111")
	// 		return new Promise((resolve) =>
	// 		{
	// 			console.log("22222222222222222")
	// 			resolve(this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyCxj_Txh7lMTSVjCaeFZ76krKaWH_-XpPQ`))
	// 		})
	// 	}
	// }

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
			console.log(date, "check date format...............")
			this.startDate = date;
		}
		else
		{
			this.endDate = date;
		}
	}

	enableDisableClicked(event, id)
	{
		this.spinner.show();//show spinner
		console.log(event.checked);
		if (event.checked)
		{
			var status = 'enable';
		}
		else
		{
			var status = 'disable';
		}
		this.adminService.reservationStatus(id, status)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result =>
			{

				this.spinner.hide();//hide spinner
			});
	}

	editAction(bookingId, updateType)
	{
		if (updateType == 'change')
		{
			this.router.navigate(['/admin/create-new-booking'], { queryParams: { bookingId: bookingId, updateType: updateType } });
		}
		else
		{
			this.router.navigate(['/admin/create-new-booking'], { queryParams: { bookingId: bookingId } });
		}
	}

	finalizeAction(bookingId)
	{
		this.router.navigate(['/admin/booking-details'], { queryParams: { bookingId: bookingId } });
	}

	returnRepeatAction(actionType, bookingId, serviceType)
	{
		console.log(actionType, bookingId, serviceType);
		// this.returnRepeatForm.patchValue({
		//   action_type:actionType,
		//   reservation_id:bookingId
		// });

		if (actionType == 'return')
		{
			// this.isRepeat=false;
			this.router.navigate(['/admin/create-new-booking'], { queryParams: { bookingId: bookingId, bookingType: 'return' } });
		}
		else
		{
			// this.isRepeat=true;
			// if(serviceType=='roundtrip')
			// {
			this.router.navigate(['/admin/create-new-booking'], { queryParams: { bookingId: bookingId, bookingType: 'repeat' } });
			// this.isRepeatRoundTrip=true;
			// }
			// else{
			//   this.isRepeatRoundTrip=false;
			// }

		}
	}

	// get f(){
	//   return this.returnRepeatForm.controls;
	// }

	// returnRepeatBookingForm()
	// {
	//   this.submitted = true;
	//   console.log(this.returnRepeatForm);
	//   // stop here if form is invalid
	//   if (this.returnRepeatForm.invalid) {
	//       return;
	//   }

	//   this.spinner.show();
	//   // this.disableSubmitButton=true; //disable submit button

	//   this.adminService.returnRepeatBooking(this.returnRepeatForm.value)
	//   .pipe(
	//       catchError(err => {
	//         this.spinner.hide();//hide spinner
	//         $('#return_repeat_booking_Modal').modal('hide');
	//         return throwError(err);
	//       })
	//   )
	//   .subscribe(({ data, success, message }: any) => {
	//     if(success==true)
	//     {
	//       this.spinner.hide();//hide spinner
	//       $('#return_repeat_booking_Modal').modal('hide');
	//       this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
	//         this.router.navigate(['/admin/daily-bookings-admin']);
	//       }); 
	//     }
	//   });
	// }

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
		// this.disableSubmitButton=true; //disable submit button

		this.adminService.changeStatusBooking(this.changeStatusForm.value)
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
						this.router.navigate(['/admin/daily-bookings-admin']);
					});
				}
			});
	}


	sendEmailClicked(bookingId, emailTarget)
	{
		// console.log(bookingId,emailTarget)
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
		// this.disableSubmitButton=true; //disable submit button

		this.adminService.sendEmail(this.sendEmailForm.value)
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
						this.router.navigate(['/admin/daily-bookings-admin']);
					});
				}
			});
	}


	FormatDate(date: string)
	{
		return moment(date).format('ll')
	}

	FormatTime(time: string)
	{
		return moment(time, 'HH:mm:ss').format('hh:mm a')
	}


}
