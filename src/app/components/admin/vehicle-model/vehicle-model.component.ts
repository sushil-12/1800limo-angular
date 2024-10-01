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
  selector: 'app-vehicle-model',
  templateUrl: './vehicle-model.component.html',
  styleUrls: ['./vehicle-model.component.scss']
})
export class VehicleModelComponent implements OnInit {

  colorToggle: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  model:any;
  modelRes:any;
  make:any;
  makeRes:any;

  public addModelForm: FormGroup;
  public editModelForm: FormGroup;
  
  public submitted=false;
  public submittedEditForm=false;
  public response:any;
  public disableAddButton:boolean=false;
  public disableEditButton:boolean=false;
  currentUser = JSON.parse(localStorage.getItem("currentUser"));

  constructor(
    private adminService:AdminService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

        /** spinner starts on init */
        this.spinner.show();

        // Load Our model using API
        this.adminService.getModelList().then(result=>{
          this.modelRes=result;
          this.model=this.modelRes.data;
          sessionStorage.setItem('model',JSON.stringify(this.model));
          this.spinner.hide();//hide spinner
        });

        // Load Our make using API
        this.adminService.getMakeList().then(result=>{
          this.makeRes=result;
          this.make=this.makeRes.data;
          
          this.addModelForm.patchValue({
            make_id:this.make[0].ID
          });
        });

        //add model type form validation
        this.addModelForm = this.formBuilder.group({
          name: ['', Validators.required],
          make_id: ['', Validators.required],
        });

        //edit model type form validation
        this.editModelForm = this.formBuilder.group({
          id: ['', Validators.required],
          name: ['', Validators.required],
          make_id: ['', Validators.required]
        });
  }

  serach(val)
  {
    let allModel=JSON.parse(sessionStorage.getItem('model'));
    let searchModel = allModel.filter(function(model) {
      if(model.name.toLowerCase().search(val)!=-1)
      {
        return true;
      }
    });
    // console.log(searchVehicles);
    this.model=searchModel;
  }

  get f(){
    return this.addModelForm.controls;
  }

  submitForm()
  {
    this.submitted = true;
    // stop here if form is invalid
    if (this.addModelForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableAddButton=true; //disable submit button

    this.adminService.addModel(this.addModelForm.value)
    .pipe(
        catchError(err => {
          $('#addModelModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#addModelModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/vehicle-model']);
      }); 
    });
  }

  editModel(id)
  {
    this.spinner.show();

    this.adminService.getModel(id)
    .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;

      this.editModelForm.patchValue({  
        id: this.response.data.id,  
        name:this.response.data.name,
        make_id:this.response.data.make_ID
      });
      $('#editModelModal').modal('show');
      this.spinner.hide();//hide spinner
    });
  }

  get fEdit(){
    return this.editModelForm.controls;
  }
  updateModelForm()
  {
    this.submittedEditForm = true;
    // stop here if form is invalid
    if (this.editModelForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableEditButton=true; //disable submit button

    this.adminService.updateModel(this.editModelForm.value)
    .pipe(
        catchError(err => {
          $('#editModelModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#editModelModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/vehicle-model']);
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
    this.adminService.modelStatus(id,status)
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

