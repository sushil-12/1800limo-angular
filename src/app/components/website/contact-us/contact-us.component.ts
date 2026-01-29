import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { WebsiteService } from 'src/app/services/website.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $: any;

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  getInTouchForm: FormGroup;
  submitted = false;
  public disableSubmitButton: boolean = false;
  public modalAlertMessage : string;
  response: any;
  constructor(private formBuilder: FormBuilder,
    private websiteService: WebsiteService,
    private router:Router,    
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    //Get In Touch FORM
    //validations
    this.getInTouchForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
      phone:['', [Validators.required, Validators.pattern("^[0-9+]*$")]],
      message: ['', Validators.required]
    });
  }

  get fGetInTouch() { 
    return this.getInTouchForm.controls;
   }
  onSubmitGetInTouch() {
    console.log(this.getInTouchForm);
    this.submitted = true;
    if (this.getInTouchForm.invalid) {
      return;
    }
    this.spinner.show();
    this.websiteService.contactFormData(this.getInTouchForm.value)
    .pipe(
      catchError(err => {
        this.spinner.hide();//hide spinner
        this.disableSubmitButton = false; //enable submit button
        return throwError(err);
      })
    )
    .subscribe(({ success,message }: any) => {   
      this.spinner.hide();//hide spinner
      this.modalAlertMessage = message;
      this.disableSubmitButton = true; //enable submit button
      if(success == true){
        $('#successfullyMessageModal').modal('show');
      }     
    });
  }
  refreshForm(){   
     location.reload();
  }
}
