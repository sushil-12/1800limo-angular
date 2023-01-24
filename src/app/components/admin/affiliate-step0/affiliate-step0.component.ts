import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';

@Component({
	selector: 'app-affiliate-step0',
	templateUrl: './affiliate-step0.component.html',
	styleUrls: ['./affiliate-step0.component.scss']
})
export class AffiliateStep0Component implements OnInit {

	public agreementValidation: boolean;
	public response: any;
	public agreement: boolean;
	stepCompleted: any;

	constructor(
		private router: Router,
		private adminService: AdminService
	) { }

	ngOnInit(): void {
		const stepCompleted = this.adminService.getLocalStepsCompleted();
		if (stepCompleted.includes('0')) {
			this.agreement = true;
		}

	}

	onCheckboxChange(e) {
		this.agreement = e.target.checked;
	}

	submitForm() {
		if (!this.agreement) {
			this.agreementValidation = true;
		}
		else {
			this.agreementValidation = false;
			this.stepCompleted = this.adminService.getLocalStepsCompleted();

			if (!this.stepCompleted.includes('0')) {
				this.adminService.getUpdatedStepsLocal('0')
				this.adminService.updateStepsLocal('0');

				//update step completed obj to change color of step icon
				let stepCompletedObj = this.adminService.getLocalStepsCompletedObj();
				stepCompletedObj.step0 = 'completed';
				this.adminService.updateStepsCompletedObj(stepCompletedObj);

				this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
					this.router.navigate(['/admin/affiliate/step1'])
				);
			}
			else {
				this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
					this.router.navigate(['/admin/affiliate/step1'])
				);
			}
		}
	}
}
