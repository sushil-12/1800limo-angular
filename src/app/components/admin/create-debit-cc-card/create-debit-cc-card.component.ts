import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-create-debit-cc-card',
  templateUrl: './create-debit-cc-card.component.html',
  styleUrls: ['./create-debit-cc-card.component.scss']
})
export class CreateDebitCcCardComponent implements OnInit {

  public createCCDebitCardForm: FormGroup;
  public submittedForm:boolean;
  public disableSubmitButton:boolean=false;
  public response:any;
  public paramResponse:any;
  public accountId:string;
  public accountType:string;

  constructor(
    private adminService:AdminService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private activatedroute:ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
    ) { }


  //google map autocomplete
  title: string = 'Akshay project';
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;
  @ViewChild('search1')
  public searchElementRef: ElementRef;

  ngOnInit(): void {


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
            // console.log(place);
            if(place.address_components[1])
              this.createCCDebitCardForm.patchValue({
                otherCity:place.address_components[1].long_name
              });
            if(place.address_components[2])
              this.createCCDebitCardForm.patchValue({
                otherState:place.address_components[2].long_name
              });
            if(place.address_components[3])
              this.createCCDebitCardForm.patchValue({
                otherCountry:place.address_components[3].long_name
              });
            if(place.address_components[4])
              this.createCCDebitCardForm.patchValue({
                otherZip:place.address_components[place.address_components.length - 1].long_name
              });
          });
        });
      });

      //add card form validation
      this.createCCDebitCardForm = this.formBuilder.group({
        reservation_id: [this.accountId, [Validators.required,Validators.pattern("^[0-9].*$")]],
        cc_number: ['', [Validators.required,Validators.pattern("^[0-9]*$"), Validators.minLength(14), Validators.maxLength(20)]],
        otherCountryOfRegionResidence: ['', Validators.required],
        cvc: ['', [Validators.required,Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(3)]],
        otherMMYY: ['', [Validators.required, Validators.pattern("(0|1)[0-9]\/[0-9]{2}")]],
        otherFirstName: ['', Validators.required],
        otherLastName: ['', Validators.required],
        otherPhone: ['', [Validators.required,Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]],
        otherStreetAddress: ['', Validators.required],
        otherCity: ['', Validators.required],
        otherState: ['', Validators.required],
        otherZip: ['', [Validators.required,Validators.pattern("^[0-9]*$")]],
      });
  }

  onCountryChange(event,type)
  {
    if(type=='mobile')
    {
      this.createCCDebitCardForm.patchValue({
        mobileIsd:'+'+event.dialCode
      });
    }
    else
    {
      this.createCCDebitCardForm.patchValue({
        workIsd:'+'+event.dialCode
      });
    }
    // console.log(this.countryCode);
  }

  get f(){
    return this.createCCDebitCardForm.controls;
  }

  submitForm()
  {
    console.log(this.createCCDebitCardForm);
    // console.log(JSON.stringify(this.addVehicleRatesForm.value));
    this.submittedForm = true;
    // stop here if form is invalid
    if (this.createCCDebitCardForm.invalid) {
        return;
    }

    console.log(this.createCCDebitCardForm.value);
    // console.log(JSON.stringify(this.addVehicleRatesForm.value));
    this.spinner.show();
    this.disableSubmitButton=true; //disable submit button

    this.adminService.paymentProcessingCcDebit(this.createCCDebitCardForm.value)
    .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          this.disableSubmitButton=false; //enable submit button
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      this.spinner.hide();//hide spinner
      this.disableSubmitButton=false; //enable submit button
      
      this.router.navigate(['/admin/daily-bookings-admin'],{queryParams:{accountType:this.accountType,accountId:this.accountId}});
    });
  }
  
  resetForm()
  {
    this.createCCDebitCardForm.reset();
  }

}

