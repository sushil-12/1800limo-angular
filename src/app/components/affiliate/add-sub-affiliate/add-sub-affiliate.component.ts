import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from '../../../services/admin.service';
import { AffiliateService } from '../../../services/affiliate.service';
import * as intlTelInput from 'intl-tel-input';

declare var $: any;
@Component({
  selector: 'app-add-sub-affiliate',
  templateUrl: './add-sub-affiliate.component.html',
  styleUrls: ['./add-sub-affiliate.component.scss']
})
export class AddSubAffiliateComponent implements OnInit, AfterViewInit {
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

    if (this.userId) {
      this.getProfile()
    }

   
  }

  ngAfterViewInit() {

    const telOptions = {
      initialCountry: 'us',
      preferredCountries: ['us', 'ca', 'mx', 'gb'],
      separateDialCode: true,
      nationalMode: false,
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js'
    };

    // Cell Number
    this.MobileObject = intlTelInput(this.mobileInput.nativeElement, telOptions);
    this.mobileInput.nativeElement.addEventListener('countrychange', () => {
      const countryData = this.MobileObject.getSelectedCountryData();
      this.onCountryChange(countryData, 'mobile');
    });

    // Background Company Tel
    this.OfficeObject = intlTelInput(this.workInput.nativeElement, telOptions);
    this.workInput.nativeElement.addEventListener('countrychange', () => {
      const countryData = this.OfficeObject.getSelectedCountryData();
      this.onCountryChange(countryData, 'work_contact_number');
    });

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
               country: component.short_name
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
  buildProfileForm() {
    this.profileForm = this.formBuilder.group({
      acc_id: [],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(9), Validators.maxLength(15)]],
      mobileIsd: ['+1', Validators.required],
      mobileCountry: ['us'],
      work_contact_number: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(9), Validators.maxLength(15)]],
      workIsd: ['+1', Validators.required],
      workCountry: ['us'],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
      company_name: [this.currentUser?.affiliate_company, Validators.required],
      address: ['', Validators.required],
      city: [''],
      state: [''],
      country: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      latitude: [''],
      longitude: [''],
    });
  }

  get f() {
    return this.profileForm.controls;
  }

  getProfile() {
    this.spinner.show();
    this.affiliateService.getSubAddDetailsById(this.userId)
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
    }
    else if (type == 'work_contact_number') {
      console.log("222222")
      this.profileForm.patchValue({
        workIsd: '+' + event.dialCode,
        workCountry: event.iso2
      });
    }
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
        this.router.navigate(['/affiliate/my-bookings']);
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
    this.router.navigate(['/affiliate/my-bookings']);
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
}
