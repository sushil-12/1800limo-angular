import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-affiliate-step6',
  templateUrl: './affiliate-step6.component.html',
  styleUrls: ['./affiliate-step6.component.scss']
})
export class AffiliateStep6Component implements OnInit {

  public affiliateId: string;
  public stepCompleted: string;
  public submittedForm: boolean;
  public response: any;


  constructor(
    private adminService: AdminService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
  }

  submitForm() {
    this.spinner.show();
    const affiliateId = sessionStorage.getItem("affiliateId");
    this.affiliateId = affiliateId;

    let stepCompleted = this.adminService.getUpdatedStepsLocal('6');
    const data: Object = {
      acc_id: this.affiliateId,
      Accept: true,
      stepCompleted: stepCompleted
    };

    this.adminService.affiliateTermsAccept(data)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          if (err.otherParams.step) {
            this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/admin/affiliate/step1']);
            });
          }
          return throwError(err);
        })
      )
      .subscribe(({ success }: any) => {
        this.spinner.hide();//hide spinner

        if (success == true) {
          this.adminService.updateStepsLocal('6');
        }
        this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
          this.router.navigate(['/admin/affiliates/all-operators'])
        );
      });
  }
}

