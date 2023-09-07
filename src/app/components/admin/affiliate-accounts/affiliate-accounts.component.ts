import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
declare var $: any;

@Component({
	selector: 'app-affiliate-accounts',
	templateUrl: './affiliate-accounts.component.html',
	styleUrls: ['./affiliate-accounts.component.scss']
})
export class AffiliateAccountsComponent implements OnInit {
	emails = new FormControl('');
    emailList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
	color: ThemePalette = 'primary';
	checked = false;
	disabled = false;
	show: boolean;
	public paramResponse: any;
	public affiliate_accounts: any;
	public affiliate_accounts_emails:any=[];
	public affiliateType: string;
	public heading: string;
	public addButton: string;
	public tree: any;
	public submitted: boolean = false;
	public lastPartUrl: any;
	public rejectCauseForm: FormGroup;
	sendEmailForm: FormGroup;
	public firstPage: Number;
	public lastPage: Number;
	public totalPage: Number;
	public currentPage: any;
	public from: Number;
	public to: Number;
	public path: string;
	public firstPageUrl: string;
	public lastPageUrl: string;
	public prevPageUrl: string;
	public nextPageUrl: string;
	operatorSelect: string;
	filter_type: string
	affiliateName: string;
	stepCompleted: string = '';
	stepCompletedObj: any = <Object>{
		step0: "uncompleted",
		step1: "uncompleted",
		step2: "uncompleted",
		step3: "uncompleted",
		step4: "uncompleted",
		step5: "uncompleted",
		step6: "uncompleted"
	}
	affiliateId: string = '';
	searchText: any = '';

	constructor(
		private adminService: AdminService,
		private router: Router,
		private $form: FormBuilder,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute) { }

