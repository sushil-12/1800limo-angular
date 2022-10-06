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
  selector: 'app-driver-language',
  templateUrl: './driver-language.component.html',
  styleUrls: ['./driver-language.component.scss']
})
export class DriverLanguageComponent implements OnInit {

  colorToggle: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  driverLanguage:any;
  driverLanguageRes:any;

  public addDriverLanguageForm: FormGroup;
  public editDriverLanguageForm: FormGroup;
  
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

        // Load Our driverLanguage using API
        this.adminService.getDriverLanguageList().then(result=>{
          this.driverLanguageRes=result;
          this.driverLanguage=this.driverLanguageRes.data;
          sessionStorage.setItem('driverLanguage',JSON.stringify(this.driverLanguage));
          this.spinner.hide();//hide spinner
        });

        //add driverLanguage type form validation
        this.addDriverLanguageForm = this.formBuilder.group({
          name: ['', Validators.required]
        });

        //edit driverLanguage type form validation
        this.editDriverLanguageForm = this.formBuilder.group({
          id: ['', Validators.required],
          name: ['', Validators.required]
        });
  }

  serach(val)
  {
    let allDriverLanguage=JSON.parse(sessionStorage.getItem('driverLanguage'));
    let searchDriverLanguage = allDriverLanguage.filter(function(driverLanguage) {
      if(driverLanguage.name.toLowerCase().search(val)!=-1)
      {
        return true;
      }
    });
    this.driverLanguage=searchDriverLanguage;
  }

  get f(){
    return this.addDriverLanguageForm.controls;
  }

  submitForm()
  {
    this.submitted = true;
    // stop here if form is invalid
    if (this.addDriverLanguageForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableAddButton=true; //disable submit button

    this.adminService.addDriverLanguage(this.addDriverLanguageForm.value)
    .pipe(
        catchError(err => {
          $('#addDriverLanguageModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#addDriverLanguageModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/driver-language']);
      }); 
    });
  }

  editDriverLanguage(id)
  {
    this.spinner.show();

    this.adminService.getDriverLanguage(id)
    .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;

      this.editDriverLanguageForm.patchValue({  
        id: this.response.data.id,  
        name:this.response.data.name
      });
      $('#editDriverLanguageModal').modal('show');
      this.spinner.hide();//hide spinner
    });
  }

  get fEdit(){
    return this.editDriverLanguageForm.controls;
  }
  updateDriverLanguageForm()
  {
    this.submittedEditForm = true;
    // stop here if form is invalid
    if (this.editDriverLanguageForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableEditButton=true; //disable submit button

    this.adminService.updateDriverLanguage(this.editDriverLanguageForm.value)
    .pipe(
        catchError(err => {
          $('#editDriverLanguageModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#editDriverLanguageModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/driver-language']);
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
    this.adminService.driverLanguageStatus(id,status)
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

