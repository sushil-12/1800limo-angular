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
import { CommonService } from 'src/app/services/common.service';
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
    private commonServices: CommonService,
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
      // this.profileForm.get('cvc')?.setValidators([Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(3), Validators.maxLength(4), this.customValidator.dashValidator(), this.customValidator.plusValidator()]);

      // this.profileForm.get('name')?.updateValueAndValidity();
      // this.profileForm.get('number')?.updateValueAndValidity();
      // this.profileForm.get('exp_year')?.updateValueAndValidity();
      // this.profileForm.get('exp_month')?.updateValueAndValidity();
      // this.profileForm.get('cvc')?.updateValueAndValidity();
      this.profileForm.patchValue({
        mobile: this.currentUser?.phone,
        mobileIsd: this.currentUser?.isd,
        mobileCountry: this.currentUser?.phoneCountry,
        workIsd: this.currentUser?.isd,
        workCountry: this.currentUser?.phoneCountry,
        faxIsd: this.currentUser?.isd,
        faxCountry: this.currentUser?.phoneCountry,
        isd_office_number: this.currentUser?.isd,
        office_country_code: this.currentUser?.phoneCountry
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
    let countryCode = 'auto';
    if (this.defaultCountryCode) {
      countryCode = this.defaultCountryCode;
    } else if (this.currentUser && (this.currentUser.phoneCountry || this.currentUser.country)) {
      countryCode = this.currentUser.phoneCountry || this.currentUser.country;
    }

    const telOptions: any = this.commonServices.getTelInputOptions(countryCode);

    if (this.cellInput) {
      console.log('onput', this.cellInput, this.cellInput.nativeElement)
      this.OfficeObject = intlTelInput(this.cellInput.nativeElement, telOptions);

      // Check if form has value, set it
      const existingCountry = this.profileForm.get('workCountry')?.value;
      if (existingCountry) {
        this.OfficeObject.setCountry(existingCountry);
      }

      this.addCustomCountrySearch(this.cellInput.nativeElement);
      this.cellInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.OfficeObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'work_contact_number')
      });
    }

    if (this.mobileInput) {
      console.log('onput', this.mobileInput, this.mobileInput.nativeElement)
      this.MobileObject = intlTelInput(this.mobileInput.nativeElement, telOptions);

      const existingCountry = this.profileForm.get('mobileCountry')?.value;
      if (existingCountry) {
        this.MobileObject.setCountry(existingCountry);
      }

      this.addCustomCountrySearch(this.mobileInput.nativeElement);
      this.mobileInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.MobileObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'mobile');
      });
    }

    if (this.faxInput) {
      console.log('onput', this.faxInput, this.faxInput.nativeElement)
      this.FaxObject = intlTelInput(this.faxInput.nativeElement, telOptions);

      // Check if form has value for faxCountry
      const existingCountry = this.profileForm.get('faxCountry')?.value;
      const existingIsd = this.profileForm.get('faxIsd')?.value;

      if (existingCountry) {
        this.FaxObject.setCountry(existingCountry);
      } else if (!existingIsd) {
        // Only if NO country AND NO ISD, sync default
        const countryData = this.FaxObject.getSelectedCountryData();
        if (countryData?.dialCode) {
          this.profileForm.patchValue({ faxIsd: '+' + countryData.dialCode });
        }
      }

      this.addCustomCountrySearch(this.faxInput.nativeElement);
      this.faxInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.FaxObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'fax')
      });
    }

    if (this.officeNumberInput) {
      console.log('onput', this.officeNumberInput, this.officeNumberInput.nativeElement)
      this.OfficePhoneObject = intlTelInput(this.officeNumberInput.nativeElement, telOptions);

      // Check if form has value for office_country_code
      const existingCountry = this.profileForm.get('office_country_code')?.value;
      const existingIsd = this.profileForm.get('isd_office_number')?.value;

      if (existingCountry) {
        this.OfficePhoneObject.setCountry(existingCountry);
      } else if (!existingIsd) {
        // Only if NO country AND NO ISD, sync default
        const countryData = this.OfficePhoneObject.getSelectedCountryData();
        if (countryData?.dialCode) {
          this.profileForm.patchValue({ isd_office_number: '+' + countryData.dialCode });
        }
      }

      this.addCustomCountrySearch(this.officeNumberInput.nativeElement);
      this.officeNumberInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.OfficePhoneObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'office_number')
      });
    }
  }

  buildProfileForm() {
    this.profileForm = this.formBuilder.group({
      acc_id: [''],
      tp_id: [''],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      work_contact_number: [''],
      workIsd: [this.currentUser?.isd || '+1', Validators.required],
      workCountry: [this.currentUser?.phoneCountry || 'us'],
      mobile: ['', [Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(4), Validators.maxLength(15)]],
      mobileIsd: [this.currentUser?.isd || '+1', Validators.required],
      mobileCountry: [this.currentUser?.phoneCountry || 'us'],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
      address: ['', Validators.required],
      city: [''],
      state: [''],
      country: ['', Validators.required],
      zip: ['', [Validators.required]],
      agency_name: ['', Validators.required],
      payee: ['', Validators.required],
      iata: ['', Validators.required],
      fax: ['', [Validators.pattern("^[0-9+]*$"), Validators.minLength(4), Validators.maxLength(15)]],
      faxIsd: [this.currentUser?.isd || '+1', Validators.required],
      faxCountry: [this.currentUser?.phoneCountry || 'us'],
      office_number: ['', [Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(4), Validators.maxLength(15)]],
      isd_office_number: [this.currentUser?.isd || '+1', Validators.required],
      office_country_code: [this.currentUser?.phoneCountry || 'us'],
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
          workIsd: data?.workIsd || this.currentUser?.isd || '+1',
          workCountry: data?.workCountry || this.currentUser?.phoneCountry || 'us',
          mobile: data?.mobile,
          mobileIsd: data?.mobileIsd || this.currentUser?.isd || '+1',
          mobileCountry: data?.mobileCountry || this.currentUser?.phoneCountry || 'us',
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
          faxIsd: data?.faxIsd || this.currentUser?.isd || '+1',
          faxCountry: data?.faxCountry || this.currentUser?.phoneCountry || 'us',
          office_number: data?.office_number,
          isd_office_number: data?.isd_office_number || this.currentUser?.isd || '+1',
          office_country_code: data?.office_country_code || this.currentUser?.phoneCountry || 'us',
          latitude: data?.latitude,
          longitude: data?.longitude,
        })
        console.log('profile data-->>>>', data)
        if (this.MobileObject) {
          if (data?.mobileCountry) {
            this.MobileObject.setCountry(data.mobileCountry)
          } else if (data?.mobileIsd && data?.mobile) {
            this.MobileObject.setNumber(data.mobileIsd + data.mobile);
            // setNumber might update the input val to full Int format, reset to just number
            this.profileForm.patchValue({ mobile: data.mobile });
          }
        }
        if (this.OfficeObject) {
          if (data?.workCountry) {
            this.OfficeObject.setCountry(data.workCountry);
          } else if (data?.workIsd && data?.work_contact_number) {
            this.OfficeObject.setNumber(data.workIsd + data.work_contact_number);
            this.profileForm.patchValue({ work_contact_number: data.work_contact_number });
          }
        }
        if (this.FaxObject) {
          if (data?.faxCountry) {
            this.FaxObject.setCountry(data.faxCountry);
          } else if (data?.faxIsd && data?.fax) {
            // Deduce flag from ISD+Number
            this.FaxObject.setNumber(data.faxIsd + data.fax);
            // Reset input to just number (National format typically desired in form control)
            this.profileForm.patchValue({ fax: data.fax });
          }
        }
        if (this.OfficePhoneObject) {
          if (data?.office_country_code) {
            this.OfficePhoneObject.setCountry(data.office_country_code);
          } else if (data?.isd_office_number && data?.office_number) {
            this.OfficePhoneObject.setNumber(data.isd_office_number + data.office_number);
            this.profileForm.patchValue({ office_number: data.office_number });
          }
        }
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

    // Sanitize fax (remove Country Code if present)
    // Force sync from visual widgets to ensure payload matches UI
    if (this.FaxObject) {
      const countryData = this.FaxObject.getSelectedCountryData();
      if (countryData.dialCode) {
        this.profileForm.value.faxIsd = '+' + countryData.dialCode;
        this.profileForm.value.faxCountry = countryData.iso2;
      }
    }
    if (this.OfficeObject) { // work_contact_number
      const countryData = this.OfficeObject.getSelectedCountryData();
      if (countryData.dialCode) {
        this.profileForm.value.workIsd = '+' + countryData.dialCode;
        this.profileForm.value.workCountry = countryData.iso2;
      }
    }
    if (this.OfficePhoneObject) { // office_number
      const countryData = this.OfficePhoneObject.getSelectedCountryData();
      if (countryData.dialCode) {
        this.profileForm.value.isd_office_number = '+' + countryData.dialCode;
        this.profileForm.value.office_country_code = countryData.iso2;
      }
    }
    if (this.MobileObject) { // mobile
      const countryData = this.MobileObject.getSelectedCountryData();
      if (countryData.dialCode) {
        this.profileForm.value.mobileIsd = '+' + countryData.dialCode;
        this.profileForm.value.mobileCountry = countryData.iso2;
      }
    }

    if (this.profileForm.value.fax && this.profileForm.value.faxIsd && this.profileForm.value.fax.startsWith(this.profileForm.value.faxIsd)) {
      this.profileForm.value.fax = this.profileForm.value.fax.substring(this.profileForm.value.faxIsd.length);
    }

    // Sanitize mobile (remove Country Code if present)
    if (this.profileForm.value.mobile && this.profileForm.value.mobileIsd && this.profileForm.value.mobile.startsWith(this.profileForm.value.mobileIsd)) {
      this.profileForm.value.mobile = this.profileForm.value.mobile.substring(this.profileForm.value.mobileIsd.length);
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
