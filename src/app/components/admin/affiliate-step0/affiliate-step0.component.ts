import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-affiliate-step0',
	templateUrl: './affiliate-step0.component.html',
	styleUrls: ['./affiliate-step0.component.scss']
})
export class AffiliateStep0Component implements OnInit
{

	public agreementValidation: boolean;
	public response: any;
	public agreement: boolean;

	constructor(
		private router: Router
	) { }

	ngOnInit(): void
	{
		// const stepCompleted = sessionStorage.getItem("stepCompleted");
		// if (stepCompleted)
		// {
		// 	this.agreement = true;
		// }
	}

	onCheckboxChange(e)
	{
		this.agreement = e.target.checked;
	}

	submitForm()
	{
		if (!this.agreement)
		{
			this.agreementValidation = true;
		}
		else
		{
			this.agreementValidation = false;
			//   sessionStorage.setItem("stepCompleted",'0');
			this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
				this.router.navigate(['/admin/affiliate/step1'])
			);
		}
	}
}
