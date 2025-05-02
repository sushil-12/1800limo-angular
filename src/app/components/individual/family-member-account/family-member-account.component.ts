import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IndividualService } from '../../../services/individual.service';
import { TravelAgentService } from '../../../services/travel-agent.service';
import * as intlTelInput from 'intl-tel-input';

@Component({
  selector: 'app-family-member-account',
  templateUrl: './family-member-account.component.html',
  styleUrls: ['./family-member-account.component.scss']
})
export class FamilyMemberAccountComponent implements OnInit {
  @ViewChild('phoneInput') phoneInput!: ElementRef;
  @ViewChild('search1') search1!: ElementRef;
  geoCoder!: google.maps.Geocoder;

  public addFamilyMemberAccountForm: FormGroup;
  public submittedForm: boolean;
  public disableSubmitButton: boolean = false;
  public response: any;
  public yearOptions: any = [];
  public MobileObject: any;
  clientId: any = null;
  type: any = null;
  // uselogin: boolean = false;

  constructor(
    private individualService: IndividualService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private $routeurl: ActivatedRoute,
    private ngZone: NgZone,
  ) { }


  //google map autocomplete
  title: string = 'AGM project';
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  currentUser: any;

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
    this.buildAddIndividualForm();
    this.$routeurl.queryParams.subscribe((params: any) => {
      console.log('params---->>>>>', params)
      this.clientId = params?.id
      if (params && params.type) {
        this.type = params.type
      }
    })
    const currentYear = (new Date()).getFullYear();
    for (let i = 0; i < 40; i++) {
      this.yearOptions.push(currentYear + i);
    }

    if (this.clientId) {
      this.individualService.getAccount(this.clientId)
        .pipe(
          catchError(err => {
            this.spinner.hide();//hide spinner
            return throwError(err);
          })
        ).subscribe(result => {
          this.response = result;

          this.addFamilyMemberAccountForm.patchValue({
            id: this.clientId,
            first_name: this.response.data?.first_name,
            last_name: this.response.data?.last_name,
            phone_number: this.response.data?.phone_number,
            phone_isd: this.response.data?.phone_isd,
            email: this.response.data?.email,
            // address: this.response.data?.address,
            // city: this.response.data?.city,
            // state: this.response.data?.state,
            // country: this.response.data?.country,
            // zipCode: this.response.data.zip,
            // latitude: this.response.data?.latitude,
            // longitude: this.response.data?.longitude,
            // use_for_login: this.response.data?.use_for_login,
            // age: this.response.data?.age,
            // relationship: this.response.data?.relationship,

          });
          // this.uselogin = this.response.data?.use_for_login
          this.spinner.hide();//hide spinner
          this.MobileObject.setCountry(this.response.data.mobileCountry);
        });
    }


  }

  ngAfterViewInit() {
    this.initphonefield()


    this.initautoComplete()


  }

  initphonefield() {

    if (this.phoneInput) {
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
    }

  }

  initautoComplete() {
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

        this.addFamilyMemberAccountForm.patchValue({
          address: place.formatted_address,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng()
        });


        // Extract address components
        place.address_components?.forEach(component => {
          const types = component.types;
          if (types.includes('country')) {
            this.addFamilyMemberAccountForm.patchValue({
              country: component.short_name
            });
          } else if (types.includes('administrative_area_level_1')) {
            this.addFamilyMemberAccountForm.patchValue({
              state: component.long_name
            });
          } else if (types.includes('administrative_area_level_3')) {
            this.addFamilyMemberAccountForm.patchValue({
              city: component.long_name
            });
          } else if (types.includes('postal_code')) {
            this.addFamilyMemberAccountForm.patchValue({
              zipCode: component.long_name
            });
          }
          // else if (types.includes('street_number')) {
          // 	this.addFamilyMemberAccountForm.patchValue({
          // 		address: component.long_name
          // 	});
          // }
        });
      });
    });
  }


  buildAddIndividualForm() {
    this.addFamilyMemberAccountForm = this.formBuilder.group({
      id: [''],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      phone_number: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
      phone_isd: ['+1', Validators.required],
      mobileCountry: ['us'],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
      // address: ['', Validators.required],
      // city: [''],
      // state: [''],
      // country: ['', Validators.required],
      // zipCode: ['', Validators.required],
      // latitude: [''],
      // longitude: [''],
      // use_for_login: [false],
      // age: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      // relationship: ['', Validators.required]
    });
  }



  onCountryChange(event, type) {
    console.log("in mobile", event.dialCode, event.iso2)
    this.addFamilyMemberAccountForm.patchValue({
      phone_isd: '+' + event.dialCode,
      mobileCountry: event.iso2
    });

  }

  telInputObjectMobile(obj) {
    this.MobileObject = obj;
  }

  get f() {
    return this.addFamilyMemberAccountForm.controls;
  }

  // handleChangeCheckbox(event) {
  //   this.uselogin = event
  //   this.addFamilyMemberAccountForm.patchValue({
  //     use_for_login: this.uselogin
  //   })
  // }

  submitForm() {
    console.log(this.addFamilyMemberAccountForm);
    // console.log(JSON.stringify(this.addVehicleRatesForm.value));
    this.submittedForm = true;
    // stop here if form is invalid
    if (this.addFamilyMemberAccountForm.invalid) {
      return;
    }

    console.log(this.addFamilyMemberAccountForm.value);
    // console.log(JSON.stringify(this.addVehicleRatesForm.value));
    this.spinner.show();
    this.disableSubmitButton = true; //disable submit button
    console.log(this.addFamilyMemberAccountForm.value)
    this.individualService.addAccount(this.addFamilyMemberAccountForm.value, this.clientId)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          this.disableSubmitButton = false; //enable submit button
          return throwError(err);
        })
      )
      .subscribe(result => {
        this.response = result;
        this.spinner.hide();//hide spinner
        this.disableSubmitButton = false; //enable submit button

        this.router.navigate([`/individual/family-members`]);
      });
  }

  resetForm() {
    const keepValues = [
      this.addFamilyMemberAccountForm.controls.phone_number.value,
      this.addFamilyMemberAccountForm.controls.id.value,
      this.addFamilyMemberAccountForm.controls.phone_isd.value,
      this.addFamilyMemberAccountForm.controls.mobileCountry.value,

    ];

    this.buildAddIndividualForm()
    this.addFamilyMemberAccountForm.controls.phone_number.patchValue(keepValues[0]);
    this.addFamilyMemberAccountForm.controls.id.patchValue(keepValues[1]);
    this.addFamilyMemberAccountForm.controls.phone_isd.patchValue(keepValues[2]);
    this.addFamilyMemberAccountForm.controls.mobileCountry.patchValue(keepValues[3]);

    console.log(this.addFamilyMemberAccountForm.value)
  }
  backButton() {
    this.router.navigate([`/individual/family-members`]);
  }
}
