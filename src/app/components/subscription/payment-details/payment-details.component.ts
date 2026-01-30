import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.scss']
})
export class PaymentDetailsComponent implements OnInit {
  public registeredUser: any;
  public cardDetails: FormGroup;
  public submittedForm: boolean;
  public response: any;
  public yearOptions: any = [];
  public subscription_product_id: any;
  public planName: string = '';
  public planPrice: any;
  public currentUser: any;

  constructor(
    private formBuilder: FormBuilder,
    private customValidator: CustomvalidationService,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private stateManagementService: StateManagementService,
    private errorDialog: ErrorDialogService,
    private router: Router

  ) { }

  ngOnInit(): void {

    this.registeredUser = JSON.parse(sessionStorage.getItem("registeredUserData"))
    this.subscription_product_id = JSON.parse(sessionStorage.getItem('selectedPlan'))?.id
    this.planName = JSON.parse(sessionStorage.getItem("selectedPlan"))?.product_name
    this.planPrice = JSON.parse(sessionStorage.getItem("selectedPlan"))?.product_price
    this.currentUser = JSON.parse(localStorage.getItem("currentUser"))

    const currentYear = (new Date()).getFullYear();
    for (let i = 0; i < 40; i++) {
      this.yearOptions.push(currentYear + i);
    }

    this.cardDetails = this.formBuilder.group({
      card_type: ['personal', Validators.required],
      number: ['', [Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.minLength(14), Validators.maxLength(20), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
      cvc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(5), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
      exp_month: ['', Validators.required],
      exp_year: ['', Validators.required],
      // name: ['', Validators.required],
    });

  }

  get f() {
    return this.cardDetails.controls
  }

  submitForm() {

    this.submittedForm = true;

    // stop here if form is invalid
    if (this.cardDetails.invalid) {
      return;
    }

    console.log(this.cardDetails.value, this.registeredUser, this.subscription_product_id);
    this.spinner.show()

    if (this.currentUser) {
      console.log("in if logged in user")
      let dataToSend = {
        ...this.cardDetails.value,
      }
      dataToSend['user_id'] = this.currentUser.id
      dataToSend['account_id'] = this.currentUser.account_id
      dataToSend['name'] = 'TEST'
      dataToSend['subscription_product_id'] = this.subscription_product_id

      this.authService.upgradePlan(dataToSend)
        .pipe(
          catchError(err => {
            this.spinner.hide();
            return throwError(err);
          })
        )
        .subscribe(result => {
          this.spinner.hide();
          this.response = result;
          this.errorDialog.openDialog({
            errors: {
              error: `<span class='text-success'>Your account has been upgraded successfully. Please log in again!</span>`
            }
          })
          this.spinner.show()
          setTimeout(() => {
            console.log("in timeout")
            this.authService.logout()
              .pipe(
                catchError(err => {
                  // this.spinner.hide('logoutspinner');//hide spinner
                  return throwError(err);
                })
              ).subscribe(({ success }: any) => {
                // this.spinner.hide('logoutspinner');//hide spinner
                if (success == true) {
                  this.stateManagementService.removeUser();
                }
                this.router.navigate(['/login/driver'])
              });
          }, 5000)
          this.spinner.hide();
        });

    }

    else {
      console.log("in if not logged in user", this.subscription_product_id)
      let dataToSend = {
        ...this.cardDetails.value,
        ...this.registeredUser,
      }

      dataToSend['subscription_product_id'] = this.subscription_product_id

      console.log("dataTosend", dataToSend)

      this.authService.createPayment(dataToSend)
        .pipe(
          catchError(err => {
            this.spinner.hide();
            return throwError(err);
          })
        )
        .subscribe(result => {
          this.spinner.hide();
          this.response = result;
          this.router.navigate(['/login/driver'])
        });
    }

  }
}
