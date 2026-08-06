import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss']
})
export class SubscriptionPlansComponent implements OnInit {
  public planData: any;
  public selectedPlanId: any = '';
  public currentUser: any;
  public numberOfVeh: any;
  public erroMsg: string = '';
  isModalOpen: boolean = false;
  showVehicleBtn: boolean = false;

  constructor(
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private error: ErrorDialogService,
    private router: Router,

  ) { }

  ngOnInit(): void {

    this.getPlans()

    this.currentUser = JSON.parse(localStorage.getItem("currentUser"))

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
    // this.spinner.show()
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
    console.log("plan", plan)
    if (plan?.id == 1) {
      sessionStorage.setItem('clicked_login_role', 'driver');
      this.router.navigate(['/login'])
    }
    else if (this.currentUser) {
      console.log("in if affiliate")
      this.numberOfVeh = localStorage.getItem('affiliateVehicles')
      if (plan?.id == 2 && this.numberOfVeh > 1) {
        console.log("in if plan is 99 and veh greater than 1")
        this.erroMsg = 'You currently have multiple vehicles associated with your account. To continue, please select the Fleet Operator Plan or remove the additional vehicles from your account.'
        this.isModalOpen = true; // Open modal
        this.showVehicleBtn = false
      }
      else if (plan.id == 3 && this.numberOfVeh > 2) {
        console.log("in if plan is 199 and veh greater than 2")
        this.erroMsg = 'You currently have more than 2 vehicles associated with your account. A charge of $25 will apply for each additional vehicle. If you agree, please proceed. Otherwise, remove the extra vehicles from your account.'
        this.isModalOpen = true; // Open modal
        this.showVehicleBtn = true
      }
      else {
        sessionStorage.setItem("selectedPlan", JSON.stringify(plan))
        this.router.navigate(['/payment-details']);
      }
    }
    else {
      sessionStorage.setItem("selectedPlan", JSON.stringify(plan))
      this.router.navigate(['/partner-registration'])
    }
  }

  proceedSubs(plans: any) {
    console.log('plans', plans)
    let plan = plans?.find(item => item?.id == 3)
    sessionStorage.setItem("selectedPlan", JSON.stringify(plan))
    this.isModalOpen = false
    this.router.navigate(['/payment-details']);
  }

  vehicleSettings() {
    this.isModalOpen = false; // Close modal
    this.router.navigate(['/affiliate/step5'])
  }

  closeModal() {
    this.isModalOpen = false
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
