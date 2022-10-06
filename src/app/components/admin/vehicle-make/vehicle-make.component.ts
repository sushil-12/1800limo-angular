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
  selector: 'app-vehicle-make',
  templateUrl: './vehicle-make.component.html',
  styleUrls: ['./vehicle-make.component.scss']
})
export class VehicleMakeComponent implements OnInit {

  colorToggle: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  make:any;
  makeRes:any;

  public addMakeForm: FormGroup;
  public editMakeForm: FormGroup;
  
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

        // Load Our make using API
        this.adminService.getMakeList().then(result=>{
          this.makeRes=result;
          this.make=this.makeRes.data;
          sessionStorage.setItem('make',JSON.stringify(this.make));
          this.spinner.hide();//hide spinner
        });

        //add make type form validation
        this.addMakeForm = this.formBuilder.group({
          name: ['', Validators.required]
        });

        //edit make type form validation
        this.editMakeForm = this.formBuilder.group({
          id: ['', Validators.required],
          name: ['', Validators.required]
        });
  }

  serach(val)
  {
    let allMake=JSON.parse(sessionStorage.getItem('make'));
    let searchMake = allMake.filter(function(make) {
      if(make.name.toLowerCase().search(val)!=-1)
      {
        return true;
      }
    });
    // console.log(searchVehicles);
    this.make=searchMake;
  }

  get f(){
    return this.addMakeForm.controls;
  }

  submitForm()
  {
    this.submitted = true;
    // stop here if form is invalid
    if (this.addMakeForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableAddButton=true; //disable submit button

    this.adminService.addMake(this.addMakeForm.value)
    .pipe(
        catchError(err => {
          $('#addMakeModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#addMakeModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/vehicle-make']);
      }); 
    });
  }

  editMake(id)
  {
    this.spinner.show();

    this.adminService.getMake(id)
    .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;

      this.editMakeForm.patchValue({  
        id: this.response.data.id,  
        name:this.response.data.name
      });
      $('#editMakeModal').modal('show');
      this.spinner.hide();//hide spinner
    });
  }

  get fEdit(){
    return this.editMakeForm.controls;
  }
  updateMakeForm()
  {
    this.submittedEditForm = true;
    // stop here if form is invalid
    if (this.editMakeForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableEditButton=true; //disable submit button

    this.adminService.updateMake(this.editMakeForm.value)
    .pipe(
        catchError(err => {
          $('#editMakeModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#editMakeModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/vehicle-make']);
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
    this.adminService.makeStatus(id,status)
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

