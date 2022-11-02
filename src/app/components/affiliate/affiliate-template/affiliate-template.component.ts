import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AffiliateService } from '../../../services/affiliate.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { ErrorDialogService } from '../../../services/error-dialog/errordialog.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
declare var $: any;

@Component({
	selector: 'app-affiliate-template',
	templateUrl: './affiliate-template.component.html',
	styleUrls: ['./affiliate-template.component.scss']
})
export class AffiliateTemplateComponent implements OnInit, AfterViewInit
{

	public userImage: string = 'assets/images/user.png';
	public showSidebar: boolean = false;
	public currentUser: any;
	public stepCompleted: any;
	public stepCompletedObj: any;
	public affiliateAccountStatus: string;
	public currentStep: string;
	public secondPartUrl: string;
	public step_0_class: string;
	public step_1_class: string;
	public step_2_class: string;
	public step_3_class: string;
	public step_4_class: string;
	public step_5_class: string;
	public step_6_class: string;
	public screenWidth: any;
	public desktopWidth: any;
	public currentYear: number = new Date().getFullYear();
	public progressBar: boolean;
	chevron: boolean = false;

	is_email_verified: boolean = false
	is_bank_verified: boolean = false
	is_show_verification_icon: boolean = false

	constructor(
		private router: Router,
		private spinner: NgxSpinnerService,
		private authService: AuthService,
		private affiliateService: AffiliateService,
		private stateManagementService: StateManagementService,
		public errorDialogService: ErrorDialogService,
		private elementRef: ElementRef
	) { }

	ngOnInit(): void
	{
		$(".collapsed").click(function ()
		{

			$(".collapse-item").removeClass("active");

		});
		this.spinner.hide();//hide running spinner when came from 

		this.screenWidth = window.innerWidth;
		//Get logged in user name
		this.currentUser = this.stateManagementService.getUser()

		//Get ProgressBar
		this.stateManagementService.getprogressBar().subscribe(commonProgressBar =>
		{
			setTimeout(() =>
			{
				this.progressBar = commonProgressBar;
			});
		});

		const tree = this.router.parseUrl(this.router.url);
		this.secondPartUrl = tree.root.children.primary.segments[1].path;
		const step = this.secondPartUrl.charAt(this.secondPartUrl.length - 1);

		if (this.secondPartUrl.substr(0, 4) == 'step')
		{
			this.stepClick(step, true);
		}
		else
		{
			this.otherRouteClick();
		}

		this.checkApplicationStatus()
	}

	checkApplicationStatus()
	{
		console.info('Checking Verification Status')
		let currentUser = JSON.parse(localStorage.getItem('currentUser'))
		if (currentUser.account_id)
		{
			const interval = setInterval(() =>
			{
				let steps_completed = this.affiliateService.getLocalStepCompletedObject()
				console.log(Object.values(steps_completed))
				// if the account is sent for verification after completing all steps, stop hitting the api
				if (Object.values(steps_completed).length == 7 && Object.values(steps_completed).filter(item => item != 'completed').length == 0)
				{
					console.log('Interval Cleared')
					clearInterval(interval)
					return
				}

				// hit the api
				this.affiliateService.affiliateVerificationStatus(currentUser.account_id).pipe(
					catchError(err =>
					{
						this.spinner.hide(); //hide spinner
						return throwError(err);
					})
				).subscribe((response: any) =>
				{
					response = response.data	// just for ease of access to use here

					this.is_show_verification_icon = true	// show the verification icon and the red status

					// check for email verification from backend and stop checking if verified
					if (response['is_email_verified'] == 'yes')
					{
						if (response['affiliate_type'] == 'gig_operator')
						{
							console.log('Gig Operator')
							// for gig only check for one email
							this.is_email_verified = true
							this.getStatusData()
						}
						if (response['dispatch_is_email_verified'] == 'yes')
						{
							console.log('Dispatch verified')
							this.getStatusData()
							this.is_email_verified = true	// remove the icon and show green status
							clearInterval(interval)
						}
					}


					// check for stripe verification from backend and stop checking if verified
					if ((response['stripe_address_status'] == 'valid' && response['transfer_status'] == 'active' && response['additional_doc_verification_status'].toLowerCase() == 'verified'))
					{
						if (steps_completed['step2'] == 'completed')
						{
							console.log('Interval Cleared 2')
							clearInterval(interval)
						}
						this.is_bank_verified = true
					}
				})
			}, 20000)
		}
	}

	stepClick(step, isComponentRefresh = false)
	{
		if (!isComponentRefresh)
		{
			this.secondPartUrl = 'step' + step;
		}

		//set this to hide/show sidebar menu elements in case of new user
		this.affiliateAccountStatus = localStorage.getItem("account_approval");
		this.currentStep = step;//To add active class
		this.stepCompletedObj = this.affiliateService.getLocalStepCompletedObject();//To add step_comp class

		this.router.navigate(['/affiliate/step' + step]);
		this.stepCompletionTick();
		this.getStatusData();
	}

