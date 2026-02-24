import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { NgxSpinnerService } from 'ngx-spinner';
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
	affiliateName: any;

	constructor(
		private router: Router,
		private adminService: AdminService,
		private errordialog: ErrorDialogService,
		private activatedRoute: ActivatedRoute,
	) { }

	ngOnInit() {
		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				this.currentStep = this.router.url.substring(this.router.url.indexOf('step')).split('?')[0];
				if (this.stepCompletedObj) {
					this.stepCompletionTick();
				}
			}
		});

		this.activatedRoute.queryParams.subscribe(params => {
			this.currentStep = this.router.url.substring(this.router.url.indexOf('step')).split('?')[0];

			if (params['affiliate']) {
				this.affiliateId = params['affiliate'];
				sessionStorage.setItem('affiliateId', this.affiliateId);
			} else {
				this.affiliateId = sessionStorage.getItem('affiliateId');
			}

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
				const stepsObjStr = sessionStorage.getItem('step_completed_obj');
				if (stepsObjStr) {
					this.stepsObj = JSON.parse(stepsObjStr);
					if (this.stepsObj) {
						for (let [key, value] of Object.entries(this.stepsObj)) {
							if (key == 'step0' && value == 'completed') {
								this['step0'] = 'md-step ' + 'completed'
							}
						}
					}
				}
			}
		});
	}
	getAffiliateName() {
		this.affiliateName = sessionStorage.getItem('affiliateName') || ""

	}

	stepCompletionTick() {
		for (let [key, value] of Object.entries(this.stepCompletedObj)) {
			let stepNumber = key;
			this[stepNumber] = 'md-step ' + value + (this.currentStep == stepNumber ? ' active' : '');
		}
		this.getAffiliateName()
	}

	stepClicked(step) {
		let steps_completed = sessionStorage.getItem('stepCompleted')
		let steps_completed_obj = JSON.parse(sessionStorage.getItem('step_completed_obj'))
		let first_incomplete_step = Object.keys(steps_completed_obj)[Object.values(steps_completed_obj).indexOf('uncompleted')]
		let first_step_error = Object.keys(steps_completed_obj)[Object.values(steps_completed_obj).indexOf('error')] || first_incomplete_step
		console.log(Object.values(steps_completed_obj).indexOf('error'), Object.values(steps_completed_obj).indexOf('uncompleted'))
		let nav_step = (Object.values(steps_completed_obj).indexOf('error') < Object.values(steps_completed_obj).indexOf('uncompleted'))
			? first_step_error :
			first_incomplete_step;
		let navigationExtras: any = {};
		if (this.affiliateId && this.affiliateId !== 'null' && this.affiliateId !== 'undefined') {
			navigationExtras = { queryParams: { affiliate: this.affiliateId.replace(/['"]+/g, '') } };
		}

		if (step == 0) {
			this.router.navigate(['/admin/affiliate/step0'], navigationExtras);
			return
		}

		console.log('Inside block')


		if (step >= 1 && steps_completed != null && steps_completed.includes((step - 1) + '')) {
			this.router.navigate(['/admin/affiliate/step' + step], navigationExtras);

		} else {
			console.log('Inside else')
			this.errordialog.openDialog({
				errors: {
					error: `Please complete previous steps first.`
				}
			})
			console.log('nav------step', nav_step)
			this.router.navigate(['/admin/affiliate/' + (nav_step)], navigationExtras)
		}
		this.getAffiliateName();

	}
}
