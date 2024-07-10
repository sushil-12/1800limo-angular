import { Component, OnInit, isDevMode } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
declare var $: any;
@Component({
  selector: 'app-travel-planner',
  templateUrl: './travel-planner.component.html',
  styleUrls: ['./travel-planner.component.scss']
})
export class TravelPlannerComponent implements OnInit {

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
  allSelected = false;
  public travel_accounts_email: any = [];
  searchText: any;
  travelAccountCount: any;
  loginAsUserResponse: any;
  audit_Trail: any = [];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private $form: FormBuilder,
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

  timer: any
  handleSearchKeyword(text: any) {
    console.log('on change search text-->>', text)
    this.searchText = text
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      localStorage.setItem('TravelAgentSearch', text)
      this.loadTravelPlanners()
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


  loadTravelPlanners(pageUrl = null) {
    /** spinner starts on init */
    this.spinner.show();
    if (pageUrl) {
      console.log("pageurl", pageUrl)
      this.scroll('travel_agent_table')
    }
    var keyword = this.searchText;

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
      this.emails.patchValue(this.travel_accounts_email.map(option => this.stringifyOption(option)));
    }
    this.allSelected = !this.allSelected;
  }

  stringifyOption(option: any) {
    return { id: option.id, email: option.email };
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
  sendEmail() {
    this.spinner.show()
    let body = {
      subject: this.sendEmailForm.get('subject').value,
      message: this.sendEmailForm.get('text_message').value,
      recipents: this.emails.value
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
  sendMessage(type: 'email' | 'sms', travelPlanner: Object, message: string = null) {
    console.log('Request to send a Message to travel agent id: ', type, travelPlanner['id'])
    this.messagetype = { type, travelPlanner }
    $('#messageModal').modal('show')
    $('#messageModal').find('.modal-header').find('h4').text('Contact to Travel Agent via ' + type.toUpperCase())
    $('#messageModal').find('.modal-body').find('p#affiliate-details').html(`Travel Agent Name: ${travelPlanner['first_name']} ${travelPlanner['last_name']}<br/>Travel Agent Email: ${travelPlanner['email']}`)
    if (message != null) {
      this.adminService.sendAffiliateMessage(type, travelPlanner['id'], { sendContent: message },).subscribe((response: any) => {
        if (response.success) {
          console.log('Message Sent Successfully. ')
        }
      })
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
}
