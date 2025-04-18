import { Component, OnInit, AfterViewInit, ElementRef, SimpleChanges, Input } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AffiliateService } from '../../../services/affiliate.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { ErrorDialogService } from '../../../services/error-dialog/errordialog.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, Event, NavigationEnd } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { state } from '@angular/animations';
import { SharedModule } from 'src/app/components/shared/shared.module';

declare var $: any;
@Component({
  selector: 'app-affiliate-driver-template',
  templateUrl: './affiliate-driver-template.component.html',
  styleUrls: ['./affiliate-driver-template.component.scss']
})
export class AffiliateDriverTemplateComponent implements OnInit {

  public userImage: string = 'assets/images/user.png';
	public showSidebar: boolean = true;
	public currentUser: any;
	public stepCompleted: any;
	public stepCompletedObj: any;
	public affiliateAccountStatus: string;
	public currentStep: string;
	public secondPartUrl: string;
	public step_0_class: string;
	public step_1_class: string;
	public step_2_class: string;
	public step_3_class: string;
	public step_4_class: string;
	public step_5_class: string;
	public step_6_class: string;
	public screenWidth: any;
	public desktopWidth: any;
	public currentYear: number = new Date().getFullYear();
	public progressBar: boolean;
	chevron_up: boolean = true;


	@Input() router1: any;
	is_email_verified: boolean = true
	is_bank_verified: boolean = true
	is_show_verification_icon: boolean = false
	profile_pic_url: any;

	constructor(
		private router: Router,
		private spinner: NgxSpinnerService,
		private authService: AuthService,
		private affiliateService: AffiliateService,
		private stateManagementService: StateManagementService,
		public errorDialogService: ErrorDialogService,
		private elementRef: ElementRef,
		private $shared: SharedModule
	) {}


	ngOnInit(): void {


		$(".collapsed").click(function () {

			$(".collapse-item").removeClass("active");

		});
		this.spinner.hide();//hide running spinner when came from 

		this.screenWidth = window.innerWidth;
		//Get logged in user name
		this.currentUser = this.stateManagementService.getUser()

		//Get ProgressBar
		this.stateManagementService.getprogressBar().subscribe(commonProgressBar => {
			setTimeout(() => {
				this.progressBar = commonProgressBar;
			});
		})

	}
	ngAfterViewInit() {

		this.googleTranslateInitFunction();
		this.profile_pic_url = JSON.parse(localStorage.getItem('userData'))?.profile_picture
	}
	ngOnChanges(changes: SimpleChanges): void {
		console.log('------->>>>>>>>>>>>>>', changes)
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


}
