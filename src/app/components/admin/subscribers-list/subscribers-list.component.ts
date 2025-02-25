import { Component, ElementRef, OnInit, ViewChild, isDevMode } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UploadService } from 'src/app/services/upload.service';
declare var $: any;

@Component({
	selector: 'app-subscribers-list',
	templateUrl: './subscribers-list.component.html',
	styleUrls: ['./subscribers-list.component.scss']
})
export class SubscribersListComponent implements OnInit {
	@ViewChild('fileInput') fileInput!: ElementRef;
	@ViewChild('fileInput1') fileInput1!: ElementRef;
	@ViewChild('message') message!: ElementRef;

	color: ThemePalette = 'primary';
	checked = false;
	disabled = false;

	public paramResponse: any;
	public individualId: string;
	public individualsRes: any;
	public individuals: any;

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
	searchText: string = '';
	loginAsUserResponse: any;
	sendEmailForm: FormGroup;
	show: boolean;
	allSelected = false;
	emails = new FormControl('');
	audit_Trail: any = [];
	fileUrl: String;
	fileName: String;
	fileType: String;
	uploadedFile: any;
	public subs_emails: any = [];

	constructor(
		private adminService: AdminService,
		private router: Router,
		private $form: FormBuilder,
		private uploadService: UploadService,
		private errorDialog: ErrorDialogService,
		private spinner: NgxSpinnerService) { }

	ngOnInit(): void {
		this.searchText = localStorage.getItem('subscriberSeacrh') ? localStorage.getItem('subscriberSeacrh') : ''
		this.loadSubscribers();//load individuals
		this.buildSendEmailForm();

	}

	adjustTextareaHeight(textarea: HTMLTextAreaElement) {
		textarea.style.height = 'auto';
		textarea.style.height = textarea.scrollHeight + 'px';
	}

