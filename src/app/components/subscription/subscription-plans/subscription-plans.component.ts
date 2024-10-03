import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss']
})
export class SubscriptionPlansComponent implements OnInit {
  public planData: any;

  constructor(
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.getPlans()

  }

  getPlans() {
    this.spinner.show()
    this.authService.getSubsPlans().pipe(
      catchError(err => {
        this.spinner.hide()
        return throwError(err)
      })
    ).subscribe(
      response => {
        this.spinner.hide()
        this.planData = response
        console.log("subs plan", response)
      }
    )
  }

  submitPlan(id) {
    if (id == 1) {
      this.router.navigate(['/login/driver'])
    }
    else {
      sessionStorage.setItem("selectedPlanId", id)
      this.router.navigate(['/partner-registration'])
    }
  }

}
