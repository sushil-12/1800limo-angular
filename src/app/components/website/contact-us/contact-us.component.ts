import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { WebsiteService } from 'src/app/services/website.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from 'src/app/services/common.service';
import * as intlTelInput from 'intl-tel-input';
import { contactUsData } from './contact-us-data';
declare var $: any;

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit, AfterViewInit {
  @ViewChild('phoneInput') phoneInput!: ElementRef;

  public countryCode = "+1";
  public phoneCountry = "us";
  countryChangeObject: any;

  getInTouchForm: FormGroup;
  submitted = false;
  public disableSubmitButton: boolean = false;
  public modalAlertMessage: string;
  response: any;
  constructor(private formBuilder: FormBuilder,
    private websiteService: WebsiteService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private titleService: Title,
    private metaService: Meta,
    private commonServices: CommonService) { }

  ngOnInit(): void {
    // Set SEO Metadata
    this.titleService.setTitle(contactUsData.meta.title);
    this.metaService.updateTag({ name: 'description', content: contactUsData.meta.description });
    this.metaService.updateTag({ name: 'keywords', content: contactUsData.meta.keywords });

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: contactUsData.meta.title });
    this.metaService.updateTag({ property: 'og:description', content: contactUsData.meta.description });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: '1-800-LIMO.COM' });

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: contactUsData.meta.title });
    this.metaService.updateTag({ name: 'twitter:description', content: contactUsData.meta.description });

    //Get In Touch FORM
    //validations
    this.getInTouchForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
      phone: ['', [Validators.required, Validators.pattern("^[0-9+]*$")]],
      message: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    if (this.countryChangeObject) {
      this.countryChangeObject.destroy();
    }
    if (this.phoneInput) {
      const telOptions: any = this.commonServices.getTelInputOptions();
      this.countryChangeObject = intlTelInput(this.phoneInput.nativeElement, telOptions);
      this.phoneInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.countryChangeObject.getSelectedCountryData();
        this.onCountryChange(countryData);
        this.validatePhone();
      });
    }
  }

  onCountryChange(event) {
    this.countryCode = '+' + event.dialCode;
    this.phoneCountry = event.iso2;
  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 43) {
      return true;
    }
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  validatePhone() {
    if (this.countryChangeObject) {
      const value = this.getInTouchForm.get('phone').value;
      if (!value) {
        if (this.fGetInTouch.phone.errors) {
          const { invalidIntl, ...otherErrors } = this.fGetInTouch.phone.errors;
          this.fGetInTouch.phone.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
        }
        return;
      }
      const isValid = this.countryChangeObject.isValidNumber();

      if (!isValid) {
        const errorCode = this.countryChangeObject.getValidationError();
        const errorMsg = ["Invalid phone number", "Invalid country code", "Invalid phone number", "Invalid phone number", "Invalid phone number"][errorCode] || "Invalid phone number";

        const currentErrors = this.fGetInTouch.phone.errors || {};
        this.fGetInTouch.phone.setErrors({ ...currentErrors, 'invalidIntl': errorMsg });
      } else {
        if (this.fGetInTouch.phone.errors) {
          const { invalidIntl, ...otherErrors } = this.fGetInTouch.phone.errors;
          this.fGetInTouch.phone.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
        }
      }
    }
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

    let submitData = { ...this.getInTouchForm.value };
    // Prefix country code to phone number before submitting if not present
    if (submitData.phone && this.countryCode && !submitData.phone.startsWith('+')) {
      submitData.phone = this.countryCode + submitData.phone;
    }

    this.websiteService.contactFormData(submitData)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          this.disableSubmitButton = false; //enable submit button
          return throwError(err);
        })
      )
      .subscribe(({ success, message }: any) => {
        this.spinner.hide();//hide spinner
        this.modalAlertMessage = message;
        this.disableSubmitButton = true; //enable submit button
        if (success == true) {
          $('#successfullyMessageModal').modal('show');
        }
      });
  }
  refreshForm() {
    $('#successfullyMessageModal').modal('hide');
    this.getInTouchForm.reset();
    this.submitted = false;
    this.disableSubmitButton = false;
  }
}
