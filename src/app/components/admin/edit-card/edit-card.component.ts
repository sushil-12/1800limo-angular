import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-edit-card',
  templateUrl: './edit-card.component.html',
  styleUrls: ['./edit-card.component.scss']
})
export class EditCardComponent implements OnInit {

  public editCardForm: FormGroup;
  public submittedForm:boolean;
  public disableSubmitButton:boolean=false;
  public response:any;
  public paramResponse:any;
  public accountId:string;
  public accountType:string;
  public cardId:string;

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
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;
  @ViewChild('search1')
  public searchElementRef: ElementRef;

  ngOnInit(): void {
      this.spinner.show();//hide spinner

      //pick vehicle id from query params
      this.activatedroute.queryParamMap
        .subscribe((params) => {
          this.paramResponse= { ...params.keys, ...params };
          this.accountId=this.paramResponse.params.accountId;
          this.accountType=this.paramResponse.params.accountType;
          this.cardId=this.paramResponse.params.cardId;
          if(!this.cardId || !this.accountId)
          {
            this.router.navigate(['/admin/cards'],{queryParams:{accountType:this.accountType,accountId:this.accountId}});
          }
        }
      );

      //fetch data to display on edit screen
      this.adminService.getCard(this.cardId)
      .pipe(
          catchError(err => {
            this.spinner.hide();//hide spinner
            return throwError(err);
          })
      ).subscribe(result=>{
        this.response=result;

        this.editCardForm.patchValue({
          // id:this.accountId,
          // acc_id:this.accountId,
          secondaryCardNumber:this.response.data.secondaryCardNumber,
          secondaryCardType:this.response.data.secondaryCardType,
          secondaryCity:this.response.data.secondaryCity,
          secondaryCountryOfRegionResidence:this.response.data.secondaryCountryOfRegionResidence,
          secondaryFirstName:this.response.data.secondaryFirstName,
          secondaryLastName:this.response.data.secondaryLastName,
          secondaryMMYY:this.response.data.secondaryMMYY,
          secondaryPhone:this.response.data.secondaryPhone,
          secondaryState:this.response.data.secondaryState,
          secondaryStreetAddress:this.response.data.secondaryStreetAddress,
          secondaryZip:this.response.data.secondaryZip,
        });
        this.spinner.hide();//hide spinner
      });

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
              this.editCardForm.patchValue({
                secondaryCity:place.address_components[1].long_name
              });
            if(place.address_components[2])
              this.editCardForm.patchValue({
                secondaryState:place.address_components[2].long_name
              });
            if(place.address_components[3])
              this.editCardForm.patchValue({
                secondaryCountry:place.address_components[3].long_name
              });
            if(place.address_components[4])
              this.editCardForm.patchValue({
                secondaryZip:place.address_components[place.address_components.length - 1].long_name
              });
          });
        });
      });

      //add card form validation
      this.editCardForm = this.formBuilder.group({
        id: [this.cardId, [Validators.required,Validators.pattern("^[0-9].*$")]],
        acc_id: [this.accountId, [Validators.required,Validators.pattern("^[0-9].*$")]],
        secondaryCardType: ['', Validators.required],
        secondaryCardNumber: [''],
        secondaryCountryOfRegionResidence: ['', Validators.required],
        secondaryCSC: [''],
        secondaryMMYY: [''],
        secondaryFirstName: ['', Validators.required],
        secondaryLastName: ['', Validators.required],
        secondaryPhone: ['', [Validators.required,Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]],
        secondaryStreetAddress: ['', Validators.required],
        secondaryCity: ['', Validators.required],
        secondaryState: ['', Validators.required],
        secondaryZip: ['', [Validators.required,Validators.pattern("^[0-9]*$")]],
      });
  }

  onCountryChange(event,type)
  {
    if(type=='mobile')
    {
      this.editCardForm.patchValue({
        mobileIsd:'+'+event.dialCode
      });
    }
    else
    {
      this.editCardForm.patchValue({
        workIsd:'+'+event.dialCode
      });
    }
    // console.log(this.countryCode);
  }

  get f(){
    return this.editCardForm.controls;
  }

  submitForm()
  {
    console.log(this.editCardForm);
    // console.log(JSON.stringify(this.addVehicleRatesForm.value));
    this.submittedForm = true;
    // stop here if form is invalid
    if (this.editCardForm.invalid) {
        return;
    }

    console.log(this.editCardForm.value);
    // console.log(JSON.stringify(this.addVehicleRatesForm.value));
    this.spinner.show();
    this.disableSubmitButton=true; //disable submit button

    this.adminService.editCard(this.editCardForm.value)
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
      
      this.router.navigate(['/admin/cards'],{queryParams:{accountType:this.accountType,accountId:this.accountId}});
    });
  }
  
  resetForm()
  {
    this.editCardForm.reset();
  }
  backButton()
  {
    this.router.navigate(['/admin/cards'],{queryParams:{accountType:this.accountType,accountId:this.accountId}});
  }

}
