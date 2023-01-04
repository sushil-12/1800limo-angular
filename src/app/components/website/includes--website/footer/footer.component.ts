import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { StateManagementService } from '../../../../services/statemanagement.service';
import { ErrorDialogService } from '../../../../services/error-dialog/errordialog.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
	selector: 'app-footer',
	templateUrl: './footer.component.html',
	styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit
{

	public currentUser;
	public Value: any;
	public steps: string = "";
	public accountStatus: string = "";
	splitSteps: any;

	QRimage = "assets/images/QRimage.png";
	constructor(
		private authService: AuthService,
		private spinner: NgxSpinnerService,
		private stateManagementService: StateManagementService,
		private router: Router,
		private errorDialogService: ErrorDialogService
	) { }

	ngOnInit()
	{
		//Get logged in user name
		this.currentUser = this.stateManagementService.getUser()
		this.steps = localStorage.getItem("stepCompleted");
		this.accountStatus = localStorage.getItem("account_approval");

		if (this.accountStatus == "completed")
		{
			this.Value = "Manage / Daily Bookings";
		}
		else
		{
			this.Value = "Continue Affiliate Set-Up";
		}
	}

	scrollToTop()
	{
		(function smoothscroll()
		{
			var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
			if (currentScroll > 0)
			{
				window.requestAnimationFrame(smoothscroll);
				window.scrollTo(0, currentScroll - (currentScroll / 8));
			}
		})();
	}

	// loginbuttons
	loginButtons(role: string)
	{
		if (role != 'driver')
		{
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

	dashboard(role)
	{
		if (role == 'affiliate')
		{
			this.spinner.show();//show spinner
			this.router.navigateByUrl('/affiliate');
			console.log("step 0  dashboard")
		}
		else if (role == 'admin')
		{
			this.spinner.show();//show spinner
			this.router.navigateByUrl('/admin/daily-bookings-admin');
			console.log("step 0  dashboard");

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
					console.log("Logout Successfully");
				}
				this.router.navigate(['/']);
			});
	}
}
