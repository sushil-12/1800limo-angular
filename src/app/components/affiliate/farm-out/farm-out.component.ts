import { Component, OnInit } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AffiliateService } from '../../../services/affiliate.service';

declare var $: any


@Component({
	selector: 'app-farm-out',
	templateUrl: './farm-out.component.html',
	styleUrls: ['./farm-out.component.scss']
})
export class FarmOutComponent implements OnInit
{
	OUTPUTDATEFORMAT = 'YYYY-MM-DD'

	farmout_modal_body: string

	start_date: string
	end_date: string

	constructor(
		private $affiliateService: AffiliateService,
		private $spinner: NgxSpinnerService,
		private $router: Router,
		private $forms: FormBuilder
	) { }

	ngOnInit(): void 
	{
		// check for selected vehicle and logged in affiliate
		console.log(this.$affiliateService.initialiseFarmout())
		if (!this.$affiliateService.initialiseFarmout())
		{
			sessionStorage.removeItem('selected_vehicle')
			this.farmout_modal_body = `
			You cannot create a booking of this vehicle. <br/><br/>
			<h6>Create a new Farm Out Booking ?</h6>
			`
			$('#farmout-modal').modal('show')
		}
		const date = new Date()
		this.start_date = date.toISOString().split('T')[0]
		date.setDate(date.getDate() + 10)
		this.end_date = date.toISOString().split('T')[0]
	}

	getFarmoutBookings(): Promise<boolean>
	{
		return new Promise((resolve) =>
		{
			// this.$affiliateService.getFarmoutBookings().subscribe((date: any) =>
			// {
			// 	console.log('Farm OutBookings: ----------------- x -----------------------')
			// })
			resolve(true)
		})
	}

}
