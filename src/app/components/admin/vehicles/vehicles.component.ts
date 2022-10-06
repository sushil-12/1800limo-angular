import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
// import { FormGroup, FormBuilder, Validators, FormArray, FormControl} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {ThemePalette} from '@angular/material/core';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {

  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  public paramResponse:any;
  public vehicleTypeId:string;
  public vehiclesRes:any;
  public vehicles:any;

  constructor(
    private adminService:AdminService,
    private router: Router,
    private spinner: NgxSpinnerService,
    // private formBuilder: FormBuilder,
    private activatedroute:ActivatedRoute) { }

  ngOnInit(): void {

      /** spinner starts on init */
      this.spinner.show();

      //pick vehicle id from query params
      this.activatedroute.queryParamMap
        .subscribe((params) => {
          this.paramResponse= { ...params.keys, ...params };
          this.vehicleTypeId=this.paramResponse.params.vehicleTypeId;
          if(!this.vehicleTypeId)
          {
            this.router.navigate(['/admin/master-vehicle-types']);
          }
        }
      );
        // Load Our vehicles using API
        this.adminService.vehicles(this.vehicleTypeId).then(result=>{
          this.vehiclesRes=result;
          this.vehicles=this.vehiclesRes.data;
          // sessionStorage.setItem('vehicles',JSON.stringify(this.vehicles));
          this.spinner.hide();//hide spinner
        });
  }

  addVehicleClick(vehicleTypeId)
  {
    // console.log(vehicleTypeId);
    this.router.navigate(['/admin/add-vehicle'],{queryParams:{vehicleTypeId:vehicleTypeId}});
  }

  clickEditVehicle(vehicleId)
  {
    this.router.navigate(['/admin/edit-vehicle'],{queryParams:{vehicleId:vehicleId,vehicleTypeId:this.vehicleTypeId}});
  }

  clickEditVehicleRates(vehicleId)
  {
    this.router.navigate(['/admin/edit-vehicle-rates'],{queryParams:{vehicleId:vehicleId,vehicleTypeId:this.vehicleTypeId}});
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
    this.adminService.vehicleStatus(id,status)
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
