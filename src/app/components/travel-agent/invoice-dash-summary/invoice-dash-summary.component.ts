import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { TravelAgentService } from 'src/app/services/travel-agent.service';
declare var $: any;
import { MatChipEvent, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import * as moment from 'moment';

@Component({
  selector: 'app-invoice-dash-summary',
  templateUrl: './invoice-dash-summary.component.html',
  styleUrls: ['./invoice-dash-summary.component.scss']
})
export class InvoiceDashSummaryComponent implements OnInit {

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
    private TravelService: TravelAgentService,
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private $spinner: NgxSpinnerService,
		private activatedroute: ActivatedRoute,
		private httpClient: HttpClient) { }

    ngOnInit(): void {
	this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
      this.spinner.show();
      this.getCurrencyData();
      this.activatedroute.queryParamMap
        .subscribe((params) => {
          this.paramResponse = { ...params.keys, ...params };
          this.bookingId = this.paramResponse.params.bookingId;
  
          if (!this.bookingId) {
            this.router.navigate([`/${this.currentUser?.roleName}/bookings`]);
          }
          else {
            this.getInvoiceData()
          }
        });
  
    }

    backButton() {
      this.router.navigate([`/${this.currentUser?.roleName}/invoices`]);
    }

  getCurrencyData() {
		console.log('in function get currency data')
		this.httpClient.get("assets/json/currencyOptions1.json").subscribe(data => {
			console.log('data ', data)
			this.currencyOptions = data;
		})
	}

  getInvoiceData() {

		this.TravelService.getInvoiceData(this.bookingId)
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
				// this.refundAmountForm.patchValue({ refundAmount: this.amount })
				// this.refundAmountForm.controls['refundAmount'].setValidators([Validators.required, Validators.max(this.amount)])
				// this.refundAmountForm.controls['refundAmount'].updateValueAndValidity();
				this.spinner.hide();//hide spinner
				this.currencySymbol = this.getCurrencySymbol(this.invoiceData.currency)
				this.subModules = localStorage.getItem('sub_modules') || [];
				this.currentUser = JSON.parse(localStorage.getItem('userData')) || "";
			});
		// this.adminService.getPaymentLogs(this.bookingId)
		// 	.pipe(
		// 		catchError(err => {
		// 			this.spinner.hide();//hide spinner
		// 			return throwError(err);
		// 		})
		// 	).subscribe(({ data, sucess, message }: any) => {
		// 		console.log("array response", data)
		// 		this.paymentHistory = data?.logs
		// 		this.paymentJson = []
		// 		for (let prop in this.paymentHistory) {
		// 			let itemObj = {
		// 				balance_transaction: prop,
		// 				amount: this.paymentHistory[prop]?.amount_captured,
		// 				type: 'Payment',
		// 				created: this.paymentHistory[prop]?.created_at
		// 			}
		// 			this.paymentJson.push(itemObj)
		// 			this.paymentHistory[prop].refunds.map(i => {
		// 				let obj1 = {
		// 					balance_transaction: i?.balance_transaction,
		// 					amount: i?.amount / 100,
		// 					created: i?.created,
		// 					type: 'Refund'
		// 				}
		// 				this.paymentJson.push(obj1)
		// 			})
		// 		}
		// 	});

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

}
