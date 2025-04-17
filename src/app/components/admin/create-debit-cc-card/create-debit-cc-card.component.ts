import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
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
  @ViewChild('search1') search1!: ElementRef;

  geoCoder!: google.maps.Geocoder;

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
    private ngZone: NgZone
    ) { }


  ngOnInit(): void {

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

  ngAfterViewInit(): void {
    this.geoCoder = new google.maps.Geocoder();

    const autocomplete = new google.maps.places.Autocomplete(
      this.search1.nativeElement,
      {
        types: ['address'] // You can tweak this to 'address', etc.
      }
    );

    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place: google.maps.places.PlaceResult = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        // Extract address components
        place.address_components?.forEach(component => {
          const types = component.types;
          if (types.includes('country')) {
            this.createCCDebitCardForm.patchValue({
              otherCountry: component.short_name
            });
          } else if (types.includes('administrative_area_level_1')) {
            this.createCCDebitCardForm.patchValue({
              otherState: component.long_name
            });
          } else if (types.includes('administrative_area_level_3')) {
            this.createCCDebitCardForm.patchValue({
              otherCity: component.long_name
            });
          } else if (types.includes('postal_code')) {
            this.createCCDebitCardForm.patchValue({
              otherZip: component.long_name
            });
          }
        });
      });
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

