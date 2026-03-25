import { Component, ElementRef, NgZone, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as intlTelInput from 'intl-tel-input';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { AffiliateService } from 'src/app/services/affiliate.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { CommonService } from 'src/app/services/common.service';
import { attachPlaceAutocompleteElement } from '../../../utils/google-place-autocomplete';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewInit {
  @ViewChild('search1') search1!: ElementRef;
  geoCoder!: google.maps.Geocoder;
  @ViewChild('mobileInput') mobileInput!: ElementRef;
  @ViewChild('workInput') workInput!: ElementRef;

  public profileForm: FormGroup;
  public submittedForm: boolean;
  public OfficeObject: any;
  public MobileObject: any;
  currentUser: any;
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
    private formBuilder: FormBuilder,
    private ngZone: NgZone,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private affiliateService: AffiliateService,
    private adminService: AdminService,
    private errors: ErrorDialogService,
    private commonServices: CommonService
  ) { }

  ngOnInit(): void {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
    console.log('current user', this.currentUser)

    this.route.queryParams.subscribe((params: any) => {
      this.userId = params?.id
    })

    if (this.userId) {
      this.getProfile()
    }


    this.buildProfileForm()
    // this.timezoneForm = this.formBuilder.group({
    //   timezone: [''],
    // });


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
        syncControl: this.profileForm.get('address')!,
      },
      (place) => {
        this.ngZone.run(() => {
          if (!place.geometry || !place.geometry.location) return;
          const formattedAddress = place.formatted_address ?? '';
          const placeName = place.name ?? '';
          const displayAddress = placeName ? `${placeName} - ${formattedAddress}` : formattedAddress;

          this.profileForm.patchValue({
            address: displayAddress,
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
    let countryCode = 'auto';
    if (this.currentUser && (this.currentUser.phoneCountry || this.currentUser.country)) {
      countryCode = this.currentUser.phoneCountry || this.currentUser.country;
    }

    const telOptions: any = this.commonServices.getTelInputOptions(countryCode);

    if (this.mobileInput) {
      console.log('onput', this.mobileInput, this.mobileInput.nativeElement)
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
      acc_id: [],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(9), Validators.maxLength(15)]],
      mobileIsd: ['+1', Validators.required],
      mobileCountry: ['us'],
      work_contact_number: ['', [Validators.pattern("^[0-9+]*$"), Validators.minLength(9), Validators.maxLength(15)]],
      workIsd: ['+1', Validators.required],
      workCountry: ['us'],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
      company_name: [this.currentUser?.affiliate_company, Validators.required],
      address: ['', Validators.required],
      city: [''],
      state: [''],
      country: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern("^[0-9+]*$")]],
      latitude: [''],
      longitude: [''],
    });
  }

  get f() {
    return this.profileForm.controls;
  }

  getProfile() {
    this.spinner.show();
    this.affiliateService.getSubAddDetailsById(this.currentUser?.account_id)
      .then(({ data }: any) => {
        this.spinner.hide();//hide spinner
        this.getProfileResponseData = data
        // this.timezoneForm.patchValue({
        //   timezone : data?.timezone
        // })
        this.profileForm.patchValue({
          acc_id: data?.acc_id,
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
          // company_name: data?.company_name,
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
      this.validateMobile();
    }
    else if (type == 'work_contact_number') {
      console.log("222222")
      this.profileForm.patchValue({
        workIsd: '+' + event.dialCode,
        workCountry: event.iso2
      });
      this.validateWork();
    }
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
    this.validatePhoneGeneric(this.f.mobile, this.MobileObject);
  }

  validateWork() {
    this.validatePhoneGeneric(this.f.work_contact_number, this.OfficeObject);
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
    // Sanitize mobile
    const mobile = this.profileForm.get('mobile');
    const mobileIsd = this.profileForm.get('mobileIsd');
    if (mobile && mobile.value && mobileIsd && mobileIsd.value) {
      const val = String(mobile.value);
      const isd = String(mobileIsd.value);
      if (val.startsWith(isd)) {
        mobile.setValue(val.substring(isd.length));
      }
    }

    this.submittedForm = true;
    // stop here if form is invalid
    if (this.profileForm.invalid) {
      return;
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

    this.affiliateService.addSubAffiliate(this.profileForm.value)
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
        this.router.navigate(['/sub_affiliate/my-bookings']);
      })


  }


  // resetForm()
  // {
  //   const keepValues = [
  //     this.profileForm.controls.mobile.value,
  //     this.profileForm.controls.id.value,
  //     this.profileForm.controls.mobileIsd.value,
  //     this.profileForm.controls.mobileCountry.value,
  //     this.profileForm.controls.agency_name.value

  //    ];

  //    this.buildProfileForm();
  //    this.profileForm.controls.mobile.patchValue(keepValues[0]);
  //    this.profileForm.controls.id.patchValue(keepValues[1]);
  //    this.profileForm.controls.mobileIsd.patchValue(keepValues[2]);
  //    this.profileForm.controls.mobileCountry.patchValue(keepValues[3]);
  //    this.profileForm.controls.agency_name.patchValue(keepValues[4])

  //     window.scrollTo({ top: 0, behavior: 'smooth' });
  // }

  backButton() {
    this.router.navigate(['/sub_affiliate/my-bookings']);
  }

  // onTimezoneChange(event: any): void {
  //   const selectedValue = event.value;
  //   console.log('Selected Timezone:', selectedValue);
  //   this.adminService
  // 		.changeTimezone(selectedValue)
  // 		.pipe()
  // 		.subscribe((response: any) => {
  // 			console.log(response,'timezone changed success');
  // 		});

  // }

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
