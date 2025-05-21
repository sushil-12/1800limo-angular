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
  selector: 'app-vehicle-color',
  templateUrl: './vehicle-color.component.html',
  styleUrls: ['./vehicle-color.component.scss']
})
export class VehicleColorComponent implements OnInit {

  colorToggle: ThemePalette = 'accent';
  checked = false;
  disabled = false;

  colors:any;
  colorsRes:any;

  public addColorsForm: FormGroup;
  public editColorsForm: FormGroup;
  
  public submitted=false;
  public submittedEditForm=false;
  public response:any;
  public disableAddButton:boolean=false;
  public disableEditButton:boolean=false;
  currentUser:any;

  constructor(
    private adminService:AdminService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

        /** spinner starts on init */
        this.spinner.show();

        // Load Our colors using API
        this.adminService.getColors().then(result=>{
          this.colorsRes=result;
          this.colors=this.colorsRes.data;
          sessionStorage.setItem('colors',JSON.stringify(this.colors));
          this.spinner.hide();//hide spinner
        });

        this.currentUser = JSON.parse(localStorage.getItem("currentUser"));

        //add color type form validation
        this.addColorsForm = this.formBuilder.group({
          name: ['', Validators.required]
        });

        //edit color type form validation
        this.editColorsForm = this.formBuilder.group({
          id: ['', Validators.required],
          name: ['', Validators.required]
        });
  }

  serach(val)
  {
    let allColors=JSON.parse(sessionStorage.getItem('colors'));
    let searchColors = allColors.filter(function(color) {
      if(color.name.toLowerCase().search(val)!=-1)
      {
        return true;
      }
    });
    // console.log(searchVehicles);
    this.colors=searchColors;
  }

  get f(){
    return this.addColorsForm.controls;
  }

  submitForm()
  {
    this.submitted = true;
    // stop here if form is invalid
    if (this.addColorsForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableAddButton=true; //disable submit button

    this.adminService.addColor(this.addColorsForm.value)
    .pipe(
        catchError(err => {
          $('#addColorModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#addColorModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/vehicle-colors']);
      }); 
    });
  }

  editColor(id)
  {
    this.spinner.show();

    this.adminService.getColor(id)
    .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;

      this.editColorsForm.patchValue({  
        id: this.response.data.id,  
        name:this.response.data.name
      });
      $('#editColorModal').modal('show');
      this.spinner.hide();//hide spinner
    });
  }

  get fEdit(){
    return this.editColorsForm.controls;
  }
  updateColorForm()
  {
    this.submittedEditForm = true;
    // stop here if form is invalid
    if (this.editColorsForm.invalid) {
        return;
    }

    this.spinner.show();
    this.disableEditButton=true; //disable submit button

    this.adminService.updateColor(this.editColorsForm.value)
    .pipe(
        catchError(err => {
          $('#editColorModal').modal('hide');
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      $('#editColorModal').modal('hide');
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/vehicle-colors']);
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
    this.adminService.colorStatus(id,status)
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

