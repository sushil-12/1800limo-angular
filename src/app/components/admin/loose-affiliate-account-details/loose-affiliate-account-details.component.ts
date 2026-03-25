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
import * as intlTelInput from 'intl-tel-input';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { attachPlaceAutocompleteElement, syncPlaceAutocompleteDisplay } from '../../../utils/google-place-autocomplete';
declare var $: any;


@Component({
  selector: 'app-loose-affiliate-account-details',
  templateUrl: './loose-affiliate-account-details.component.html',
  styleUrls: ['./loose-affiliate-account-details.component.scss']
})
export class LooseAffiliateAccountDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('search1') search1!: ElementRef;
  @ViewChild('phoneInput') phoneInput!: ElementRef;
  @ViewChild('workInput') workInput!: ElementRef;

  public profileForm: FormGroup;
  public submittedForm: boolean;
  public MobileObject: any;
  public OfficeObject: any;
  currentUser: any;
  userId: any;
  getProfileResponseData: any;
  languageList: { id: number, name: string }[] = [];
  selectedLanguages: number[] = [];
  resp: any;
  filteredOptions: any;
  badgeOptions: any;

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
    private adminService: AdminService,
    private errors: ErrorDialogService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      this.userId = params?.looseAffId
    })

    this.buildProfileForm()

    this.adminService.getAssicationsLanguages()
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
      ).subscribe(data => {
        this.spinner.hide();//hide spinner
        this.resp = data
        this.languageList = this.resp?.data?.languages;
        this.syncSelectedLanguages();

      })


    if (this.userId) {
      this.getProfile()
    }
    else {
      this.adminService.getAllEnableBadgeCities()
        .pipe(
          catchError(err => {
            this.spinner.hide();//hide spinner
            return throwError(err);
          })
        ).subscribe((res: any) => {
          this.badgeOptions = res?.data
          this.filteredOptions = res?.data

        })
    }



  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.nameInput) {
        this.nameInput.nativeElement.focus();
      }
    }, 500);

    this.selectedLanguages = [1]
    this.syncSelectedLanguages();

    if (this.search1?.nativeElement) {
      void attachPlaceAutocompleteElement(
        this.search1.nativeElement,
        {
          types: ['geocode', 'establishment'],
          fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components', 'types'],
          syncControl: this.profileForm.get('address')!,
        },
        (place) => this.onGmpLooseAffiliateAddressSelected(place)
      );
    }

    this.initallphonefields()
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

  validatePhone(controlName: string, telInputObject: any) {
    const control = this.profileForm.get(controlName);
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

  initallphonefields() {

    if (this.phoneInput) {
      console.log('onput', this.phoneInput, this.phoneInput.nativeElement)
      this.MobileObject = intlTelInput(this.phoneInput.nativeElement, {
        initialCountry: 'us',
        preferredCountries: ['us', 'ca', 'mx', 'gb'],
        separateDialCode: true,
        nationalMode: true,
        // autoPlaceholder: 'aggressive',
        utilsScript:
          'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js'
      });

      this.addCustomCountrySearch(this.phoneInput.nativeElement);

      this.phoneInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.MobileObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'phone')
        this.validatePhone('phone', this.MobileObject);
      });
    }

    if (this.workInput) {
      console.log('onput', this.workInput, this.workInput.nativeElement)
      this.OfficeObject = intlTelInput(this.workInput.nativeElement, {
        initialCountry: 'us',
        preferredCountries: ['us', 'ca', 'mx', 'gb'],
        separateDialCode: true,
        nationalMode: true,
        // autoPlaceholder: 'aggressive',
        utilsScript:
          'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js'
      });

      this.addCustomCountrySearch(this.workInput.nativeElement);

      this.workInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.OfficeObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'work');
        this.validatePhone('work', this.OfficeObject);
      });
    }



  }

  buildProfileForm() {
    this.profileForm = this.formBuilder.group({
      name: [''],
      operator_name: [''],
      phone: ['', [Validators.required]],
      phone_isd: ['+1', Validators.required],
      phone_country: ['us'],
      email: ['', [Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
      address: [''],
      work: [''],
      work_isd: ['+1'],
      work_country: ['us'],
      city: [''],
      state: [''],
      country: [''],
      zipCode: [''],
      latitude: [''],
      longitude: [''],
      language: [''],
      badge_city: [''],
      badge_city_name: [''],


    });
  }

  get f() {
    return this.profileForm.controls;
  }

  private syncSelectedLanguages() {
    if (!this.languageList?.length) {
      return;
    }

    const selectedValues = Array.isArray(this.selectedLanguages) ? this.selectedLanguages : [this.selectedLanguages];
    const normalizedIds = selectedValues
      .map((item: any) => item && typeof item === 'object' ? Number(item.id) : Number(item))
      .filter((id: number) => !Number.isNaN(id) && this.languageList.some((language) => Number(language.id) === id));

    this.profileForm.patchValue({ language: normalizedIds }, { emitEvent: false });
  }

  getProfile() {
    this.spinner.show();
    this.adminService.getLooseAffAccDetails(this.userId)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
      ).subscribe(data => {
        this.spinner.hide();//hide spinner
        this.getProfileResponseData = data
        console.log("badge city", this.badgeOptions)
        this.adminService.getAllEnableBadgeCities()
          .pipe(
            catchError(err => {
              this.spinner.hide();//hide spinner
              return throwError(err);
            })
          ).subscribe((res: any) => {
            this.badgeOptions = res?.data
            this.filteredOptions = res?.data
            res?.data?.map((i: any) => {
              if (i.id == this.getProfileResponseData.data?.badge_city) {
                this.profileForm.patchValue({
                  badge_city: i.id,
                  badge_city_name: i.name
                })
              }
            })
          })


        this.profileForm.patchValue({
          name: this.getProfileResponseData?.data?.name,
          operator_name: this.getProfileResponseData?.data?.operator_name,
          phone: this.getProfileResponseData?.data?.phone,
          phone_isd: this.getProfileResponseData?.data?.phone_isd,
          phone_country: this.getProfileResponseData?.data?.phone_country,
          work: this.getProfileResponseData?.data?.work_phone == 0 ? '' : this.getProfileResponseData?.data?.work_phone,
          work_isd: this.getProfileResponseData?.data?.work_isd,
          work_country: this.getProfileResponseData?.data?.work_country,
          email: this.getProfileResponseData?.data?.email,
          address: this.getProfileResponseData?.data?.city,
          city: this.getProfileResponseData?.data?.city,
          state: this.getProfileResponseData?.data?.state,
          country: this.getProfileResponseData?.data?.country,
          // language: this.getProfileResponseData?.data?.language,
          latitude: this.getProfileResponseData?.data?.latitude,
          longitude: this.getProfileResponseData?.data?.longitude,
        })
        this.selectedLanguages = this.getProfileResponseData?.data?.language_spoken || [];
        this.syncSelectedLanguages();
        console.log('profile this.getProfileResponseData?.data-->>>>', this.profileForm.value)
        this.MobileObject.setCountry(this.getProfileResponseData?.data?.phone_country)
        this.OfficeObject.setCountry(this.getProfileResponseData?.data?.work_country)
      })
  }

  onCountryChange(event, type) {
    console.log("11111", event)
    if (type == 'phone') {
      this.profileForm.patchValue({
        phone_isd: '+' + event.dialCode,
        phone_country: event.iso2
      });
    }
    else {
      this.profileForm.patchValue({
        work_isd: '+' + event.dialCode,
        work_country: event.iso2
      });
    }


  }

  telInputObjectMobile(obj) {
    console.log('telInputMobile', obj)
    this.MobileObject = obj;
  }

  telInputObjectOffice(obj) {
    this.OfficeObject = obj;
  }

  handleBadgeCity(value: any) {
    console.log(value, this.filteredOptions)
    this.filteredOptions = this.badgeOptions.filter((i: any) => i.name.toLowerCase().startsWith(value.toLowerCase()))
  }

  selectBadgeCity(option: any, isUserInput) {
    console.log('in function selectBadgeCity-->>>', isUserInput)
    if (isUserInput) {
      this.profileForm.patchValue({
        badge_city: option.id
      })
      // this.addAffiliateAccountForm.updateValueAndValidity()
    }

  }

  onGmpLooseAffiliateAddressSelected(place: google.maps.places.PlaceResult): void {
    this.ngZone.run(() => {
      if (!place?.geometry?.location) {
        return;
      }

      let country = '';
      let state = '';
      let city = '';
      let zipCode = '';

      place.address_components?.forEach((component) => {
        const types = component.types || [];

        if (types.includes('country')) {
          country = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        } else if (
          types.includes('locality') ||
          types.includes('postal_town') ||
          types.includes('administrative_area_level_3')
        ) {
          city = component.long_name;
        } else if (types.includes('postal_code')) {
          zipCode = component.long_name;
        }
      });

      const formattedAddress = place.formatted_address ?? '';
      const placeName = place.name ?? '';
      const displayAddress = placeName ? `${placeName} - ${formattedAddress}` : formattedAddress;

      this.profileForm.patchValue({
        address: displayAddress,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        country,
        state,
        city,
        zipCode
      });
    });
  }

  clearAddressField(): void {
    this.profileForm.patchValue({
      address: '',
      latitude: '',
      longitude: '',
      country: '',
      state: '',
      city: '',
      zipCode: ''
    });
    this.profileForm.updateValueAndValidity();

    const nativeInput = this.search1?.nativeElement as HTMLInputElement | undefined;
    if (nativeInput) {
      nativeInput.value = '';
      syncPlaceAutocompleteDisplay(nativeInput);
    }
  }

  submitForm() {
    console.log(this.profileForm);
    this.submittedForm = true;

    // Sync Phone Country Data
    if (this.MobileObject) {
      const countryData = this.MobileObject.getSelectedCountryData();
      if (countryData && countryData.dialCode) {
        this.profileForm.patchValue({
          phone_isd: '+' + countryData.dialCode,
          phone_country: countryData.iso2
        });
      }
    }

    // Sync Work Country Data
    if (this.OfficeObject) {
      const countryData = this.OfficeObject.getSelectedCountryData();
      if (countryData && countryData.dialCode) {
        this.profileForm.patchValue({
          work_isd: '+' + countryData.dialCode,
          work_country: countryData.iso2
        });
      }
    }

    // stop here if form is invalid
    if (this.profileForm.invalid) {
      console.log("Trace: Form Invalid");
      console.log("Form is invalid:");
      Object.keys(this.profileForm.controls).forEach(key => {
        const controlErrors = this.profileForm.get(key).errors;
        if (controlErrors != null) {
          console.log(`Key control: ${key}, Errors:`, controlErrors);
        }
      });
      return;
    }

    console.log("Trace: Form Valid, preparing payload");

    // Create a payload object, don't modify form value directly
    const payload = { ...this.profileForm.value };

    // Sanitize work (remove spaces, dashes, brackets etc)
    if (payload.work) {
      // Remove all non-numeric characters except +
      let cleanWork = payload.work.toString().replace(/[^0-9+]/g, '');

      // Handle ISD prefix removal
      if (payload.work_isd && cleanWork.startsWith(payload.work_isd)) {
        cleanWork = cleanWork.substring(payload.work_isd.length);
      }
      payload.work = cleanWork;
    }

    // Sanitize phone (remove spaces, dashes, brackets etc)
    if (payload.phone) {
      // Remove all non-numeric characters except +
      let cleanPhone = payload.phone.toString().replace(/[^0-9+]/g, '');

      // Handle ISD prefix removal
      if (payload.phone_isd && cleanPhone.startsWith(payload.phone_isd)) {
        cleanPhone = cleanPhone.substring(payload.phone_isd.length);
      }
      payload.phone = cleanPhone;
    }

    if (this.profileForm.get('badge_city_name').value == '') {
      this.profileForm.patchValue({
        badge_city: ''
      });
      payload.badge_city = '';
    }


    if (this.profileForm.get('address').value != '' && this.profileForm.get('latitude').value == '') {
      console.log("Trace: Address Check Failed");
      this.errors.openDialog({
        errors: {
          error: `<spanclass="text-danger font-weight-bolder text-xl">Please choose the correct address from the dropdown.</span>`
        }
      })
      return;
    }

    console.log("Trace: Submitting payload", payload);
    this.spinner.show();

    this.adminService.createLooseAffAcc(payload, this.userId)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
      )
      .subscribe(result => {
        this.response = result;
        this.spinner.hide();//hide spinner
        if (this.userId) {
          this.router.navigate(['/admin/loose-affiliate-accounts'])
        }
        else {
          this.router.navigate(['/admin/add-loose-affiliate-account']).then(() => {
            window.location.reload();
          });
        }
        console.log("profile created", this.response)
      });


  }


  resetForm() {
    const keepValues = [
      this.profileForm.controls.phone.value,
      this.profileForm.controls.id.value,
      this.profileForm.controls.phone_isd.value,
      this.profileForm.controls.phone_country.value,

    ];

    this.buildProfileForm();
    this.profileForm.controls.phone.patchValue(keepValues[0]);
    this.profileForm.controls.id.patchValue(keepValues[1]);
    this.profileForm.controls.phone_isd.patchValue(keepValues[2]);
    this.profileForm.controls.phone_country.patchValue(keepValues[3]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      if (this.nameInput) {
        this.nameInput.nativeElement.focus();
      }
    }, 500);
  }

  backButton() {
    this.router.navigate(['/admin/loose-affiliate-accounts']);
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
