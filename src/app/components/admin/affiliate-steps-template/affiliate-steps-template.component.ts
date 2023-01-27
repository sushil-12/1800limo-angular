import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
declare var $: any;


@Component({
	selector: 'app-affiliate-steps-template',
	templateUrl: './affiliate-steps-template.component.html',
	styleUrls: ['./affiliate-steps-template.component.scss']
})
export class AffiliateStepsTemplateComponent implements OnInit {

	public currentUser: any;
	public stepCompleted: Array<any>;
	public stepCompletedObj: any;
	public affiliateAccountStatus: string;
	public currentStep: any;
	public secondPartUrl: string;
	public step0: string;
	public step1: string;
	public step2: string;
	public step3: string;
	public step4: string;
	public step5: string;
	public step6: string;
	tree: any;
	public errors: object;
	public response: any;
	affiliateId: string;
	stepsObj: string;

	constructor(
		private router: Router,
		private adminService: AdminService,
		private errordialog: ErrorDialogService
	) { }

	ngOnInit(): void {
		this.affiliateId = sessionStorage.getItem('affiliateId');
		if (this.affiliateId) {
			this.adminService.getStepsCompleted(this.affiliateId)
				.pipe(
					catchError(err => {
						return throwError(err);
					})
				).subscribe(({ data }: any) => {
					if (data) {
						const stepCompleted = data.step_completed;
						const stepCompletedObj = data.step_completed_obj;
						this.affiliateAccountStatus = data.account_approval;
						if (stepCompleted) {
							this.stepCompleted = stepCompleted;
							this.stepCompletedObj = stepCompletedObj;
							this.adminService.updateStepsArrayLocal(stepCompleted);
							this.adminService.updateStepsCompletedObj(stepCompletedObj);
							this.stepCompletionTick();
						}
					}
				});
		}
		if (!this.affiliateId) {
			this.stepsObj = JSON.parse(sessionStorage.getItem('step_completed_obj'));
			for (let [key, value] of Object.entries(this.stepsObj)) {
				if (key == 'step0' && value == 'completed') {
					this['step0'] = 'md-step ' + 'completed'
				}
			}
		}

		const tree = this.router.parseUrl(this.router.url);
		this.secondPartUrl = tree.root.children.primary.segments[2].path;
		const step = this.secondPartUrl.charAt(this.secondPartUrl.length - 1);
		console.log(step, ";;;;;;;;;;;;;;;;;")

	}
	stepCompletionTick() {
		for (let [key, value] of Object.entries(this.stepCompletedObj)) {
			console.log(key)
			let stepNumber = key;
			this[stepNumber] = 'md-step ' + value + (this.currentStep == stepNumber ? ' active' : '');

		}
	}

	stepClicked(step) {
		let steps_completed = sessionStorage.getItem('stepCompleted')

		if (step == 0) {
			this.router.navigate(['/admin/affiliate/step0']);
			return
		}

		console.log('Inside block')


		if (step >= 1 && steps_completed != null && steps_completed.includes((step - 1) + '')) {
			this.router.navigate(['/admin/affiliate/step' + step]);

		} else {
			console.log('Inside else')
			this.errordialog.openDialog({
				errors: {
					error: `Please complete previous steps first.`
				}
			})
			this.router.navigate(['/admin/affiliate/step' + (steps_completed.length)])
		}

	}
}
