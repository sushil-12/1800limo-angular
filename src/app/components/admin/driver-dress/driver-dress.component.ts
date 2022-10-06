import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {ThemePalette} from '@angular/material/core';
declare var $: any;

@Component({
  selector: 'app-driver-dress',
  templateUrl: './driver-dress.component.html',
  styleUrls: ['./driver-dress.component.scss']
})
export class DriverDressComponent implements OnInit {

  colorToggle: ThemePalette = 'primary';
  checked = false;
  disabled = false;
  
  driverDress:any;
  driverDressRes:any;

  public addDriverDressForm: FormGroup;
  public editDriverDressForm: FormGroup;
  
  public submitted=false;
  public submittedEditForm=false;
  public response:any;
  public disableAddButton:boolean=false;
  public disableEditButton:boolean=false;

  constructor(
    private adminService:AdminService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

        /** spinner starts on init */
        this.spinner.show();

        // Load Our driverDress using API
        this.adminService.getDriverDressList().then(result=>{
          this.driverDressRes=result;
          this.driverDress=this.driverDressRes.data;
          sessionStorage.setItem('driverDress',JSON.stringify(this.driverDress));
          this.spinner.hide();//hide spinner
        });

        //add driverDress type form validation
        this.addDriverDressForm = this.formBuilder.group({
          name: ['', Validators.required]
        });

        //edit driverDress type form validation
        this.editDriverDressForm = this.formBuilder.group({
          id: ['', Validators.required],
          name: ['', Validators.required]
        });
  }

  serach(val)
  {
    let allDriverDress=JSON.parse(sessionStorage.getItem('driverDress'));
    let searchDriverDress = allDriverDress.filter(function(driverDress) {
      if(driverDress.name.toLowerCase().search(val)!=-1)
      {
        return true;
      }
    });
    this.driverDress=searchDriverDress;
  }

  get f(){
    return this.addDriverDressForm.controls;
  }

  submitForm()
  {
    this.submitted = true;
    // stop here if form is invalid
    if (this.addDriverDressForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableAddButton=true; //disable submit button

    this.adminService.addDriverDress(this.addDriverDressForm.value)
    .pipe(
        catchError(err => {
          $('#addDriverDressModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#addDriverDressModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/driver-dress']);
      }); 
    });
  }

  editDriverDress(id)
  {
    this.spinner.show();

    this.adminService.getDriverDress(id)
    .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;

      this.editDriverDressForm.patchValue({  
        id: this.response.data.id,  
        name:this.response.data.name
      });
      $('#editDriverDressModal').modal('show');
      this.spinner.hide();//hide spinner
    });
  }

  get fEdit(){
    return this.editDriverDressForm.controls;
  }
  updateDriverDressForm()
  {
    this.submittedEditForm = true;
    // stop here if form is invalid
    if (this.editDriverDressForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableEditButton=true; //disable submit button

    this.adminService.updateDriverDress(this.editDriverDressForm.value)
    .pipe(
        catchError(err => {
          $('#editDriverDressModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#editDriverDressModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/driver-dress']);
      }); 
    });
  }

  enableDisableClicked(event,id)
  {
    this.spinner.show();//show spinner
    console.log(event.checked);
    if(event.checked)
    {
      var status='enable';
    }
    else
    {
      var status='disable';
    }
    this.adminService.driverDressStatus(id,status)
    .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
    ).subscribe(result=>{

      this.spinner.hide();//hide spinner
    });
  }

}