	timer: any
	handleSearchKeyword(text: any) {
		console.log('on change search text-->>', text)
		this.searchText = text
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			localStorage.setItem('subscriberSeacrh', text)
			this.loadSubscribers()
		}, 700)
	}
	handleKeypressEvents() {
		clearTimeout(this.timer)
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

	loadSubscribers(pageUrl = null) {
		/** spinner starts on init */
		// this.spinner.show();
		if (pageUrl) {
			console.log("pageurl", pageUrl)
			this.scroll('individual_table')
		}
		// var keyword = ((document.getElementById("keyword") as HTMLInputElement).value);
		let keyword = this.searchText
		// console.log(keyword);
		// Load Our individuals using API
		this.adminService.subscribersAccounts(pageUrl, keyword).then(result => {
			this.individualsRes = result;
			this.individuals = this.individualsRes?.data?.data;
			this.subs_emails = this.individuals.filter(item => item.Email !== null)
			this.firstPage = 1;
			this.lastPage = this.individualsRes.data.last_page;
			this.totalPage = this.individualsRes.data.last_page;
			this.currentPage = this.individualsRes.data.current_page;
			this.from = this.individualsRes.data.from;
			this.to = this.individualsRes.data.to;
			this.path = this.individualsRes.data.path;
			this.firstPageUrl = this.individualsRes.data.first_page_url;
			this.lastPageUrl = this.individualsRes.data.last_page_url;
			this.prevPageUrl = this.individualsRes.data.prev_page_url;
			this.nextPageUrl = this.individualsRes.data.next_page_url;
			// sessionStorage.setItem('individuals',JSON.stringify(this.individuals));
			// this.spinner.hide();//hide spinner
		})
			.catch(err => {
				// this.spinner.hide();//hide spinner
			});
	}

	get Form() {
		return this.sendEmailForm.controls;
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
		this.show = false
		$("#sendEmailModal").modal("hide");
	}

	selectAll() {
		if (this.allSelected) {
			this.emails.patchValue([]);
		} else {
			const allValues = this.individuals.map(option => this.stringifyOption(option));
			this.emails.setValue(allValues);
		}
		this.allSelected = !this.allSelected;
	}

	stringifyOption(option: any): string {
		return JSON.stringify({ id: option.id, email: option.Email });
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
		let fileData =[]
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
			fileData:fileData
		}
		console.log("body-------->", body)

		this.adminService.sendEmailAffiliate(body).subscribe((response: any) => {
			this.errorDialog.openDialog({
				errors: {
					error: `<span class='text-success'>${response.message}</span>`
				}
			})
			this.spinner.hide()
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

	addIndividualClick(individualId) {
		this.router.navigate(['/admin/add-individual-account'], { queryParams: { individualId: individualId } });
	}

	//build email modal
	buildSendEmailForm() {
		this.sendEmailForm = this.$form.group({
			subject: [''],
			text_message: ['']
		})
	}

	teset(args: any) {
		if (!this.searchText) { return args?.length > 0 ? args.toString().replaceAll(",", ", ") : "N/A"; }
		if (args) {
			args = args.toString().replaceAll(",", ", ")
			var re = new RegExp(this.searchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
			return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
		}

	}

	clickEditIndividual(individualId) {

		this.router.navigate(['/admin/edit-individual-account'], { queryParams: { individualId: individualId } });
	}

	clickIndividualCards(individualId) {
		this.router.navigate(['/admin/cards'], { queryParams: { accountType: 'individual', accountId: individualId } });
	}

	highlighText(args: string) {
		if (!this.searchText) { return args; }
		if (args) {
			args = args.toString()
			var re = new RegExp(this.searchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
			return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
		}
	}

	messagetype: Record<string, any>
	async sendMessage(type: 'email' | 'sms', individual: Object, message: string = null) {
		console.log('Request to send a Message to individual id: ', type, individual, message)
		this.messagetype = { type, individual }
		$('#messageModal').modal('show')
		$('#messageModal').find('.modal-header').find('h4').text('Contact to Subscriber via ' + type.toUpperCase())
		$('#messageModal').find('.modal-body').find('p#affiliate-details').html(`Subscriber Name: ${individual['FirstName']} ${individual['LastName']}<br/>Subscriber Email: ${individual['Email']}`)
		if (message != null) {
			this.spinner.show()
			let fileData =[]
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
			fileData:fileData
			}
			this.adminService.sendAffiliateMessage(type, individual['id'], body).subscribe((response: any) => {
				this.spinner.hide()
				this.errorDialog.openDialog({
					errors: {
						error: `<span class='text-success'>${response.message}</span>`
					}
				})
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

	enableDisableClicked(event, id) {
		this.spinner.show();//show spinner
		console.log(event.checked);
		if (event.checked) {
			var status = 'enable';
		}
		else {
			var status = 'disable';
		}
		this.adminService.individualAccountStatus(id, status)
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

	loginAsUser(user_id) {
		console.log("in login as user indv", user_id)


		this.spinner.show()
		this.adminService.loginAsUser(user_id).pipe(
			catchError(err => {
				this.spinner.hide()
				return throwError(err);
			})
		).subscribe(response => {
			this.spinner.hide()
			this.loginAsUserResponse = response
			let bkp_a_token = localStorage.getItem('access_token')
			let bkp_crnt_dt = localStorage.getItem('currentUser')
			let bkp_u_dt = localStorage.getItem('userData')
			let bkp_currency_symbol = localStorage.getItem('currencySymbol')

			localStorage.setItem('bkp_currency_symbol', bkp_currency_symbol)
			localStorage.setItem('bkp_a_token', bkp_a_token)
			localStorage.setItem('bkp_crnt_dt', bkp_crnt_dt)
			localStorage.setItem('bkp_u_dt', bkp_u_dt)
			console.log("response", response)

			localStorage.setItem('currencySymbol', JSON.stringify(this.loginAsUserResponse?.currency?.symbol))
			localStorage.setItem('access_token', this.loginAsUserResponse.data?.access_token)
			localStorage.setItem('currentUser', JSON.stringify(this.loginAsUserResponse.data?.user))
			localStorage.setItem("is_stripe_account_added", this.loginAsUserResponse.data?.subscriber_data?.is_stripe_account_added);
			localStorage.setItem("current_period_end_date", this.loginAsUserResponse.data?.subscription_status?.current_period_end_date)
			localStorage.setItem("is_subscription_cancelled", this.loginAsUserResponse.data?.subscriber_data?.is_cancelled)


			this.router.navigateByUrl('/home')
			

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


}

