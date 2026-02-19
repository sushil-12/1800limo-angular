import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { StateManagementService } from '../../../../services/statemanagement.service';
import { ErrorDialogService } from '../../../../services/error-dialog/errordialog.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";
import { AdminService } from 'src/app/services/admin.service';


@Component({
	selector: 'app-footer',
	templateUrl: './footer.component.html',
	styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit {
	// @HostListener('keydown.tab', ['$event'])
	// onKeyDown(event: KeyboardEvent) {
	//   event.preventDefault();
	// }
	copyright_text: string = new Date().getFullYear().toString() + ' 1800LIMO.COM All rights reserved.'
	public currentUser;
	public Value: any;
	public steps: string = "";
	public accountStatus: string = "";
	splitSteps: any;
	showLogoutModal: boolean = false;

	QRimage = "assets/images/QRimage.jpg";
	constructor(
		private authService: AuthService,
		private spinner: NgxSpinnerService,
		private adminService: AdminService,
		private stateManagementService: StateManagementService,
		private router: Router,
		private errorDialogService: ErrorDialogService
	) { }

	ngOnInit(): void {
		// header scroll
		// this.headerScroll();

		//Get logged in user name
		this.currentUser = this.stateManagementService.getUser()
		if (this.currentUser) {
			this.getPermissions()
		}
		// Get Steps
		this.steps = localStorage.getItem("stepCompleted") || "";
		this.accountStatus = localStorage.getItem("account_approval") || "";

		if (this.accountStatus == "completed" || this.accountStatus == "accepted") {
			this.Value = "Manage Bookings";
		}
		else {
			this.Value = "Continue Affiliate Set-Up";
		}

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
	scrollToTop() {
		(function smoothscroll() {
			var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
			if (currentScroll > 0) {
				window.requestAnimationFrame(smoothscroll);
				window.scrollTo(0, currentScroll - (currentScroll / 8));
			}
		})();
	}

	// loginbuttons
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
		this.router.navigateByUrl('/login/' + role);
	}

	dashboard(role) {
		if (role == 'affiliate') {
			this.spinner.show();//show spinner
			this.router.navigateByUrl('/affiliate');
			console.log("step 0  dashboard")
		}
		else if (role == 'admin') {
			this.spinner.show();//show spinner
			this.router.navigateByUrl('/admin/daily-bookings-admin');
			console.log("step 0  dashboard");

		}
	}

	openLogoutModal() {
		this.showLogoutModal = true;
	}

	closeLogoutModal() {
		this.showLogoutModal = false;
	}

	logout() {
		this.spinner.show();//show spinner
		this.authService.logout()
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(({ success }: any) => {
				this.spinner.hide();//hide spinner
				if (success == true) {
					this.stateManagementService.removeUser();
					localStorage.removeItem('modules')
					localStorage.removeItem('sub_modules')
					this.router.navigate(['/home']);
					location.reload()
					console.log("Logout Successfully");
				}
			});
	}
}
