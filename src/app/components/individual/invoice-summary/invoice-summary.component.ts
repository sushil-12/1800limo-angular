import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IndividualService } from 'src/app/services/individual.service';
declare var $: any;

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
		private router: Router,
		private spinner: NgxSpinnerService,
    private individualService: IndividualService,
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
            this.router.navigate([`/individual/bookings`]);
          }
          else {
            this.getInvoiceData()
          }
        });
  
    }

    backButton() {
      this.router.navigate([`/individual/invoice`]);
    }

  getCurrencyData() {
		console.log('in function get currency data')
		this.httpClient.get("assets/json/currencyOptions1.json").subscribe(data => {
			console.log('data ', data)
			this.currencyOptions = data;
		})
	}

  getInvoiceData() {

		this.individualService.getInvoiceData(this.bookingId)
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
				this.spinner.hide();//hide spinner
				this.currencySymbol = this.getCurrencySymbol(this.invoiceData.currency)
				this.subModules = localStorage.getItem('sub_modules') || [];
				this.currentUser = JSON.parse(localStorage.getItem('userData')) || "";
			});

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
