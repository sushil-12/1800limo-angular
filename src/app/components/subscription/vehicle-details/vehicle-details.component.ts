import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $: any;

@Component({
	selector: 'app-vehicle-details',
	templateUrl: './vehicle-details.component.html',
	styleUrls: ['./vehicle-details.component.scss']
})
export class VehicleDetailsComponent implements OnInit {

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
	public affiliateId: any;
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
		if (sessionStorage.getItem('msg')) {
			$('#firstVehicleAddedModal').modal('show');
			sessionStorage.removeItem('msg')
		}

		// this.affiliateId = sessionStorage.getItem("affiliateId");
		this.affiliateId = JSON.parse(localStorage.getItem("currentUser"))?.account_id

		// Load Our vehicles using API
		this.adminService.adminAffiliateVehicleList(this.affiliateId).then(result => {
			this.vehiclesRes = result;
			this.vehicles = this.vehiclesRes.data.vehicleList;
			if (this.vehiclesRes?.data?.can_add_vehicle) {
				this.instructionBasedOnAffiliate = 'Click ⊕ Add Vehicle - If Different Year, Make, Model.'
			}
			else if(this.vehiclesRes?.data?.max_vehicles == 2){
				this.instructionBasedOnAffiliate = 'Pay $25 to add an additional vehicle.'
			}
			else{
				this.instructionBasedOnAffiliate = 'You are not permitted to add more vehicles based on your current subscription.'
			}

			this.checkCanAddVehicle(this.vehiclesRes?.data?.max_vehicles)

			this.stateManagementService.setprogressBar(false);
			this.stateManagementService.setNumberOfVehicles(this.vehiclesRes.data.totalNumberOfVehicles);
			setTimeout(() => {
				$('[data-toggle="dropdown"]').tooltip();//Bootstrap tooltip
			}, 500);
		});
	}

	checkCanAddVehicle(numOfVehicles) {
		if (this.vehiclesRes.data.totalNumberOfVehicles >= numOfVehicles) {
			this.canAddVehicle = false;
		}
		else {
			this.canAddVehicle = true;
		}
	}

	addVehicleClick(vehicleTypeId) {
		// console.log(vehicleTypeId);
		this.router.navigate(['/admin/add-vehicle-subscriber'], { queryParams: { vehicleTypeId: vehicleTypeId } });
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
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
					this.router.navigate(['/admin/vehicle-details']);
				});

				// this.stateManagementService.setprogressBar(false);
			});
	}


	clickEditVehicle(vehicleId) {
		this.router.navigate(['/admin/edit-vehicle-subscriber'], { queryParams: { vehicleId: vehicleId, vehicleTypeId: this.vehicleTypeId } });
	}

	clickEditVehicleRates(vehicleId) {
		this.router.navigate(['/admin/edit-vehicle-rates-subscriber'], { queryParams: { vehicleId: vehicleId, vehicleTypeId: this.vehicleTypeId } });
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

