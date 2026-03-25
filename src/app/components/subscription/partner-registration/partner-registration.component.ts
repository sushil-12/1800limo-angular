import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as intlTelInput from 'intl-tel-input';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from '../../../services/common.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { environment } from 'src/environments/environment';
import { attachPlaceAutocompleteElement } from '../../../utils/google-place-autocomplete';
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
    private router: Router,
    private commonServices: CommonService

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
      otp: ['', [Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(6), Validators.maxLength(6)]],
    });

  }

  ngAfterViewInit() {

    //init flag
    const telOptions: any = this.commonServices.getTelInputOptions();
    this.MobileObject = intlTelInput(this.phoneInput.nativeElement, telOptions);

    this.addCustomCountrySearch(this.phoneInput.nativeElement);

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

    void attachPlaceAutocompleteElement(
      this.search1.nativeElement,
      {
        types: ['geocode', 'establishment'],
        fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components', 'types'],
        syncControl: this.registrationForm.get('address')!,
      },
      (place) => {
        this.ngZone.run(() => {
          if (!place.geometry || !place.geometry.location) return;
          const formattedAddress = place.formatted_address ?? '';
          const placeName = place.name ?? '';
          const displayAddress = placeName ? `${placeName} - ${formattedAddress}` : formattedAddress;

          this.registrationForm.patchValue({
            address: displayAddress,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          });

          place.address_components?.forEach((component) => {
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
          });
        });
      }
    );
  }

  buildregistrationForm() {
    this.registrationForm = this.formBuilder.group({
      userId: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      company_name: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(9), Validators.maxLength(15)]],
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
    // Allow: backspace, delete, tab, escape, enter, + symbol (43)
    if (charCode === 43) {
      return true;
    }
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

    // Sync country code
    if (this.MobileObject) {
      const countryData = this.MobileObject.getSelectedCountryData();
      if (countryData && countryData.dialCode) {
        this.registrationForm.patchValue({
          countryCode: '+' + countryData.dialCode,
          phoneCountry: countryData.iso2
        });
      }
    }

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

    // Sync country code
    if (this.MobileObject) {
      const countryData = this.MobileObject.getSelectedCountryData();
      if (countryData && countryData.dialCode) {
        this.registrationForm.patchValue({
          countryCode: '+' + countryData.dialCode,
          phoneCountry: countryData.iso2
        });
      }
    }

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



  private addCustomCountrySearch(element: HTMLElement) {
    element.addEventListener('open:countrydropdown', () => {
      const container = element.closest('.iti');
      const dropdown = container?.querySelector('.iti__country-list');
      if (!dropdown) return;

      // Check if search already exists
      if (dropdown.querySelector('.iti-search-input')) return;

      // Create search container
      const searchContainer = document.createElement('div');
      searchContainer.className = 'iti-search-container';

      // Create search input
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'iti-search-input';
      searchInput.placeholder = 'Search country...';

      searchContainer.appendChild(searchInput);

      // Prevent dropdown from closing when interacting with search
      searchInput.addEventListener('click', (e) => e.stopPropagation());
      searchInput.addEventListener('keydown', (e) => e.stopPropagation());

      // Insert at top of dropdown
      dropdown.insertBefore(searchContainer, dropdown.firstChild);

      // Focus on search
      setTimeout(() => searchInput.focus(), 100);

      // Filter countries on input
      searchInput.addEventListener('input', (e: any) => {
        e.stopPropagation();
        const searchTerm = e.target.value.toLowerCase();
        const countries = dropdown.querySelectorAll('.iti__country');
        let hasVisible = false;

        countries.forEach((country: any) => {
          // Search in the full text (Name + Dial Code)
          const text = country.textContent?.toLowerCase() || '';

          if (text.includes(searchTerm)) {
            country.classList.remove('iti__hide');
            country.style.display = 'block'; // Force show
            hasVisible = true;
          } else {
            country.classList.add('iti__hide');
            country.style.display = 'none'; // Force hide
          }
        });

        // Handle No Results
        let noResults = dropdown.querySelector('.iti-no-results');
        if (!noResults) {
          noResults = document.createElement('div');
          noResults.className = 'iti-no-results';
          noResults.textContent = 'No results found';
          dropdown.appendChild(noResults);
        }

        if (!hasVisible && searchTerm) {
          (noResults as HTMLElement).style.display = 'block';
        } else {
          (noResults as HTMLElement).style.display = 'none';
        }

        // Show all if search is empty
        if (!searchTerm) {
          countries.forEach((country: any) => {
            country.classList.remove('iti__hide');
            country.style.display = 'block';
          });
          (noResults as HTMLElement).style.display = 'none';
        }
      });
    });
  }
}
