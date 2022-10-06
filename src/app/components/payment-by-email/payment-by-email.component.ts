import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ErrorDialogService } from '../../services/error-dialog/errordialog.service';

@Component({
  selector: 'app-payment-by-email',
  templateUrl: './payment-by-email.component.html',
  styleUrls: ['./payment-by-email.component.scss']
})
export class PaymentByEmailComponent implements OnInit {

  public PBEform: FormGroup;
  public submittedForm: boolean;
  public disableSubmitButton: boolean = false;
  public response: any;
  public paramResponse: any;
  public accountId: string;
  public accountType: string;
  public bookingId: string;
  public accId: string;
  public paymentData: any;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private activatedroute: ActivatedRoute,
    public errorDialogService: ErrorDialogService
  ) { }

  ngOnInit(): void {

    this.spinner.show();
    this.activatedroute.paramMap
      .subscribe((params) => {
        this.paramResponse = { ...params.keys, ...params };
        this.bookingId = this.paramResponse.params.bookingId;
        this.accId = this.paramResponse.params.accId;
        this.adminService.getPaymentData(this.accId, this.bookingId)
          .pipe(
            catchError(err => {
              this.spinner.hide();//hide spinner
              return throwError(err);
            })
          ).subscribe(({ data, sucess, message }: any) => {
            console.log("array response", data)
            this.paymentData = data;

            this.PBEform.patchValue({
              acc_id: this.accId,
              reservation_id: this.bookingId,
              grand_total: this.paymentData.grand_total,
            });
            this.spinner.hide();//hide spinner
          });
        // }
      });

    //add card form validation
    this.PBEform = this.formBuilder.group({
      acc_id: [''],
      reservation_id: [''],
      grand_total: [''],
      cc_number: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(16), Validators.maxLength(16)]],
      name_on_card: ['', Validators.required],
      cc_expiry_month: ['', Validators.required],
      cc_expiry_year: ['', Validators.required],
      cvc: ['', Validators.required],
    });
  }

  get f() {
    return this.PBEform.controls;
  }

  submitForm() {
    console.log(this.PBEform);
    this.submittedForm = true;
    // stop here if form is invalid
    if (this.PBEform.invalid) {
      return;
    }

    console.log(this.PBEform.value);
    this.spinner.show();
    this.disableSubmitButton = true; //disable submit button

    this.adminService.paymentProcessingByEmail(this.PBEform.value)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          this.disableSubmitButton = false; //enable submit button
          return throwError(err);
        })
      )
      .subscribe(result => {
        this.response = result;
        this.spinner.hide();//hide spinner
        this.disableSubmitButton = false; //enable submit button

        this.router.navigate(['/payment-by-email'], { queryParams: { accId: this.accId, bookingId: this.bookingId } });
      });
  }

}
