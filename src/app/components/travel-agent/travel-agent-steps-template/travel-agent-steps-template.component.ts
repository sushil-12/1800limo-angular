import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TravelAgentService } from 'src/app/services/travel-agent.service';
declare var $: any;
@Component({
  selector: 'app-travel-agent-steps-template',
  templateUrl: './travel-agent-steps-template.component.html',
  styleUrls: ['./travel-agent-steps-template.component.scss']
})
export class TravelAgentStepsTemplateComponent implements OnInit {

  public currentUser: any;
	public stepCompleted: Array<any>;
	public stepCompletedObj: any;
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
	travelAgentId: string;
	stepsObj: string;
	affiliateName: any;

	constructor(
		private router: Router,
		private travelAgentService: TravelAgentService,
		private errordialog: ErrorDialogService,
	) { }

	ngOnInit() {
		this.currentStep = this.router.url.substring(this.router.url.indexOf('step'));
		this.travelAgentId = JSON.parse(localStorage.getItem('currentUser'))?.account_id
			this.travelAgentService.getStepsCompleted(this.travelAgentId)
				.pipe(
					catchError(err => {
						return throwError(err);
					})
				).subscribe(({ data }: any) => {
					if (data) {
						const stepCompleted = data.step_completed;
						const stepCompletedObj = data.step_completed_obj;
						if (stepCompleted) {
							this.stepCompleted = stepCompleted;
							this.stepCompletedObj = stepCompletedObj;
							this.travelAgentService.updateStepsArrayLocal(stepCompleted);
							this.travelAgentService.updateStepsCompletedObj(stepCompletedObj);
							this.stepCompletionTick();
						}
					}
				});
		
		if (!this.travelAgentId) {
			this.stepsObj = JSON.parse(sessionStorage.getItem('step_completed_obj'));
			for (let [key, value] of Object.entries(this.stepsObj)) {
				// key == 'step0' &&
				if (value == 'completed') {
					this[key] = 'md-step ' + 'completed'
				}
			}
		}
	}
	
	// getAffiliateName(){
	// 	this.affiliateName = sessionStorage.getItem('affiliateName') || ""

	// }

	stepCompletionTick() {
		for (let [key, value] of Object.entries(this.stepCompletedObj)) {
			let stepNumber = key;
			this[stepNumber] = 'md-step ' + value + (this.currentStep == stepNumber ? ' active' : '');
		}
		// this.getAffiliateName()
	}

	stepClicked(step) {
		let steps_completed = sessionStorage.getItem('stepCompleted')
		let steps_completed_obj = JSON.parse(sessionStorage.getItem('step_completed_obj'))
		let first_incomplete_step = Object.keys(steps_completed_obj)[Object.values(steps_completed_obj).indexOf('uncompleted')]
		let first_step_error = Object.keys(steps_completed_obj)[Object.values(steps_completed_obj).indexOf('error')] || first_incomplete_step
		console.log(Object.values(steps_completed_obj).indexOf('error'),Object.values(steps_completed_obj).indexOf('uncompleted'))
		let nav_step = (Object.values(steps_completed_obj).indexOf('error') < Object.values(steps_completed_obj).indexOf('uncompleted'))
			? first_step_error :
			first_incomplete_step;
		if (step == 1) {
			this.router.navigate(['/travel_agent/profile/step1']);
			return
		}

		console.log('Inside block')

		// && steps_completed.includes((step) + '')
		if (step >= 1 && steps_completed != null ) {
			this.router.navigate(['/travel_agent/profile/step' + step]);

		} else {
			console.log('Inside else')
			this.errordialog.openDialog({
				errors: {
					error: `Please complete previous step first.`
				}
			})
			console.log('nav------step' , nav_step)
			this.router.navigate(['/travel_agent/profile/' + (nav_step)])
		}
		// this.getAffiliateName();

	}

}
