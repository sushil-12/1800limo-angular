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
  selector: 'app-travel-planner',
  templateUrl: './travel-planner.component.html',
  styleUrls: ['./travel-planner.component.scss']
})
export class TravelPlannerComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('fileInput1') fileInput1!: ElementRef;
  @ViewChild('message') message!: ElementRef;
  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  public paramResponse: any;
  public travelPlannerId: string;
  public travelPlannersRes: any;
  public travelPlanners: any;

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
  sendEmailForm: FormGroup;
  show: boolean;
  emails = new FormControl('');
  phone_numbers= new FormControl('');
  allSelected = false;
  public travel_accounts_email: any = [];
  searchText: any;
  travelAccountCount: any;
  loginAsUserResponse: any;
  audit_Trail: any = [];
  fileUrl: String;
  fileName: String;
  fileType: String;
  uploadedFile: any;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private $form: FormBuilder,
    private uploadService: UploadService,
    private errorDialog: ErrorDialogService,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.searchText = localStorage.getItem('TravelAgentSearch') ? localStorage.getItem('TravelAgentSearch') : ''
    this.loadTravelPlanners();//load travelPlanners
    this.buildSendEmailForm();

    localStorage.removeItem('travelAgent_id')
    sessionStorage.removeItem('stepCompleted')
    sessionStorage.removeItem('step_completed_obj')
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
      localStorage.setItem('TravelAgentSearch', text)
      // this.loadTravelPlanners()
    }, 700)
  }
  reset(){
    this.searchText = ""
    localStorage.removeItem('TravelAgentSearch')
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


  loadTravelPlanners(pageUrl = null) {
    /** spinner starts on init */
    this.spinner.show();
    if (pageUrl) {
      console.log("pageurl", pageUrl)
      this.scroll('travel_agent_table')
    }
    var keyword = this.searchText?.replace(/&/g, '%26')

    // Load Our travelPlanners using API
    this.adminService.travelPlannerAccounts(pageUrl, keyword).then(result => {
      this.travelPlannersRes = result;
      this.travelPlanners = this.travelPlannersRes.data.data;
      this.travel_accounts_email = this.travelPlannersRes?.data?.data;

      this.firstPage = 1;
      this.travelAccountCount = this.travelPlannersRes?.data?.account_counts
      this.lastPage = this.travelPlannersRes.data.last_page;
      this.totalPage = this.travelPlannersRes.data.last_page;
      this.currentPage = this.travelPlannersRes.data.current_page;
      this.from = this.travelPlannersRes.data.from;
      this.to = this.travelPlannersRes.data.to;
      this.path = this.travelPlannersRes.data.path;
      this.firstPageUrl = this.travelPlannersRes.data.first_page_url;
      this.lastPageUrl = this.travelPlannersRes.data.last_page_url;
      this.prevPageUrl = this.travelPlannersRes.data.prev_page_url;
      this.nextPageUrl = this.travelPlannersRes.data.next_page_url;
      // sessionStorage.setItem('travelPlanners',JSON.stringify(this.travelPlanners));
      this.spinner.hide();//hide spinner
    })
      .catch(err => {
        this.spinner.hide();//hide spinner
      });
  }

  acceptRejectAffiliate(acc_id, status) {
    this.spinner.show();
    // this.disableSubmitButton=true; //disable submit button
    console.log('acc_id', acc_id, 'status', status)

    this.adminService.acceptRejectAffiliate(acc_id, status)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
      )
      .subscribe(({ data, success, message }: any) => {
        if (success == true) {
          this.spinner.hide();//hide spinner
          this.loadTravelPlanners()
        }
      });
  }

  addTravelPlannerClick(travelPlannerId) {
    this.router.navigate(['/admin/travel-planner-account/step1'], { queryParams: { travelPlannerId: travelPlannerId } });
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
    this.emails.setValue('')
    this.phone_numbers.setValue('')

    this.show = false
    $("#sendEmailModal").modal("hide");
    $("#sendsmsModal").modal("hide");
  }

  selectAll() {
    if (this.allSelected) {
      this.emails.patchValue('');
    } else {
      const allValues = this.travel_accounts_email.map(option => this.stringifyOption(option));
      this.emails.setValue(allValues);
    }
    this.allSelected = !this.allSelected;
  }

  stringifyOption(option: any): string {
    return JSON.stringify({ id: option.id, email: option.email });
  }


	selectAllNumbers() {
		if (this.allSelected) {
			this.phone_numbers.patchValue('');
		} else {
			const allValues = this.travel_accounts_email.map(option => this.stringifyOptionNumber(option));
			this.phone_numbers.setValue(allValues);
		}
		this.allSelected = !this.allSelected;
	}

	stringifyOptionNumber(option: any): string {
		return JSON.stringify({ id: option.id, phoneNumber: (option?.mobileIsd + option?.mobile) });
	}


	sendEmailSms(){
		this.spinner.show()
		let body = {
			message: this.sendEmailForm.get('text_message')?.value,
			recipents: this.phone_numbers.value,
		}
		console.log("in sms",body)

		this.adminService.sendSmsAffiliate(body).subscribe((response: any) => {
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
			text_message: ''
		})
		this.phone_numbers.setValue('');

		$("#sendsmsModal").modal("hide");
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
    let body = {
      subject: this.sendEmailForm.get('subject').value,
      message: this.sendEmailForm.get('text_message').value,
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

  highlighTextSteps(args: string) {
    if (!this.searchText) { return args ? args.replace("_", " ").toUpperCase() : "N/A"; }
    if (args) {
      args = args.replace("_", " ").toUpperCase()
      var re = new RegExp(this.searchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
      return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
    }

  }

  clickEditTravelPlanner(travelPlannerId) {
    localStorage.setItem('travelAgent_id', travelPlannerId)
    this.router.navigate(['/admin/travel-planner-account/step1'], { queryParams: { travelPlannerId: travelPlannerId } });
  }

  viewSubAgents(travelPlannerId) {
    this.router.navigate(['/admin/sub-travel-planner-account'], { queryParams: { travelPlannerId: travelPlannerId } });
  }

  clickTravelPlannerCards(travelPlannerId) {
    this.router.navigate(['/admin/cards'], { queryParams: { accountType: 'travelPlanner', accountId: travelPlannerId } });
  }

  clickTravelPlannerStaff(travelPlannerId) {
    this.router.navigate(['/admin/staff'], { queryParams: { accountType: 'travelPlanner', accountId: travelPlannerId } });
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
  async sendMessage(type: 'email' | 'sms', travelPlanner: Object, message: string = null) {
    console.log('Request to send a Message to travel agent id: ', type, travelPlanner['id'])
    this.messagetype = { type, travelPlanner }
    $('#messageModal').modal('show')
    $('#messageModal').find('.modal-header').find('h4').text('Contact to Travel Agent via ' + type.toUpperCase())
    $('#messageModal').find('.modal-body').find('p#affiliate-details').html(`Travel Agent Name: ${travelPlanner['first_name']} ${travelPlanner['last_name']}<br/>Travel Agent Email: ${travelPlanner['email']}`)
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
			this.adminService.sendAffiliateMessage(type, travelPlanner['id'], body).subscribe((response: any) => {
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
    this.adminService.travelPlannerAccountStatus(id, status)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
      ).subscribe(result => {

        this.spinner.hide();//hide spinner
      });
  }

  //for paginator
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
  loginAsUser(id) {
    this.spinner.show()
    this.adminService.loginAsUser(id).pipe(
      catchError(err => {
        this.spinner.hide()
        return throwError(err);
      })
    ).subscribe(response => {
      this.spinner.hide()
      this.loginAsUserResponse = response
      if (this.loginAsUserResponse.data.user?.is_profile_complete && this.loginAsUserResponse?.data?.travel_planner?.account_approval == 'rejected') {
        this.errorDialog.openDialog({
          errors: {
            error: `This account is being rejected by admin. So, you can't log into this account!`
          }
        })
        return;
      }
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
      sessionStorage.setItem('step_completed', JSON.stringify(this.loginAsUserResponse.data?.travel_planner.step_completed))
      sessionStorage.setItem('step_completed_obj', JSON.stringify(this.loginAsUserResponse.data?.travel_planner.step_completed_obj))
      localStorage.setItem('agentAccountStatus', this.loginAsUserResponse?.data?.travel_planner?.account_approval)
      localStorage.setItem('invite_link', this.loginAsUserResponse?.data?.invite_link)
      localStorage.setItem('access_token', this.loginAsUserResponse.data?.access_token)
      localStorage.setItem('currentUser', JSON.stringify(this.loginAsUserResponse.data?.user))
      // localStorage.setItem('userData', bkp_u_dt)
      if (this.loginAsUserResponse.data.user?.is_profile_complete && this.loginAsUserResponse?.data?.travel_planner?.account_approval == 'accepted') {
        this.router.navigateByUrl('/travel_agent/bookings');
      }
      else {
        this.router.navigateByUrl('/travel_agent/profile/step1');
      }


    });
  }

  myUploader(event) {
    // this.loader = true;

    this.uploadedFile = Array.from(event.target.files)
    console.log("file", this.uploadedFile)
    // if (this.uploadedFile) {
    //   this.fileName = this.uploadedFile['name'];
    //   this.fileType = this.uploadedFile['type'];
    //   console.log("file", this.fileName, this.fileType)
    // }
  }

}
