import { MapsAPILoader } from '@agm/core';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { AuthService } from 'src/app/services/auth.service';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { TravelAgentService } from 'src/app/services/travel-agent.service';
declare var $: any;


@Component({
  selector: 'app-loose-affiliate-account-details',
  templateUrl: './loose-affiliate-account-details.component.html',
  styleUrls: ['./loose-affiliate-account-details.component.scss']
})
export class LooseAffiliateAccountDetailsComponent implements OnInit {

  public profileForm: FormGroup;
  public submittedForm: boolean;
  public MobileObject: any;
  currentUser: any;
  userId: any;
  getProfileResponseData: any;

  //google map autocomplete
  title: string = 'AGM project';
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;
  @ViewChild('search1')
  public searchElementRef: ElementRef;
  response: any;
  defaultCountryCode: string;
  lastSegment: string;

  constructor(
    private stateManagementService: StateManagementService,
    private formBuilder: FormBuilder,
    private customValidator: CustomvalidationService,
    private mapsAPILoader: MapsAPILoader,
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

    if (this.userId) {
      this.getProfile()
    }

    this.mapsAPILoader.load().then(() => {
      // this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder;
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          console.log(place);
          //Fill one way form pickup address fields
          this.profileForm.patchValue({
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            address: place?.formatted_address
          });
          for (var i = 0; i < place.address_components.length; i++) {
            for (var j = 0; j < place.address_components[i].types.length; j++) {
              if (place.address_components[i].types[j] == "country") {
                this.profileForm.patchValue({
                  country: place.address_components[i].long_name
                });
                // this.changeCountry(place.address_components[i].short_name)
              }
              else if (place.address_components[i].types[j] == "administrative_area_level_1") {
                this.profileForm.patchValue({
                  state: place.address_components[i].long_name
                });
              }
              else if (place.address_components[i].types[j] == "administrative_area_level_3") {
                this.profileForm.patchValue({
                  city: place.address_components[i].long_name
                });
              }
              else if (place.address_components[i].types[j] == "postal_code") {
                this.profileForm.patchValue({
                  zip: place.address_components[i].long_name
                });
              }
              // else if (place.address_components[i].types[j] == "street_number") {
              // 	this.profileForm.patchValue({
              // 		address: place.address_components[i].long_name
              // 	});
              // }
            }
          }
        });
      });
    });

  }

  buildProfileForm() {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
      phone_isd: ['+1', Validators.required],
      phone_country: ['us'],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
      address: ['', Validators.required],
      // city: [''],
      // state: [''],
      // country: ['', Validators.required],
      // zip: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      latitude: [''],
      longitude: [''],


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
        this.profileForm.patchValue({
          name: this.getProfileResponseData?.data?.name,
          phone: this.getProfileResponseData?.data?.phone,
          phone_isd: this.getProfileResponseData?.data?.phone_isd,
          phone_country: this.getProfileResponseData?.data?.phone_country,
          email: this.getProfileResponseData?.data?.email,
          address: this.getProfileResponseData?.data?.city,
          city: this.getProfileResponseData?.data?.city,
          state: this.getProfileResponseData?.data?.state,
          country: this.getProfileResponseData?.data?.country,
          latitude: this.getProfileResponseData?.data?.latitude,
          longitude: this.getProfileResponseData?.data?.longitude,
        })
        console.log('profile this.getProfileResponseData?.data-->>>>', this.getProfileResponseData?.data)
        this.MobileObject.setCountry(this.getProfileResponseData?.data?.phone_country)
      })
  }

  onCountryChange(event, type) {
    console.log("11111", event)
    this.profileForm.patchValue({
      phone_isd: '+' + event.dialCode,
      phone_country: event.iso2
    });

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
        this.router.navigate(['/admin/loose-affiliate-accounts']);
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
