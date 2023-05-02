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
  refundHistory: any;
  paramResponse: any;
  bookingId: any;

  constructor(
    private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
		private activatedroute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
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
    this.adminService.getInvoiceRefundHistory(this.bookingId)
		.pipe(
			catchError(err =>
			{
				this.spinner.hide();//hide spinner
				return throwError(err);
			})
		).subscribe(({ data, sucess, message }: any) =>
		{
			this.refundHistory = data?.id?.data
		});
  }

  TimestampToDate(timestamp:any){
		if(timestamp){
			return moment(timestamp*1000).format('MMMM Do YYYY, h:mm:ss a')
		}
	}

}
