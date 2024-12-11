import { Component, OnInit, isDevMode } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { UploadService } from 'src/app/services/upload.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
declare var $: any;

@Component({
  selector: 'app-loose-affiliate-accounts',
  templateUrl: './loose-affiliate-accounts.component.html',
  styleUrls: ['./loose-affiliate-accounts.component.scss']
})
export class LooseAffiliateAccountsComponent implements OnInit {

  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  public paramResponse: any;
  public LooseAffiliateAccRes: any;
  public LooseAffiliateAcc: any;

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
  searchText: any;
  looseAffiliateAccountCount: any;
  loginAsUserResponse: any;
  alertMessage: string = '';
  looseAffId: any;
  sendEmailForm: FormGroup;
  show: boolean;
  allSelected = false;
  emails = new FormControl('');
  audit_Trail: any = [];
  public sendMessageForm: FormGroup;
  fileToUpload: File;
  emailFileName: string = '';
  fileUrl: String;
  fileName: String;
  fileType: String;
  uploadedFile: any;


  constructor(
    private adminService: AdminService,
    private uploadService: UploadService,
    private router: Router,
    private errorDialog: ErrorDialogService,
    private $form: FormBuilder,
    private $routeurl: ActivatedRoute,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.searchText = localStorage.getItem('looseAffiliateSearch') ? localStorage.getItem('looseAffiliateSearch') : ''
    this.sendMessageForm = this.$form.group({
      file: [null]
    })
    this.loadSubLooseAffiliateAcc();//load LooseAffiliateAcc
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
      localStorage.setItem('looseAffiliateSearch', text)
      this.loadSubLooseAffiliateAcc()
    }, 700)
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

  loadSubLooseAffiliateAcc(pageUrl = null) {
    /** spinner starts on init */
    if (pageUrl) {
      console.log("pageurl", pageUrl)
      this.scroll('loose_affiliae_table')
    }
    this.spinner.show();

    var keyword = this.searchText;

    // Load Our LooseAffiliateAcc using API
    this.adminService.getLooseAffiliaeAccounts(pageUrl, keyword).then(result => {
      this.LooseAffiliateAccRes = result;
      this.LooseAffiliateAcc = this.LooseAffiliateAccRes?.data?.loose_affiliates?.data;
      console.log('loose aff acc--->', this.LooseAffiliateAcc)
      this.firstPage = 1;
      this.looseAffiliateAccountCount = this.LooseAffiliateAccRes?.data?.count
      this.lastPage = this.LooseAffiliateAccRes?.data?.loose_affiliates?.last_page;
      this.totalPage = this.LooseAffiliateAccRes?.data?.loose_affiliates?.last_page;
      this.currentPage = this.LooseAffiliateAccRes?.data?.loose_affiliates?.current_page;
      this.from = this.LooseAffiliateAccRes?.data?.loose_affiliates?.from;
      this.to = this.LooseAffiliateAccRes?.data?.loose_affiliates?.to;
      this.path = this.LooseAffiliateAccRes?.data?.loose_affiliates?.path;
      this.firstPageUrl = this.LooseAffiliateAccRes?.data?.loose_affiliates?.first_page_url;
      this.lastPageUrl = this.LooseAffiliateAccRes?.data?.loose_affiliates?.last_page_url;
      this.prevPageUrl = this.LooseAffiliateAccRes?.data?.loose_affiliates?.prev_page_url;
      this.nextPageUrl = this.LooseAffiliateAccRes?.data?.loose_affiliates?.next_page_url;
      // sessionStorage.setItem('LooseAffiliateAcc',JSON.stringify(this.LooseAffiliateAcc));
      this.spinner.hide();//hide spinner
    })
      .catch(err => {
        this.spinner.hide();//hide spinner
      });
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
  closeModal(fileInput) {
    fileInput.value = '';
    this.uploadedFile = ''
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
      const allValues = this.LooseAffiliateAcc.map(option => this.stringifyOption(option));
      this.emails.setValue(allValues);
    }
    this.allSelected = !this.allSelected;
  }

  stringifyOption(option: any): string {
    return JSON.stringify({ id: option.id, email: option.email });
  }
  //submit email modal
  async sendEmail() {
    this.spinner.show()
    if (this.uploadedFile) {
      let dataS = await this.uploadService.uploadFile(this.uploadedFile);
      this.fileUrl = dataS.Location;
      console.log("fileUrl", this.fileUrl)
    }
    let body = {
      subject: this.sendEmailForm.get('subject').value,
      message: this.sendEmailForm.get('text_message').value,
      recipents: this.emails.value,
      account_type: 'loose_affiliate',
      fileUrl: this.fileUrl,
      filetype: this.fileType
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

  highlighText(args: string) {
    if (!this.searchText) { return args; }
    if (args) {
      args = args.toString()
      var re = new RegExp(this.searchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
      return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
    }
  }

  addLooseAffiliateClick() {
    this.router.navigate(['/admin/add-loose-affiliate-account']);
  }

  editLooseAffClick(looseAffId) {
    this.router.navigate(['/admin/edit-loose-affiliate-account'], { queryParams: { looseAffId: looseAffId } });
  }

  enableDisableClicked(id: any) {
    this.alertMessage = 'Are you sure you want to delete this account?'
    this.looseAffId = id
  }

  delete() {
    $('#deleteConfirmationModal').modal('hide');
    this.adminService.deleteLooseAffAccount(this.looseAffId)
      .pipe(
        catchError(err => {
          // this.stateManagementService.setprogressBar(false);
          return throwError(err);
        })
      ).subscribe(result => {
        this.loadSubLooseAffiliateAcc()
        // this.stateManagementService.setprogressBar(false);
      });
  }

  inviteEmailFileChange(event: any) {
    console.log('fileeeeeee', event.target.files[0])
    // this.fileToUpload = files.item(0);
    this.emailFileName = event.target.files[0].name
    this.fileToUpload = event.target.files[0];
  }

  messagetype: Record<string, any>
  sendMessage(type: 'email' | 'sms', travelPlanner: any, message: string = null) {
    console.log('Request to send a Message to travel agent id: ', type, travelPlanner, message)
    this.messagetype = { type, travelPlanner }
    $('#messageModal').modal('show')
    $('#messageModal').find('.modal-header').find('h4').text('Contact to User via ' + type.toUpperCase())
    $('#messageModal').find('.modal-body').find('p#affiliate-details').html(`User Name: ${travelPlanner['name']}<br/>User Email: ${travelPlanner['email']}`)
    if (message != null) {

      const formData = new FormData();
      // Store form name as "file" with file data
      formData.append("file", this.fileToUpload);

      formData.append("text_message", message);
      formData.append("account_type", 'loose_affiliate')
      if (type == 'email') {
        formData.append("email_address", travelPlanner?.email)
      }
      else {
        formData.append('phone_number', travelPlanner?.phone_isd + travelPlanner?.phone)
      }
      console.log("bodyy in send message", formData)

      this.adminService.sendNotificationAllAccounts(type, travelPlanner?.id, formData).then(response => {
        if (!response.ok) {
          if (response.status === 422) {
            // Parse the JSON response
            response.json().then(errorData => {
              // Handle validation errors or other specific errors
              console.error('Validation errors:', errorData?.message);
              this.errorDialog.openDialog({
                errors: {
                  error: errorData?.message
                }
              })
            });
          }
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
        .then(data => {
          console.log('File uploaded successfully:', data);
          this.fileToUpload = null
          this.emailFileName = ''
          this.sendMessageForm.patchValue({
            file: [null]
          })
          message = ''
          this.errorDialog.openDialog({
            errors: {
              error: `<span class='text-success'>${data?.message}</span>`
            }
          })

        })
        .catch(error => {
          console.error('Error uploading file:', error);
          this.errorDialog.openDialog({
            errors: {
              error: 'Server Error'
            }
          })
        });

    }
  }

  myUploader(event) {
    // this.loader = true;

    this.uploadedFile = event.target.files[0]
    console.log("file", this.uploadedFile)
    if (this.uploadedFile) {
      this.fileName = this.uploadedFile['name'];
      this.fileType = this.uploadedFile['type'];
      console.log("file", this.fileName, this.fileType)
    }
  }


}
