import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AffiliateService } from 'src/app/services/affiliate.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';

@Component({
  selector: 'app-affiliate-finalize',
  templateUrl: './affiliate-finalize.component.html',
  styleUrls: ['./affiliate-finalize.component.scss']
})
export class AffiliateFinalizeComponent implements OnInit {

  public bookingId:any;
  public BookingDetail:any;
  public transferType:any;
  init_rates: boolean;
	edit_rates_value: any;
  finalize_btn : any = 'Finalize'
  constructor(
    private affiliateService: AffiliateService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
		private fb: FormBuilder,
		private activatedroute: ActivatedRoute
  ) { }

  ngOnInit(): void {
		// this.spinner.show()
    this.activatedroute.queryParams
			.subscribe((params) =>
			{
				this.bookingId = params?.bookingId
				console.log("booking id---->>>>>>",this.bookingId, )

				if (!this.bookingId)
				{
					this.router.navigate(['/affiliate/my-bookings']);
				}
				else
				{
					// this.buildChargesFormGroup()
					// this.chargesForm.get('reservation_id').setValue(this.bookingId)
					this.getBookingData()
				}
			});
  }


	getBookingData()
	{
		this.affiliateService.getBookingData(this.bookingId)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(({ data }: any) =>
			{
        console.log('response getBookingData Affiliate--->>>>' , data)
				this.BookingDetail = data?.booking_detail
        this.transferType = this.BookingDetail?.transfer_type
        this.init_rates = true;
	})
}


textFormatter(text: string) {
  try {
    return text?.replace(/[\\\_$]+/g, ' ')
  }
  catch
  {
    return text
  }
}

dateFormat(value: any) {
  if (value) {
    return moment(value, 'YYYY-MM-DD').format('ll')
  }
}

dateFormat2(value: any) {
  if (value) {
    return moment(value, 'YYYY-MM-DD').format('L')
  }
}

timeFormat(value: any) {
  if (value?.toUpperCase() == '12:00 AM') {
    return '0000 h'
  }
  let hours = moment(moment(value, 'hh:mm a').format('HH'), 'HH').hours();
  let mins = moment(value, 'hh:mm a').minutes().toString();
  if (Number(mins) == 0 || Number(mins) < 10) {
    mins = '0' + mins.toString();
  }

  return hours < 10 ? '0' + hours.toString() + mins.toString() + ' h' : hours.toString() + mins.toString() + ' h'
  //return value.replace(':', '').substring(0, 5) + 'h';
}

timeFormat2(value: string) {
  if (value) {
    return moment(value, 'HH:mm a').format('h:mm a');
  }
}
RateFormValue(form: any) {
  console.log('rate form value ------>>>>' , form)
  this.edit_rates_value = form
}


submitForm(){
  this.finalize_btn = 'Finalized'
		let rateArray = JSON.parse(JSON.stringify(this.edit_rates_value))
		delete rateArray.sub_total
		delete rateArray.grand_total
		let body  = {
			reservation_id : this.bookingId,
			rateArray : rateArray,
			sub_total : this.edit_rates_value.sub_total,
			grand_total : this.edit_rates_value.grand_total
		}
    console.log('final obj -------------->>>>>>>',body)
		console.log('\n\n Submitting Form' , body);
			this.affiliateService.updateFinalizeRates(body).subscribe((response: any) => {
				this.$errors.openDialog({
					errors: {
						error: `<span class='text-success'>${response.message}</span>`
					}
				})
				// this.$router.navigate(['/admin/daily-bookings-admin'])
				console.log('response-->>' , response)
			})

}



}
