import { Component, OnInit } from '@angular/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
declare var $: any;
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
	refundAmountForm:FormGroup
	show:boolean = false
	constructor(
		private affiliateService: AffiliateService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private $form: FormBuilder,
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
					this.router.navigate(['/affiliate/my-bookings']);
				}
				else
				{
					this.affiliateService.getInvoiceData(this.bookingId)
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
							console.log(this.audit_Trail, "/////\\\\\\")
							this.spinner.hide();//hide spinner
						});
				}
			});
	}
	buildRefundForm(){
		this.refundAmountForm = this.$form.group({
			refundAmount:['',[Validators.required]]
		})
	}
	backButton()
	{
		this.router.navigate(['/affiliate/my-bookings'], { queryParams: { bookingId: this.bookingId } });
	}
	closeModal() {
		this.refundAmountForm.patchValue({refundAmount:this.invoiceData.grand_total})
		this.show = false
		$("#refundModal").modal("hide");
	}

}