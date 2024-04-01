import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AffiliateService } from '../../../services/affiliate.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { catchError } from 'rxjs/operators';
import { throwError, Subscription, interval } from 'rxjs';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { NgOtpInputComponent } from 'ng-otp-input';
declare var $: any;

@Component({
	selector: 'app-otp',
	templateUrl: './otp.component.html',
	styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit, OnDestroy {

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
	review_referral_url: any;
	Role: any;
	@ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;
	@ViewChild('otpInput') otpInput: ElementRef;
	email: any = null;
	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private authService: AuthService,
		private affiliateService: AffiliateService,
		private stateManagementService: StateManagementService,
		private $errors: ErrorDialogService,
		private $route: ActivatedRoute,
	) {
		if (this.authService.currentUserValue) {
			switch (this.authService.currentUserValue.roleName) {
				case 'admin': {
					this.router.navigateByUrl('/admin');
					break;
				}
				case 'sub_admin': {
					this.router.navigateByUrl('/admin');
					break;
				}
				case 'individual': {
					this.router.navigateByUrl('/individual');
					break;
				}
				case 'driver': {
					switch (localStorage.getItem("account_approval")) {
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
					this.router.navigateByUrl('/travel_agent/bookings');
					break;
				}
				default: {
					break;
				}
			}
		}
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	ngOnInit(): void {
		this.otpForm = this.formBuilder.group({
			otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern("^[0-9]*$")]],
		});

		this.review_referral_url = localStorage.getItem('review_referral_url')

		this.subscription = interval(1000)
			.subscribe(x => { this.countdownTimer(); });

		console.log(this.$route.url)
		this.$route.queryParams.subscribe((params: any) => {
			if (params.otp) {
				setTimeout(() => {
					this.ngOtpInput.setValue(params.otp);
					this.otpForm.get('otp').setValue(params.otp)
					this.otpForm.updateValueAndValidity()
					// this.ngOtpInput.focusTo(this.otpInput)
					// this.otpCheck()
				}, 2000)
			}
			if (params.email) {
				this.email = params.email
			}
			if (params?.role) {
				this.Role = params?.role
			}
		})
		document.querySelectorAll('.otp-input').forEach(occurence => {
			occurence.addEventListener('click', (e) => {
				console.log('A link was clicked');
			});
		});
	}

	ngAfterViewInit() {
		setTimeout(() => {
			$(document).ready(function () {
				// Set focus on the input field
				console.log('------------->>>otpInput', $('#otpInput'))


				console.log('click trigger')
			});
			$(".otp-input:first").focus();
			$(".otp-input:first").trigger('click');
		}, 2000);
	}

	countdownTimer() {
		this.timeDifference = this.dDay - new Date().getTime();
		this.secondsToDday = Math.floor((this.timeDifference % (1000 * 60)) / 1000);
		if (this.secondsToDday <= 0) {
			this.subscription.unsubscribe();
			this.resendOtpVisible = true;
		}
	}
	onOtpChange(value) {
		this.otpForm.get('otp').setValue(value)
		this.otpForm.updateValueAndValidity()
		if (value.length >= 6) {
			this.otpCheck()
		}
	}

	resendOtp() {
		this.disableSubmit = true; //disable submit button
		this.showProgressBar = true; //show progressbar

		let userId = sessionStorage.getItem('userId');
		this.authService.resendOtp({ "userId": userId, "role": this.Role })
			.pipe(
				catchError(err => {
					this.disableSubmit = false; //enable submit button
					this.showProgressBar = false; //hide progressbar
					return throwError(err);
				})
			)
			.subscribe(result => {
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
	otpCheck() {
		this.submitted = true;
		// stop here if form is invalid
		if (this.otpForm.invalid) {
			return;
		}

		this.disableSubmit = true; //disable submit button
		this.showProgressBar = true; //show progressbar

		let userId = sessionStorage.getItem('userId');
		let family_id = sessionStorage.getItem('family_id')
		this.otpForm.value.userId = userId;
		this.otpForm.value.family_id = family_id

		this.authService.verifyOtp(this.otpForm.value)
			.pipe(
				catchError(err => {
					this.disableSubmit = false; //enable submit button
					this.showProgressBar = false; //hide progressbar
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;
				// set login user value in localStorage
				console.log('logged in success', result)
				let loginUserDetail = {
					Phone: this.response.data.user.phone,
					RoleName: this.response.data.user.roleName,
					PhoneCountry: this.response.data.user.phoneCountry,
					profile_picture: this.response?.data?.user?.profile_picture
				}
				//end

				//set profile pic link here
				localStorage.setItem('userData', JSON.stringify(loginUserDetail))
				localStorage.setItem('currentUser', JSON.stringify(this.response?.data?.user));
				localStorage.setItem('access_token', this.response?.data?.access_token);
				localStorage.setItem('currencySymbol', JSON.stringify(this.response?.currency?.symbol))
				if (this.response?.data?.is_family_member) {
					localStorage.setItem('is_family_member', this.response?.data?.is_family_member)
					localStorage.setItem("family_member_data", JSON.stringify(this.response?.data?.family_member_data))
				}
				if (this.response?.data?.invite_link) {
					localStorage.setItem('invite_link', this.response?.data?.invite_link)
				}
				else {
					localStorage.removeItem('invite_link')
				}

				let QB_redirectUrl = localStorage.getItem('QB_redirectUrl') || ''
				let vehicle_selected = JSON.parse(sessionStorage.getItem('selected_vehicle'))

				switch (this.response.data.user.roleName) {
					case 'admin': {
						this.router.navigateByUrl('/admin');
						break;
					}
					case 'sub_admin': {
						this.router.navigateByUrl('/admin');
						localStorage.setItem('modules', this.response.data?.modules);
						localStorage.setItem('sub_modules', this.response.data?.sub_modules)
						break;
					}
					case 'individual': {
						if (this.response?.data.user?.is_profile_complete) {
							this.router.navigateByUrl('/individual/bookings');
						}
						else {
							this.router.navigateByUrl('/individual/profile');
						}
						break;
					}
					case 'driver': {
						localStorage.setItem("account_approval", this.response.data.affiliateParmas.account_approval);
						localStorage.setItem("recject_cause_message", this.response.data.affiliateParmas.recject_cause_message);
						this.affiliateService.updateStepsArrayLocal(this.response.data.affiliateParmas.step_completed);
						this.affiliateService.updateStepsCompletedObject(this.response.data.affiliateParmas.step_completed_obj);
						switch (this.response.data.affiliateParmas.account_approval) {
							case 'accepted': {
								if (QB_redirectUrl == 'true' && vehicle_selected) {
									this.router.navigate([
										'/affiliate/create-new-booking'
									],
										{ queryParams: { affiliate_id: vehicle_selected.affiliate_id, vehicle_id: vehicle_selected.id, new: true } })
								}
								else {
									this.router.navigateByUrl('/affiliate/my-bookings');
								}
								break;
							}
							case 'completed': {
								this.router.navigateByUrl('/affiliate/account-status');
								if (QB_redirectUrl.length) {
									this.$errors.openDialog({
										errors: {
											error: `<span class='text-danger'>Not able to create booking</span>`
										}
									})
								}
								break;
							}
							case 'rejected': {
								this.router.navigateByUrl('/affiliate/account-status');
								break;
							}
							case 'in-progress': {
								let nextStep: number;
								if (this.response.data.affiliateParmas.step_completed.length > 0) {//if step 0 is completed
									nextStep = this.fetchHighestNumber(this.response.data.affiliateParmas.step_completed);
									if (QB_redirectUrl.length) {
										this.$errors.openDialog({
											errors: {
												error: `<span class='text-danger'>You need to complete registration steps</span>`
											}
										})
									}
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
						sessionStorage.setItem('step_completed', JSON.stringify(this.response.data?.travel_planner.step_completed))
						sessionStorage.setItem('step_completed_obj', JSON.stringify(this.response.data?.travel_planner.step_completed_obj))
						localStorage.setItem('agentAccountStatus', this.response?.data?.travel_planner?.account_approval)
						if (this.response.data.user?.is_profile_complete && this.response?.data?.travel_planner?.account_approval == 'accepted') {
							if (this.review_referral_url) {
								this.router.navigateByUrl(this.review_referral_url);
							}
							else {
								this.router.navigateByUrl('/travel_agent/bookings');
							}
						}
						else {
							this.router.navigateByUrl('/travel_agent/profile/step1');
						}


						break;
					}
					case 'sub_travel_agent': {
						if (this.response?.data?.user?.is_profile_complete) {
							this.router.navigateByUrl('/sub_travel_agent/bookings');
						}
						else {
							this.router.navigateByUrl('/sub_travel_agent/profile')
						}
						break;
					}
					default: {
						return false;
						break;
					}
				}
			});
	}

	fetchHighestNumber(array: Array<number | string>): number {
		let highest = 0
		for (let i = 0; i < array.length; i++) {
			try {
				if (highest < parseInt((array[i]).toString())) {
					highest = parseInt((array[i]).toString())
				}
			} catch (err) {
				console.log('Error Fetching Highest Number: ', err)
				return
			}
		}
		console.log('Highest: ', highest)
		return highest
	}
}