	ngOnInit(): void {

		this.buildSendEmailForm();
		this.operatorSelect = 'all';
		this.filter_type = 'all'
		this.searchText = localStorage.getItem('affiliateSearch') ? localStorage.getItem('affiliateSearch') : ''

		this.affiliateTypeSwitch('all')
		sessionStorage.clear()

		this.rejectCauseForm = this.formBuilder.group({
			acc_id: ['', Validators.required],
			reject_cause: ['', Validators.required],
		});
		console.log("emailssss------->",this.affiliate_accounts_emails)

		this.adminService.getEmailList()
			.pipe(
				catchError(err => {
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) => {
				
					this.affiliate_accounts_emails = data
					console.log("emailssss------->",this.affiliate_accounts_emails)
				
			});

			

	}


	affiliateTypeSwitch(_affiliateType: string) {
		switch (_affiliateType) {
			case 'black-limo-operator': {
				this.heading = "Black Car / Limo Accounts";
				this.addButton = "Add Black Car / Limo Account";
				this.affiliateType = 'black_limo_operator';
				this.affiliateName = "Black Car / Limo";
				this.loadAffiliateOperators()
				break;
			}
			case 'fleet-operator': {
				this.heading = "Fleet Accounts";
				this.addButton = "Add Fleet Account";
				this.affiliateType = 'fleet_operator';
				this.affiliateName = "Fleet";
				this.loadAffiliateOperators()
				break;
			}
			case 'taxi-operator': {
				this.heading = "Taxi Accounts";
				this.addButton = "Add Taxi Account";
				this.affiliateType = 'taxi_operator';
				this.affiliateName = "Taxi";
				this.loadAffiliateOperators()
				break;
			}
			case 'gig-operator': {
				this.heading = "Gig Accounts";
				this.addButton = "Add Gig Account";
				this.affiliateType = 'gig_operator';
				this.affiliateName = "Gig";
				this.loadAffiliateOperators()
				break;
			}
			default: {
				this.heading = "All Accounts";
				this.addButton = "Add Affiliate Account";
				this.affiliateType = 'all-operators';
				this.affiliateName = "Affiliate";
				this.loadAffiliateOperators()
				break;
			}
		}
	}

	onChangeFilterType(value: string) {
		console.log('Changing Filter Type: ', value)
		this.filter_type = value
		this.loadAffiliateOperators()
	}

	timer: any
	handleSearchKeyword(text:any){
		console.log('on change search text-->>' , text)
		this.searchText = text
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			localStorage.setItem('affiliateSearch' , text)
			this.loadAffiliateOperators()
		}, 700)
	}
	handleKeypressEvents() {
		clearTimeout(this.timer)
	}

	loadAffiliateOperators(pageUrl = null) {
		/** spinner starts on init */
		var keyword = this.searchText
		if(keyword.length>0){
			this.filter_type = 'all'
			console.log('keyword--->>>' , keyword , this.filter_type)
		}
		this.spinner.show();

		// console.log(keyword);
		// Load Our blackCarLimoBus using API
		this.adminService.blackCarLimoBusAccounts(pageUrl, this.affiliateType, this.filter_type, keyword).then((result: any) => {
			this.affiliate_accounts = result.data.data;

			this.firstPage = 1;
			this.lastPage = result.data.last_page;
			this.totalPage = result.data.last_page;
			this.currentPage = result.data.current_page;
			this.from = result.data.from;
			this.to = result.data.to;
			this.path = result.data.path;
			this.firstPageUrl = result.data.first_page_url;
			this.lastPageUrl = result.data.last_page_url;
			this.prevPageUrl = result.data.prev_page_url;
			this.nextPageUrl = result.data.next_page_url;
			// sessionStorage.setItem('blackCarLimoBus',JSON.stringify(this.blackCarLimoBus));
			this.spinner.hide();//hide spinner
		})
	}

	addAffiliateAccountClick() {
		sessionStorage.setItem("affiliateType", this.affiliateType);
		sessionStorage.setItem("stepCompleted", this.stepCompleted);
		sessionStorage.setItem("step_completed_obj", JSON.stringify(this.stepCompletedObj));
		sessionStorage.setItem("affiliateId", this.affiliateId);
		this.router.navigate(['/admin/affiliate/step0']);
	}

	editAffiliateAccount(affiliate_id: number, affiliate_type: string , affiliateUserData) {
		// this.affiliateService.updateStepsArrayLocal(this.response.data.affiliateParmas.step_completed);
		// this.affiliateService.updateStepsCompletedObject(this.response.data.affiliateParmas.step_completed_obj);
		sessionStorage.setItem('affiliateId', JSON.stringify(affiliate_id))
		sessionStorage.setItem("affiliateType", affiliate_type);
		sessionStorage.setItem('affiliateName' , affiliateUserData.FirstName +' '+ affiliateUserData.LastName)
		this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
			this.router.navigate(['/admin/affiliate/step0']);
		});

	}
	navigateToStep0Inprogress(affiliate_id: number, affiliate_type: string , affiliateUserData){
		console.log('in function navigate to step 0 in case status in-progesas', affiliateUserData)
		if(affiliateUserData?.account_approval=="in-progress"){
			sessionStorage.setItem('affiliateId', JSON.stringify(affiliate_id))
			sessionStorage.setItem("affiliateType", affiliate_type);
			sessionStorage.setItem('affiliateName' , affiliateUserData.FirstName +' '+ affiliateUserData.LastName)
			this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
				this.router.navigate(['/admin/affiliate/step0']);
			});
		}
	}

	viewAffiliateCreditCards(affiliate_id: number) {
		this.router.navigate(['/admin/cards'], { queryParams: { accountType: 'blackCarLimoBus', accountId: affiliate_id } });
	}

	acceptAffiliate(acc_id) {
		this.spinner.show();
		// this.disableSubmitButton=true; //disable submit button
		console.log('acc_id', acc_id)

		this.adminService.acceptAffiliate(acc_id)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) => {
				if (success == true) {
					this.spinner.hide();//hide spinner
					location.reload()
				}
			});
	}

	get rejectCauseF() {
		return this.rejectCauseForm.controls;
	}

	rejectAffiliateClick(acc_id) {
		this.rejectCauseForm.patchValue({
			acc_id: acc_id
		});
	}

	rejectAffiliate() {
		this.submitted = true;
		console.log(this.rejectCauseForm);
		// stop here if form is invalid
		if (this.rejectCauseForm.invalid) {
			return;
		}

		this.spinner.show();
		// this.disableSubmitButton=true; //disable submit button

		this.adminService.rejectAffiliate(this.rejectCauseForm.value)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					$('#rejectCauseModal').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) => {
				if (success == true) {
					this.spinner.hide()
					$('#rejectCauseModal').modal('hide');
					location.reload()
				}
			});
	}

	enableDisableClicked(event, id) {
		this.spinner.show();//show spinner
		console.log(event.checked);
		if (event.checked) {
			var status = 'enable';
		}
		else {
			var status = 'disable';
		}
		this.adminService.blackCarLimoBusAccountStatus(id, status)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result => {

				this.spinner.hide();//hide spinner
			});
	}

	//for pagination
	counter() {
		var currentPage;
		var startFrom;
		var endTo;

		if (this.currentPage < 5) {
			startFrom = 0;
			endTo = this.totalPage;
		}
		else if (this.currentPage < this.totalPage) {
			currentPage = this.currentPage
			endTo = currentPage + 1;
			startFrom = endTo - 5;
		}
		else {
			endTo = this.totalPage;
			startFrom = endTo - 5;
		}

		var i;
		var udpArr = new Array();
		for (i = startFrom; i < endTo; i++) {
			udpArr.push(i + 1);
		}
		return udpArr;
	}

	formatter(text: string) {
		return text.replace(/[_|-]/g, ' ')
	}

	messagetype: Record<string, any>
	sendMessage(type: 'email' | 'sms', affiliate: Object, message: string = null) {
		console.log('Request to send a Message to affiliate id: ', type, affiliate['id'])
		this.messagetype = { type, affiliate }
		$('#messageModal').modal('show')
		$('#messageModal').find('.modal-header').find('h4').text('Contact to Affiliate via ' + type.toUpperCase())
		$('#messageModal').find('.modal-body').find('p#affiliate-details').html(`Affiliate Name: ${affiliate['FirstName']} ${affiliate['LastName']}<br/>Affiliate Email: ${affiliate['Email']}`)
		if (message != null) {
			this.adminService.sendAffiliateMessage(type, affiliate['id'], { sendContent: message }).subscribe((response: any) => {
				if (response.success) {
					console.log('Message Sent Successfully. ')
				}
			})
		}
	}

	get Form() {
		return this.sendEmailForm.controls;
	}

	//build email modal
	buildSendEmailForm() {
		this.sendEmailForm = this.$form.group({
			subject: [''],
			text_message: ['']
		})
	}

	//close email modal
	closeModal() {
		this.sendEmailForm.patchValue({
			amount: 0,
			payment_description: ''
		})
		this.show = false
		$("#sendEmailModal").modal("hide");
	}

	//submit email modal
	sendEmail() {
		// this.spinner.show()
		// let body = {
			
		// }
		// console.log('in function payment', body)
		// this.adminService.chargeByCard(body).subscribe((response: any) => {
		// 	// this.$errors.openDialog({
		// 	// 	errors: {
		// 	// 		error: `<span class='text-success'>${response.message}</span>`
		// 	// 	}
		// 	// })
		// 	this.spinner.hide()
		// })
		console.log("in modal send email form submiut",this.emails.value)
		this.show = false
		this.sendEmailForm.patchValue({
			subject: "",
			text_message: ''
		})
		this.emails = new FormControl('')
		$("#sendEmailModal").modal("hide");
	}

}