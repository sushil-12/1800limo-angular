import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { TravelAgentService } from '../../../services/travel-agent.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { AffiliateService } from 'src/app/services/affiliate.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import * as intlTelInput from 'intl-tel-input';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  @ViewChild('search1') search1!: ElementRef;
  geoCoder!: google.maps.Geocoder;
  @ViewChild('cellInput') cellInput!: ElementRef;
  @ViewChild('mobileInput') mobileInput!: ElementRef;
  @ViewChild('faxInput') faxInput!: ElementRef;
  @ViewChild('officeNumberInput') officeNumberInput!: ElementRef;

  // timezone=new FormControl('')
  public profile_pic: any;
  public modalImage: string;
  public imageSrc: string;
  public phoneObject: any;
  public profileForm: FormGroup;
  @Input() closeTab: EventEmitter<any> = new EventEmitter();
  public submittedForm: boolean; public yearOptions: any = [];
  public OfficeObject: any;
  public MobileObject: any;
  public FaxObject: any;
  public OfficePhoneObject: any;
  public currentUser: any = JSON.parse(localStorage.getItem('currentUser'))

  //google map autocomplete
  title: string = 'AGM project';
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  response: any;
  defaultCountryCode: string;
  lastSegment: string;
  accountStatus: any;

  constructor(
    private affiliateService: AffiliateService,
    private stateManagementService: StateManagementService,
    private formBuilder: FormBuilder,
    private customValidator: CustomvalidationService,
    private ngZone: NgZone,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private travelAgentService: TravelAgentService,
    private authService: AuthService,
    private errorDialog: ErrorDialogService,
  ) { }

  ngOnInit(): void {
    this.accountStatus = localStorage.getItem('agentAccountStatus')
    if (this.accountStatus == 'rejected') {
      this.errorDialog.openDialog({
        errors: {
          error: `Your account is being rejected by admin. Currently we are logging you out. Please contact admin!`
        }
      })
      setTimeout(() => {
        console.log("in timeout")
        // this.spinner.show('logoutspinner')
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
            this.router.navigate(['/']);
          });
      }, 15000)
    }
    //  else if(this.accountStatus == 'pending'){
    //     this.errorDialog.openDialog({
    //       errors: {
    //         error: `Please wait! As your account status is ${this.accountStatus} from admin.`
    //       }
    //     }) 
    //   }
    this.route.url.subscribe(segments => {
      // The "step" part is in the last segment
      const lastSegment = segments[segments.length - 1];
      this.lastSegment = lastSegment.path;
      console.log(`Step: ${this.lastSegment}`);
    });
    const currentYear = (new Date()).getFullYear();
    for (let i = 0; i < 40; i++) {
      this.yearOptions.push(currentYear + i);
    }
    this.buildProfileForm();



    this.stateManagementService.setprogressBar(false);//hide progressbar
    if (this.currentUser?.is_profile_complete) {
      this.getProfileData()
    }
    else {
      // this.profileForm.get('name')?.setValidators([Validators.required]);
      // this.profileForm.get('number')?.setValidators([Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.minLength(14), Validators.maxLength(20), this.customValidator.dashValidator(), this.customValidator.plusValidator()]);
      // this.profileForm.get('exp_month')?.setValidators([Validators.required]);
      // this.profileForm.get('exp_year')?.setValidators([Validators.required]);
      // this.profileForm.get('cvc')?.setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(4), this.customValidator.dashValidator(), this.customValidator.plusValidator()]);

      // this.profileForm.get('name')?.updateValueAndValidity();
      // this.profileForm.get('number')?.updateValueAndValidity();
      // this.profileForm.get('exp_year')?.updateValueAndValidity();
      // this.profileForm.get('exp_month')?.updateValueAndValidity();
      // this.profileForm.get('cvc')?.updateValueAndValidity();
      this.profileForm.patchValue({
        mobile: this.currentUser?.phone,
        mobileIsd: this.currentUser?.isd,
        mobileCountry: this.currentUser?.phoneCountry
      })
      this.defaultCountryCode = this.currentUser?.phoneCountry;
    }

  }



  ngAfterViewInit() {

    this.initallphonefields()

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

        this.profileForm.patchValue({
          address: place.formatted_address,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng()
        });


        // Extract address components
        place.address_components?.forEach(component => {
          const types = component.types;
          if (types.includes('country')) {
            this.profileForm.patchValue({
              country: component.long_name
            });
          } else if (types.includes('administrative_area_level_1')) {
            this.profileForm.patchValue({
              state: component.long_name
            });
          } else if (types.includes('administrative_area_level_3')) {
            this.profileForm.patchValue({
              city: component.long_name
            });
          } else if (types.includes('postal_code')) {
            this.profileForm.patchValue({
              zipCode: component.long_name
            });
          }
          // else if (types.includes('street_number')) {
          // 	this.profileForm.patchValue({
          // 		address: component.long_name
          // 	});
          // }
        });
      });
    });


  }

  initallphonefields() {

    const telOptions = {
      initialCountry: 'us',
      preferredCountries: ['us', 'ca', 'mx', 'gb'],
      separateDialCode: true,
      nationalMode: false,
      // autoPlaceholder: 'aggressive',
      utilsScript:
        'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js'
    }



    if (this.cellInput) {
      console.log('onput', this.cellInput, this.cellInput.nativeElement)
      this.OfficeObject = intlTelInput(this.cellInput.nativeElement, telOptions);
      this.cellInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.OfficeObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'work_contact_number')
      });
    }

    if (this.mobileInput) {
      console.log('onput', this.mobileInput, this.mobileInput.nativeElement)
      this.MobileObject = intlTelInput(this.mobileInput.nativeElement, telOptions);
      this.mobileInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.MobileObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'mobile');
      });
    }

    if (this.faxInput) {
      console.log('onput', this.faxInput, this.faxInput.nativeElement)
      this.FaxObject = intlTelInput(this.faxInput.nativeElement, telOptions);
      this.faxInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.FaxObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'fax')
      });
    }

    if (this.officeNumberInput) {
      console.log('onput', this.officeNumberInput, this.officeNumberInput.nativeElement)
      this.OfficePhoneObject = intlTelInput(this.officeNumberInput.nativeElement, telOptions);
      this.officeNumberInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.OfficePhoneObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'office_number')
      });
    }

    this.MobileObject.setCountry(this.defaultCountryCode)
    this.OfficeObject.setCountry(this.defaultCountryCode)
    this.OfficePhoneObject.setCountry(this.defaultCountryCode)
    this.FaxObject.setCountry(this.defaultCountryCode)


  }

  buildProfileForm() {
    this.profileForm = this.formBuilder.group({
      acc_id: [''],
      tp_id: [''],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      work_contact_number: [''],
      workIsd: ['+1', Validators.required],
      workCountry: ['us'],
      mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
      mobileIsd: ['+1', Validators.required],
      mobileCountry: ['us'],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
      address: ['', Validators.required],
      city: [''],
      state: [''],
      country: ['', Validators.required],
      zip: ['', [Validators.required]],
      agency_name: ['', Validators.required],
      payee: ['', Validators.required],
      iata: ['', Validators.required],
      fax: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
      faxIsd: ['+1', Validators.required],
      faxCountry: ['us'],
      office_number: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
      isd_office_number: ['+1', Validators.required],
      office_country_code: ['us'],
      latitude: [''],
      longitude: [''],
      card_type: ['personal', Validators.required],
      number: [''],
      cvc: [''],
      exp_month: [''],
      exp_year: [''],
      name: [''],
      timezone: ['']
    });
  }
  get f() {
    return this.profileForm.controls;
  }

  getProfileData() {
    this.travelAgentService.getProfileDetail()
      .pipe(
        catchError(err => {
          this.stateManagementService.setprogressBar(false);//hide progressbar
          return throwError(err);
        })
      ).subscribe(({ data }: any) => {
        this.stateManagementService.setprogressBar(false);//hide progressbar
        this.profile_pic = data?.profile_pic;
        this.profileForm.patchValue({
          acc_id: data?.acc_id,
          tp_id: data?.tp_id,
          firstName: data?.first_name,
          middleName: data?.middle_name,
          lastName: data?.last_name,
          work_contact_number: data?.work_contact_number,
          workIsd: data?.workIsd || '+1',
          workCountry: data?.workCountry || 'us',
          mobile: data?.mobile,
          mobileIsd: data?.mobileIsd || '+1',
          mobileCountry: data?.mobileCountry || 'us',
          email: data?.email,
          address: data?.address,
          city: data?.city,
          state: data?.state,
          country: data?.country,
          zip: data?.zip,
          agency_name: data?.agency_name,
          payee: data?.payee,
          iata: data?.iata,
          fax: data?.fax,
          faxIsd: data?.faxIsd || '+1',
          faxCountry: data?.faxCountry || 'us',
          office_number: data?.office_number,
          isd_office_number: data?.isd_office_number || '+1',
          office_country_code: data?.office_country_code || 'us',
          latitude: data?.latitude,
          longitude: data?.longitude,
        })
        console.log('profile data-->>>>', data)
        this.MobileObject.setCountry(data?.mobileCountry)
        this.OfficeObject.setCountry(data?.workCountry);
        this.FaxObject.setCountry(data?.faxCountry);
        this.OfficePhoneObject.setCountry(data?.office_country_code);
      });
  }
  onCountryChange(event, type) {
    if (type == 'mobile') {
      console.log("11111", event)
      this.profileForm.patchValue({
        mobileIsd: '+' + event.dialCode,
        mobileCountry: event.iso2
      });
      this.profileForm.get('mobile').updateValueAndValidity();
      this.validateMobile();
    }
    else if (type == 'work_contact_number') {
      console.log("222222")
      this.profileForm.patchValue({
        workIsd: '+' + event.dialCode,
        workCountry: event.iso2
      });
      this.profileForm.get('work_contact_number').updateValueAndValidity();
      this.validateWork();
    }
    else if (type == 'office_number') {
      console.log("333333")
      this.profileForm.patchValue({
        isd_office_number: '+' + event.dialCode,
        office_country_code: event.iso2
      });
      this.profileForm.get('office_number').updateValueAndValidity();
      this.validateOfficeNumber();
    }
    else {
      console.log("4444444")
      this.profileForm.patchValue({
        faxIsd: '+' + event.dialCode,
        faxCountry: event.iso2
      });
    }
    // console.log(this.countryCode);
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
        const errorMsg = ["Invalid number", "Invalid country code", "Phone number seems to be too short", "Phone number seems to be too long", "Invalid number"][errorCode] || "Invalid number";
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
    this.validatePhoneGeneric(this.profileForm.get('mobile'), this.MobileObject);
  }

  validateWork() {
    this.validatePhoneGeneric(this.profileForm.get('work_contact_number'), this.OfficeObject);
  }

  validateFax() {
    this.validatePhoneGeneric(this.profileForm.get('fax'), this.FaxObject);
  }

  validateOfficeNumber() {
    this.validatePhoneGeneric(this.profileForm.get('office_number'), this.OfficePhoneObject);
  }
  telInputObjectOffice(obj) {
    this.OfficeObject = obj;
  }
  telInputObjectMobile(obj) {
    console.log('telInputMobile', obj)
    this.MobileObject = obj;
  }
  telInputObjectFax(obj) {
    this.FaxObject = obj;
  }
  telInputObjectOfficePhone(obj) {
    this.OfficePhoneObject = obj;
  }
  closeButton() {
    this.closeTab.emit();
  }
  showImageInModal(imageUrl) {
    this.modalImage = imageUrl;
    // console.log("11111",imageUrl)
    $("#imageModal").addClass("showImage");
    $("#imageModal").removeClass("d-none");
    // $("#imageModal").show();
  }
  fillAddress(form_control: string, address: any) {
    console.log('Address: ', address)
    this.profileForm.patchValue({
      address: address.formatted_address
    })
  }

  profile_pic_change(event) {
    console.log('in function upload profile pic')
    this.stateManagementService.setprogressBar(true);//show progressbar
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imageSrc = reader.result as string;
        this.travelAgentService.uploadProfilePicture(this.imageSrc)
          .pipe(
            catchError(err => {
              this.stateManagementService.setprogressBar(false);//hide progressbar
              return throwError(err);
            })
          )
          .subscribe(({ data, message }: any) => {
            this.profile_pic = data.image;
            let userInfo = JSON.parse(localStorage.getItem('userData'))
            if (userInfo) {
              userInfo['profile_picture'] = data?.image
              localStorage.setItem('userData', JSON.stringify(userInfo))
            }
            this.stateManagementService.setprogressBar(false);//hide progressbar
            // this.snackbarMsg = message;
            // this.openSnackbar();
            // window.location.reload()
          });
      };
    }
  }
  submit() {
    console.log(this.profileForm);
    // console.log(JSON.stringify(this.addVehicleRatesForm.value));
    this.submittedForm = true;
    // stop here if form is invalid
    if (this.profileForm.invalid) {
      return;
    }


    if (this.profileForm.get('address').value != '' && this.profileForm.get('latitude').value == '') {
      this.errorDialog.openDialog({
        errors: {
          error: `<spanclass="text-danger font-weight-bolder text-xl">Please choose the correct address from the dropdown.</span>`
        }
      })
      return;
    }

    console.log(this.profileForm.value);
    // console.log(JSON.stringify(this.addVehicleRatesForm.value));
    this.spinner.show();

    this.travelAgentService.updateProfile(this.profileForm.value, this.currentUser?.is_profile_complete)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
      )
      .subscribe(result => {
        this.response = result;
        this.spinner.hide();//hide spinner
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        if (this.response?.data?.is_profile_complete) {
          currentUser['is_profile_complete'] = true
          currentUser['name'] = this.response?.data?.first_name + ' ' + this.response?.data?.last_name
          currentUser['account_id'] = this.response?.data?.acc_id
          localStorage.setItem('currentUser', JSON.stringify(currentUser))
          if (this.lastSegment == 'step1') {
            this.router.navigateByUrl('/travel_agent/profile/step2').then(() => {
              window.location.reload();
            });

          }
          else {
            window.location.reload()
          }
        }

      });
  }


}
