import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { UploadService } from 'src/app/services/upload.service';
import { constant_data } from 'src/assets/js/data.js'
declare var $: any;

@Component({
  selector: 'app-recover-accounts',
  templateUrl: './recover-accounts.component.html',
  styleUrls: ['./recover-accounts.component.scss']
})
export class RecoverAccountsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('message') message!: ElementRef;
  color: ThemePalette = 'accent';
  checked = false;
  disabled = false;

  public paramResponse: any;

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
  public accountToDelete: number;
  public alertMessage: string;
  public sendMessageForm: FormGroup;
  fileToUpload: File;
  emailFileName: string = '';
  searchText: any;
  accounts: any;
  isDeletedAcc: boolean = false;
  showActionColumn: boolean = true;
  title: string = 'All';
  accounts_count: any;
  fileUrl: String;
  fileName: String;
  fileType: String;
  uploadedFile: any;
  accountType: any = 'all'
  userType: Array<any> = constant_data.userTypeSlug;
  unregistered: Boolean = false;
  successMessage: any;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private errorDialog: ErrorDialogService,
    private uploadService: UploadService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.searchText = localStorage.getItem('allAccountsSearch') ? localStorage.getItem('allAccountsSearch') : ''
    // this.searchText = ''
    this.loadAccounts();//load travelPlanners
    this.sendMessageForm = this.formBuilder.group({
      file: [null]
    })

    // localStorage.removeItem('travelAgent_id' )
  }

  timer: any
  handleSearchKeyword(text: any) {
    console.log('on change search text-->>', text)
    this.searchText = text
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      localStorage.setItem('allAccountsSearch', text)
      // this.loadAccounts()
    }, 700)
  }

  handleChangeCheckbox(value: any) {
    console.log("event---->> ", value);
    this.unregistered = value;
    this.loadAccounts()
  }

  reset() {
    this.searchText = "";
    this.unregistered = false;
    this.accountType = 'all';
    localStorage.removeItem('allAccountsSearch')

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

  loadAccounts(pageUrl = null) {
    if (pageUrl) {
      console.log("pageurl", pageUrl)
      this.scroll('all_accounts_table')
    }
    /** spinner starts on init */
    this.spinner.show();

    var keyword = this.searchText;

    // Load Our travelPlanners using API
    this.adminService.getAccounts(pageUrl, this.isDeletedAcc, keyword, this.accountType, this.unregistered).then((result: any) => {
      let response = result
      this.accounts = result?.data?.users?.data;
      this.accounts_count = result?.data?.account_counts;

      this.firstPage = 1;
      this.lastPage = result.data?.users?.last_page;
      this.totalPage = result.data?.users?.last_page;
      this.currentPage = result.data?.users?.current_page;
      this.from = result.data?.users?.from;
      this.to = result.data?.users?.to;
      this.path = result.data?.users?.path;
      this.firstPageUrl = result.data?.users?.first_page_url;
      this.lastPageUrl = result.data?.users?.last_page_url;
      this.prevPageUrl = result.data?.users?.prev_page_url;
      this.nextPageUrl = result.data?.users?.next_page_url;
      // sessionStorage.setItem('travelPlanners',JSON.stringify(this.travelPlanners));
      //hide action column

      this.spinner.hide();//hide spinner
    })
      .catch(err => {
        this.spinner.hide();//hide spinner
      });
  }

  addTravelPlannerClick(travelPlannerId) {
    this.router.navigate(['/admin/travel-planner-account/step1'], { queryParams: { travelPlannerId: travelPlannerId } });
  }

  formatText(value) {
    return value ? value.replaceAll('_', ' ') : 'N/A'
  }

  handleChangeToggle() {
    this.isDeletedAcc = !this.isDeletedAcc;
    if (this.isDeletedAcc) {
      this.showActionColumn = false
      this.title = "Deleted"
    }
    else {
      this.showActionColumn = true
      this.title = "All"
    }
  }

  onFilterChange(name, event: any) {
    console.log("in filter change", name, event)
    if (name == 'accountType') {
      this.accountType = event.value;
    }
    this.loadAccounts()
  }

  enableDisableClickedDelete(id) {
    $('#deleteConfirmationModal').modal('show');
    console.log('in function open modal', this.accountToDelete)
    this.accountToDelete = id;
    this.alertMessage = "Are you sure you want to delete this account?"
  }

  deleteAccount() {
    $('#deleteConfirmationModal').modal('hide');
    console.log('in function delete account', this.accountToDelete)
    this.adminService.deleteAccount(this.accountToDelete)
      .pipe(
        catchError(err => {
          // this.stateManagementService.setprogressBar(false);
          return throwError(err);
        })
      ).subscribe(result => {
        this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/admin/all-accounts']);
        });
        this.loadAccounts()
      });

  }

  clickEditTravelPlanner(travelPlannerId) {
    localStorage.setItem('travelAgent_id', travelPlannerId)
    this.router.navigate(['/admin/travel-planner-account/step1'], { queryParams: { travelPlannerId: travelPlannerId } });
  }

  clickTravelPlannerCards(travelPlannerId) {
    this.router.navigate(['/admin/cards'], { queryParams: { accountType: 'travelPlanner', accountId: travelPlannerId } });
  }

  clickTravelPlannerStaff(travelPlannerId) {
    this.router.navigate(['/admin/staff'], { queryParams: { accountType: 'travelPlanner', accountId: travelPlannerId } });
  }

  highlighText(args: string) {
    if (!this.searchText) { return args ? args : 'N/A'; }
    if (args) {
      args = args.toString()
      const escapedSearchText = this.searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var re = new RegExp(escapedSearchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
      return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
    }
  }

  inviteEmailFileChange(event: any) {
    console.log('fileeeeeee', event.target.files[0])
    // this.fileToUpload = files.item(0);
    this.emailFileName = event.target.files[0].name
    this.fileToUpload = event.target.files[0];
  }

  //close email modal
  closeModal() {
    this.fileInput.nativeElement.value = '';
    this.message.nativeElement.value = '';
    this.uploadedFile = null;
    this.fileType = null;
    this.fileUrl = null;
    $("#messageModal").modal("hide");
  }

  messagetype: Record<string, any>
  async sendMessage(type: 'email' | 'sms', travelPlanner: any, message: string = null) {
    console.log('Request to send a Message to travel agent id: ', type, travelPlanner, message)
    this.messagetype = { type, travelPlanner }
    $('#messageModal').modal('show')
    $('#messageModal').find('.modal-header').find('h4').text('Contact to User via ' + type.toUpperCase())
    $('#messageModal').find('.modal-body').find('p#affiliate-details').html(`User Name: ${travelPlanner['first_name']} ${travelPlanner['last_name']}<br/>User Email: ${travelPlanner['email']}`)
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
        text_message: message,
        fileData: fileData
      }
      if (type == 'email') {
        body['email_address'] = travelPlanner?.email
      }
      else {
        body['phone_number'] = travelPlanner?.isd + travelPlanner?.phone
      }

      console.log("bodyy in send message", body)

      this.adminService.sendNotificationAllAccounts(type, travelPlanner?.id, body).subscribe((response: any) => {
        this.spinner.hide()
        $('#successModal').modal('show')
        this.successMessage = response?.message
        setTimeout(() => {
          $('#successModal').modal('hide')
        }, 2000)
        console.log("response-------->", response)
      })

      // Clear file input after success
      this.uploadedFile = null;
      this.fileUrl = null;
      this.fileType = null;
      if (this.fileInput) {
        this.fileInput.nativeElement.value = ''; // Reset file input
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
