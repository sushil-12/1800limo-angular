import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';

@Component({
	selector: 'app-admin-template',
	templateUrl: './admin-template.component.html',
	styleUrls: ['./admin-template.component.scss']
})
export class AdminTemplateComponent implements OnInit
{
	copyright_text: string = new Date().getFullYear().toString() + ' 1800LIMO.COM'
	public role: string;
	public affiliateAccountStatus: string;
	public userImage: string = 'assets/images/user.png';
	public userName: string = 'Admin';
	public showSidebar: boolean = true;
	public userEmail: string;
	public screenWidth: any;
	public progressBar: boolean;
	chevron: boolean = false;
	chevron1: boolean = false;
	chevron2: boolean = false;
	chevron3: boolean = false;
	chevron4: boolean = false;

	modules:any = localStorage.getItem('modules') || ''
	subModules:any = localStorage.getItem('sub_modules') || ''
	constructor(private router: Router, private authService: AuthService,
		private stateManagementService: StateManagementService,
		private spinner: NgxSpinnerService,
		private adminService:AdminService) { }

	// ngAfterViewInit()
	// {
	// 	if (this.screenWidth <= '991')
	// 	{
	// 		$("body").addClass("sidenav-toggled");
	// 		this.showSidebar = true;
	// 	}
	// }

	ngOnInit(): void
	{

		console.log('On load admin template component')
		this.getPermission()
		this.screenWidth = window.innerWidth;

		//Get ProgressBar
		this.stateManagementService.getprogressBar().subscribe(commonProgressBar =>
		{
			setTimeout(() =>
			{
				this.progressBar = commonProgressBar;
			});

			console.log("1111")
		});
		// $("#sidebarToggle").on("click", function (e)
		// {
		// 	e.preventDefault();
		// 	$("body").toggleClass("sidenav-toggled");
		// });

		this.affiliateAccountStatus = localStorage.getItem("account_approval");

		const currentUser = this.authService.currentUserValue;
		this.role = currentUser.roleName;


	}
	getPermission(){
		this.adminService.getMyPermissions()
				.pipe(
					catchError(err =>
					{
						this.spinner.hide();//hide spinner
						return throwError(err);
					})
				).subscribe((response: any) =>
				{
					this.spinner.hide();//hide spinner
					localStorage.setItem('modules','')
					localStorage.setItem('sub_modules','')
					localStorage.setItem('modules',response?.data?.modules)
					localStorage.setItem('sub_modules',response?.data?.sub_modules)
					this.subModules = response?.data?.sub_modules
					this.modules = response?.data?.modules
				});
	}
	showSidebarFunc(status)
	{
		$("body").toggleClass("sidenav-toggled");
		if (status)
		{
			this.showSidebar = true;
		}
		else
		{
			this.showSidebar = false;
		}
	}

	closeSidebarFunc(status)
	{
		if (this.screenWidth <= '991')
		{
			$("body").removeClass("sidenav-toggled");
			if (status)
			{
				this.showSidebar = true;
			}
			else
			{
				this.showSidebar = false;
			}
		}
	}
	invoiceFunc(status)
	{
		this.chevron = !this.chevron
		if (this.screenWidth <= '991')
		{
			$("body").removeClass("sidenav-toggled");
			if (status)
			{
				this.showSidebar = true;
			}
			else
			{
				this.showSidebar = false;
			}
		}
	}
	userAccountFunc(status)
	{
		this.chevron1 = !this.chevron1
		if (this.screenWidth <= '991')
		{
			$("body").removeClass("sidenav-toggled");
			if (status)
			{
				this.showSidebar = true;
			}
			else
			{
				this.showSidebar = false;
			}
		}
	}
	reportFunc(status)
	{
		this.chevron2 = !this.chevron2
		if (this.screenWidth <= '991')
		{
			$("body").removeClass("sidenav-toggled");
			if (status)
			{
				this.showSidebar = true;
			}
			else
			{
				this.showSidebar = false;
			}
		}
	}
	settingFunc(status)
	{
		this.chevron3 = !this.chevron3
		if (this.screenWidth <= '991')
		{
			$("body").removeClass("sidenav-toggled");
			if (status)
			{
				this.showSidebar = true;
			}
			else
			{
				this.showSidebar = false;
			}
		}
	}
	webPageCMSFunc(status)
	{
		this.chevron4 = !this.chevron4
		if (this.screenWidth <= '991')
		{
			$("body").removeClass("sidenav-toggled");
			if (status)
			{
				this.showSidebar = true;
			}
			else
			{
				this.showSidebar = false;
			}
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
