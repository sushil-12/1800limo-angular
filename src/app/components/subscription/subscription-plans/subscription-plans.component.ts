import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
declare var bootstrap: any;

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss']
})
export class SubscriptionPlansComponent implements OnInit {
  public planData: any;
  public selectedPlanId: any = '';

  constructor(
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.getPlans()

     // Initialize all tooltips on page load
    //  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    //  tooltipTriggerList.map(function (tooltipTriggerEl) {
    //    return new bootstrap.Tooltip(tooltipTriggerEl);
    //  });

     // Initialize all tooltips on page load, with click trigger for mobile devices
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
     return new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: 'hover focus click'  // Supports hover, focus, and click for different devices
      });
    });

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
        console.log("subs plan", this.planData)
      }
    )
  }

  submitPlan(plan) {
    console.log("plan",plan)
    if (plan?.id == 1) {
      this.router.navigate(['/login/driver'])
    }
    else {
      sessionStorage.setItem("selectedPlan", JSON.stringify(plan))
      this.router.navigate(['/partner-registration'])
    }
  }

  selectedPlan(id) {
    this.selectedPlanId = id
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  transform(value: string): string {
    if (!value) return value;
    return value.replace(/_/g, ' '); // Replace underscores with spaces
  }

}
