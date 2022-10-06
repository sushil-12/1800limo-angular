import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import {Router} from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-affiliate-step6',
  templateUrl: './affiliate-step6.component.html',
  styleUrls: ['./affiliate-step6.component.scss']
})
export class AffiliateStep6Component implements OnInit {

  public affiliateId:string;
  public affiliateType:string;
  public stepCompleted:string;
  public submittedForm:boolean;
  public response:any;

  constructor(
    private adminService:AdminService,
    private router: Router,
    private spinner: NgxSpinnerService
    ) { }

  ngOnInit(): void {
  }

  submitForm()
  {
    this.spinner.show();
    this.affiliateId=sessionStorage.getItem("affiliateId");
    this.affiliateType=sessionStorage.getItem("affiliateType");
    this.stepCompleted=sessionStorage.getItem("stepCompleted");

    const data:Object={
      acc_id:this.affiliateId,
      Accept:true
    };

    this.adminService.affiliateTermsAccept(data)
    .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
    )
    .subscribe(result=>{
      this.response=result;
      this.spinner.hide();//hide spinner
      
      switch(this.affiliateType)
      {
        case 'fleet_operator':{
          this.router.navigate(['/admin/black-car-limo-bus-admin']);
          break; 
        }
        case 'taxi_operator':{
          this.router.navigate(['/admin/taxi-admin']);
          break; 
        }
        case 'gig_operator':{
          this.router.navigate(['/admin/gig-admin']);
          break; 
        }
      }
    });
  }
}
