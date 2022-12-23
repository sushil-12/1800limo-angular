import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';

@Component({
	selector: 'app-booking-details',
	templateUrl: './booking-details.component.html',
	styleUrls: ['./booking-details.component.scss']
})
export class BookingDetailsComponent implements OnInit
{
	rates: Array<Record<string, any>> = []
	direct_taxes: Array<Record<string, any>> = []
	taxes: Array<Record<string, any>> = []
	hide: boolean = false

	constructor(
		private $api: AdminService,
		private $route: ActivatedRoute,
		private $router: Router
	) { }

	ngOnInit(): void
	{
		// this.$route.queryParams.subscribe((params: any) =>
		// {
		// 	if (params.bookingId)
		// 	{
		// 		this.getReservationDetails(params.bookingId)
		// 	} else
		// 	{
		// 		this.$router.navigate(['/admin/daily-bookings-admin'])
		// 	}
		// })
	}


	getReservationDetails(booking_id: number)
	{
		// this.$api.getReservationDetails(booking_id).subscribe((response: any) =>
		// {

		// })
	}

}
