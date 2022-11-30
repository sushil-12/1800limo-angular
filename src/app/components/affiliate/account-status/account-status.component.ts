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
export class AccountStatusComponent implements OnInit
{

  public account_approval: string;
  public recject_cause_message: string;
  public account_status_message: string;
  public disableAccountStatusButton: boolean = false;

  constructor(
    private router: Router,
    private stateManagementService: StateManagementService,
    private affiliateService: AffiliateService,
  ) { }

  ngOnInit(): void
  {
    this.checkAffiliateAccountStatus('refresh');
  }

  checkAffiliateAccountStatus(onRefresh = null)
  {
    this.stateManagementService.setprogressBar(true);
    this.disableAccountStatusButton = true; //disable submit button
    this.affiliateService.checkAffiliateAccountStatus()
      .pipe(
        catchError(err =>
        {
          this.stateManagementService.setprogressBar(false);
          this.disableAccountStatusButton = false;  //enable submit button
          return throwError(err);
        })
      ).subscribe(({ data, message }: any) =>
      {

        this.account_approval = data.status;
        if (!onRefresh)
        {
          $('#accountStatusModal').modal('show');
        }
        switch (data.status)
        {
          case 'accepted': {
            this.stateManagementService.setprogressBar(false);
            this.disableAccountStatusButton = false; //enable submit button
            this.router.navigate(['/affiliate/my-bookings']);
            break;
          }
          case 'completed': {
            this.account_status_message = message;
            this.stateManagementService.setprogressBar(false);
            this.disableAccountStatusButton = false; //enable submit button
            this.router.navigate(['/affiliate/account-status']);
            break;
          }
          case 'rejected': {
            this.account_status_message = message;
            this.stateManagementService.setprogressBar(false);
            this.disableAccountStatusButton = false; //enable submit button
            this.router.navigate(['/affiliate/account-status']);
            break;
          }
          case 'in-progress': {
            this.stateManagementService.setprogressBar(false);
            this.disableAccountStatusButton = false; //enable submit button
            this.router.navigate(['/affiliate/step1']);
            break;
          }
          default: {
            this.stateManagementService.setprogressBar(false);
            this.disableAccountStatusButton = false; //enable submit button
            this.router.navigate(['/affiliate']);
            break;
          }
        }
      });
  }
}
