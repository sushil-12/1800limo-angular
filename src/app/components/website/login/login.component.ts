import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit
{

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
	constructor(private formBuilder: FormBuilder, private router: Router, private authService: AuthService, private changeDetectorRef: ChangeDetectorRef,
		private customValidator: CustomvalidationService)
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
	ngAfterViewInit()
	{

		// get login user details
		let loginData = JSON.parse(localStorage.getItem('userData'))
		if (loginData)
		{
			this.loginForm.patchValue({
				phone: loginData.Phone,
				role: loginData.RoleName
			})
			this.countryChangeObject.setCountry(loginData.PhoneCountry);
			this.changeDetectorRef.detectChanges();
		}
	}

	ngOnInit(): void
	{
		this.loginForm = this.formBuilder.group({
			phone: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15), Validators.pattern("^[0-9]*$"), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			role: ['', Validators.required]
		});

		if (this.router.url === '/admin-login')
		{
			sessionStorage.setItem('clicked_login_role', 'admin');
		}
		else if (this.router.url === '/sub-admin-login')
		{
			sessionStorage.setItem('clicked_login_role', 'sub_admin');
		}
		// else if (!sessionStorage.getItem('clicked_login_role')) {
		//   sessionStorage.setItem('clicked_login_role', 'individual');
		// }


		const pageUrl = this.router.parseUrl(this.router.url);
		try
		{
			console.log('>>>>>>>>>>', pageUrl)
			this.Role = pageUrl.root.children.primary.segments[1].path
			this.loginForm.patchValue({
				role: this.Role,
			})
		} catch (err)
		{
			// this.Role = sessionStorage.getItem('clicked_login_role');
			if (sessionStorage.getItem('clicked_login_role') !== null)
			{
				this.loginButtons(sessionStorage.getItem('clicked_login_role'))
			} else
			{
				this.router.navigateByUrl('/login/driver')
			}
		}
	}
	// loginbuttons
	loginButtons(_role: string)
	{
		this.roleSelected = _role;
		this.router.navigate(['/login/' + _role])
	}

	telInputObjectCell(obj)
	{
		this.countryChangeObject = obj;
	}

	customValidationFunction(group): any
	{
		if (!group.controls['phone'].value)
		{
			return null;
		}
		let RegExp = group.controls['phone'].value;
		if (RegExp.match(/[+]/))
		{
			return { 'plusError': true };
		}
	}

	onCountryChange(event)
	{
		this.countryCode = '+' + event.dialCode;
		this.phoneCountry = event.iso2;
	}

	get f() { return this.loginForm.controls; }
	loginCheck()
	{
		this.submitted = true;
		// stop here if form is invalid

		if (this.roleSelected == null || this.roleSelected == "")
		{
			this.loginForm.patchValue({
				role: this.Role
			})
		} else
		{
			this.loginForm.patchValue({
				role: this.roleSelected
			})
		}
		if (this.loginForm.invalid)
		{
			return;
		}

		this.disableSubmit = true; //disable submit button
		this.showProgressBar = true; //show progressbar

		this.loginForm.value.countryCode = this.countryCode
		this.loginForm.value.phoneCountry = this.phoneCountry;

		this.authService.login(this.loginForm.value)
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
				var userId = this.response.data.id;
				sessionStorage.setItem('userId', '' + userId);

				this.router.navigateByUrl('/otp');
			});
	}
}
