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
declare var $ :any;


@Component({
  selector: 'app-sub-agent-account-details',
  templateUrl: './sub-agent-account-details.component.html',
  styleUrls: ['./sub-agent-account-details.component.scss']
})
export class SubAgentAccountDetailsComponent implements OnInit {

  public profileForm: FormGroup;
  public submittedForm: boolean;
  public OfficeObject: any;
  public MobileObject: any;
  currentUser:any;
  agency_name:any;
  invite_code:any;
  userId:any;
  getProfileResponseData:any;
  timezoneForm: FormGroup;

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
    private authService:AuthService,
    private travelAgentService: TravelAgentService,
    private adminService: AdminService,
  ) { }

  ngOnInit(): void {

    localStorage.removeItem('review_referral_url')
    this.route.queryParams.subscribe((params:any)=>{
			this.userId = params?.id
		})

    this.buildProfileForm()
    this.timezoneForm = this.formBuilder.group({
      timezone: [''],
    });
    this.getProfile()
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

  }

  buildProfileForm() {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      work_contact_number: [''],
      workIsd: ['+1', Validators.required],
      workCountry: ['us'],
      mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
      mobileIsd: ['+1', Validators.required],
      mobileCountry: ['us'],
      email: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9.]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      address: ['', Validators.required],
      city: [''],
      state: [''],
      country: ['', Validators.required],
      zip: ['',[Validators.required,Validators.pattern("^[0-9]*$")]],
      latitude: [''],
      longitude: [''],
      agency_name: ['', Validators.required],
      invite_code: [this.invite_code]

    });
  }

  get f() {
    return this.profileForm.controls;
  }

  getProfile(){
    this.spinner.show();
    this.travelAgentService.getSubAgentAccountDetails(this.userId)
     .then(({ data }: any) => {
      this.spinner.hide();//hide spinner
      this.getProfileResponseData = data
      this.timezoneForm.patchValue({
        timezone : data?.timezone
      })
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
      }).catch((err)=>{
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

 


  submitForm()
	{
    console.log(this.profileForm);
    this.submittedForm = true;
    // stop here if form is invalid
    if (this.profileForm.invalid) {
      return;
    }

    console.log(this.profileForm.value);
    this.spinner.show();

    this.travelAgentService.createNewSubAgent(this.profileForm.value ,  this.currentUser?.is_profile_complete)
    .pipe(
      catchError(err => {
        this.spinner.hide();//hide spinner
        return throwError(err);
      })
    )
    .subscribe(result => {
      this.response = result;
      this.spinner.hide();//hide spinner
     console.log("profile created",this.response)
     $("#redirectModal").modal("show");

     setTimeout(()=>{
      console.log("in timeout")
      this.spinner.show()
      $("#redirectModal").modal("hide");
      this.authService.logout()
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(({ success }: any) =>
			{
				this.spinner.hide();//hide spinner
				if (success == true)
				{
					this.stateManagementService.removeUser();
				}
				this.router.navigate(['/']);
			});
     },10000)

    });


	}

  
  acceptRejectAffiliate(status) {
		this.spinner.show();
		// this.disableSubmitButton=true; //disable submit button
		console.log('acc_id', this.getProfileResponseData?.acc_id,status,'status')

		this.travelAgentService.acceptRejectAffiliate(this.getProfileResponseData?.acc_id,status)
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


	resetForm()
	{
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
	backButton()
	{
		this.router.navigate(['/travel_agent/sub-agent-accounts']);
	}
  onTimezoneChange(event: any): void {
    const selectedValue = event.value;
    console.log('Selected Timezone:', selectedValue);
    this.adminService
			.changeTimezone(selectedValue)
			.pipe()
			.subscribe((response: any) => {
				console.log(response,'timezone changed success');
			});

  }
}
