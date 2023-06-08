import { Component, ElementRef, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { StateManagementService } from '../../../../services/statemanagement.service';
import { Router, Scroll } from '@angular/router';
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
	public Value: any;
	total_count: any;
	splitSteps: any;
	desktopWidth: any;

	constructor(
		private router: Router,
		private spinner: NgxSpinnerService,
		private authService: AuthService,
		private adminService: AdminService,
		private stateManagementService: StateManagementService,
		private errorDialogService: ErrorDialogService,
		private elementRef: ElementRef,

	) {
		this.router.events.pipe(filter(e => e instanceof Scroll)).subscribe((e: any) => {
			const tree = this.router.parseUrl(this.router.url);
			this.currentRoute = tree.root.children.primary.segments[0].path;
			console.log(this.currentRoute)
		});
	}

	ngOnInit(): void {
		// header scroll
		// this.headerScroll();

		//Get logged in user name
		this.currentUser = this.stateManagementService.getUser()
		if (this.currentUser) {
			this.getPermissions()
		}
		// Get Steps
		this.steps = localStorage.getItem("stepCompleted");
		this.accountStatus = localStorage.getItem("account_approval");

		if (this.accountStatus == "completed" || this.accountStatus == "accepted") {
			this.Value = "Manage / Daily Bookings";
		}
		else {
			this.Value = "Continue Affiliate Set-Up";
		}

	}


	ngAfterViewInit() {
		this.desktopWidth = window.innerWidth;
		// if (this.desktopWidth <= '767')
		// {
		// 	//google translate
		// 	var v = document.createElement("script");
		// 	v.type = "text/javascript";
		// 	v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element_mobile'); } ";
		// 	this.elementRef.nativeElement.appendChild(v);
		// 	var s = document.createElement("script");
		// 	s.type = "text/javascript";
		// 	s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
		// 	this.elementRef.nativeElement.appendChild(s);

		// }

		if (this.desktopWidth > '767') {
			//google translate
			console.log('<<<<<<<-------select language------>>>>>>>>')
			console.log("Sushil")
			var v = document.createElement("script");
			v.type = "text/javascript";
			v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element_desktop'); } ";
			this.elementRef.nativeElement.appendChild(v);
			var s = document.createElement("script");
			s.type = "text/javascript";
			s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
			this.elementRef.nativeElement.appendChild(s);

			setTimeout(() => {
				$('body').find(".VIpgJd-ZVi9od-xl07Ob-lTBxed").attr('href', 'javascript:void(0)');
				$('.goog-te-gadget-simple').css({ height: 'auto' });
			}, 1000)
		}
		setTimeout(() => {
			$('body').find(".VIpgJd-ZVi9od-xl07Ob-lTBxed").attr('href', 'javascript:void(0)');
			const elements = document.querySelectorAll('.VIpgJd-ZVi9od-xl07Ob-lTBxed');
			$('.VIpgJd-ZVi9od-xl07Ob-lTBxed').find('span:first').text('Select language / Translate')
			if (elements.length === 2) {
				elements[0].parentNode.removeChild(elements[0]);
			}
		}, 1000)
		//a.addEventListener("click",function(e){e.preventDefault(); alert("preform action");});
		//translator 

		// if (this.screenWidth <= '991')
		// {
		// 	$("body").addClass("sidenav-toggled");
		// 	this.showSidebar = true;
		// }


	}

	getPermissions() {
		this.adminService.getMyPermissions()
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
		if (role != 'driver') {
			this.errorDialogService.openDialog({
				errors: {
					error: 'Currently only Drivers are allowed to Sign In. User accounts coming soon! Recruiting quality vetted drivers, and chauffeurs, only at this time. Refer a trusted driver/ chauffeur to 1-800 - LIMO.COM now! You deserve the best.'
				}
			})
			return
		}
		//navigate to login screen
		this.router.navigateByUrl('/login/' + role);
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
					console.log("Logout Successfully");
				}
			});
	}

	dashboard(role) {
		if (role == 'affiliate') {
			let isAffiliate_approved = localStorage.getItem('account_approval')
			this.spinner.show();//show spinner
			if (isAffiliate_approved == "accepted") {
				this.router.navigateByUrl('/affiliate/my-bookings');
			}
			else {
				this.router.navigateByUrl('/affiliate');
				console.log("step 0  dashboard")
			}
		}
		else if (role == 'admin') {
			this.spinner.show();//show spinner
			this.router.navigateByUrl('/admin/daily-bookings-admin');
			console.log("step 0  dashboard");

		}
	}

}
