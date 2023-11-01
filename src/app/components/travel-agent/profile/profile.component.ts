import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { TravelAgentService } from '../../../services/travel-agent.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { MapsAPILoader } from '@agm/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { AffiliateService } from 'src/app/services/affiliate.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
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
	private geoCoder;
	@ViewChild('search1')
	public searchElementRef: ElementRef;
  response: any;
  defaultCountryCode: string;
  lastSegment: string;

  constructor(
    private affiliateService: AffiliateService,
    private stateManagementService: StateManagementService,
    private formBuilder: FormBuilder,
    private customValidator: CustomvalidationService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private travelAgentService: TravelAgentService,
  ) { }

  ngOnInit(): void {
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
    //google map autocomplete
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
            address:place?.formatted_address 
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
    this.stateManagementService.setprogressBar(false);//hide progressbar
    if (this.currentUser?.is_profile_complete) {
      this.getProfileData()
    }
    else {
      // this.profileForm.get('name')?.setValidators([Validators.required]);
      // this.profileForm.get('number')?.setValidators([Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.minLength(16), Validators.maxLength(20), this.customValidator.dashValidator(), this.customValidator.plusValidator()]);
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

  buildProfileForm() {
    this.profileForm = this.formBuilder.group({
      acc_id: [''],
      tp_id:[''],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      work_contact_number: [''],
      workIsd: ['+1', Validators.required],
      workCountry: ['us'],
      mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
      mobileIsd: ['+1', Validators.required],
      mobileCountry: ['us'],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/i)]],
      address: ['', Validators.required],
      city: [''],
      state: [''],
      country: ['', Validators.required],
      zip: ['',[Validators.required]],
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
      timezone : ['']
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
          tp_id : data?.tp_id,
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
    }
    else if (type == 'work_contact_number') {
      console.log("222222")
      this.profileForm.patchValue({
        workIsd: '+' + event.dialCode,
        workCountry: event.iso2
      });
    }
    else if (type == 'office_number') {
      console.log("333333")
      this.profileForm.patchValue({
        isd_office_number: '+' + event.dialCode,
        office_country_code: event.iso2
      });
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
            if(userInfo){
              userInfo['profile_picture'] = data?.image
              localStorage.setItem('userData' , JSON.stringify(userInfo))
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
          currentUser['name'] = this.response?.data?.first_name +' ' + this.response?.data?.last_name
          currentUser['account_id'] = this.response?.data?.acc_id
          localStorage.setItem('currentUser', JSON.stringify(currentUser))
          if(this.lastSegment=='step1'){
          this.router.navigateByUrl('/travel_agent/profile/step2').then(() => {
            window.location.reload();
          });

          }
          else{
          window.location.reload()
          }
        }

      });
  }


}
