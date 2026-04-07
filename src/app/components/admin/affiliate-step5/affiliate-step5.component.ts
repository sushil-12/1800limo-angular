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
	public vehicles: any[] = [];
	public vehicleToDelete: number;
	public affiliateId: any;
	public showInstructionIfStepNotCompleted: boolean = false;
	currentUser: any;
	affiliateType: string;
	public isLoading: boolean = true;

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
		// this.stateManagementService.setprogressBar(true);
		this.affiliateType = sessionStorage.getItem("affiliateType");

		this.affiliateId = sessionStorage.getItem("affiliateId");

		this.stepCompleted = this.adminService.getLocalStepsCompleted();
		if (!this.stepCompleted.includes('5') && this.affiliateType == 'fleet_operator') {
			this.showInstructionIfStepNotCompleted = true;
		}

		// Load Our vehicles using API
		this.isLoading = true;
		this.spinner.show();
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
			this.isLoading = false;
			this.spinner.hide();
		}).catch(err => {
			this.isLoading = false;
			this.spinner.hide();
			console.error(err);
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
		this.spinner.show();
		var status = 'disable';
		$('#deleteConfirmationModal').modal('hide');

		this.adminService.vehicleStatus(this.vehicleToDelete, status)
			.pipe(
				catchError(err => {
					this.spinner.hide();
					return throwError(err);
				})
			).subscribe(result => {
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
					this.router.navigate(['/admin/affiliate/step5']);
					this.spinner.hide();
				});

			});
	}


	drop(event: CdkDragDrop<any[]>) {
		if (event.previousIndex === event.currentIndex) {
			return;
		}

		const previousVehicles = [...this.vehicles];
		moveItemInArray(this.vehicles, event.previousIndex, event.currentIndex);
		this.applySequentialSortOrders();

		this.spinner.show();
		const payload = {
			sort_orders: this.vehicles.map((vehicle: any, index: number) => ({
				id: vehicle.ID || vehicle.id,
				sort_order: index + 1
			}))
		};

		this.adminService.adminAffiliateUpdateVehicleSortOrders(payload).pipe(
			catchError(err => {
				this.vehicles = previousVehicles;
				this.applySequentialSortOrders();
				this.spinner.hide();
				return throwError(err);
			})
		).subscribe(() => {
			this.spinner.hide();
		});
	}

	private applySequentialSortOrders() {
		this.vehicles = this.vehicles.map((vehicle: any, index: number) => ({
			...vehicle,
			sort_order: index + 1
		}));
	}

	clickEditVehicle(vehicleId) {
		this.router.navigate(['/admin/affiliate/step5/edit-vehicle'], { queryParams: { vehicleId: vehicleId, vehicleTypeId: this.vehicleTypeId } });
	}

	clickedDuplicateVehicle(vehicleId) {
		this.router.navigate(['/admin/affiliate/step5/duplicate-vehicle'], { queryParams: { vehicleId: vehicleId, vehicleTypeId: this.vehicleTypeId, new: true, duplicateVehcile: true } });
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
