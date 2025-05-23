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
declare var $: any;


@Component({
  selector: 'app-loose-affiliate-account-details',
  templateUrl: './loose-affiliate-account-details.component.html',
  styleUrls: ['./loose-affiliate-account-details.component.scss']
})
export class LooseAffiliateAccountDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('search1') search1!: ElementRef;
  geoCoder!: google.maps.Geocoder;
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
    // Focus on the input field when the component has fully initialized
    if (this.nameInput) {
      this.nameInput.nativeElement.focus();
    }

    this.selectedLanguages = [1]
    this.profileForm.patchValue({ language: this.selectedLanguages });


    //google map autocomplete
    this.geoCoder = new google.maps.Geocoder();

    const autocomplete = new google.maps.places.Autocomplete(
      this.search1.nativeElement,
      {
        types: ['address'] // You can tweak this to 'address', etc.
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
        });
      });
    });

    this.initallphonefields()
  }

  initallphonefields(){

    if(this.phoneInput){
      console.log('onput',this.phoneInput,this.phoneInput.nativeElement)
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
        console.log("in change",countryData)
        this.onCountryChange(countryData,'phone')
      });
    }

    if(this.workInput){
      console.log('onput',this.workInput,this.workInput.nativeElement)
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
        console.log("in change",countryData)
        this.onCountryChange(countryData, 'work');
      });
    }

  

  }

  buildProfileForm() {
    this.profileForm = this.formBuilder.group({
      name: [''],
      operator_name: [''],
      phone: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(7), Validators.maxLength(15)]],
      phone_isd: ['+1', Validators.required],
      phone_country: ['us'],
      email: ['info@1800limo.com', [Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
      address: [''],
      work: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
      work_isd: ['+1'],
      work_country: ['us'],
      // city: [''],
      // state: [''],
      // country: ['', Validators.required],
      // zip: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
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
        this.selectedLanguages = this.getProfileResponseData?.data?.language_spoken; // Assuming API returns [1, 2] for selected languages
        this.profileForm.patchValue({ language: this.selectedLanguages });
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

  submitForm() {
    console.log(this.profileForm);
    this.submittedForm = true;
    // stop here if form is invalid
    if (this.profileForm.invalid) {
      return;
    }

    if (this.profileForm.get('badge_city_name').value == '') {
      this.profileForm.patchValue({
        badge_city: ''
      })
    }

    console.log(this.profileForm.value);
    this.spinner.show();

    this.adminService.createLooseAffAcc(this.profileForm.value, this.userId)
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
  }

  backButton() {
    this.router.navigate(['/admin/loose-affiliate-accounts']);
  }

}
