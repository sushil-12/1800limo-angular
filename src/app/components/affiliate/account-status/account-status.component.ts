import { Component, OnInit } from '@angular/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
declare var $: any;


@Component({
  selector: 'app-account-status',
  templateUrl: './account-status.component.html',
  styleUrls: ['./account-status.component.scss']
})
export class AccountStatusComponent implements OnInit {

  account_approval_status!: string
  status_message!: string
  status_title!: string
  status_color!: string
  reasons!: string

  constructor(
    private $router: Router,
    private affiliateService: AffiliateService,
  ) { }

  ngOnInit(): void {
    this.checkAffiliateAccountStatus()
  }

  checkAffiliateAccountStatus() {
    this.status_message = ""
    this.status_title = "loading ..."
    this.status_color = "text-secondary"
    this.reasons = ""

    this.affiliateService.checkAffiliateAccountStatus().subscribe(({ data, message }: any) => {
      console.log("status", data?.status, message)
      this.account_approval_status = data?.status;
      // this.reasons = data.comment.replace('/\n+/g', 'br/>')

      if (this.account_approval_status == 'accepted') {
        localStorage.setItem('account_approval', 'accepted')
        this.$router.navigate(['/affiliate/my-bookings'])
        window.location.reload()
      } else if (this.account_approval_status == 'completed') {
        this.status_message = ""
        this.status_title = "In Review ..."
        this.status_color = "text-primary"
        this.reasons = ""
      }
      else if (this.account_approval_status == 'rejected') {
        this.status_message = ""
        this.status_title = "Rejected ..."
        this.status_color = "text-danger"
        this.reasons = message
      } else if (this.account_approval_status == 'stripe_error') {
        this.status_message = ""
        this.status_title = "Stripe-Error ..."
        this.status_color = "text-danger"
        this.reasons = 'Please check Step 2 to fix the stripe errors!'
        localStorage.setItem('account_approval', 'stripe_error')
      } else {
        // do in case of IN-PROGRESS || REJECTED

        [this.status_color, this.status_title, this.status_message] = (function (status: string) {
          return status == 'completed' ?
            ['text-primary', 'In Review', 'Your application is still under processing ...'] :
            ['text-danger', 'Rejected', 'Your application has been rejected by the Admin due to the following reasons: ']
        })(data.status)
      }

    });
  }
}
