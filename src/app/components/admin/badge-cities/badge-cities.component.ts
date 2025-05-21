import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
declare var $ : any;
@Component({
  selector: 'app-badge-cities',
  templateUrl: './badge-cities.component.html',
  styleUrls: ['./badge-cities.component.scss']
})
export class BadgeCitiesComponent implements OnInit {
  Cities: any;

  public editCityForm: FormGroup;
  public addCityForm: FormGroup;
  color: ThemePalette = 'accent';
  
  constructor( 
    private adminService:AdminService,
    private router: Router,
		private $errors: ErrorDialogService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder) {
    { }
   }

  ngOnInit(): void {
    this.spinner.show();

    // Load Our colors using API
   this.getAllBadgeCities()
    this.addCityForm = this.formBuilder.group({
      name: ['', [Validators.required]]
    });

    //edit year type form validation
    this.editCityForm = this.formBuilder.group({
      id: ['', Validators.required],
      name: ['', [Validators.required ]]
    });
  }

  getAllBadgeCities(){
    this.adminService.getAllBadgeCities().pipe(
      catchError((err) => {
        this.spinner.hide(); //hide spinner	
        return throwError(err);
      })
    )
    .subscribe((response: any) => {
      console.log('response of get badge cities-->>' , response)
      this.Cities = response?.data
      this.spinner.hide()
    })
  }
  get f(){
    return this.editCityForm.controls;
  }
  get addForm(){
    return this.addCityForm.controls;
  }
  editCity(selectedCity:any){
    this.editCityForm.patchValue({
      id:selectedCity.id,
      name:selectedCity.name
    })
    this.editCityForm.updateValueAndValidity();
    $('#editCityModal').modal('show');

  }
  updateCityForm()
  {
    let body ={
      id:this.editCityForm.get('id')?.value,
      name: this.editCityForm.get('name')?.value
    }
    console.log('data----->>>',body)
    this.spinner.show();
    this.adminService.updateBadgeCity(body).pipe(
          catchError(err => {
            this.spinner.hide();//hide spinner
            return throwError(err);
          })
      ).subscribe((response: any) => {
        $('#editCityModal').modal('hide');
			this.$errors.openDialog({
				errors: {
					error: `<span class='text-success'>${response.message}</span>`
				}
			})
      this.getAllBadgeCities();
			this.spinner.hide()
		})
  }

  submitForm(){
    this.spinner.show();
    this.adminService.addBadgeCity({name:this.addCityForm.get('name')?.value}).pipe(
          catchError(err => {
            this.spinner.hide();//hide spinner
            return throwError(err);
          })
      ).subscribe((response: any) => {
        $('#addCityModal').modal('hide');
        this.addCityForm.patchValue({
          name:""
        })
			this.$errors.openDialog({
				errors: {
					error: `<span class='text-success'>${response.message}</span>`
				}
			})
      this.getAllBadgeCities();
			this.spinner.hide()
		})
  }
  enableDisableClicked(event,id:any){
    this.spinner.show();
    console.log(event.checked);
    let body ={
      id:id,
      status:''
    }
    if(event.checked)
    {
      body['status']='enable';
    }
    else
    {
      body['status']='disable';
    }
    this.adminService.updateBadgeCityStatus(body).pipe(
          catchError(err => {
            this.spinner.hide();//hide spinner
            return throwError(err);
          })
      ).subscribe((response: any) => {
			this.$errors.openDialog({
				errors: {
					error: `<span class='text-success'>${response.message}</span>`
				}
			})
      this.getAllBadgeCities();
			this.spinner.hide()
		})
  }

}
