import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
	selector: 'app-invoice-summary',
	templateUrl: './invoice-summary.component.html',
	styleUrls: ['./invoice-summary.component.scss']
})
export class InvoiceSummaryComponent implements OnInit
{

	public response: any;
	public invoiceData: any;
	public paramResponse: any;
	public bookingId: any;
	audit_Trail: Array<any>;
	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private activatedroute: ActivatedRoute) { }

	ngOnInit(): void
	{

		this.spinner.show();
		this.activatedroute.queryParamMap
			.subscribe((params) =>
			{
				this.paramResponse = { ...params.keys, ...params };
				this.bookingId = this.paramResponse.params.bookingId;

				if (!this.bookingId)
				{
					this.router.navigate(['/admin/daily-bookings-admin']);
				}
				else
				{
					this.adminService.getInvoiceData(this.bookingId)
						.pipe(
							catchError(err =>
							{
								this.spinner.hide();//hide spinner
								return throwError(err);
							})
						).subscribe(({ data, sucess, message }: any) =>
						{
							console.log("array response", data)
							this.invoiceData = data;
							this.audit_Trail = this.invoiceData.audit_trail;
							console.log(this.audit_Trail)
							this.spinner.hide();//hide spinner
						});
				}
			});
	}
	backButton()
	{
		this.router.navigate(['/admin/daily-bookings-admin']);
	}

}
