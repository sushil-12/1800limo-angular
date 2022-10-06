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
export class AffiliateStepsTemplateComponent implements OnInit
{

	public currentUser: any;
	public stepCompleted: Array<any>;
	public stepCompletedObj: any;
	public affiliateAccountStatus: string;
	public currentStep: any;
	public secondPartUrl: string;
	public step_1_class: string;
	public step_2_class: string;
	public step_3_class: string;
	public step_4_class: string;
	public step_5_class: string;
	tree: any;
	public errors: object;
	public response: any;

	constructor(
		private router: Router,
		private adminService: AdminService,
		private errordialog: ErrorDialogService
	) { }

	ngOnInit(): void
	{

		const tree = this.router.parseUrl(this.router.url);
		this.secondPartUrl = tree.root.children.primary.segments[2].path;
		const step = this.secondPartUrl.charAt(this.secondPartUrl.length - 1);

		if (this.secondPartUrl.indexOf('step') != -1)
		{
			this.stepClicked(step, true);
		}
		else
		{
			this.otherRouteClick();
		}
		this.stepCompleted = this.adminService.getSessionStepsCompleted();//To add step_comp class
		console.log(this.stepCompleted)
	}
	otherRouteClick()
	{
		//set this to hide/show sidebar menu elements in case of new user
		this.affiliateAccountStatus = sessionStorage.getItem("account_approval");
		this.getStatusData('notAStepRoute');
	}
	stepClicked(step, isComponentRefresh = false)
	{
		const tree = this.router.parseUrl(this.router.url);
		this.secondPartUrl = tree.root.children.primary.segments[2].path;
		const url_step = this.secondPartUrl.charAt(this.secondPartUrl.length - 1);

		setTimeout(() =>
		{
			if (step != url_step && document.getElementById('step_' + step).classList.contains('active'))
			{
				document.getElementById('step_' + step).classList.remove('active')
			}
			if (step == url_step)
			{
				document.getElementById('step_' + step).classList.add('active')
			}
		}, 2000)

		if (!isComponentRefresh)
		{
			this.secondPartUrl = 'step' + step;
		}
		this.affiliateAccountStatus = sessionStorage.getItem("account_approval");
		this.currentStep = step;//To add active class
		// this.stepCompletedObj = this.adminService.getLocalStepCompletedObject();//To add step_comp class

		let steps_completed = this.adminService.getSessionStepsCompleted()

		if (step == 1)
		{
			this.router.navigate(['/admin/affiliate/step1']);
			// this.stepCompletionTick();
			this.getStatusData('stepRoute');
			return
		}

		console.log('Inside block')


		if (step > 1 && steps_completed != null && steps_completed.includes((step - 1) + ''))
		{
			this.router.navigate(['/admin/affiliate/step' + step]);
			// this.stepCompletionTick();
			this.getStatusData('stepRoute');

		} else
		{
			console.log('Inside else')
			this.errordialog.openDialog({
				errors: {
					error: `Please complete previous steps first.`
				}
			})
		}
	}
	stepCompletionTick()
	{
		console.log('>>>>>>>>.___________________.__________________', this.stepCompleted)
		for (let step of this.stepCompleted)
		{
			this['step_' + step + '_class'] = 'collapse-item completed' + (this.currentStep == step ? ' active' : '');
		}
	}
	getStatusData(routeType)
	{
		this.adminService.getStepsCompleted(sessionStorage.getItem('affiliateId'))
			.pipe(
				catchError(err =>
				{
					return throwError(err);
				})
			).subscribe(({ data }: any) =>
			{
				console.log('\n\n\n\n>>>>>>>>>>>>>>>>>>>>.........>>>>>>>>>>>>', data)
				if (data)
				{
					// const stepCompletedObj = data.step_completed_obj;
					this.affiliateAccountStatus = data.account_approval;
					if (data.step_completed && data.step_completed.length > 0)
					{
						this.stepCompleted = data.step_completed;
						console.log(this.stepCompleted, "<><><?><>?<<>?<><>?<M<>>?<M<<>")
						// this.stepCompletedObj = stepCompletedObj;
						// this.adminService.updateStepsArrayLocal(this.stepCompleted);
						// this.adminService.updateStepsCompletedObject(stepCompletedObj);
						this.stepCompletionTick();
					}

					switch (data.account_approval)
					{
						case 'completed': {
							if (this.secondPartUrl != 'account-status')
							{
								//redirect user to account status if trying to access any URL in case of "account status=completed"
								this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
									this.router.navigate(['/affiliate/account-status'])
								);
							}
							break;
						}
						case 'in-progress': {
							let nextStep: number;
							if (this.stepCompleted)
							{
								if (this.stepCompleted.includes('1'))
								{//if step 0 is completed
									nextStep = 2;
								}
								else
								{//if no step is completed
									nextStep = 1;
								}
							}
							else
							{//if no step is completed
								nextStep = 1;
							}
							if (this.secondPartUrl.substr(1, 4) != 'step')
							{
								this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
									this.router.navigate(['/admin/affiliate/step' + nextStep])
								);
							}
							break;
						}
						default: {
							break;
						}
					}
				}
			});
	}
}
