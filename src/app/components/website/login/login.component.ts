import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';

import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

	public loginForm: FormGroup;
	public submitted = false;
	public countryCode = "+1";
	public phoneCountry = "us";
	public response: any;
	public showProgressBar: boolean = false;
	public disableSubmit: boolean = false;
	Role: string;
	countryChangeObject: any;
	roleSelected: string;
	alert_individual: boolean = false;
	alert_corporate: boolean = false;
	alert_travel_agent: boolean = false;
	referralCode: string = null;

	constructor(private formBuilder: FormBuilder,
		private router: Router,
		private authService: AuthService,
		private changeDetectorRef: ChangeDetectorRef,
		private errorDialogService: ErrorDialogService,
		private customValidator: CustomvalidationService,
		private route: ActivatedRoute) {
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
					this.router.navigateByUrl('/travel_agent');
					break;
				}
				case 'sub_travel_agent': {
					this.router.navigateByUrl('/sub_travel_agent')
					break;
				}
				default: {
					break;
				}
			}
		}
	}
	ngAfterViewInit() {

		// get login user details
		let loginData = JSON.parse(localStorage.getItem('userData'))
		if (loginData) {
			this.loginForm.patchValue({
				phone: loginData.Phone,
				role: loginData.RoleName
			})
			this.countryChangeObject.setCountry(loginData.PhoneCountry);
			this.changeDetectorRef.detectChanges();
		}
	}

	ngOnInit(): void {
		this.loginForm = this.formBuilder.group({
			phone: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15), Validators.pattern("^[0-9]*$"), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			role: ['', Validators.required],
			invite_code: ['']
		});

		if (this.router.url === '/admin-login') {
			sessionStorage.setItem('clicked_login_role', 'admin');
		}
		else if (this.router.url === '/sub-admin-login') {
			sessionStorage.setItem('clicked_login_role', 'sub_admin');
		}
		// else if (!sessionStorage.getItem('clicked_login_role')) {
		//   sessionStorage.setItem('clicked_login_role', 'individual');
		// }

		this.route.queryParams.subscribe((params: any) => {
			this.referralCode = atob(params?.refferal_code)
			localStorage.setItem('agency_name', params?.agency_name)
			localStorage.setItem('invite_code', this.referralCode)
			console.log('Referral code->:', this.referralCode);
			this.loginForm.patchValue({
				invite_code: this.referralCode
			})
		})

		this.route.params.subscribe((params: Params) => {
			const role = params['role'];
			console.log('Role:', role, params);

			const existRoles = ['admin', 'driver', 'sub_admin', 'travel_agent', 'master_user', 'sub_travel_agent', 'individual','sub_affiliate','subscriber']

			console.log('Role:', role);
			// const existRoles = ['admin' , 'driver' , 'sub_admin' , 'travel_agent',]
			if (!existRoles.includes(role)) {
				this.router.navigate(['/login/driver']).then(() => {
					window.location.reload()
				});
			}
		});
		console.log('LOGIN fORM VALUE->:', this.loginForm.value);

		const pageUrl = this.router.parseUrl(this.router.url);
		try {
			console.log('>>>>>>>>>>', pageUrl)
			this.Role = pageUrl.root.children.primary.segments[1].path
			this.loginForm.patchValue({
				role: this.Role,
			})
		} catch (err) {
			// this.Role = sessionStorage.getItem('clicked_login_role');
			if (sessionStorage.getItem('clicked_login_role') !== null) {
				this.loginButtons(sessionStorage.getItem('clicked_login_role'))
			} else {
				this.router.navigateByUrl('/login/driver')
			}
		}
	}

	loginSubTravelAgent() {
		this.router.navigate(['/login/sub_travel_agent']).then(() => {
			window.location.reload()
		})

	}
	loginSubAffiliate() {
		this.router.navigate(['/login/sub_affiliate']).then(() => {
			window.location.reload()
		})

	}
	// loginbuttons
	loginButtons(role: string) {
		if (role != 'driver' && role != 'sub_admin') {
			this.errorDialogService.openDialog({
				errors: {
					error: 'Oops! Currently only Drivers are allowed to Sign In.User accounts coming soon! Recruiting quality vetted drivers, and chauffeurs, only at this time. Refer a trusted driver/ chauffeur to 1-800 - LIMO.COM now! You deserve the best.'
				}
			})
			return
		}
		//navigate to login screen
		this.router.navigate(['/login/' + role]).then(() => {
			window.location.reload()
		});
		// this.router.navigateByUrl('/login/' + role).then(()=>{
		// 	this.router.navigate(['/login/' + role]).then(()=>{
		// 	console.log(`After navigation I am on:${this.router.url}`)
		// 	})
		// 	})
	}
	telInputObjectCell(obj) {
		this.countryChangeObject = obj;
	}

	customValidationFunction(group): any {
		if (!group.controls['phone'].value) {
			return null;
		}
		let RegExp = group.controls['phone'].value;
		if (RegExp.match(/[+]/)) {
			return { 'plusError': true };
		}
	}
	format(value) {
		return value ? value.replaceAll('_', ' ') : ''
	}

	onCountryChange(event) {
		this.countryCode = '+' + event.dialCode;
		this.phoneCountry = event.iso2;
	}

	get f() { return this.loginForm.controls; }
	clearAlert() {
		setTimeout(() => {
			this.alert_corporate = false;
			this.alert_individual = false;
			this.alert_travel_agent = false;
		}, 3000)
	}
	loginCheck() {
		this.submitted = true;
		// stop here if form is invalid

		if (this.roleSelected == null || this.roleSelected == "") {
			this.loginForm.patchValue({
				role: this.Role
			})
		} else {
			this.loginForm.patchValue({
				role: this.roleSelected
			})
		}
		if (this.loginForm.invalid) {
			return;
		}
		if (this.loginForm?.get('invite_code').value) {
			localStorage.setItem('invite_code', this.loginForm?.get('invite_code').value)
		}
		this.disableSubmit = true; //disable submit button
		this.showProgressBar = true; //show progressbar

		this.loginForm.value.countryCode = this.countryCode
		this.loginForm.value.phoneCountry = this.phoneCountry;

		this.authService.login(this.loginForm.value)
			.pipe(
				catchError(err => {
					this.disableSubmit = false; //enable submit button
					this.showProgressBar = false; //hide progressbar
					return throwError(err);
				})
			)
			.subscribe((result: any) => {
				this.response = result;
				var userId = this.response.data.id;
				sessionStorage.setItem('userId', '' + userId);
				if (this.response.data.family_data?.id) {
					sessionStorage.setItem('family_id', this.response.data.family_data.id)
				}
				let email = this.response?.data?.email
				if (environment['environmentName'] !== 'Production') {

					console.log('role', this.Role)
					this.router.navigateByUrl('/otp' + `?otp=${result.data.otp}` + `&role=${this.Role}` + `&email=${email}`);
				} else {
					this.router.navigateByUrl('/otp' + `?role=${this.Role}`);
				}
			});
	}
}
