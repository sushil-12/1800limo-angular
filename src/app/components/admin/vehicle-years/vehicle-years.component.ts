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
  selector: 'app-vehicle-years',
  templateUrl: './vehicle-years.component.html',
  styleUrls: ['./vehicle-years.component.scss']
})
export class VehicleYearsComponent implements OnInit {

  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  years:any;
  yearsRes:any;

  public addYearsForm: FormGroup;
  public editYearsForm: FormGroup;
  
  public submitted=false;
  public submittedEditForm=false;
  public response:any;
  public disableAddButton:boolean=false;
  public disableEditButton:boolean=false;
  currentUser = JSON.parse(localStorage.getItem('curentUser'))
  
  constructor(
    private adminService:AdminService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

        /** spinner starts on init */
        this.spinner.show();

        // Load Our years using API
        this.adminService.getYears().then(result=>{
          console.log(result)
          this.yearsRes=result;
          this.years=this.yearsRes.data;
          sessionStorage.setItem('years',JSON.stringify(this.years));
          this.spinner.hide();//hide spinner
        });

        //add year type form validation
        this.addYearsForm = this.formBuilder.group({
          name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern("^[0-9]*$") ]]
        });

        //edit year type form validation
        this.editYearsForm = this.formBuilder.group({
          id: ['', Validators.required],
          name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern("^[0-9]*$") ]]
        });
  }

  serach(val)
  {
    let allYears=JSON.parse(sessionStorage.getItem('years'));
    let searchYears = allYears.filter(function(year) {
      if(year.name.toLowerCase().search(val)!=-1)
      {
        return true;
      }
    });
    // console.log(searchVehicles);
    this.years=searchYears;
  }

  get f(){
    return this.addYearsForm.controls;
  }

  submitForm()
  {
    this.submitted = true;
    // stop here if form is invalid
    if (this.addYearsForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableAddButton=true; //disable submit button

    this.adminService.addYear(this.addYearsForm.value)
    .pipe(
        catchError(err => {
          $('#addYearModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#addYearModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/vehicle-years']);
      }); 
    });
  }

  editYear(id)
  {
    this.spinner.show();

    this.adminService.getYear(id)
    .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;

      this.editYearsForm.patchValue({  
        id: this.response.data.id,  
        name:this.response.data.name
      });
      $('#editYearModal').modal('show');
      this.spinner.hide();//hide spinner
    });
  }

  get fEdit(){
    return this.editYearsForm.controls;
  }
  updateYearForm()
  {
    this.submittedEditForm = true;
    // stop here if form is invalid
    if (this.editYearsForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableEditButton=true; //disable submit button

    this.adminService.updateYear(this.editYearsForm.value)
    .pipe(
        catchError(err => {
          $('#editYearModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#editYearModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/vehicle-years']);
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
    this.adminService.yearStatus(id,status)
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