	otherRouteClick()
	{
		//set this to hide/show sidebar menu elements in case of new user
		this.affiliateAccountStatus = localStorage.getItem("account_approval");
		this.stepCompleted = localStorage.getItem("stepCompleted");//To add step_comp class

		this.getStatusData();
	}

	getStatusData()
	{
		this.affiliateService.getStepsCompleted()
			.pipe(
				catchError(err =>
				{
					return throwError(err);
				})
			).subscribe(({ data }: any) =>
			{
				if (data)
				{
					// if (Object.keys(data.step_completed_obj).every((currentValue: string) =>
					// {
					// 	if ([0, 1, 2, 3, 4, 5, 6].includes(parseInt(currentValue.charAt(currentValue.length - 1))))
					// 	{
					// 		return true
					// 	}
					// 	return false
					// }))
					// {
					// 	this.router.navigate(['/affiliate/my-bookings'])
					// }
					const stepCompleted = data.step_completed;
					const stepCompletedObj = data.step_completed_obj;
					this.affiliateAccountStatus = data.account_approval;
					if (stepCompleted)
					{
						this.stepCompleted = stepCompleted;
						this.stepCompletedObj = stepCompletedObj;
						this.affiliateService.updateStepsArrayLocal(stepCompleted);
						this.affiliateService.updateStepsCompletedObject(stepCompletedObj);
						this.stepCompletionTick();
					}
					localStorage.setItem("account_approval", data.account_approval);
					localStorage.setItem("recject_cause_message", data.recject_cause_message);

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
								if (this.stepCompleted.includes('0'))
								{//if step 0 is completed
									nextStep = 1;
								}
								else
								{//if no step is completed
									nextStep = 0;
								}
							}
							else
							{//if no step is completed
								nextStep = 0;
							}
							if (this.secondPartUrl.substr(0, 4) != 'step')
							{
								this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
									this.router.navigate(['/affiliate/step' + nextStep])
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

	stepCompletionTick()
	{
		for (let [key, value] of Object.entries(this.stepCompletedObj))
		{
			let stepNumber = key.slice(-1);
			this['step_' + stepNumber + '_class'] = 'collapse-item ' + value + (this.currentStep == stepNumber ? ' active' : '');
		}
	}

	logout()
	{
		this.spinner.show();//show spinner
		this.authService.logout()
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(({ success }: any) =>
			{
				this.spinner.hide();//hide spinner
				if (success == true)
				{
					this.stateManagementService.removeUser();
				}
				this.router.navigate(['/']);
			});
	}

	ngAfterViewInit()
	{
		this.desktopWidth = window.innerWidth;
		if (this.desktopWidth <= '767')
		{
			//google translate
			var v = document.createElement("script");
			v.type = "text/javascript";
			v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element_mobile'); } ";
			this.elementRef.nativeElement.appendChild(v);
			var s = document.createElement("script");
			s.type = "text/javascript";
			s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
			this.elementRef.nativeElement.appendChild(s);
		}
		console.log(this.desktopWidth, "gejehftgfrncfdfninjkgldfuhgli")
		if (this.desktopWidth > '767')
		{
			//google translate
			var v = document.createElement("script");
			v.type = "text/javascript";
			v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element_desktop'); } ";
			this.elementRef.nativeElement.appendChild(v);
			var s = document.createElement("script");
			s.type = "text/javascript";
			s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
			this.elementRef.nativeElement.appendChild(s);
		}

		//translator 

		// if (this.screenWidth <= '991')
		// {
		// 	$("body").addClass("sidenav-toggled");
		// 	this.showSidebar = true;
		// }
	}
	// scrollToTop()
	// {
	// 	(function smoothscroll()
	// 	{
	// 		var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
	// 		if (currentScroll > 0)
	// 		{
	// 			window.requestAnimationFrame(smoothscroll);
	// 			window.scrollTo(0, currentScroll - (currentScroll / 8));
	// 		}
	// 	})();
	// }
	showSidebarFunc(status)
	{
		$("body").toggleClass("sidenav-toggled");
		if (status)
		{
			this.showSidebar = true;
		}
		else
		{
			this.showSidebar = false;
		}
	}
	closeSidebarFunc(status)
	{
		if (this.screenWidth <= '991')
		{
			$("body").removeClass("sidenav-toggled");
			if (status)
			{
				this.showSidebar = true;
			}
			else
			{
				this.showSidebar = false;
			}
		}
	}
	chevronFunctionality()
	{
		this.chevron = !this.chevron
		console.log(this.chevron)
	}
}
