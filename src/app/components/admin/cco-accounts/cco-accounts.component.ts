import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { UploadService } from 'src/app/services/upload.service';
declare var $: any;

@Component({
  selector: 'app-cco-accounts',
  templateUrl: './cco-accounts.component.html',
  styleUrl: './cco-accounts.component.scss'
})
export class CcoAccountsComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('fileInput1') fileInput1!: ElementRef;
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
  title: string = 'CCO';
  fileUrl: String;
  fileName: String;
  fileType: String;
  uploadedFile: any;
  accountType: any = 'affiliate';
  dataQuality: any = 'valid'
  userType = [
    {
      "id": "individual",
      "value": "Individual"
    },
    {
      "id": "affiliate",
      "value": "Affiliates"
    },
    {
      "id": "travel_agent",
      "value": "Travel Agent"
    },
  ];

  data_quality_array = [
    {
      "id": "valid",
      "value": "Valid"
    },
    {
      "id": "suspicious",
      "value": "Suspicious"
    },
    {
      "id": "invalid",
      "value": "Invalid"
    },
    {
      "id": "needs_review",
      "value": "Needs review"
    },
  ]

  successMessage: any;
  sendEmailForm: FormGroup;
  emails = new FormControl();
  allSelected = false;
  account_emails: any;
  accounts_count:any;


  constructor(
    private adminService: AdminService,
    private router: Router,
    private errorDialog: ErrorDialogService,
    private uploadService: UploadService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {

    this.buildSendEmailForm();

    this.searchText = localStorage.getItem('ccoAccountsSearch') ? localStorage.getItem('ccoAccountsSearch') : ''
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
      localStorage.setItem('ccoAccountsSearch', text)
      // this.loadAccounts()
    }, 700)
  }


  reset() {
    this.searchText = "";
    this.accountType = 'affiliate';
    this.dataQuality = 'valid';
    localStorage.removeItem('ccoAccountsSearch')

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
    this.adminService.getCcoAccounts(pageUrl, keyword, this.accountType, this.dataQuality).then((result: any) => {
      let response = result
      this.accounts = result?.data?.data;
      this.account_emails = this.accounts.filter(item => item.email !== null)
      this.accounts_count = result?.data?.total_count

      this.firstPage = 1;
      this.lastPage = result.data?.last_page;
      this.totalPage = result.data?.last_page;
      this.currentPage = result.data?.current_page;
      this.from = result.data?.from;
      this.to = result.data?.to;
      this.path = result.data?.path;
      this.firstPageUrl = result.data?.first_page_url;
      this.lastPageUrl = result.data?.last_page_url;
      this.prevPageUrl = result.data?.prev_page_url;
      this.nextPageUrl = result.data?.next_page_url;
      // sessionStorage.setItem('travelPlanners',JSON.stringify(this.travelPlanners));
      //hide action column

      this.spinner.hide();//hide spinner
    })
      .catch(err => {
        this.spinner.hide();//hide spinner
      });
  }

  formatText(value) {
    return value ? value.replaceAll('_', ' ') : 'N/A'
  }

  onFilterChange(name, event: any) {
    console.log("in filter change", name, event)
    if (name == 'accountType') {
      this.accountType = event.value;
    }
    else if (name == 'dataQuality') {
      this.dataQuality = event.value
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
    let body = {
      account_type: this.accountType,
      id: this.accountToDelete
    }
    this.adminService.deleteCcoAccount(body)
      .pipe(
        catchError(err => {
          // this.stateManagementService.setprogressBar(false);
          return throwError(err);
        })
      ).subscribe(result => {
        this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/admin/cco-accounts']);
        });
        this.loadAccounts()
      });

  }

  highlighText(args: string) {
    if (!this.searchText) { return args ? args : 'N/A'; }
    if (args) {
      args = args.toString()
      var re = new RegExp(this.searchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
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
    this.fileInput1.nativeElement.value = '';
    this.message.nativeElement.value = '';
    this.uploadedFile = null;
    this.fileType = null;
    this.fileUrl = null;
    $("#messageModal").modal("hide");
    this.sendEmailForm.patchValue({
      subject: "",
      text_message: ''
    })
    this.emails.setValue('');
    $("#sendEmailModal").modal("hide");
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }


  //build email modal
  buildSendEmailForm() {
    this.sendEmailForm = this.formBuilder.group({
      subject: [''],
      text_message: ['']
    })
  }

  messagetype: Record<string, any>
  async sendMessage(type: 'email' | 'sms', user: any, message: string = null) {
    console.log('Request to send a Message to travel agent id: ', type, user, message)
    this.messagetype = { type, user }
    console.log("messageType", this.messagetype)
    $('#messageModal').modal('show')
    $('#messageModal').find('.modal-header').find('h4').text('Contact to User via ' + type.toUpperCase())
    $('#messageModal').find('.modal-body').find('p#affiliate-details').html(`User Email: ${user['email']}`)
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
        body['email_address'] = user?.email
      }
      else {
        body['phone_number'] = user?.isd + user?.phone
      }

      console.log("bodyy in send message", body)

      this.adminService.sendNotificationAllAccounts(type, user?.id, body).subscribe((response: any) => {
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

  get Form() {
    return this.sendEmailForm.controls;
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


  selectAll() {
    if (this.allSelected) {
      this.emails.patchValue('');
    } else {
      const allValues = this.account_emails.map(option => this.stringifyOption(option));
      this.emails.setValue(allValues);
    }
    this.allSelected = !this.allSelected;
  }

  stringifyOption(option: any): string {
    return JSON.stringify({ id: option.id, email: option.email });
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

    this.sendEmailForm.patchValue({
      subject: "",
      text_message: ''
    })
    this.emails.setValue('');

    // Clear file input after success
    this.uploadedFile = null;
    this.fileUrl = null;
    this.fileType = null;
    if (this.fileInput1) {
      this.fileInput1.nativeElement.value = ''; // Reset file input
    }

    $("#sendEmailModal").modal("hide");
  }

}
