
import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { CustomvalidationService } from '../../../services/customvalidation.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { TravelAgentService } from '../../../services/travel-agent.service';
import { CommonService } from '../../../services/common.service';
import * as intlTelInput from 'intl-tel-input';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { attachPlaceAutocompleteElement } from '../../../utils/google-place-autocomplete';
declare var $: any;


@Component({
  selector: 'app-sub-agent-account-details',
  templateUrl: './sub-agent-account-details.component.html',
  styleUrls: ['./sub-agent-account-details.component.scss']
})
export class SubAgentAccountDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('search1') search1!: ElementRef;
  geoCoder!: google.maps.Geocoder;
  @ViewChild('mobileInput') mobileInput!: ElementRef;
  @ViewChild('workInput') workInput!: ElementRef;

  public profileForm: FormGroup;
  public submittedForm: boolean;
  public OfficeObject: any;
  public MobileObject: any;
  currentUser: any;
  agency_name: any;
  invite_code: any;
  userId: any;
  getProfileResponseData: any;
  timezoneForm: FormGroup;

  //google map autocomplete
  title: string = 'AGM project';
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  response: any;
  defaultCountryCode: string;
  lastSegment: string;

  constructor(
    private stateManagementService: StateManagementService,
    private formBuilder: FormBuilder,
    private customValidator: CustomvalidationService,
    private ngZone: NgZone,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private travelAgentService: TravelAgentService,
    private adminService: AdminService,
    private errors: ErrorDialogService,
    private commonServices: CommonService
  ) { }

  ngOnInit(): void {

    localStorage.removeItem('review_referral_url')
    this.route.queryParams.subscribe((params: any) => {
      this.userId = params?.id
    })

    this.buildProfileForm()
    this.timezoneForm = this.formBuilder.group({
      timezone: [''],
    });
    this.getProfile()


  }

  ngAfterViewInit() {

    this.initallphonefields()

    //google map autocomplete
    this.geoCoder = new google.maps.Geocoder();

    void attachPlaceAutocompleteElement(
      this.search1.nativeElement,
      {
        types: ['geocode', 'establishment'],
        fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components', 'types'],
      },
      (place) => {
        this.ngZone.run(() => {
          if (!place.geometry || !place.geometry.location) return;

          this.profileForm.patchValue({
            address: place.formatted_address,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          });

          place.address_components?.forEach((component) => {
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
          });
        });
      }
    );

  }

  initallphonefields() {

    if (this.mobileInput) {
      console.log('onput', this.mobileInput, this.mobileInput.nativeElement)
      const telOptions: any = this.commonServices.getTelInputOptions();
      this.MobileObject = intlTelInput(this.mobileInput.nativeElement, telOptions);

      this.addCustomCountrySearch(this.mobileInput.nativeElement);

      this.mobileInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.MobileObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'mobile')
      });
    }

    if (this.workInput) {
      console.log('onput', this.workInput, this.workInput.nativeElement)
      const telOptions: any = this.commonServices.getTelInputOptions();
      this.OfficeObject = intlTelInput(this.workInput.nativeElement, telOptions);

      this.addCustomCountrySearch(this.workInput.nativeElement);

      this.workInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.OfficeObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'work_contact_number');
      });
    }



  }

  buildProfileForm() {
    this.profileForm = this.formBuilder.group({
      acc_id: [''],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      work_contact_number: [''],
      workIsd: ['+1', Validators.required],
      workCountry: ['us'],
      mobile: ['', [Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(9), Validators.maxLength(15)]],
      mobileIsd: ['+1', Validators.required],
      mobileCountry: ['us'],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
      address: ['', Validators.required],
      city: [''],
      state: [''],
      country: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern("^[0-9+]*$")]],
      latitude: [''],
      longitude: [''],
      agency_name: ['', Validators.required],
      invite_code: [this.invite_code]

    });
  }

  get f() {
    return this.profileForm.controls;
  }

  getProfile() {
    this.spinner.show();
    this.travelAgentService.getSubAgentAccountDetails(this.userId)
      .then(({ data }: any) => {
        this.spinner.hide();//hide spinner
        this.getProfileResponseData = data
        this.timezoneForm.patchValue({
          timezone: data?.timezone
        })
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
          address: data?.Address,
          city: data?.city,
          state: data?.state,
          country: data?.country,
          zip: data?.zipCode,
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
      }).catch((err) => {
        this.spinner.hide();//hide spinner
        console.log(err)
      })
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
    // else if (type == 'office_number') {
    //   console.log("333333")
    //   this.profileForm.patchValue({
    //     isd_office_number: '+' + event.dialCode,
    //     office_country_code: event.iso2
    //   });
    // }
    // else {
    //   console.log("4444444")
    //   this.profileForm.patchValue({
    //     faxIsd: '+' + event.dialCode,
    //     faxCountry: event.iso2
    //   });
    // }
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

  telInputObjectOffice(obj) {
    this.OfficeObject = obj;
  }
  telInputObjectMobile(obj) {
    console.log('telInputMobile', obj)
    this.MobileObject = obj;
  }




  submitForm() {
    console.log(this.profileForm);
    this.submittedForm = true;
    // stop here if form is invalid
    if (this.profileForm.invalid) {
      return;
    }

    // Sanitize mobile (remove Country Code if present)
    if (this.profileForm.value.mobile && this.profileForm.value.mobileIsd && this.profileForm.value.mobile.startsWith(this.profileForm.value.mobileIsd)) {
      this.profileForm.value.mobile = this.profileForm.value.mobile.substring(this.profileForm.value.mobileIsd.length);
    }


    if (this.profileForm.get('address').value != '' && this.profileForm.get('latitude').value == '') {
      this.errors.openDialog({
        errors: {
          error: `<spanclass="text-danger font-weight-bolder text-xl">Please choose the correct address from the dropdown.</span>`
        }
      })
      return;
    }

    console.log(this.profileForm.value);
    this.spinner.show();

    this.travelAgentService.updateSubAgentAccount(this.profileForm.value)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
      )
      .subscribe(result => {
        this.response = result;
        console.log("profile updated", this.response)
        this.spinner.hide();//hide spinner
        this.router.navigate(['/travel_agent/sub-agent-accounts']);
      })


  }


  acceptRejectAffiliate(status) {
    this.spinner.show();
    // this.disableSubmitButton=true; //disable submit button
    console.log('acc_id', this.getProfileResponseData?.acc_id, status, 'status')

    this.travelAgentService.acceptRejectAffiliate(this.getProfileResponseData?.acc_id, status)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
      )
      .subscribe(({ data, success, message }: any) => {
        if (success == true) {
          this.spinner.hide();//hide spinner
          this.router.navigate(['/travel_agent/sub-agent-accounts'])
          // this.loadClientAccounts()
        }
      });
  }


  resetForm() {
    const keepValues = [
      this.profileForm.controls.mobile.value,
      this.profileForm.controls.id.value,
      this.profileForm.controls.mobileIsd.value,
      this.profileForm.controls.mobileCountry.value,
      this.profileForm.controls.agency_name.value

    ];

    this.buildProfileForm();
    this.profileForm.controls.mobile.patchValue(keepValues[0]);
    this.profileForm.controls.id.patchValue(keepValues[1]);
    this.profileForm.controls.mobileIsd.patchValue(keepValues[2]);
    this.profileForm.controls.mobileCountry.patchValue(keepValues[3]);
    this.profileForm.controls.agency_name.patchValue(keepValues[4])

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backButton() {
    this.router.navigate(['/travel_agent/sub-agent-accounts']);
  }

  onTimezoneChange(event: any): void {
    const selectedValue = event.value;
    console.log('Selected Timezone:', selectedValue);
    this.adminService
      .changeTimezone(selectedValue)
      .pipe()
      .subscribe((response: any) => {
        console.log(response, 'timezone changed success');
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
