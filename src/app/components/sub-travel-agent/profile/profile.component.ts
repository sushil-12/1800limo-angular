import { Component, ElementRef, NgZone, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as intlTelInput from 'intl-tel-input';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { AuthService } from 'src/app/services/auth.service';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { TravelAgentService } from 'src/app/services/travel-agent.service';
declare var $: any;

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
  agency_name: any;
  invite_code: any;
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
    private errors: ErrorDialogService
  ) { }

  ngOnInit(): void {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
    console.log(this.currentUser)
    this.agency_name = localStorage.getItem('agency_name') ? localStorage.getItem('agency_name') : this.currentUser?.agency_name
    this.invite_code = localStorage.getItem('invite_code')
    this.buildProfileForm()
    this.timezoneForm = this.formBuilder.group({
      timezone: [''],
    });


    if (this.currentUser?.is_profile_complete) {
      this.getProfile()
    }
    else {
      this.profileForm.patchValue({
        mobile: this.currentUser?.phone,
        mobileIsd: this.currentUser?.isd,
        mobileCountry: this.currentUser?.phoneCountry,
        agency_name: this.agency_name
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
        types: ['geocode'], // Use geocode for addresses and landmarks // Optional: Restrict to US addresses
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
          console.log("types", types, component)
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

    if (this.mobileInput) {
      console.log('onput', this.mobileInput, this.mobileInput.nativeElement)
      this.MobileObject = intlTelInput(this.mobileInput.nativeElement, {
        initialCountry: 'us',
        preferredCountries: ['us', 'ca', 'mx', 'gb'],
        separateDialCode: true,
        nationalMode: false,
        // autoPlaceholder: 'aggressive',
        utilsScript:
          'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js'
      });

      this.mobileInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.MobileObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'mobile')
      });
    }

    if (this.workInput) {
      console.log('onput', this.workInput, this.workInput.nativeElement)
      this.OfficeObject = intlTelInput(this.workInput.nativeElement, {
        initialCountry: 'us',
        preferredCountries: ['us', 'ca', 'mx', 'gb'],
        separateDialCode: true,
        nationalMode: false,
        // autoPlaceholder: 'aggressive',
        utilsScript:
          'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js'
      });

      this.workInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.OfficeObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'work_contact_number');
      });
    }

    this.MobileObject.setCountry(this.defaultCountryCode)
    this.OfficeObject.setCountry(this.defaultCountryCode)


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
      mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
      mobileIsd: ['+1', Validators.required],
      mobileCountry: ['us'],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
      address: ['', Validators.required],
      city: [''],
      state: [''],
      country: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      latitude: [''],
      longitude: [''],
      agency_name: [''],
      invite_code: [this.invite_code]

    });
  }

  get f() {
    return this.profileForm.controls;
  }

  onCountryChange(event, type) {
    if (type == 'mobile') {
      console.log("11111", event)
      this.profileForm.patchValue({
        mobileIsd: '+' + event.dialCode,
        mobileCountry: event.iso2
      });
    }
    else if (type == 'work_contact_number') {
      console.log("222222")
      this.profileForm.patchValue({
        workIsd: '+' + event.dialCode,
        workCountry: event.iso2
      });
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

  telInputObjectOffice(obj) {
    this.OfficeObject = obj;
  }
  telInputObjectMobile(obj) {
    console.log('telInputMobile', obj)
    this.MobileObject = obj;
  }



  getProfile() {
    this.spinner.show();
    this.travelAgentService.getProfileSubAgent()
      .then(({ data }: any) => {
        this.spinner.hide();//hide spinner
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
      }).catch((err) => {
        this.spinner.hide();//hide spinner
        console.log(err)
      })
  }

  submitForm() {
    console.log(this.profileForm);
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

    this.travelAgentService.createNewSubAgent(this.profileForm.value, this.currentUser?.is_profile_complete)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
      )
      .subscribe(result => {
        this.response = result;
        this.spinner.hide();//hide spinner
        console.log("profile created", this.response)
        if (!this.currentUser?.is_profile_complete) {
          $("#redirectModal").modal("show");
          setTimeout(() => {
            console.log("in timeout")
            this.spinner.show('logoutspinner')
            $("#redirectModal").modal("hide");
            this.authService.logout()
              .pipe(
                catchError(err => {
                  this.spinner.hide('logoutspinner');//hide spinner
                  return throwError(err);
                })
              ).subscribe(({ success }: any) => {
                this.spinner.hide('logoutspinner');//hide spinner
                if (success == true) {
                  this.stateManagementService.removeUser();
                }
                this.router.navigate(['/']);
              });
          }, 10000)
        }



      });


  }

  redirectToHome() {
    console.log("in function redirect home")
    $("#redirectModal").modal("hide");
    this.spinner.show('logoutspinner')
    this.authService.logout()
      .pipe(
        catchError(err => {
          this.spinner.hide('logoutspinner');//hide spinner
          return throwError(err);
        })
      ).subscribe(({ success }: any) => {
        console.log("in function redirect home")
        this.spinner.hide('logoutspinner');//hide spinner
        if (success == true) {
          this.stateManagementService.removeUser();
        }
        this.router.navigate(['/']);
      })
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
  // backButton()
  // {
  // 	this.router.navigate(['/login/sub_travel_agent']);
  // }

}
