import { Component, ElementRef, OnInit, ViewChild, isDevMode } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { AffiliateService } from 'src/app/services/affiliate.service';
import { UploadService } from 'src/app/services/upload.service';
declare var $: any;

@Component({
	selector: 'app-affiliate-accounts',
	templateUrl: './affiliate-accounts.component.html',
	styleUrls: ['./affiliate-accounts.component.scss']
})
export class AffiliateAccountsComponent implements OnInit {
	private readonly affiliateSearchStorageKey = 'affiliateSearch';
	private readonly affiliateFilterStorageKey = 'affiliateFilterType';
	private readonly affiliateOperatorStorageKey = 'affiliateOperatorSelect';
	@ViewChild('fileInput') fileInput!: ElementRef;
	@ViewChild('fileInput1') fileInput1!: ElementRef;
	@ViewChild('message') message!: ElementRef;
	emails = new FormControl();
	phone_numbers = new FormControl();
	color: ThemePalette = 'accent';
	checked = false;
	disabled = false;
	show: boolean;
	public paramResponse: any;
	public affiliate_accounts: any;
	public affiliate_accounts_emails: any = [];
	public affiliate_accounts_numbers: any = [];
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
	affiliate_count: any;
	loginAsUserResponse: any;
	allSelected = false;
	audit_Trail: any = [];
	fileUrl: String;
	fileName: String;
	fileType: String;
	uploadedFile: any;
	successMessage: any;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private $form: FormBuilder,
		private spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
		private formBuilder: FormBuilder,
		private uploadService: UploadService,
		private affiliateService: AffiliateService,
		private activatedRoute: ActivatedRoute) { }

	ngOnInit(): void {

		this.buildSendEmailForm();
		this.operatorSelect = localStorage.getItem(this.affiliateOperatorStorageKey) || 'all';
		this.filter_type = localStorage.getItem(this.affiliateFilterStorageKey) || 'all';
		this.searchText = (localStorage.getItem(this.affiliateSearchStorageKey) || '').toUpperCase();

		this.affiliateTypeSwitch(this.operatorSelect)
		sessionStorage.clear()

		this.rejectCauseForm = this.formBuilder.group({
			acc_id: ['', Validators.required],
			reject_cause: ['', Validators.required],
		});

		// this.getEmailList()


	}

	adjustTextareaHeight(textarea: HTMLTextAreaElement) {
		textarea.style.height = 'auto';
		textarea.style.height = textarea.scrollHeight + 'px';
	}


	onChangeFilterType(value: string) {
		console.log('Changing Filter Type: ', value)
		this.filter_type = value
		localStorage.setItem(this.affiliateFilterStorageKey, value);
		this.loadAffiliateOperators()
	}
	affiliateTypeSwitch(_affiliateType: string) {
		this.operatorSelect = _affiliateType;
		localStorage.setItem(this.affiliateOperatorStorageKey, _affiliateType);
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
				this.heading = "Fleet/Coach Accounts";
				this.addButton = "Add Fleet/Coach Account";
				this.affiliateType = 'fleet_operator';
				this.affiliateName = "Fleet/Coach";
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

	timer: any
	handleSearchKeyword(text: any) {
		console.log('on change search text-->>', text)
		this.searchText = (text || '').toUpperCase()
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			localStorage.setItem(this.affiliateSearchStorageKey, this.searchText || '')
			// this.loadAffiliateOperators()
			// this.getEmailList()
		}, 700)
	}
	handleKeypressEvents() {
		clearTimeout(this.timer)
	}

	reset() {
		clearTimeout(this.timer);
		this.searchText = '';
		this.filter_type = 'all';
		this.operatorSelect = 'all';
		localStorage.removeItem(this.affiliateSearchStorageKey);
		localStorage.removeItem(this.affiliateFilterStorageKey);
		localStorage.removeItem(this.affiliateOperatorStorageKey);
		this.affiliateTypeSwitch('all');
	}

	scroll(id) {
		// let el = document.getElementById(id);
		// let elementRect = el.getBoundingClientRect();
		// let absoluteElementTop = elementRect.top + window.pageYOffset;
		// let topElement = absoluteElementTop - 200;

		// console.log(`scrolling to ${id}`, el , absoluteElementTop ,window.innerHeight);
		// window.scrollTo({
		// 	top: topElement,
		// 	behavior: 'smooth'
		// });

		let el = document.getElementById(id);
		console.log(`scrolling to ${id}`, el);
		el.scrollIntoView({ behavior: 'smooth' });
	}
	handleSearch() {
		localStorage.setItem(this.affiliateSearchStorageKey, this.searchText || '');
		this.loadAffiliateOperators();
	}
	loadAffiliateOperators(pageUrl = null) {
		/** spinner starts on init */
		var keyword = this.searchText?.replace(/&/g, '%26')
		localStorage.setItem(this.affiliateSearchStorageKey, this.searchText || '');
		localStorage.setItem(this.affiliateFilterStorageKey, this.filter_type || 'all');
		localStorage.setItem(this.affiliateOperatorStorageKey, this.operatorSelect || 'all');

		if (pageUrl) {
			console.log("pageurl", pageUrl)
			this.scroll('affiliates_table')
		}
		this.spinner.show();
		// console.log(keyword);
		// Load Our blackCarLimoBus using API
		this.adminService.blackCarLimoBusAccounts(pageUrl, this.affiliateType, this.filter_type, keyword).then((result: any) => {
			const affiliateAccounts = result.data.data.map(i => {
				if (i?.LanguagesSpoken) {
					console.log("in language iffff")
					i['readMore'] = (i?.LanguagesSpoken?.length) > 2 ? true : false
				}
				else {
					console.log("in language elase")
					i['readMore'] = false
				}
				return i
			})
			this.affiliate_accounts = this.filterAffiliateAccounts(affiliateAccounts);
			this.affiliate_accounts_emails = this.affiliate_accounts.filter(item => item.Email !== null)
			this.affiliate_accounts_numbers = this.affiliate_accounts.filter(item => item.CellNumber !== null)
			this.affiliate_count = result.data.account_counts;
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

	private filterAffiliateAccounts(accounts: any[] = []) {
		const searchTerm = this.searchText?.toString().trim().toLowerCase();
		if (!searchTerm) {
			return accounts;
		}

		return accounts.filter((account) =>
			this.getAffiliateSearchValues(account).some((value) =>
				value.toLowerCase().includes(searchTerm)
			)
		);
	}

	private getAffiliateSearchValues(account: any): string[] {
		const fullName = [
			account?.FirstName,
			account?.MiddleName,
			account?.LastName
		].filter(Boolean).join(' ').trim();
		const driverNames = this.getDriverNames(account?.driver_list);
		const phoneNumber = [
			account?.CellIsd,
			account?.CellNumber
		].filter(Boolean).join('');
		const phoneWithCountry = [
			phoneNumber,
			account?.CellNumberCountry ? `(${account.CellNumberCountry.toUpperCase()})` : ''
		].filter(Boolean).join(' ');
		const vehicleTypes = Array.isArray(account?.vehicles) ? account.vehicles.join(' ') : account?.vehicles;
		const languageValues = Array.isArray(account?.LanguagesSpoken)
			? account.LanguagesSpoken.join(' ')
			: account?.LanguagesSpoken;

		return [
			account?.account_approval,
			account?.account_approval?.replace(/[_-]/g, ' '),
			account?.CellIsd,
			account?.CellNumber,
			account?.CellNumberCountry,
			phoneNumber,
			phoneWithCountry,
			account?.at_step,
			account?.at_step_nmae,
			account?.at_step_nmae?.replace(/[_-]/g, ' '),
			account?.status ? 'enabled active true' : 'disabled inactive false',
			account?.AffiliateType,
			account?.AffiliateTypeName,
			fullName,
			driverNames,
			account?.Email,
			account?.badge_city_name,
			account?.CompanyName,
			account?.DBA,
			languageValues,
			account?.Address,
			vehicleTypes,
			account?.number_of_vehicles?.toString()
		].filter(Boolean).map((value) => value.toString());
	}

	getDriverNames(driverList: any[] = []): string {
		if (!Array.isArray(driverList) || !driverList.length) {
			return 'N/A';
		}

		return driverList
			.map((driver: any) => [
				driver?.first_name,
				driver?.middle_name,
				driver?.last_name
			].filter(Boolean).join(' ').trim())
			.filter((name: string) => name.length > 0)
			.join(', ') || 'N/A';
	}

	getDriverListItems(driverList: any[] = []): any[] {
		if (!Array.isArray(driverList) || !driverList.length) {
			return [];
		}

		return driverList
			.map((driver: any) => ({
				...driver,
				displayName: [
					driver?.first_name,
					driver?.middle_name,
					driver?.last_name
				].filter(Boolean).join(' ').trim()
			}))
			.filter((driver: any) => driver?.displayName);
	}

	openDriverProfile(driver: any, affiliateAccount: any, event?: Event) {
		event?.preventDefault();
		event?.stopPropagation();

		if (!driver?.id || !affiliateAccount?.id) {
			return;
		}

		sessionStorage.setItem('affiliateId', JSON.stringify(affiliateAccount.id));
		sessionStorage.setItem('affiliateType', affiliateAccount.AffiliateType);
		sessionStorage.setItem('affiliateName', `${affiliateAccount.FirstName || ''} ${affiliateAccount.LastName || ''}`.trim());
		sessionStorage.setItem('affiliateUserData', JSON.stringify(affiliateAccount));
		this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
			this.router.navigate(['/admin/affiliate/step4/add-driver'], { queryParams: { driverId: driver.id } });
		});
	}

	private getSearchRegex() {
		const searchTerm = this.searchText?.toString();
		if (!searchTerm) {
			return null;
		}

		const escapedSearchText = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		return new RegExp(escapedSearchText, 'gi');
	}

	addAffiliateAccountClick() {
		sessionStorage.setItem("affiliateType", this.affiliateType);
		sessionStorage.setItem("stepCompleted", this.stepCompleted);
		sessionStorage.setItem("step_completed_obj", JSON.stringify(this.stepCompletedObj));
		sessionStorage.setItem("affiliateId", this.affiliateId);
		this.router.navigate(['/admin/affiliate/step0']);
	}

	editAffiliateAccount(affiliate_id: number, affiliate_type: string, affiliateUserData) {
		// this.affiliateService.updateStepsArrayLocal(this.response.data.affiliateParmas.step_completed);
		// this.affiliateService.updateStepsCompletedObject(this.response.data.affiliateParmas.step_completed_obj);
		sessionStorage.setItem('affiliateId', JSON.stringify(affiliate_id))
		sessionStorage.setItem("affiliateType", affiliate_type);
		sessionStorage.setItem('affiliateName', affiliateUserData.FirstName + ' ' + affiliateUserData.LastName)
		this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
			this.router.navigate(['/admin/affiliate/step1'], { queryParams: { affiliate: affiliate_id } });
		});

	}
	navigateToStep0Inprogress(affiliate_id: number, affiliate_type: string, affiliateUserData) {
		console.log('in function navigate to step 0 in case status in-progesas', affiliateUserData)
		if (affiliateUserData?.account_approval == "in-progress") {
			sessionStorage.setItem('affiliateId', JSON.stringify(affiliate_id))
			sessionStorage.setItem("affiliateType", affiliate_type);
			sessionStorage.setItem('affiliateName', affiliateUserData.FirstName + ' ' + affiliateUserData.LastName)
			this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
				this.router.navigate(['/admin/affiliate/step0'], { queryParams: { affiliate: affiliate_id } });
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
	highlighText(args: string) {
		if (!this.searchText) { return args ? args : "N/A"; }
		if (args) {
			args = args.toString()
			const re = this.getSearchRegex();
			return re ? args.replace(re, '<mark class="font-weight-bold">$&</mark>') : args;
		}

	}

	teset(args: any) {
		if (!this.searchText) { return args?.length > 0 ? args.toString().replaceAll(",", ", ") : "N/A"; }
		if (args) {
			args = args.toString().replaceAll(",", ", ")
			const re = this.getSearchRegex();
			return re ? args.replace(re, '<mark class="font-weight-bold">$&</mark>') : args;
		}

	}

	highlighTextSteps(args: string) {
		if (!this.searchText) { return args ? args.replace("_", " ").toUpperCase() : "N/A"; }
		if (args) {
			args = args.replace("_", " ").toUpperCase()
			const re = this.getSearchRegex();
			return re ? args.replace(re, '<mark class="font-weight-bold">$&</mark>') : args;
		}

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

		if (this.currentPage as number < 5) {
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
	async sendMessage(type: 'email' | 'sms', affiliate: Object, message: string = null) {
		console.log('Request to send a Message to affiliate id: ', type, affiliate['id'])
		this.messagetype = { type, affiliate }
		$('#messageModal').modal('show')
		$('#messageModal').find('.modal-header').find('h4').text('Contact to Affiliate via ' + type.toUpperCase())
		$('#messageModal').find('.modal-body').find('p#affiliate-details').html(`Affiliate Name: ${affiliate['FirstName']} ${affiliate['LastName']}<br/>Affiliate Email: ${affiliate['Email']}`)
		if (message != null) {
			this.spinner.show()
			let fileData = []
			if (this.uploadedFile) {
				for (let file of this.uploadedFile) {
					let dataS = await this.uploadService.uploadFile(file);
					fileData.push({
						fileUrl: dataS.Location,
						fileType: file.type
					});
				}
			}
			let body = {
				sendContent: message,
				fileData: fileData
			}
			this.adminService.sendAffiliateMessage(type, affiliate['id'], body).subscribe((response: any) => {
				this.spinner.hide()
				$('#successModal').modal('show')
				this.successMessage = response?.message
				setTimeout(() => {
					$('#successModal').modal('hide')
				}, 1500)
				console.log("response-------->", response)
			})

			// Clear file input after success
			this.uploadedFile = null;
			this.fileUrl = null;
			this.fileType = null;
			if (this.fileInput1) {
				this.fileInput1.nativeElement.value = ''; // Reset file input
			}
			if (this.message) {
				this.message.nativeElement.value = ''; // Reset message input
			}

			$("#messageModal").modal("hide");
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
		this.fileInput.nativeElement.value = '';
		this.fileInput1.nativeElement.value = '';
		this.message.nativeElement.value = '';
		this.uploadedFile = null
		this.fileUrl = null
		this.fileType = null
		this.sendEmailForm.patchValue({
			subject: "",
			text_message: ''
		})
		this.emails.setValue('');
		this.phone_numbers.setValue('');
		this.show = false
		$("#sendEmailModal").modal("hide");
		$("#sendsmsModal").modal("hide");
	}

	selectAll() {
		if (this.allSelected) {
			this.emails.patchValue('');
		} else {
			const allValues = this.affiliate_accounts_emails.map(option => this.stringifyOption(option));
			this.emails.setValue(allValues);
		}
		this.allSelected = !this.allSelected;
	}

	stringifyOption(option: any): string {
		return JSON.stringify({ id: option.id, email: option.Email });
	}

	selectAllNumbers() {
		if (this.allSelected) {
			this.phone_numbers.patchValue('');
		} else {
			const allValues = this.affiliate_accounts_numbers.map(option => this.stringifyOptionNumber(option));
			this.phone_numbers.setValue(allValues);
		}
		this.allSelected = !this.allSelected;
	}

	stringifyOptionNumber(option: any): string {
		return JSON.stringify({ id: option.id, phoneNumber: (option?.CellIsd + option?.CellNumber) });
	}

	auditTrail(id: any) {
		console.log("In function audit trail", id);
		this.spinner.show();
		this.adminService
			.communicationLogs(id)
			.pipe(
				catchError((err) => {
					return throwError(err);
				})
			)
			.subscribe((response: any) => {
				this.spinner.hide();
				console.log("audit trail --->>>>>>>>", response);
				this.audit_Trail = response?.data?.logs;
				// $("#AuditTrailModal").modal("hide");
			});
	}

	viewEmailContent(id: any) {
		console.log("In function view email content", id);
		const url = isDevMode() ? `https://1800limoapi.infodevbox.com/log-content/${id}` : `https://api.1800limo.com/log-content/${id}`;
		window.open(url, '_blank');
	}

	convertTextToHtml(text: string): string {
		// Basic conversion of text to HTML
		// Replace newlines with <br> tags
		const escapedText = text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/\n/g, '<br>');

		return `<p>${escapedText}</p>`;
	}

	//submit email modal
	async sendEmail() {
		this.spinner.show()
		let fileData = []
		if (this.uploadedFile) {
			for (let file of this.uploadedFile) {
				let dataS = await this.uploadService.uploadFile(file);
				fileData.push({
					fileUrl: dataS.Location,
					fileType: file.type
				});
			}
		}
		const textContent = this.sendEmailForm.get('text_message')?.value;
		const htmlContent = this.convertTextToHtml(textContent);
		let body = {
			subject: this.sendEmailForm.get('subject').value,
			message: htmlContent,
			recipents: this.emails.value,
			fileData: fileData
		}
		console.log("body-------->", body)
		this.adminService.sendEmailAffiliate(body).subscribe((response: any) => {
			// this.$errors.openDialog({
			// 	errors: {
			// 		error: `<span class='text-success'>${response.message}</span>`
			// 	}
			// })
			this.spinner.hide()
			$('#successModal').modal('show')
			this.successMessage = response?.message
			setTimeout(() => {
				$('#successModal').modal('hide')
			}, 1500)
			console.log("response-------->", response)
		})

		this.show = false
		this.sendEmailForm.patchValue({
			subject: "",
			text_message: ''
		})
		this.emails.setValue('');

		// Clear file input after success
		this.uploadedFile = null;
		this.fileUrl = null;
		this.fileType = null;
		if (this.fileInput) {
			this.fileInput.nativeElement.value = ''; // Reset file input
		}

		$("#sendEmailModal").modal("hide");
	}

	toggleShowMore(vehinfo: any, check: boolean) {
		console.log('vehInfo', vehinfo, 'check', check)
		this.affiliate_accounts = this.affiliate_accounts.map(i => {
			if (i.id == vehinfo.id) {
				i['readMore'] = check
				console.log('readMore', i?.readMore)
			}
			return i;
		})

	}
	fetchHighestNumber(array: Array<number | string>): number {
		let highest = 0
		for (let i = 0; i < array.length; i++) {
			try {
				if (highest < parseInt((array[i]).toString())) {
					highest = parseInt((array[i]).toString())
				}
			} catch (err) {
				console.log('Error Fetching Highest Number: ', err)
				return
			}
		}
		console.log('Highest: ', highest)
		return highest
	}

	loginAsUser(id) {
		this.spinner.show()
		this.adminService.loginAsUser(id).pipe(
			catchError(err => {
				this.spinner.hide()
				return throwError(err);
			})
		).subscribe(response => {
			this.spinner.hide()
			let bkp_a_token = localStorage.getItem('access_token')
			let bkp_crnt_dt = localStorage.getItem('currentUser')
			let bkp_u_dt = localStorage.getItem('userData')
			let bkp_currency_symbol = localStorage.getItem('currencySymbol')
			localStorage.setItem('bkp_currency_symbol', bkp_currency_symbol)
			localStorage.setItem('bkp_a_token', bkp_a_token)
			localStorage.setItem('bkp_crnt_dt', bkp_crnt_dt)
			localStorage.setItem('bkp_u_dt', bkp_u_dt)
			console.log("response", response)
			this.loginAsUserResponse = response
			let QB_redirectUrl = localStorage.getItem('QB_redirectUrl') || ''
			let vehicle_selected = JSON.parse(sessionStorage.getItem('selected_vehicle'))
			localStorage.setItem('currencySymbol', JSON.stringify(this.loginAsUserResponse?.currency?.symbol))
			localStorage.setItem("account_approval", this.loginAsUserResponse.data.affiliateParmas.account_approval);
			localStorage.setItem("recject_cause_message", this.loginAsUserResponse.data.affiliateParmas.recject_cause_message);
			this.affiliateService.updateStepsArrayLocal(this.loginAsUserResponse.data.affiliateParmas.step_completed);
			this.affiliateService.updateStepsCompletedObject(this.loginAsUserResponse.data.affiliateParmas.step_completed_obj);
			localStorage.setItem('access_token', this.loginAsUserResponse.data?.access_token)
			localStorage.setItem('currentUser', JSON.stringify(this.loginAsUserResponse.data?.user))
			switch (this.loginAsUserResponse.data.affiliateParmas.account_approval) {
				case 'accepted': {
					if (QB_redirectUrl == 'true' && vehicle_selected) {
						this.router.navigate([
							'/affiliate/create-new-booking'
						],
							{ queryParams: { affiliate_id: vehicle_selected.affiliate_id, vehicle_id: vehicle_selected.id, new: true } })
					}
					else {
						this.router.navigateByUrl('/affiliate/my-bookings');
					}
					break;
				}
				case 'completed': {
					this.router.navigateByUrl('/affiliate/account-status');
					if (QB_redirectUrl.length) {
						this.$errors.openDialog({
							errors: {
								error: `<span class='text-danger'>Not able to create booking</span>`
							}
						})
					}
					break;
				}
				case 'rejected': {
					this.router.navigateByUrl('/affiliate/account-status');
					break;
				}
				case 'in-progress': {
					let nextStep: number;
					if (this.loginAsUserResponse.data.affiliateParmas.step_completed.length > 0) {//if step 0 is completed
						nextStep = this.fetchHighestNumber(this.loginAsUserResponse.data.affiliateParmas.step_completed);
						if (QB_redirectUrl.length) {
							this.$errors.openDialog({
								errors: {
									error: `<span class='text-danger'>You need to complete registration steps</span>`
								}
							})
						}
						this.router.navigateByUrl('/affiliate/step' + nextStep.toString());
						break;
					}
				}
				default: {
					this.router.navigateByUrl('/affiliate');
					break;
				}
			}
		});
	}

	myUploader(event) {
		// this.loader = true;

		this.uploadedFile = Array.from(event.target.files)
		console.log("file", this.uploadedFile)
		// if (this.uploadedFile) {
		// 	this.fileName = this.uploadedFile['name'];
		// 	this.fileType = this.uploadedFile['type'];
		// 	console.log("file", this.fileName, this.fileType)
		// }
	}

	sendEmailSms() {
		this.spinner.show()
		let body = {
			message: this.sendEmailForm.get('text_message')?.value,
			recipents: this.phone_numbers.value,
		}
		console.log("in sms", body)

		this.adminService.sendSmsAffiliate(body).subscribe((response: any) => {
			this.spinner.hide()
			$('#successModal').modal('show')
			this.successMessage = response?.message
			setTimeout(() => {
				$('#successModal').modal('hide')
			}, 1500)
			console.log("response-------->", response)
		})

		this.show = false
		this.sendEmailForm.patchValue({
			text_message: ''
		})
		this.phone_numbers.setValue('');

		$("#sendsmsModal").modal("hide");
	}
}
