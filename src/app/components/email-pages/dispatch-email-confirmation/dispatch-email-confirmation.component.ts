import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsiteService } from '../../../services/website.service';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
	selector: 'app-dispatch-email-confirmation',
	templateUrl: './dispatch-email-confirmation.component.html',
	styleUrls: ['./dispatch-email-confirmation.component.scss']
})
export class DispatchEmailConfirmationComponent implements OnInit
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
		this.activatedroute.queryParamMap
			.subscribe((params) =>
			{
				const paramResponse: any = { ...params.keys, ...params };
				this.email = paramResponse.params.e;
				this.hash = paramResponse.params.h;

				if (this.email && this.hash)
				{
					this.spinner.show();
					// this.websiteService.dispatchEmailVerification(this.email, this.hash)
					// 	.pipe(
					// 		catchError(err =>
					// 		{
					// 			this.spinner.hide();//hide spinner
					// 			return throwError(err);
					// 		})
					// 	).subscribe(({ message }: any) =>
					// 	{
					// 		this.spinner.hide();//hide spinner
					// 		this.outputMessage = message;
					// 	});
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
