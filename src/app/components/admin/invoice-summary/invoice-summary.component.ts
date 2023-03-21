import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';

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
		private $spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
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

	sendInvoiceToCustomer(){
		this.$spinner.show()
		this.adminService.sendInvoiveToCustomer(this.bookingId).subscribe((response: any) => {
			this.$errors.openDialog({
				errors: {
					error: `<span class='text-success'>${response.message}</span>`
				}
			})
			// this.$router.navigate(['/admin/daily-bookings-admin'])
			console.log('response-->>' , response)
			this.$spinner.hide()
		})
	}

	refund(){
		this.$spinner.show()
		let body = {
			reservation_id : this.invoiceData.reservation_id,
			amount : this.invoiceData.grand_total * 100,
			invoice_id: this.invoiceData.invoice_number
		}
		this.adminService.refund(body).subscribe((response: any) => {
			this.$errors.openDialog({
				errors: {
					error: `<span class='text-success'>${response.message}</span>`
				}
			})
			// this.$router.navigate(['/admin/daily-bookings-admin'])
			this.$spinner.hide()
		})
	}

}
