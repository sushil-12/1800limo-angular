import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';
declare var $: any;

@Component({
	selector: 'app-agent-template',
	templateUrl: './agent-template.component.html',
	styleUrls: ['./agent-template.component.scss']
})
export class AgentTemplateComponent implements OnInit {

	public userImage: string = 'assets/images/user.png';
	public showSidebar: boolean = true;
	public currentUser: any;
	public screenWidth: any;
	public desktopWidth: any;
	public currentYear: number = new Date().getFullYear();
	public progressBar: boolean;
	profile_pic_url: any;
	chevron_up: boolean = false;
	chevron: boolean = false;
	chevron1: boolean = false;
	public invite_link: string;
	public referral_code: any;
	showCopyIcon: boolean;
	accountStatus: any;
	bkpData: any = '';

	constructor(
		private router: Router,
		private stateManagementService: StateManagementService,
		private authService: AuthService,
		private elementRef: ElementRef,
		private spinner: NgxSpinnerService,
	) {

	}

	ngOnInit(): void {
		this.bkpData = JSON.parse(localStorage.getItem('bkp_crnt_dt')) ? JSON.parse(localStorage.getItem('bkp_crnt_dt')) : ''
		this.invite_link = localStorage.getItem('invite_link')
		var referralCode = (new URL(this.invite_link)).searchParams.get("refferal_code");
		this.referral_code = atob(referralCode);
		console.log("decodedReferralCode", this.referral_code);


		$(".collapsed").click(function () {

			$(".collapse-item").removeClass("active");

		});
		this.spinner.hide();//hide running spinner when came from 

		this.screenWidth = window.innerWidth;
		//Get logged in user name
		this.currentUser = this.stateManagementService.getUser()
		this.accountStatus = localStorage.getItem('agentAccountStatus')
		console.log(this.currentUser?.is_profile_complete, "is profile")

		//Get ProgressBar
		this.stateManagementService.getprogressBar().subscribe(commonProgressBar => {
			setTimeout(() => {
				this.progressBar = commonProgressBar;
			});
		});
	}
	ngAfterViewInit() {

		this.googleTranslateInitFunction();
		this.profile_pic_url = JSON.parse(localStorage.getItem('userData'))?.profile_picture
	}
	googleTranslateInitFunction() {
		this.desktopWidth = window.innerWidth;
		if (this.desktopWidth <= '767') {
			//google translate
			console.log('-----google translate element for mobile view-------->>>>')
			var v = document.createElement("script");
			v.type = "text/javascript";
			v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en',layout: google.translate.TranslateElement.InlineLayout.VERTICAL}, 'google_translate_element_mobile'); } ";
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
			v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.VERTICAL }, 'google_translate_element_desktop'); } ";
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

	handleDivClick(event: MouseEvent | TouchEvent) {
		console.log('Clicked/touched parent div', event, this.showSidebar);
		if (!this.showSidebar) {
			$("body").toggleClass("sidenav-toggled");
			this.showSidebar = true
		}
	}
	invoiceFunc(status) {
		this.chevron = !this.chevron
	}
	userAccountFunc(status) {
		this.chevron1 = !this.chevron1
	}

	copyInviteLink() {
		this.showCopyIcon = true
		console.log("in function copy link to clipboard")
		setTimeout(() => {
			this.showCopyIcon = false
		}, 2500)
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
			this.showSidebar = true;
			$("body").removeClass("sidenav-toggled");
		}
	}
	toggleChevron() {
		this.chevron_up = !this.chevron_up
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
				}
				this.router.navigate(['/']);
			});
	}

	backToAdmin() {
		let bkp_a_token = localStorage.getItem('bkp_a_token')
		let bkp_crnt_dt = localStorage.getItem('bkp_crnt_dt')
		let bkp_u_dt = localStorage.getItem('bkp_u_dt')
		let bkp_currency_symbol = localStorage.getItem('bkp_currency_symbol')
		localStorage.setItem('currencySymbol', bkp_currency_symbol)
		localStorage.setItem('access_token', bkp_a_token)
		localStorage.setItem('currentUser', bkp_crnt_dt)
		localStorage.setItem('userData', bkp_u_dt)
		sessionStorage.removeItem('step_completed')
		sessionStorage.removeItem('step_completed_obj')
		localStorage.removeItem('bkp_a_token')
		localStorage.removeItem('bkp_crnt_dt')
		localStorage.removeItem('bkp_u_dt')
		localStorage.removeItem('agentAccountStatus')
		localStorage.removeItem('invite_link')
		localStorage.removeItem('bkp_currency_symbol')
		this.router.navigateByUrl('/admin/daily-bookings-admin');


	}
}
