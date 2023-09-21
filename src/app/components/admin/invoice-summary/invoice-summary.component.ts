import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
declare var $: any;
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipEvent, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';

export interface Email {
	value: string;
}
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
	show: boolean = false
	show_sendInvoiceToAny: boolean = false
	refundAmountForm: FormGroup
	audit_Trail: Array<any>;
	str_email: any = ''
	partial_refund_amount: number = 0;
	// amount is grandTotal - refunded ammount 
	amount: number = 0
	paymentHistory: any;
	currencyOptions: any;
	currencySymbol: any;
	paymentJson: any[];
	subModules: any = [];
	currentUser: any;
	constructor(
		private adminService: AdminService,
		private router: Router,
		private $form: FormBuilder,
		private spinner: NgxSpinnerService,
		private $spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
		private activatedroute: ActivatedRoute,
		private httpClient: HttpClient) { }


	ngOnInit(): void {

		this.spinner.show();
		this.buildRefundForm()
		this.getCurrencyData();
		this.activatedroute.queryParamMap
			.subscribe((params) => {
				this.paramResponse = { ...params.keys, ...params };
				this.bookingId = this.paramResponse.params.bookingId;

				if (!this.bookingId) {
					this.router.navigate(['/admin/daily-bookings-admin']);
				}
				else {
					this.getInvoiceData()
				}
			});

	}

	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	readonly separatorKeysCodes: number[] = [ENTER, COMMA];
	emails: Email[] = [];

	add(event: MatChipInputEvent): void {
		const input = event.input;
		const value = event.value;

		// Add our email
		if ((value || '').trim()) {
			this.emails.push({ value: value.trim() });
		}

		// Reset the input value
		if (input) {
			input.value = '';
		}
		console.log('emails-->>>', this.emails)
	}

	remove(email: Email): void {
		console.log('in function remove-->>', email)
		const index = this.emails.indexOf(email);

		if (index >= 0) {
			this.emails.splice(index, 1);
		}
	}


	backButton() {
		this.router.navigate(['/admin/daily-bookings-admin']);
	}
	buildRefundForm() {
		this.refundAmountForm = this.$form.group({
			refundAmount: ['', [Validators.required]]
		})
	}

	getInvoiceData() {

		this.adminService.getInvoiceData(this.bookingId)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(({ data, sucess, message }: any) => {
				console.log("array response", data)
				this.invoiceData = data;
				this.audit_Trail = this.invoiceData?.audit_trail;
				// amount refunded is in penny ,for convert to dollar divide by 100
				this.partial_refund_amount = this.invoiceData?.billing_detail?.amount_refunded / 100
				this.amount = this.invoiceData?.grand_total - this.partial_refund_amount
				this.refundAmountForm.patchValue({ refundAmount: this.amount })
				this.refundAmountForm.controls['refundAmount'].setValidators([Validators.required, Validators.max(this.amount)])
				this.refundAmountForm.controls['refundAmount'].updateValueAndValidity();
				this.spinner.hide();//hide spinner
				this.currencySymbol = this.getCurrencySymbol(this.invoiceData.currency)
				this.subModules = localStorage.getItem('sub_modules') || [];
				this.currentUser = JSON.parse(localStorage.getItem('userData')) || "";
			});
		this.adminService.getPaymentLogs(this.bookingId)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(({ data, sucess, message }: any) => {
				console.log("array response", data)
				this.paymentHistory = data?.logs
				this.paymentJson = []
				for (let prop in this.paymentHistory) {
					let itemObj = {
						balance_transaction: prop,
						amount: this.paymentHistory[prop]?.amount_captured,
						type: 'Payment',
						created: this.paymentHistory[prop]?.created_at
					}
					this.paymentJson.push(itemObj)
					this.paymentHistory[prop].refunds.map(i => {
						let obj1 = {
							balance_transaction: i?.balance_transaction,
							amount: i?.amount / 100,
							created: i?.created,
							type: 'Refund'
						}
						this.paymentJson.push(obj1)
					})
				}
			});

	}
	sendInvoiceToCustomer() {
		this.$spinner.show()
		this.adminService.sendInvoiveToCustomer(this.bookingId).subscribe((response: any) => {
			// this.$errors.openDialog({
			// 	errors: {
			// 		error: `<span class='text-success'>${response.message}</span>`
			// 	}
			// })
			// this.$router.navigate(['/admin/daily-bookings-admin'])
			console.log('response-->>', response)
			this.$spinner.hide()
		})
	}
	sendInvoiceToAny() {

		let data = {
			// email_addresses: this.emails
			email_address: this.str_email
		}


		this.$spinner.show()
		this.adminService.sendInvoiveToAny(this.bookingId, data).subscribe((response: any) => {
			this.$errors.openDialog({
				errors: {
					error: `<span class='text-success'>${response.message}</span>`
				}
			})
			// this.$router.navigate(['/admin/daily-bookings-admin'])
			console.log('response-->>', response)
			this.$spinner.hide()
		})
		this.show_sendInvoiceToAny = false
		this.str_email = ''
		$("#sendInvoiceToAny").modal("hide");
	}
	get Form() {
		return this.refundAmountForm.controls;
	}
	TimestampToDate(timestamp: any) {
		if (timestamp) {
			return moment(timestamp * 1000).format('MMMM Do YYYY, h:mm:ss a')
		}
	}
	formatText(value){
		return value ? value.replaceAll('_' , ' ') : ''
	}

	getCurrencyData() {
		console.log('in function get currency data')
		this.httpClient.get("assets/json/currencyOptions1.json").subscribe(data => {
			console.log('data ', data)
			this.currencyOptions = data;
		})
	}
	getCurrencySymbol(currency: any) {
		let symbol;
		for (let i = 0; i < this.currencyOptions.length; i++) {
			if (this.currencyOptions[i].code == currency.toUpperCase()) {
				symbol = this.currencyOptions[i].symbol
				break;
			}
		}
		return symbol
	}


	refund() {
		console.log('--------->>>>>>>>>>>>>>', this.refundAmountForm.get('refundAmount').value, this.refundAmountForm.valid)
		if (this.refundAmountForm.valid) {
			$("#refundModal").modal("hide");
			this.$spinner.show()
			let body = {
				reservation_id: this.invoiceData.reservation_id,
				amount: this.refundAmountForm.get('refundAmount').value,
				invoice_id: this.invoiceData.invoice_number
			}
			this.adminService.refund(body).subscribe((response: any) => {
				// this.$errors.openDialog({
				// 	errors: {
				// 		error: `<span class='text-success'>${response.message}</span>`
				// 	}
				// })
				// this.$router.navigate(['/admin/daily-bookings-admin'])
				this.getInvoiceData()
				// this.$spinner.hide()
			})
		}
	}


	closeModal() {
		this.refundAmountForm.patchValue({ refundAmount: this.invoiceData.grand_total })
		this.show = false
		$("#refundModal").modal("hide");
	}
	closeModal_send_in_to_any() {
		// this.refundAmountForm.patchValue({refundAmount:this.invoiceData.grand_total})
		this.show_sendInvoiceToAny = false
		this.str_email = ''
		$("#sendInvoiceToAny").modal("hide");
	}

	handleInputEmail(event: any) {
		console.log('in function handle input email', event.target.value)
		if (event.target.value) {
			this.str_email = event.target.value
		}
	}

}
