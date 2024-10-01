import { Component, ElementRef, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
declare var $: any;

@Component({
	selector: 'app-admin-template',
	templateUrl: './admin-template.component.html',
	styleUrls: ['./admin-template.component.scss']
})
export class AdminTemplateComponent implements OnInit {
	copyright_text: string = new Date().getFullYear().toString() + ' 1800LIMO.COM'
	public role: string;
	public created_by_role: any;
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

	modules: any = localStorage.getItem('modules') || ''
	subModules: any = localStorage.getItem('sub_modules') || ''
	desktopWidth: any;
	name: any;
	constructor(private router: Router, private authService: AuthService,
		private stateManagementService: StateManagementService,
		private spinner: NgxSpinnerService,
		private adminService: AdminService,
		private elementRef: ElementRef,
	) { }

	// ngAfterViewInit()
	// {
	// 	if (this.screenWidth <= '991')
	// 	{
	// 		$("body").addClass("sidenav-toggled");
	// 		this.showSidebar = true;
	// 	}
	// }

	ngOnInit(): void {

		console.log('On load admin template component')
		this.getPermission()
		this.screenWidth = window.innerWidth;

		//Get ProgressBar
		this.stateManagementService.getprogressBar().subscribe(commonProgressBar => {
			setTimeout(() => {
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
		this.created_by_role = currentUser?.created_by_role
		this.role = currentUser.roleName;
		this.name = currentUser.name


	}

	ngAfterViewInit() {

		this.googleTranslateInitFunction();

	}

	handleDivClick(event: MouseEvent | TouchEvent) {
		console.log('Clicked/touched parent div', event, this.showSidebar);
		if (!this.showSidebar) {
			$("body").toggleClass("sidenav-toggled");
			this.showSidebar = true
		}
		// if (targetElement.id === 'layoutSidenav_nav') {
		// 	// Ignore the click event if the target is the child div with id 'layoutSidenav_nav'
		// 	console.log('click ignore')
		// 	return;
		// }

		// Handle the click/touch event on the parent div here
	}
	googleTranslateInitFunction() {
		this.desktopWidth = window.innerWidth;
		if (this.desktopWidth <= '767') {
			//google translate
			console.log('-----google translate element for mobile view-------->>>>')
			var v = document.createElement("script");
			v.type = "text/javascript";
			v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en',layout: google.translate.TranslateElement.InlineLayout.VERTICAL}, 'google_translate_element_admin_mobile'); } ";
			this.elementRef.nativeElement.appendChild(v);
			var s = document.createElement("script");
			s.type = "text/javascript";
			s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
			this.elementRef.nativeElement.appendChild(s);

			$('.goog-te-gadget').html($('.goog-te-gadget').children());
			$("#google-translate").fadeIn('1000');


			function cleartimer() {
				setTimeout(function () {
					window.clearInterval(myVar);
				}, 500);
			}
			function myTimer() {
				if ($('.goog-te-combo option:first').length) {
					$('.goog-te-combo option:first').html('Translate');
					cleartimer();
				}
			}
			var myVar = setInterval(function () { myTimer() }, 0);
		}

		if (this.desktopWidth > '767') {
			//google translate
			console.log('<<<<<<<-------select language------>>>>>>>>')
			var v = document.createElement("script");
			v.type = "text/javascript";
			v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false, layout: google.translate.TranslateElement.InlineLayout.VERTICAL }, 'google_translate_element_admin_desktop'); } ";
			this.elementRef.nativeElement.appendChild(v);
			var s = document.createElement("script");
			s.type = "text/javascript";
			s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
			this.elementRef.nativeElement.appendChild(s);
			$('.goog-te-gadget').html($('.goog-te-gadget').children());
			$("#google-translate").fadeIn('1000');


			function cleartimer() {
				setTimeout(function () {
					window.clearInterval(myVar);
				}, 500);
			}
			function myTimer() {
				if ($('.goog-te-combo option:first').length) {
					$('.goog-te-combo option:first').html('Translate');
					cleartimer();
				}
			}
			var myVar = setInterval(function () { myTimer() }, 0);

		}
	}
	getPermission() {
		this.adminService.getMyPermissions()
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe((response: any) => {
				this.spinner.hide();//hide spinner
				localStorage.setItem('modules', '')
				localStorage.setItem('sub_modules', '')
				localStorage.setItem('modules', response?.data?.modules)
				localStorage.setItem('sub_modules', response?.data?.sub_modules)
				this.subModules = response?.data?.sub_modules
				this.modules = response?.data?.modules
			});
	}
	showSidebarFunc(status) {

		$("body").toggleClass("sidenav-toggled");
		if (status) {
			this.showSidebar = true;
		}
		else {
			this.showSidebar = false;
		}
	}

	closeSidebarFunc(status) {

		if (this.screenWidth <= '991') {
			console.log('in function close side bar function', this.showSidebar)
			this.showSidebar = true;
			$("body").removeClass("sidenav-toggled");
		}
	}
	invoiceFunc(status) {
		this.chevron = !this.chevron
		// if (this.screenWidth <= '991') {
		// 	$("body").removeClass("sidenav-toggled");
		// 	if (status) {
		// 		this.showSidebar = true;
		// 	}
		// 	else {
		// 		this.showSidebar = false;
		// 	}
		// }
	}
	userAccountFunc(status) {
		this.chevron1 = !this.chevron1
		// if (this.screenWidth <= '991') {
		// 	$("body").removeClass("sidenav-toggled");
		// 	if (status) {
		// 		this.showSidebar = true;
		// 	}
		// 	else {
		// 		this.showSidebar = false;
		// 	}
		// }
	}
	reportFunc(status) {
		this.chevron2 = !this.chevron2
		// if (this.screenWidth <= '991') {
		// 	$("body").removeClass("sidenav-toggled");
		// 	if (status) {
		// 		this.showSidebar = true;
		// 	}
		// 	else {
		// 		this.showSidebar = false;
		// 	}
		// }
	}
	settingFunc(status) {
		this.chevron3 = !this.chevron3
		// if (this.screenWidth <= '991') {
		// 	$("body").removeClass("sidenav-toggled");
		// 	if (status) {
		// 		this.showSidebar = true;
		// 	}
		// 	else {
		// 		this.showSidebar = false;
		// 	}
		// }
	}
	webPageCMSFunc(status) {
		this.chevron4 = !this.chevron4
		// if (this.screenWidth <= '991') {
		// 	$("body").removeClass("sidenav-toggled");
		// 	if (status) {
		// 		this.showSidebar = true;
		// 	}
		// 	else {
		// 		this.showSidebar = false;
		// 	}
		// }
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
					console.log("Logout Successfully");
				}
				this.router.navigate(['/']);
			});
	}

}
