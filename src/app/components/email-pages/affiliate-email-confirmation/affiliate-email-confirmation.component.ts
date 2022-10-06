import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsiteService } from '../../../services/website.service';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
declare var $: any;

@Component({
	selector: 'app-affiliate-email-confirmation',
	templateUrl: './affiliate-email-confirmation.component.html',
	styleUrls: ['./affiliate-email-confirmation.component.scss']
})
export class AffiliateEmailConfirmationComponent implements OnInit
{

	public email: string;
	public hash: string;
	public outputMessage: string;

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
				this.email = paramResponse.params.e;
				this.hash = paramResponse.params.h;

				if (this.email && this.hash)
				{
					this.spinner.show();
					this.websiteService.affiliateEmailVerification(this.email, this.hash)
						.pipe(
							catchError(err =>
							{
								this.spinner.hide();//hide spinner
								return throwError(err);
							})
						).subscribe(({ message }: any) =>
						{
							this.spinner.hide();//hide spinner
							this.outputMessage = message;
						});
				}
				else
				{
					this.outputMessage = 'Please enter Valid Link.';
				}
			});
	}
	navigateToSteps()
	{

		this.router.navigate(['/affiliate/step2']);
	}
}
