import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { StateManagementService } from '../../../../services/statemanagement.service';
import { Router, Scroll } from '@angular/router';
import { filter, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { HomeComponent } from '../../home/home.component';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
declare var $: any;

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit
{

	currentRoute: string;
	public currentUser;
	public steps: string = "";
	public accountStatus: string = "";
	public userImage: string = 'assets/images/user.png';
	public Value: any;
	total_count: any;
	splitSteps: any;

	constructor(
		private router: Router,
		private spinner: NgxSpinnerService,
		private authService: AuthService,
		private stateManagementService: StateManagementService,
		private errorDialogService: ErrorDialogService
	)
	{
		this.router.events.pipe(filter(e => e instanceof Scroll)).subscribe((e: any) =>
		{
			const tree = this.router.parseUrl(this.router.url);
			this.currentRoute = tree.root.children.primary.segments[0].path;
			console.log(this.currentRoute)
		});
	}

	ngOnInit(): void
	{
		// header scroll
		// this.headerScroll();

		//Get logged in user name
		this.currentUser = this.stateManagementService.getUser()
		// Get Steps
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


	scroll(el: HTMLElement)
	{
		el.scrollIntoView();
	}

	loginButtons(role: string)
	{
		if (role != 'driver')
		{
			return false
			this.errorDialogService.openDialog({
				errors: {
					error: 'Oops! Currently only Drivers are allowed to Sign In.'
				}
			})
			return
		}
		//navigate to login screen
		this.router.navigateByUrl('/login/' + role);
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
					this.router.navigate(['/home']);
					location.reload()
					console.log("Logout Successfully");
				}
			});
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

}
