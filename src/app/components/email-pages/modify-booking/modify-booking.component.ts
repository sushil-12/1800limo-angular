import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService } from 'src/app/services/admin.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';

@Component({
  selector: 'app-modify-booking',
  templateUrl: './modify-booking.component.html',
  styleUrls: ['./modify-booking.component.scss']
})
export class ModifyBookingComponent implements OnInit {

  url: string;

  constructor(
		private $api: AdminService,
		private $spinner: NgxSpinnerService,
    private $form: FormBuilder,
		private router: Router,
    private activatedroute: ActivatedRoute,
		private $errors: ErrorDialogService,
  ) { }
  modifyBookingForm: FormGroup
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) =>
			{
        console.log('params-->>>>>>>' , params)
				// const paramResponse: any = { ...params.keys, ...params };
				this.url = atob(params.message)
        console.log('->>>>>>>>>..',this.url,atob(params.message))
			});
    this.modifyBookingForm = this.$form.group({
      details: ['', Validators.required]
    })
  }
  get Form() {
    return this.modifyBookingForm.controls;
  }
  submitForm(){
    console.log('form submitted', this.url, this.modifyBookingForm.value)
    let data = {
      modify_message : this.modifyBookingForm.value.details
    } 
    // this.$spinner.show()
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
