import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
declare var $ : any;
@Component({
  selector: 'app-badge-cities',
  templateUrl: './badge-cities.component.html',
  styleUrls: ['./badge-cities.component.scss']
})
export class BadgeCitiesComponent implements OnInit {

  constructor( 
    private adminService:AdminService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder) {
    { }
   }

  ngOnInit(): void {
    this.spinner.show();

    // Load Our colors using API
    this.adminService.getBadgeCities().pipe(
      catchError((err) => {
        this.spinner.hide(); //hide spinner	
        return throwError(err);
      })
    )
    .subscribe((response: any) => {
      console.log('response of get badge cities-->>' , response)
      this.spinner.hide()
    })
  }


  editBadgeCity(id)
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

      // this.editColorsForm.patchValue({  
      //   id: this.response.data.id,  
      //   name:this.response.data.name
      // });
      // $('#editColorModal').modal('show');
      this.spinner.hide();//hide spinner
    });
  }

}
