import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
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
  travelAccountCount: any;
  loginAsUserResponse: any;
  alertMessage: string = '';
  looseAffId: any;
  sendEmailForm: FormGroup;
  show: boolean;
  allSelected = false;
  emails = new FormControl('');

  constructor(
    private adminService: AdminService,
    private router: Router,
    private errorDialog: ErrorDialogService,
    private $form: FormBuilder,
    private $routeurl: ActivatedRoute,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.searchText = localStorage.getItem('looseAffiliateSearch') ? localStorage.getItem('looseAffiliateSearch') : ''
    this.loadSubLooseAffiliateAcc();//load LooseAffiliateAcc
    this.buildSendEmailForm();
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
      this.LooseAffiliateAcc = this.LooseAffiliateAccRes?.data?.data;
      console.log('loose aff acc--->', this.LooseAffiliateAcc)
      this.firstPage = 1;
      this.travelAccountCount = this.LooseAffiliateAccRes?.data?.account_counts
      this.lastPage = this.LooseAffiliateAccRes.data.last_page;
      this.totalPage = this.LooseAffiliateAccRes.data.last_page;
      this.currentPage = this.LooseAffiliateAccRes.data.current_page;
      this.from = this.LooseAffiliateAccRes.data.from;
      this.to = this.LooseAffiliateAccRes.data.to;
      this.path = this.LooseAffiliateAccRes.data.path;
      this.firstPageUrl = this.LooseAffiliateAccRes.data.first_page_url;
      this.lastPageUrl = this.LooseAffiliateAccRes.data.last_page_url;
      this.prevPageUrl = this.LooseAffiliateAccRes.data.prev_page_url;
      this.nextPageUrl = this.LooseAffiliateAccRes.data.next_page_url;
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
      this.emails.patchValue(this.LooseAffiliateAcc.map(option => option.email));
    }
    this.allSelected = !this.allSelected;
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

  messagetype: Record<string, any>
  sendMessage(type: 'email' | 'sms', travelPlanner: any, message: string = null) {
    console.log('Request to send a Message to travel agent id: ', type, travelPlanner)
    this.messagetype = { type, travelPlanner }
    $('#messageModal').modal('show')
    $('#messageModal').find('.modal-header').find('h4').text('Contact to User via ' + type.toUpperCase())
    $('#messageModal').find('.modal-body').find('p#affiliate-details').html(`User Name: ${travelPlanner['name']}<br/>User Email: ${travelPlanner['email']}`)
    if (message != null) {
      // let body = {
      //   text_message: message
      // }
      const formData = new FormData();
      formData.append("text_message", message);
      if (type == 'email') {
        formData.append("email_address", travelPlanner?.email)
      }
      else {
        formData.append('phone_number', travelPlanner?.phone_isd + travelPlanner?.phone)
      }
      // if (type == 'email') {
      //   body['email_address'] = travelPlanner?.email
      // }
      // else {
      //   body['phone_number'] = travelPlanner?.phone_isd + travelPlanner?.phone
      // }
      console.log("bodyy in send message", formData)
      this.adminService.sendNotificationAllAccounts(type, formData).then(response => {
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


}
