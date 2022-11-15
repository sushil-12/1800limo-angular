import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AffiliateService } from '../../../services/affiliate.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { catchError } from 'rxjs/operators';
import { throwError, Subscription, interval } from 'rxjs';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
declare var $: any;

@Component({
	selector: 'app-otp',
	templateUrl: './otp.component.html',
	styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit, OnDestroy
{

	public otpForm: FormGroup;
	public submitted = false;
	public response: any;
	public showProgressBar: boolean = false;
	public disableSubmit: boolean = false;
	public resendOtpVisible: boolean = false;
	public timer: number;
	private subscription: Subscription;
	public dDay = new Date().getTime() + 16 * 1000;
	public timeDifference;
	public secondsToDday;

	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private authService: AuthService,
		private affiliateService: AffiliateService,
		private stateManagementService: StateManagementService
	)
	{
		if (this.authService.currentUserValue)
		{
			switch (this.authService.currentUserValue.roleName)
			{
				case 'admin': {
					this.router.navigateByUrl('/admin');
					break;
				}
				case 'sub_admin': {
					this.router.navigateByUrl('/admin');
					break;
				}
				case 'individual': {
					this.router.navigateByUrl('/user');
					break;
				}
				case 'driver': {
					switch (localStorage.getItem("account_approval"))
					{
						case 'accepted': {
							this.router.navigateByUrl('/affiliate/my-bookings');
							break;
						}
						case 'completed': {
							this.router.navigateByUrl('/affiliate/account-status');
							break;
						}
						case 'rejected': {
							this.router.navigateByUrl('/affiliate/account-status');
							break;
						}
						case 'in-progress': {
							var nextStep = localStorage.getItem("step_completed") + 1;
							this.router.navigateByUrl('/affiliate/step' + nextStep);
							break;
						}
						default: {
							this.router.navigateByUrl('/affiliate');
							break;
						}
					}
					break;
				}
				case 'corporate': {
					this.router.navigateByUrl('/user');
					break;
				}
				case 'travel_agent': {
					this.router.navigateByUrl('/user');
					break;
				}
				default: {
					break;
				}
			}
		}
	}

	ngOnDestroy()
	{
		this.subscription.unsubscribe();
	}

	ngOnInit(): void
	{
		this.otpForm = this.formBuilder.group({
			otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern("^[0-9]*$")]],
		});

		this.subscription = interval(1000)
			.subscribe(x => { this.countdownTimer(); });
	}

	countdownTimer()
	{
		this.timeDifference = this.dDay - new Date().getTime();
		this.secondsToDday = Math.floor((this.timeDifference % (1000 * 60)) / 1000);
		if (this.secondsToDday <= 0)
		{
			this.subscription.unsubscribe();
			this.resendOtpVisible = true;
		}
	}

	resendOtp()
	{
		this.disableSubmit = true; //disable submit button
		this.showProgressBar = true; //show progressbar

		let userId = sessionStorage.getItem('userId');
		this.authService.resendOtp({ "userId": userId })
			.pipe(
				catchError(err =>
				{
					this.disableSubmit = false; //enable submit button
					this.showProgressBar = false; //hide progressbar
					return throwError(err);
				})
			)
			.subscribe(result =>
			{
				this.disableSubmit = false; //enable submit button
				this.showProgressBar = false; //hide progressbar

				this.dDay = new Date().getTime() + 16 * 1000;
				this.subscription = interval(1000)
					.subscribe(x => { this.countdownTimer(); });
				this.resendOtpVisible = false;

				$('#resendOtpModal').modal('show');
			});
	}

	get f() { return this.otpForm.controls; }
	otpCheck()
	{
		this.submitted = true;
		// stop here if form is invalid
		if (this.otpForm.invalid)
		{
			return;
		}

		this.disableSubmit = true; //disable submit button
		this.showProgressBar = true; //show progressbar

		let userId = sessionStorage.getItem('userId');
		this.otpForm.value.userId = userId;

		this.authService.verifyOtp(this.otpForm.value)
			.pipe(
				catchError(err =>
				{
					this.disableSubmit = false; //enable submit button
					this.showProgressBar = false; //hide progressbar
					return throwError(err);
				})
			)
			.subscribe(result =>
			{
				this.response = result;
				// set login user value in localStorage
				let loginUserDetail = {
					Phone: this.response.data.user.phone,
					RoleName: this.response.data.user.roleName,
					PhoneCountry: this.response.data.user.phoneCountry,
				}
				//end

				localStorage.setItem('userData', JSON.stringify(loginUserDetail))
				localStorage.setItem('currentUser', JSON.stringify(this.response.data.user));
				localStorage.setItem('access_token', this.response.data.access_token);

				switch (this.response.data.user.roleName)
				{
					case 'admin': {
						this.router.navigateByUrl('/admin');
						break;
					}
					case 'sub_admin': {
						this.router.navigateByUrl('/admin');
						break;
					}
					case 'individual': {
						this.router.navigateByUrl('/user');
						break;
					}
					case 'driver': {
						localStorage.setItem("account_approval", this.response.data.affiliateParmas.account_approval);
						localStorage.setItem("recject_cause_message", this.response.data.affiliateParmas.recject_cause_message);
						this.affiliateService.updateStepsArrayLocal(this.response.data.affiliateParmas.step_completed);
						this.affiliateService.updateStepsCompletedObject(this.response.data.affiliateParmas.step_completed_obj);
						switch (this.response.data.affiliateParmas.account_approval)
						{
							case 'accepted': {
								this.router.navigateByUrl('/affiliate/my-bookings');
								break;
							}
							case 'completed': {
								this.router.navigateByUrl('/affiliate/account-status');
								break;
							}
							case 'rejected': {
								this.router.navigateByUrl('/affiliate/account-status');
								break;
							}
							case 'in-progress': {
								let nextStep: number;
								if (this.response.data.affiliateParmas.step_completed.length > 0)
								{//if step 0 is completed
									nextStep = this.fetchHighestNumber(this.response.data.affiliateParmas.step_completed);
									this.router.navigateByUrl('/affiliate/step' + nextStep.toString());
									break;
								}
							}
							default: {
								this.router.navigateByUrl('/affiliate');
								break;
							}
						}
						break;
					}
					case 'corporate': {
						this.router.navigateByUrl('/user');
						break;
					}
					case 'travel_agent': {
						this.router.navigateByUrl('/user');
						break;
					}
					default: {
						return false;
						break;
					}
				}
			});
	}

	fetchHighestNumber(array: Array<number | string>): number
	{
		let highest = 0
		for (let i = 0; i < array.length; i++)
		{
			try
			{
				if (highest < parseInt((array[i]).toString()))
				{
					highest = parseInt((array[i]).toString())
				}
			} catch (err)
			{
				console.log('Error Fetching Highest Number: ', err)
				return
			}
		}
		console.log('Highest: ', highest)
		return highest
	}
}
