import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
declare var $: any;
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
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
	show:boolean = false
	refundAmountForm:FormGroup
	audit_Trail: Array<any>;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private $form: FormBuilder,
		private spinner: NgxSpinnerService,
		private $spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
		private activatedroute: ActivatedRoute) { }

	ngOnInit(): void
	{

		this.spinner.show();
		this.buildRefundForm()
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
					this.getInvoiceData()
				}
			});
	}
	backButton()
	{
		this.router.navigate(['/admin/daily-bookings-admin']);
	}
	buildRefundForm(){
		this.refundAmountForm = this.$form.group({
			refundAmount:['',[Validators.required]]
		})
	}

	getInvoiceData(){

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
			this.refundAmountForm.patchValue({refundAmount:this.invoiceData.grand_total})
			this.refundAmountForm.controls['refundAmount'].setValidators([Validators.required,Validators.max(this.invoiceData.grand_total)])
			this.refundAmountForm.controls['refundAmount'].updateValueAndValidity();
			this.spinner.hide();//hide spinner
		});
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
	get Form() {
		return this.refundAmountForm.controls;
	}

	refund(){
		console.log('--------->>>>>>>>>>>>>>',this.refundAmountForm.get('refundAmount').value , this.refundAmountForm.valid)
		if(this.refundAmountForm.valid){
			$("#refundModal").modal("hide");
			this.$spinner.show()
			let body = {
				reservation_id : this.invoiceData.reservation_id,
				amount : this.refundAmountForm.get('refundAmount').value  * 100,
				invoice_id: this.invoiceData.invoice_number
			}
			this.adminService.refund(body).subscribe((response: any) => {
				this.$errors.openDialog({
					errors: {
						error: `<span class='text-success'>${response.message}</span>`
					}
				})
				// this.$router.navigate(['/admin/daily-bookings-admin'])
				this.getInvoiceData()
				// this.$spinner.hide()
			})
		}
	}

	closeModal() {
		this.refundAmountForm.patchValue({refundAmount:this.invoiceData.grand_total})
		this.show = false
		$("#refundModal").modal("hide");
	}

}
