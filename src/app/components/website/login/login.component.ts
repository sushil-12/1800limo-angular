import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
// import { ReCaptchaService } from '../../../services/re-captcha.service';

import { environment } from 'src/environments/environment';
import * as intlTelInput from 'intl-tel-input';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
	@ViewChild('phoneInput') phoneInput!: ElementRef;

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
		// private recaptchaService: ReCaptchaService, 
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
		if (this.countryChangeObject) {
			this.countryChangeObject.destroy();
		}
		this.countryChangeObject = intlTelInput(this.phoneInput.nativeElement, {
			initialCountry: 'us',
			preferredCountries: ['us', 'ca', 'mx', 'gb'],
			separateDialCode: true,
			nationalMode: true,
			// autoPlaceholder: 'aggressive',
			utilsScript:
				'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js'
		});


		this.addCustomCountrySearch(this.phoneInput.nativeElement);

		this.phoneInput.nativeElement.addEventListener('countrychange', () => {
			const countryData = this.countryChangeObject.getSelectedCountryData();
			console.log("in country change", countryData)
			this.onCountryChange(countryData)
			this.validatePhone();
		});

		// get login user details
		let loginData = JSON.parse(localStorage.getItem('userData'))
		if (loginData) {
			this.loginForm.patchValue({
				phone: loginData.Phone,
				role: loginData.RoleName
			})
			this.countryChangeObject.setCountry(loginData.PhoneCountry);
			this.changeDetectorRef.detectChanges();
			this.validatePhone(); // Check validation on initial load
		}
	}

	ngOnInit(): void {

		// this.recaptchaService.load(environment.recaptchaKey);

		this.loginForm = this.formBuilder.group({
			phone: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15), Validators.pattern("^[0-9+]*$"), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			role: ['', Validators.required],
			invite_code: [''],
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

			const existRoles = ['admin', 'driver', 'sub_admin', 'travel_agent', 'master_user', 'sub_travel_agent', 'individual', 'sub_affiliate', 'subscriber']

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
		// Allow + symbol now
		return null;
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

		// Strip country code from phone number if present (to avoid duplication like +91+91...)
		if (this.loginForm.value.phone && this.countryCode && this.loginForm.value.phone.startsWith(this.countryCode)) {
			this.loginForm.value.phone = this.loginForm.value.phone.substring(this.countryCode.length);
		}

		// this.recaptchaService.execute('login', recaptchaToken => {
		// console.log("recaptcha token--->",recaptchaToken)
		// this.loginForm.value.recaptchaToken = recaptchaToken;
		console.log("login form", this.loginForm.value)
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
				var userId;
				var email;
				if (this.response?.data?.is_driver) {
					userId = this.response?.data?.user?.id
					email = this.response?.data?.user?.email
					sessionStorage.setItem("isDriver", 'Driver')
				}
				else {
					userId = this.response?.data?.id;
					email = this.response?.data?.email
					sessionStorage.setItem("isDriver", '')
				}
				sessionStorage.setItem('userId', '' + userId);
				if (this.response.data.family_data?.id) {
					sessionStorage.setItem('family_id', this.response.data.family_data.id)
				}

				if (environment['environmentName'] !== 'Production') {

					console.log('role', this.Role)
					this.router.navigateByUrl('/otp' + `?otp=${result.data.otp}` + `&role=${this.Role}` + `&email=${email}`);
				} else {
					this.router.navigateByUrl('/otp' + `?role=${this.Role}`);
				}
			});
	}
	numberOnly(event: any): boolean {
		const charCode = (event.which) ? event.which : event.keyCode;
		// Allow: backspace, delete, tab, escape, enter, + symbol (43)
		if (charCode === 43) {
			return true;
		}
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}

	validatePhone() {
		if (this.countryChangeObject) {
			const value = this.loginForm.get('phone').value;
			if (!value) {
				// If empty, let required validator handle it. Remove our intl error if present.
				if (this.f.phone.errors) {
					const { invalidIntl, ...otherErrors } = this.f.phone.errors;
					this.f.phone.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
				}
				return;
			}
			const isValid = this.countryChangeObject.isValidNumber();
			// If valid, clears this specific error. Note: other validators might still run.
			// But since we are manually setting errors, we need to be careful not to clear others if we use setErrors(null).
			// However, setErrors({...}) overwrites.
			// Better strategy: If invalid, add to errors. If valid, remove from errors.

			if (!isValid) {
				const errorCode = this.countryChangeObject.getValidationError();
				// standard 1:1 mapping for intl-tel-input error codes [0-4]
				const errorMsg = ["Invalid phone number", "Invalid country code", "Invalid phone number", "Invalid phone number", "Invalid phone number"][errorCode] || "Invalid phone number";

				const currentErrors = this.f.phone.errors || {};
				this.f.phone.setErrors({ ...currentErrors, 'invalidIntl': errorMsg });
			} else {
				// Remove invalidIntl error if exists
				if (this.f.phone.errors) {
					const { invalidIntl, ...otherErrors } = this.f.phone.errors;
					// If no other errors, set to null
					this.f.phone.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
				}
			}
		}
	}

	private addCustomCountrySearch(element: HTMLElement) {
		element.addEventListener('open:countrydropdown', () => {
			const container = element.closest('.iti');
			const dropdown = container?.querySelector('.iti__country-list');
			if (!dropdown) return;

			// Check if search already exists
			if (dropdown.querySelector('.iti-search-input')) return;

			// Create search container
			const searchContainer = document.createElement('div');
			searchContainer.className = 'iti-search-container';

			// Create search input
			const searchInput = document.createElement('input');
			searchInput.type = 'text';
			searchInput.className = 'iti-search-input';
			searchInput.placeholder = 'Search country...';

			searchContainer.appendChild(searchInput);

			// Prevent dropdown from closing when interacting with search
			searchInput.addEventListener('click', (e) => e.stopPropagation());
			searchInput.addEventListener('keydown', (e) => e.stopPropagation());

			// Insert at top of dropdown
			dropdown.insertBefore(searchContainer, dropdown.firstChild);

			// Focus on search
			setTimeout(() => searchInput.focus(), 100);

			// Filter countries on input
			searchInput.addEventListener('input', (e: any) => {
				e.stopPropagation();
				const searchTerm = e.target.value.toLowerCase();
				const countries = dropdown.querySelectorAll('.iti__country');
				let hasVisible = false;

				countries.forEach((country: any) => {
					// Search in the full text (Name + Dial Code)
					const text = country.textContent?.toLowerCase() || '';

					if (text.includes(searchTerm)) {
						country.classList.remove('iti__hide');
						country.style.display = 'block'; // Force show
						hasVisible = true;
					} else {
						country.classList.add('iti__hide');
						country.style.display = 'none'; // Force hide
					}
				});

				// Handle No Results
				let noResults = dropdown.querySelector('.iti-no-results');
				if (!noResults) {
					noResults = document.createElement('div');
					noResults.className = 'iti-no-results';
					noResults.textContent = 'No results found';
					dropdown.appendChild(noResults);
				}

				if (!hasVisible && searchTerm) {
					(noResults as HTMLElement).style.display = 'block';
				} else {
					(noResults as HTMLElement).style.display = 'none';
				}

				// Show all if search is empty
				if (!searchTerm) {
					countries.forEach((country: any) => {
						country.classList.remove('iti__hide');
						country.style.display = 'block';
					});
					(noResults as HTMLElement).style.display = 'none';
				}
			});
		});
	}
}
