import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $: any;

@Component({
  selector: 'app-loose-affiliate-vehicles',
  templateUrl: './loose-affiliate-vehicles.component.html',
  styleUrls: ['./loose-affiliate-vehicles.component.scss']
})
export class LooseAffiliateVehiclesComponent implements OnInit {

  checked = false;
    disabled = false;
  
    public paramResponse: any;
    public stepCompleted: any;
    public vehicleTypeId: string;
    public amenityList: Array<string>;
    public vehiclesRes: any;
    public canAddVehicle: boolean = false;
    public alertMessage: string;
    public instructionBasedOnAffiliate: string;
    public vehicles: any;
    public vehicleToDelete: number;
    public looseAffId: any;
    public showInstructionIfStepNotCompleted: boolean = false;
    currentUser: any;
    affiliateType: string;
  
    constructor(
      private adminService: AdminService,
      private router: Router,
      private spinner: NgxSpinnerService,
      private stateManagementService: StateManagementService,
      private activatedroute: ActivatedRoute) { }
  
    ngAfterViewChecked() {
      $(".dropdown-toggle").tooltip({
        trigger: 'hover'
      });
      $(".dropdown-toggle").on('mouseleave', function () {
        $(this).tooltip('dispose');
      });
      $(".dropdown-toggle").on('click', function () {
        $(this).tooltip('dispose');
      });
    }
    ngOnInit(): void {
  

      this.activatedroute.queryParamMap
			.subscribe((params) =>
			{
        this.paramResponse = { ...params.keys, ...params };
				this.looseAffId = this.paramResponse.params.looseAffId;
			});
  
      // Load Our vehicles using API
      this.adminService.adminLooseAffVehList(this.looseAffId).then(result => {
        this.vehiclesRes = result;
        this.vehicles = this.vehiclesRes.data.vehicleList;
      });

    }
  
    addVehicleClick(vehicleTypeId) {
      // console.log(vehicleTypeId);
      this.router.navigate(['/admin/add-vehicle-loose-affiliate'], { queryParams: { looseAffId:this.looseAffId , vehicleTypeId: vehicleTypeId } });
    }
    delete() {
      // this.stateManagementService.setprogressBar(true);
      var status = 'disable';
      $('#deleteConfirmationModal').modal('hide');
  
      this.adminService.vehicleStatus(this.vehicleToDelete, status)
        .pipe(
          catchError(err => {
            // this.stateManagementService.setprogressBar(false);
            return throwError(err);
          })
        ).subscribe(result => {
          if(this.looseAffId){
            this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/admin/loose-affliate-vehicles'], { queryParams: { looseAffId: this.looseAffId } });
            });
          }
          else{
            this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/admin/affiliate/step5']);
            });
          }
         
  
          // this.stateManagementService.setprogressBar(false);
        });
    }
  
  
    drop(event: CdkDragDrop<string[]>) {
      // moveItemInArray(this.vehicles, event.previousIndex, event.currentIndex);'
      console.log(event, "check event")
      console.log("previous index", event.previousIndex)
      console.log("current index", event.currentIndex)
      this.spinner.show();
      let id = this.vehicles[event.previousIndex].ID
      console.log(id, "////////////")
      this.adminService.changeSortOrder({ vehicle_id: id, currentIndex: event.currentIndex, previousIndex: event.previousIndex, type: "affiliate-vehicle" }).subscribe((response: any) => {
        this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/admin/affiliate/step5']);
        });
        this.spinner.hide();
        // console.log(response.data)
      })
    }

    clickEditVehicle(vehicleId) {
      this.router.navigate(['/admin/edit-vehicle-subscriber'], { queryParams: { looseAffId:this.looseAffId , vehicleId: vehicleId, vehicleTypeId: this.vehicleTypeId } });
    }
  
    clickEditVehicleRates(vehicleId) {
      this.router.navigate(['/admin/edit-vehicle-rates-subscriber'], { queryParams: { looseAffId:this.looseAffId , vehicleId: vehicleId, vehicleTypeId: this.vehicleTypeId } });
    }
  
    updateAmenityList(amenityList) {
      console.log(this.amenityList, "dfguadgfugsduyfyasdfytdyuftyudtfygtsyftjsdygfasdyut")
      this.amenityList = amenityList;
      $('#amenityListModal').modal('show');
    }
    enableDisableClicked(id) {
      this.vehicleToDelete = id;
      this.alertMessage = "Are you sure you want to delete this Vehicle?"
    }
  
  }
  
  