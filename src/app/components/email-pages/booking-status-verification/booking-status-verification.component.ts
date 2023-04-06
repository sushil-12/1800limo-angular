import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WebsiteService } from 'src/app/services/website.service';
declare var $: any;

@Component({
  selector: 'app-booking-status-verification',
  templateUrl: './booking-status-verification.component.html',
  styleUrls: ['./booking-status-verification.component.scss']
})
export class BookingStatusVerificationComponent implements OnInit {

  
	message : string;
  success:string;
	text_message: string;
	error: boolean
	

	constructor(
		private websiteService: WebsiteService,
		private spinner: NgxSpinnerService,
		private router: Router,
		private activatedroute: ActivatedRoute,) { }

	ngOnInit(): void
	{
		$('[data-toggle="tooltip"]').tooltip()
		this.activatedroute.queryParamMap
			.subscribe((params) =>
			{
				const paramResponse: any = { ...params.keys, ...params };
				this.message = atob(paramResponse.params.message) 
        this.success =paramResponse.params.success;
        console.log('->>>>>>>>>..',this.success,this.message)
        if(this.success=='true' && this.message){
          this.text_message = this.message;
        }
        else{
          this.error=true
          this.text_message=this.message
        }
				// if (this.email && this.hash)
				// {
				// 	this.spinner.show();
				// 	this.websiteService.affiliateEmailVerification(this.email, this.hash, this.is_dispatch)
				// 		.pipe(
				// 			catchError(err =>
				// 			{
				// 				this.spinner.hide();//hide spinner
				// 				return throwError(err);
				// 			})
				// 		).subscribe(({ message, success }: any) =>
				// 		{
				// 			this.spinner.hide();//hide spinner
				// 			this.error = false;
				// 			if (!success)
				// 			{
				// 				this.error = true
				// 			}
				// 			this.text_message = message;
				// 		});
				// }
				// else
				// {
				// 	this.error = true
				// 	this.text_message = 'Please enter Valid Link.';
				// }
			});
	}
	navigateToSteps()
	{

		this.router.navigate(['/affiliate/step2']);
	}

}
