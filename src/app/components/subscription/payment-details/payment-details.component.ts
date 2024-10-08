import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';

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

  constructor(
    private formBuilder: FormBuilder,
    private customValidator: CustomvalidationService,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private router: Router

  ) { }

  ngOnInit(): void {

    this.registeredUser = JSON.parse(sessionStorage.getItem("registeredUserData"))
    this.subscription_product_id = sessionStorage.getItem('selectedPlanId')

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
        this.router.navigate(['/login/subscriber'])
      });
  }


}
