import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AffiliateService } from '../../../services/affiliate.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { ErrorDialogService } from '../../../services/error-dialog/errordialog.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { state } from '@angular/animations';
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
		console.log(tree)
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

	/**
	 * API hit for checking the verification status
	 * 
	 * @param account_id: Number [Required] Logged in user account id
	 * @returns: Promise of type returned data from api
	 */
	checkVerification(account_id: number): Promise<any>
	{
		return new Promise((resolve, reject) =>
		{
			this.affiliateService.affiliateVerificationStatus(account_id).pipe(
				catchError(err =>
				{
					this.spinner.hide(); //hide spinner
					reject(err)
					return throwError(err);
				})
			).subscribe((response: any) =>
			{
				resolve(response.data)
			})
		})
	}
	checkApplicationStatus()
	{
		console.info('Checking Verification Status')
		let currentUser = JSON.parse(localStorage.getItem('currentUser'))
		let C_V: Array<number> = [] 	// state for completed and verified steps
		// make sure the driver is logged in before checking the verification status
		if (currentUser && currentUser.roleName == 'driver' && currentUser.account_id)
		{
			const interval = setInterval(() =>
			{
				let steps_completed = this.affiliateService.getLocalStepCompletedObject()
				// check for the verification status, api should hit once per interval
				this.checkVerification(currentUser.account_id).then((data) =>
				{
					// check for step 1
					if (steps_completed.hasOwnProperty('step1') && steps_completed.step1 != 'uncompleted')
					{
						// toggle the icon and state for email verification
						// check for only one email in case of Gig Operator
						if ((data['affiliate_type'] == 'gig_operator' && data['is_email_verified'] == 'yes') || (data['is_email_verified'] == 'yes' && data['dispatch_is_email_verified'] == 'yes'))
						{
							this.is_email_verified = true
							this.is_show_verification_icon = false
						}
						else
						{
							this.is_email_verified = false
							this.is_show_verification_icon = true
						}
					} else
					{
						C_V.push(1)
					}

					// check for step 2
					if (steps_completed.hasOwnProperty('step2') && steps_completed.step2 != 'uncompleted')
					{
						// toggle the icon and state of bank verification
						if ((data['stripe_address_status'].toLowerCase() == 'valid' && data['transfer_status'].toLowerCase() == 'active' && data['additional_doc_verification_status'].toLowerCase() == 'verified'))
						{
							this.is_bank_verified = true
							this.is_show_verification_icon = false
						}
						else
						{
							this.is_bank_verified = false
							this.is_show_verification_icon = true
						}
					}
					else
					{
						C_V.push(2)
					}

					// Clear Interval when both steps are completed and verified
					if (C_V.indexOf(1) != -1 && C_V.indexOf(2) != -1)
					{
						clearInterval(interval)
						console.log('Cleared for both steps are completed and verified.')
						return
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
			v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element_desktop'); } ";
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
