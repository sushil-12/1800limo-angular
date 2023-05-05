import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit {
  paymentHistory: any;
  paramResponse: any;
  bookingId: any;
  currencyOptions: any;
  currencySymbol:any;
  paymentJson: any[];

  constructor(
    private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
		private activatedroute: ActivatedRoute,
    private httpClient: HttpClient
  ) { }

  ngOnInit(): void {
    this.getCurrencyData()
    this.activatedroute.queryParamMap
    .subscribe((params) =>
    {
      this.paramResponse = { ...params.keys, ...params };
      this.bookingId = this.paramResponse.params.bookingId;

      if (!this.bookingId)
      {
        this.$errors.openDialog({
          errors: {
            error: `<span class='text-danger'> NOT FOUND</span>`
          }
        })
      }
      else
      {
        this.getData()
      }
    });
  }
  
  getData(){
    this.adminService.getPaymentLogs(this.bookingId)
		.pipe(
			catchError(err =>
			{
				this.spinner.hide();//hide spinner
				return throwError(err);
			})
		).subscribe(({ data, sucess, message }: any) =>
		{
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
      //api response need to add field of currency
			this.currencySymbol = this.getCurrencySymbol('usd')
		});
  }
  getCurrencyData(){
    console.log('in function get currency data')
		this.httpClient.get("assets/json/currencyOptions1.json").subscribe(data => { 
      console.log('data ' ,data)
			this.currencyOptions = data;
		})
	}
	getCurrencySymbol(currency:any){
    let symbol ;
		for(let i=0; i<this.currencyOptions.length;i++){
      if(this.currencyOptions[i].code == currency.toUpperCase()){
        symbol =  this.currencyOptions[i].symbol
				break;
			}
		}
		return symbol
	} 
  TimestampToDate(timestamp:any){
		if(timestamp){
			return moment(timestamp*1000).format('MMMM Do YYYY, h:mm:ss a')
		}
	}

}
