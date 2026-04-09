import { Component, ElementRef, OnInit, ChangeDetectorRef, Injector } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { StateManagementService } from '../../../../services/statemanagement.service';
import { NavigationEnd, Router, Scroll } from '@angular/router';
import { filter, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { HomeComponent } from '../../home/home.component';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { AdminService } from 'src/app/services/admin.service';
declare var $: any;

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

	currentRoute: string;
	public currentUser;
	public steps: string = "";
	public accountStatus: string = "";
	public userImage: string = 'assets/images/user.png';
	total_count: any;
	splitSteps: any;
	desktopWidth: any;
	routeForSubscriptionProcess: any;
	excludedRoutes: string[] = ['/subscription', '/partner-registration', '/payment-details', '/quotebot/master-vehicle', '/quotebot/select-vehicle', '/quotebot/vehicle-details']
	showLogoutModal: boolean = false;

	constructor(
		private router: Router,
		private spinner: NgxSpinnerService,
		private authService: AuthService,
		private stateManagementService: StateManagementService,
		private errorDialogService: ErrorDialogService,
		private elementRef: ElementRef,
		private cdr: ChangeDetectorRef,
		private injector: Injector,

	) {
		this.router.events.pipe(filter(e => e instanceof Scroll)).subscribe((e: any) => {
			const tree = this.router.parseUrl(this.router.url);
			this.currentRoute = tree.root.children.primary.segments[0].path;
		});

		//to remove join us btn from header
		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				this.routeForSubscriptionProcess = this.router.url;
			}
		});

	}

	isExcludedRoute(): boolean {
		return this.excludedRoutes.includes(this.routeForSubscriptionProcess);
	}

	get userDisplayName(): string {
		const user = this.currentUser;
		if (!user) return '';

		const lastName = user.LastName || '';
		const lastNameInitial = lastName ? lastName.charAt(0) : '';
		const firstName = user.FirstName || '';

		if (user.roleName === 'driver') {
			if (user.affiliate_company) {
				return user.affiliate_company;
			}
			if (firstName) {
				return firstName + lastNameInitial;
			}
			return user.roleName || '';
		}

		if (user.name) {
			return user.name;
		}

		if (user.FirstName) {
			return firstName + lastNameInitial;
		}

		return user.roleName || '';
	}

	get Value(): string {
		const user = this.currentUser;
		const status = this.accountStatus;

		if (user?.roleName == 'travel_agent') {
			let stepsObj: any = {};
			try {
				stepsObj = JSON.parse(sessionStorage.getItem('step_completed_obj') || "{}");
			} catch (e) {
				console.error('Error parsing step_completed_obj', e);
			}

			if (stepsObj && stepsObj.step1 === 'completed' && stepsObj.step2 === 'completed') {
				return "Manage Bookings";
			} else {
				return "Continue Set-Up";
			}
		}

		if (user?.roleName == 'individual') {
			if (user.is_profile_complete === 0 || user.is_profile_complete === '0') {
				return "Continue Set-Up";
			} else {
				return "Manage Bookings";
			}
		}

		if (user?.roleName == 'sub_travel_agent') {
			if (user.is_profile_complete === 0 || user.is_profile_complete === '0' || user.is_profile_complete === null || user.is_profile_complete === undefined) {
				return "Continue Set-Up";
			} else {
				return "Manage Bookings";
			}
		}

		if (user?.roleName == 'sub_affiliate') {
			return "Manage Bookings";
		}

		if (status === "completed" || status === "accepted") {
			return "Manage Bookings";
		}

		return "Continue Set-Up";
	}

	ngOnInit(): void {
		// header scroll
		// this.headerScroll();

		//Get logged in user name
		this.currentUser = this.stateManagementService.getUser()
		if (this.currentUser && !this.shouldSkipPermissionsFetch()) {
			this.getPermissions()
		}
		// Get Steps
		this.steps = localStorage.getItem("stepCompleted") || "";
		this.accountStatus = localStorage.getItem("account_approval") || "";

		this.cdr.detectChanges();

		// For Select Box Dropdown
		$(window).on('load', function () {
			$(".goog-te-combo").css({
				'-webkit-appearance': 'none',
				'-moz-appearance': 'none',
				'background': 'transparent url("data:image/svg+xml;utf8,<svg fill=\'black\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>") no-repeat 100% 5px',
				'border': '1px solid #dfdfdf',
				'border-radius': '2px',
				'margin-right': '2rem'
			});
		})
	}


	ngAfterViewInit(): void {
		// this.desktopWidth = window.innerWidth;
		// if (this.desktopWidth > '767') {
		// 	//google translate
		// 	console.log('<<<<<<<-------select language------>>>>>>>>')
		// 	var v = document.createElement("script");
		// 	v.type = "text/javascript";
		// 	v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false, layout: google.translate.TranslateElement.InlineLayout.VERTICAL }, 'google_translate_element_home_desktop'); } ";
		// 	this.elementRef.nativeElement.appendChild(v);
		// 	var s = document.createElement("script");
		// 	s.type = "text/javascript";
		// 	s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
		// 	this.elementRef.nativeElement.appendChild(s);
		// 	$('.goog-te-gadget').html($('.goog-te-gadget').children());
		// 	$("#google-translate").fadeIn('1000');


		// 	function cleartimer() {
		// 		setTimeout(function () {
		// 			window.clearInterval(myVar);
		// 		}, 500);
		// 	}
		// 	function myTimer() {
		// 		if ($('.goog-te-combo option:first').length) {
		// 			$('.goog-te-combo option:first').html('Translate');
		// 			cleartimer();
		// 		}
		// 	}
		// 	var myVar = setInterval(function () { myTimer() }, 0);

		// }


		// setTimeout(() => {
		// 	console.log('------- set timeout exe')
		// 	$('body').find(".VIpgJd-ZVi9od-xl07Ob-lTBxed").attr('href', 'javascript:void(0)'); 
		// 	$('.VIpgJd-ZVi9od-xl07Ob-lTBxed').find('span:first').text('Translate')
		// 	$('goog-te-combo').find('option:first').text('Translate')
		// 	$('.goog-te-gadget-simple').css({height :'auto'}); 
		// 	const elements = document.querySelectorAll('.VIpgJd-ZVi9od-xl07Ob-lTBxed');
		// 	if (elements.length === 2) {
		// 		elements[0].parentNode.removeChild(elements[0]);
		// 	}
		// }, 300)
	}
	private shouldSkipPermissionsFetch(): boolean {
		return ['/home', '/services', '/quotebot_section'].includes(this.router.url);
	}
	getPermissions() {
		this.injector.get(AdminService).getMyPermissions()
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe((response: any) => {
				this.spinner.hide();//hide spinner
				localStorage.setItem('modules', response?.data?.modules)
				localStorage.setItem('sub_modules', response?.data?.sub_modules)
			});
	}

	scroll(el: HTMLElement) {
		el.scrollIntoView();
	}

	loginButtons(role: string) {
		if (role != 'driver' && role != 'sub_admin' && role != 'travel_agent' && role != 'individual' && role != 'subscriber') {
			this.errorDialogService.openDialog({
				errors: {
					error: 'Currently only Drivers are allowed to Sign In. User accounts coming soon! Recruiting quality vetted drivers, and chauffeurs, only at this time. Refer a trusted driver/ chauffeur to 1-800 - LIMO.COM now! You deserve the best.'
				}
			})
			return
		}
		//navigate to login screen
		// this.router.navigate(['/login/' + role]);
		this.router.navigateByUrl('/login/' + role).then(() => {
			window.location.reload()
		});
	}

	openLogoutModal() {
		this.showLogoutModal = true;
		this.cdr.detectChanges();
	}

	closeLogoutModal() {
		this.showLogoutModal = false;
		this.cdr.detectChanges();
	}

	logout() {
		this.spinner.show()
		this.authService.logout()
			.pipe(
				catchError(err => {
					this.spinner.hide()
					return throwError(err);
				})
			).subscribe(({ success }: any) => {
				this.spinner.hide()
				if (success) {
					this.stateManagementService.removeUser()
					localStorage.removeItem('modules')
					localStorage.removeItem('sub_modules')
					this.router.navigate(['/home']);
					location.reload()
				}
			});
	}

	dashboard(role) {
		if (role == 'affiliate' || role == 'driver') {
			let isAffiliate_approved = localStorage.getItem('account_approval')
			this.spinner.show();//show spinner
			if (isAffiliate_approved == "accepted") {
				this.router.navigateByUrl('/affiliate/my-bookings');
			}
			else {
				this.router.navigateByUrl('/affiliate');
			}
		}
		else if (role == 'admin') {
			this.spinner.show();//show spinner
			this.router.navigateByUrl('/admin/daily-bookings-admin');

		}
		else if (role == 'sub_affiliate') {
			this.router.navigateByUrl('/sub_affiliate/my-bookings');
		}
		else if (role == 'subscriber') {
			this.router.navigateByUrl('/admin/daily-bookings-admin');
		}
		// else if (role == 'travel_agent') {
		// 	let stepsObj: any = {};
		// 	try {
		// 		stepsObj = JSON.parse(sessionStorage.getItem('stepCompleted') || "{}");
		// 	} catch (e) {
		// 		console.error('Error parsing step_completed_obj', e);
		// 	}

		// 	if (stepsObj && stepsObj.step1 === 'completed') {
		// 		this.router.navigateByUrl('/travel_agent/profile/step2');
		// 	} else {
		// 		this.router.navigateByUrl('/travel_agent/profile/step1');
		// 	}
		// }
		else {
			this.spinner.show();
			this.router.navigateByUrl(`${role}/bookings`)
		}
	}
	redirectCompleteProfile(role) {
		this.spinner.show()
		if (role == 'affiliate' || role == 'driver') {
			let isAffiliate_approved = localStorage.getItem('account_approval')
			this.spinner.show();//show spinner
			if (isAffiliate_approved == "accepted") {
				this.router.navigateByUrl('/affiliate/my-bookings');
			}
			else {
				this.router.navigateByUrl('/affiliate');
			}
		}
		else if (role == 'travel_agent') {
			let stepsObj: any = {};
			try {
				stepsObj = JSON.parse(sessionStorage.getItem('step_completed_obj') || "{}");
			} catch (e) {
				console.error('Error parsing step_completed_obj', e);
			}

			if (stepsObj && stepsObj.step1 === 'completed') {
				this.router.navigateByUrl('/travel_agent/profile/step2');
			} else {
				this.router.navigateByUrl('/travel_agent/profile/step1');
			}
		}
		else {
			this.router.navigateByUrl(`${role}/profile`)
		}
	}
}
