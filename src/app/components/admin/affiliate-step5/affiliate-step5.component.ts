import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
declare var $: any;

@Component({
	selector: 'app-affiliate-step5',
	templateUrl: './affiliate-step5.component.html',
	styleUrls: ['./affiliate-step5.component.scss']
})
export class AffiliateStep5Component implements OnInit {

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
	public showInstructionIfStepNotCompleted: boolean = false;
	currentUser: any;
	affiliateType: string;

	constructor(
		private adminService: AdminService,
		private router: Router,
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
		// this.stateManagementService.setprogressBar(true);
		this.affiliateType = sessionStorage.getItem("affiliateType");

		this.affiliateId = sessionStorage.getItem("affiliateId");

		this.stepCompleted = this.adminService.getLocalStepsCompleted();
		if (!this.stepCompleted.includes('5') && this.affiliateType == 'fleet_operator') {
			this.showInstructionIfStepNotCompleted = true;
		}

		// Load Our vehicles using API
		this.adminService.adminAffiliateVehicleList(this.affiliateId).then(result => {
			this.vehiclesRes = result;
			this.vehicles = this.vehiclesRes.data.vehicleList;

			switch (sessionStorage.getItem("affiliateType")) {
				case 'gig_operator':
					this.instructionBasedOnAffiliate = 'Note : Gig Drivers can enter only 1 vehicle.';
					this.checkCanAddVehicle(1)
					break;
				case 'taxi_operator':
					this.instructionBasedOnAffiliate = 'Note : Taxi Operators can enter only 1 vehicle.';
					this.checkCanAddVehicle(1)
					break;
				case 'black_limo_operator':
					this.instructionBasedOnAffiliate = 'Click ⊕ Add Vehicle - If Different Year, Make, Model.';
					this.checkCanAddVehicle(2)
					break;
				case 'fleet_operator':
					this.instructionBasedOnAffiliate = 'Click ⊕ Add Vehicle - If Different Year, Make, Model.';
					this.canAddVehicle = true;//can add any number of vehicles
					break;
			}
			// this.stateManagementService.setprogressBar(false);
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
		this.router.navigate(['/admin/affiliate/step5/add-vehicle'], { queryParams: { vehicleTypeId: vehicleTypeId } });
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
					this.router.navigate(['/admin/affiliate/step5']);
				});

				// this.stateManagementService.setprogressBar(false);
			});
	}

	clickEditVehicle(vehicleId) {
		this.router.navigate(['/admin/affiliate/step5/edit-vehicle'], { queryParams: { vehicleId: vehicleId, vehicleTypeId: this.vehicleTypeId } });
	}

	clickEditVehicleRates(vehicleId) {
		this.router.navigate(['/admin/affiliate/step5/edit-vehicle-rates'], { queryParams: { vehicleId: vehicleId, vehicleTypeId: this.vehicleTypeId } });
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

