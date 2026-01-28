import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as intlTelInput from 'intl-tel-input';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-partner-registration',
  templateUrl: './partner-registration.component.html',
  styleUrls: ['./partner-registration.component.scss']
})
export class PartnerRegistrationComponent implements OnInit {
  @ViewChild('phoneInput') phoneInput!: ElementRef;
  @ViewChild('search1') search1!: ElementRef;
  geoCoder!: google.maps.Geocoder;

  public registrationForm: FormGroup;
  public otpForm: FormGroup;
  public submittedForm: boolean;
  public submittedOtpForm: boolean;
  public MobileObject: any;
  public WorkObject: any;
  public defaultCountryCode: string = "us";
  public disableButton: boolean = true;
  public otpresponse: any;
  public enableOtpField: boolean = true;
  public snackbarMsg: string;
  public verifiedNumber: any;
  public planName: string = '';
  public planPrice: any;

  constructor(
    private formBuilder: FormBuilder,
    private ngZone: NgZone,
    private authService: AuthService,
    private errorDialog: ErrorDialogService,
    private spinner: NgxSpinnerService,
    private router: Router

  ) { }


  //google map autocomplete
  title: string = 'AGM project';
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  ngOnInit(): void {

    this.planName = JSON.parse(sessionStorage.getItem("selectedPlan"))?.product_name
    this.planPrice = JSON.parse(sessionStorage.getItem("selectedPlan"))?.product_price

    this.buildregistrationForm();


    this.otpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(6), Validators.maxLength(6)]],
    });

  }

  ngAfterViewInit() {

    //init flag
    this.MobileObject = intlTelInput(this.phoneInput.nativeElement, {
      initialCountry: 'us',
      preferredCountries: ['us', 'ca', 'mx', 'gb'],
      separateDialCode: true,
      nationalMode: false,
      // autoPlaceholder: 'aggressive',
      utilsScript:
        'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js'
    });

    this.phoneInput.nativeElement.addEventListener('countrychange', () => {
      const countryData = this.MobileObject.getSelectedCountryData();
      console.log("in country chnage", countryData)
      this.onCountryChange(countryData, 'mobile')
    });

    this.initautoComplete()


  }

  initautoComplete() {

    //google map autocomplete
    this.geoCoder = new google.maps.Geocoder();

    const autocomplete = new google.maps.places.Autocomplete(
      this.search1.nativeElement,
      {
        types: ['geocode', 'establishment'], // Use geocode for addresses and landmarks // Optional: Restrict to US addresses
        fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components', 'types']
      }
    );

    autocomplete.addListener("place_changed", () => {
      this.ngZone.run(() => {
        //get the place result
        const place: google.maps.places.PlaceResult = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        this.registrationForm.patchValue({
          address: place.formatted_address,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng()
        });


        // Extract address components
        place.address_components?.forEach(component => {
          const types = component.types;
          if (types.includes('country')) {
            this.registrationForm.patchValue({
              country: component.long_name
            });
          } else if (types.includes('administrative_area_level_1')) {
            this.registrationForm.patchValue({
              state: component.long_name
            });
          } else if (types.includes('administrative_area_level_3')) {
            this.registrationForm.patchValue({
              city: component.long_name
            });
          } else if (types.includes('postal_code')) {
            this.registrationForm.patchValue({
              zipCode: component.long_name
            });
          }
          // else if (types.includes('street_number')) {
          // 	this.registrationForm.patchValue({
          // 		address: component.long_name
          // 	});
          // }
        });
      });
    });
  }

  buildregistrationForm() {
    this.registrationForm = this.formBuilder.group({
      userId: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      company_name: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(9), Validators.maxLength(15)]],
      countryCode: ['+1', Validators.required],
      phoneCountry: ['us'],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
      address: ['', [Validators.required]],
      city: [''],
      state: [''],
      country: [''],
      zipCode: [''],
      latitude: [''],
      longitude: [''],
    });
  }

  get f() {
    return this.registrationForm.controls;
  }

  get fOtpform() {
    return this.otpForm.controls;
  }


  onCountryChange(event, type) {
    this.registrationForm.patchValue({
      countryCode: '+' + event.dialCode,
      phoneCountry: event.iso2
    });
    this.registrationForm.get('phone').updateValueAndValidity();
    this.validateMobile();
  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  validatePhoneGeneric(control: any, telInputObject: any) {
    if (telInputObject) {
      const value = control.value;
      if (!value) {
        if (control.errors) {
          const { invalidIntl, ...otherErrors } = control.errors;
          control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
        }
        return;
      }
      const isValid = telInputObject.isValidNumber();
      if (!isValid) {
        const errorCode = telInputObject.getValidationError();
        const errorMsg = ["Invalid phone number", "Invalid country code", "Invalid phone number", "Invalid phone number", "Invalid phone number"][errorCode] || "Invalid phone number";
        const currentErrors = control.errors || {};
        control.setErrors({ ...currentErrors, 'invalidIntl': errorMsg });
      } else {
        if (control.errors) {
          const { invalidIntl, ...otherErrors } = control.errors;
          control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
        }
      }
    }
  }

  validateMobile() {
    this.validatePhoneGeneric(this.registrationForm.get('phone'), this.MobileObject);
  }

  telInputObjectMobile(obj) {
    this.MobileObject = obj;
  }

  onChangeMobile(event) {
    const currentValue = event.target.value;
    console.log("in chnage", this.verifiedNumber, currentValue)
    if (this.verifiedNumber != currentValue) {
      console.log('Value changed from', this.verifiedNumber, 'to', currentValue);
      this.enableOtpField = true;
    }
  }

  openSnackbar() {
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () {
      x.className = x.className.replace("show", "");
    }, 5000);
  }

  sendOtp() {
    this.spinner.show()
    let data = {
      phone: this.registrationForm.get('phone').value,
      countryCode: this.registrationForm.get('countryCode').value
    }

    this.authService.subscriberOtp(data)
      .pipe(
        catchError(err => {
          this.spinner.hide()
          return throwError(err);
        })
      )
      .subscribe((result: any) => {
        this.spinner.hide()
        this.otpresponse = result;
        this.enableOtpField = false;
        this.snackbarMsg = "OTP sent Successfully";
        this.openSnackbar();
        $("#otpModal").modal("show");
      });
  }

  verifyOtp() {
    this.submittedOtpForm = true;
    if (this.otpForm.invalid) {
      return;
    }

    let data = {
      userId: this.otpresponse?.data?.id,
      otp: this.otpForm.get('otp').value
    }

    this.authService.verifySubsciberOtp(data)
      .pipe(
        catchError(err => {
          this.spinner.hide()
          this.enableOtpField = true;
          return throwError(err);
        })
      )
      .subscribe((result: any) => {
        this.spinner.hide()
        this.enableOtpField = false;
        this.registrationForm.patchValue({
          userId: result?.data.id
        })
        this.verifiedNumber = result?.data.phone
        this.snackbarMsg = 'Phone verified successfully! Click Register for payment.'
        this.openSnackbar()
      });
    this.otpForm.patchValue({
      otp: ""
    })
    $("#otpModal").modal("hide");

  }

  resendOtp() {
    let data = {
      phone: this.registrationForm.get('phone').value,
      countryCode: this.registrationForm.get('countryCode').value,
      userId: this.otpresponse?.data?.id
    }
    console.log("data to send", data)
    this.authService.resendOtp(data)
      .pipe(
        catchError(err => {
          this.spinner.hide()
          return throwError(err);
        })
      )
      .subscribe((result: any) => {
        this.spinner.hide()
        this.snackbarMsg = "OTP sent Successfully";
        this.openSnackbar();
      });
  }

  submitForm() {

    this.submittedForm = true

    if (this.registrationForm.invalid) {
      return;
    }


    if (this.registrationForm.get('address').value != '' && this.registrationForm.get('latitude').value == '') {
      this.errorDialog.openDialog({
        errors: {
          error: `<spanclass="text-danger font-weight-bolder text-xl">Please choose the correct address from the dropdown.</span>`
        }
      })
      return;
    }

    if (this.enableOtpField) {
      console.log("phone not verified")
      // this.errorDialog.openDialog({
      //   errors: {
      // 		error: `Please verify your mobile number!`
      // 	}
      // })
      return;
    }

    if (this.registrationForm.get('userId').value == "") {
      this.enableOtpField = true
      console.log("user id empty")
      return;
    }

    this.spinner.show()

    this.authService.validateSubsData(this.registrationForm.value)
      .pipe(
        catchError(err => {
          this.spinner.hide()
          return throwError(err);
        })
      )
      .subscribe((result: any) => {
        this.spinner.hide()
        sessionStorage.setItem("registeredUserData", JSON.stringify(this.registrationForm.value))
        this.snackbarMsg = "Registration Successful. PLease Proceed for payment!";
        this.openSnackbar();
        this.router.navigate(['/payment-details']);
      });


    // this.authService.registerSubscriber(this.registrationForm.value)
    //   .pipe(
    //     catchError(err => {
    //       this.spinner.hide()
    //       return throwError(err);
    //     })
    //   )
    //   .subscribe((result: any) => {
    //     this.spinner.hide()
    //     this.snackbarMsg = "Registration Successful. PLease Login!";
    //     this.openSnackbar();
    //     this.router.navigate(['/login/subscriber']);
    //   });



  }


}
