import { Component, OnInit } from '@angular/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
declare var $: any;
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';

@Component({
	selector: 'app-invoice-summary',
	templateUrl: './invoice-summary.component.html',
	styleUrls: ['./invoice-summary.component.scss']
})
export class InvoiceSummaryComponent implements OnInit {

	public response: any;
	public invoiceData: any;
	public paramResponse: any;
	public bookingId: any;
	audit_Trail: Array<any>;
	refundAmountForm: FormGroup
	show: boolean = false
	currencySymbol: any;
	constructor(
		private affiliateService: AffiliateService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private $form: FormBuilder,
		private $errors: ErrorDialogService,
		private stateManagementService: StateManagementService,
		private activatedroute: ActivatedRoute) { }

	ngOnInit(): void {

		this.spinner.show();
		this.buildRefundForm()
		this.activatedroute.queryParamMap
			.subscribe((params) => {
				this.paramResponse = { ...params.keys, ...params };
				this.bookingId = this.paramResponse.params.bookingId;

				if (!this.bookingId) {
					this.router.navigate(['/affiliate/my-bookings']);
				}
				else {
					this.fetchInvoiceData()
				}
			});

		this.currencySymbol = this.stateManagementService.getCurrencySymbol()
	}

	fetchInvoiceData() {
		this.affiliateService.getInvoiceData(this.bookingId)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(({ data, sucess, message }: any) => {
				console.log("array response", data)
				this.invoiceData = data;
				this.audit_Trail = this.invoiceData.audit_trail;
				this.refundAmountForm.patchValue({ refundAmount: this.invoiceData.grand_total })
				console.log(this.audit_Trail, "/////\\\\\\")
				this.spinner.hide();//hide spinner
			});
	}
	buildRefundForm() {
		this.refundAmountForm = this.$form.group({
			refundAmount: ['', [Validators.required]]
		})
	}
	backButton() {
		this.router.navigate(['/affiliate/my-bookings'], { queryParams: { bookingId: this.bookingId } });
	}
	closeModal() {
		this.refundAmountForm.patchValue({ refundAmount: this.invoiceData.grand_total })
		this.show = false
		$("#refundModal").modal("hide");
		console.log('in function closeModal')
	}

	get Form() {
		return this.refundAmountForm.controls;
	}
	sendInvoiceToCustomer() {
		this.spinner.show()
		this.affiliateService.sendInvoiveToCustomer(this.bookingId).subscribe((response: any) => {
			// this.$errors.openDialog({
			// 	errors: {
			// 		error: `<span class='text-success'>${response.message}</span>`
			// 	}
			// })
			// this.$router.navigate(['/admin/daily-bookings-admin'])
			console.log('response-->>', response)
			this.spinner.hide()
		})
	}

	refund() {
		console.log('--------->>>>>>>>>>>>>>', this.refundAmountForm.get('refundAmount').value, this.refundAmountForm.valid)
		if (this.refundAmountForm.valid) {
			$("#refundModal").modal("hide");
			this.spinner.show()
			let body = {
				reservation_id: this.invoiceData.reservation_id,
				amount: this.refundAmountForm.get('refundAmount').value * 100,
				invoice_id: this.invoiceData.invoice_number
			}
			this.affiliateService.refund(body).subscribe((response: any) => {
				// this.$errors.openDialog({
				// 	errors: {
				// 		error: `<span class='text-success'>${response.message}</span>`
				// 	}
				// })
				// this.$router.navigate(['/admin/daily-bookings-admin'])
				this.fetchInvoiceData()
				// this.$spinner.hide()
			})
		}
	}

}