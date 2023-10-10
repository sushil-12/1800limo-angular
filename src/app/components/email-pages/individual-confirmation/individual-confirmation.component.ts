import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService } from 'src/app/services/admin.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';

@Component({
  selector: 'app-individual-confirmation',
  templateUrl: './individual-confirmation.component.html',
  styleUrls: ['./individual-confirmation.component.scss']
})
export class IndividualConfirmationComponent implements OnInit {
  url: string;

  constructor(
		private $api: AdminService,
		private $spinner: NgxSpinnerService,
    private $form: FormBuilder,
		private router: Router,
    private activatedroute: ActivatedRoute,
		private $errors: ErrorDialogService,
  ) { }
  ReasonForm: FormGroup
  public reasonArray = ['Booked by mistake', 'Too expensive', 'Flight or Transportation Delays' ,'others']
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) =>
			{
        console.log('params-->>>>>>>' , params)
				// const paramResponse: any = { ...params.keys, ...params };
				this.url = atob(params.message)
        console.log('->>>>>>>>>..',this.url,atob(params.message))
			});
    this.ReasonForm = this.$form.group({
      selected_reason: ['', Validators.required],
      reason: ['']
    })
  }
  get Form() {
    return this.ReasonForm.controls;
  }
  handleChangeReason(value) {
    if (value == 'others') {
      this.ReasonForm.patchValue({
        reason : ''
      })
      this.ReasonForm.get('other').setValidators(Validators.required);
      this.ReasonForm.get('other').updateValueAndValidity;
    }
    else {
      this.ReasonForm.patchValue({
        reason : value
      })
      this.ReasonForm.get('other').clearValidators();
      this.ReasonForm.get('other').updateValueAndValidity();
    }
  }
  submitForm(){
    console.log('form submitted', this.url, this.ReasonForm.value)
    let data = {
      cancellation_reason : this.ReasonForm.value.reason
    }
    this.$spinner.show()
		this.$api.cancellationBooking(this.url,data).subscribe((response: any) => {
      this.$spinner.hide()
      this.$errors.openDialog({
					errors: {
						error: `<span class='text-success'>${response.message}</span>`
					}
				})
      this.router.navigate(['/home']);
		})
  }

}
