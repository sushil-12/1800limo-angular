import { Component, OnInit, isDevMode } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService } from 'src/app/services/admin.service';

@Component({
	selector: 'app-finalize-booking',
	templateUrl: './finalize-booking.component.html',
	styleUrls: ['./finalize-booking.component.scss']
})
export class FinalizeBookingComponent implements OnInit
{

	bookingId: number = 0;

	BookingDetail: any;
	RatesList: any;
	CardsInformation: any

	constructor(
		private $api: AdminService,
		private $route: ActivatedRoute,
		private $router: Router,
		private $spinner: NgxSpinnerService
	) { }

	ngOnInit(): void
	{

		this.$route.queryParams.subscribe((params: any) =>
		{
			isDevMode && console.log('Params Found: ', params)
			if (params.bookingId)
			{
				this.bookingId = params.bookingId;

				this.getReservationDetails(this.bookingId)
			} else
			{
				// navigate back to dashboard in case of no booking Id specified.
				this.$router.navigate(['/admin/daily-bookings-admin'])
			}
		})
	}


	getReservationDetails(booking_id: number = 0)
	{
		this.$spinner.show()
		this.$api.getReservationDetails(booking_id).pipe().subscribe((response: any) =>
		{
			this.$spinner.hide()
			console.log(response)
			this.BookingDetail = response.data.booking_detail;
			this.RatesList = response.data.priceDetail;
			this.CardsInformation = response.data.CreditCardsDetail;
		})
	}

}
