import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { forkJoin, throwError } from 'rxjs';
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


	drop(event: CdkDragDrop<any[]>) {
		if (event.previousIndex === event.currentIndex) {
			return;
		}

		const previousVehicles = [...this.vehicles];
		moveItemInArray(this.vehicles, event.previousIndex, event.currentIndex);

		this.spinner.show();

		const fieldDataRequest = this.adminService.adminAffiliateGetFieldsData();
		const vehicleDetailsRequests = this.vehicles.map((vehicle: any) =>
			this.adminService.adminAffiliateGetVehicleData(vehicle.ID || vehicle.id)
		);

		forkJoin([fieldDataRequest, ...vehicleDetailsRequests]).pipe(
			switchMap((responses: any[]) => {
				const fieldData = responses[0]?.data || {};
				const vehicleResponses = responses.slice(1);
				const updateRequests = vehicleResponses.map((response: any, index: number) =>
					this.adminService.adminAffiliateEditVehicle(
						this.buildAffiliateVehicleUpdatePayload(
							response.data,
							this.vehicles[index],
							fieldData,
							index + 1
						)
					)
				);

				return forkJoin(updateRequests);
			}),
			catchError(err => {
				this.vehicles = previousVehicles;
				this.spinner.hide();
				return throwError(err);
			})
		).subscribe(() => {
			this.spinner.hide();
		});
	}

	private buildAffiliateVehicleUpdatePayload(vehicleDetails: any, vehicleSummary: any, fieldData: any, sortOrder: number) {
		const selectedAmenities = this.extractSelectedAmenityIds(vehicleDetails);
		const specialAmenities = Array.isArray(vehicleDetails.specialAmenities) ? vehicleDetails.specialAmenities : [];
		const vehicleInterior = Array.isArray(vehicleDetails.vehicleInterior) ? vehicleDetails.vehicleInterior : [];
		const vehicleId = vehicleSummary?.ID || vehicleSummary?.id || vehicleDetails.id || vehicleDetails.ID || '';
		const relativeVehicleId = vehicleSummary?.ID || vehicleSummary?.id || vehicleId;
		const specialAmenitiesGet = this.buildBooleanSelectionArray(fieldData?.specialAmenities, specialAmenities);
		const vehicleInteriorGet = this.buildBooleanSelectionArray(fieldData?.vehicleInterior, vehicleInterior);

		return {
			acc_id: '',
			affiliate_type: this.affiliateType,
			id: vehicleId,
			relative_vehicle_id: relativeVehicleId,
			vehicleType: parseInt(vehicleDetails.vehicle_type || vehicleDetails.vehicleType || vehicleDetails.vehicleType_id, 10) || '',
			make: vehicleDetails.make || '',
			model: vehicleDetails.model || '',
			year: vehicleDetails.year || '',
			color: vehicleDetails.color || '',
			licensePlate: vehicleDetails.license_plate || vehicleDetails.licensePlate || '',
			numberOfVehicles: vehicleDetails.numberOfVehicles || vehicleDetails.number_of_vehicles || 1,
			seats: vehicleDetails.seats || '',
			luggage: vehicleDetails.luggage || '',
			charterCancelPolicy: vehicleDetails.charterCancelPolicy || '24',
			nonCharterCancelPolicy: vehicleDetails.nonCharterCancelPolicy || '24',
			typeOfService: Array.isArray(vehicleDetails.typeOfService) ? vehicleDetails.typeOfService : [],
			amenities: selectedAmenities,
			specialAmenitiesGet: specialAmenitiesGet,
			specialAmenities: specialAmenities,
			vehicleInteriorGet: vehicleInteriorGet,
			vehicleInterior: vehicleInterior,
			vehicle_image_1: vehicleDetails.vehicle_image_1?.ID || '',
			vehicle_image_2: vehicleDetails.vehicle_image_2?.ID || '',
			vehicle_image_3: vehicleDetails.vehicle_image_3?.ID || '',
			vehicle_image_4: vehicleDetails.vehicle_image_4?.ID || '',
			vehicle_image_5: vehicleDetails.vehicle_image_5?.ID || '',
			vehicle_image_6: vehicleDetails.vehicle_image_6?.ID || '',
			vehicle_image_7: vehicleDetails.vehicle_image_7?.ID || '',
			vehicle_image_8: vehicleDetails.vehicle_image_8?.ID || '',
			vehicle_image_9: vehicleDetails.vehicle_image_9?.ID || '',
			rearPlateImage: vehicleDetails.rear_plate_image?.ID || '',
			windowPermitImage: vehicleDetails.window_permitImage?.ID || '',
			windowPermit2Image: vehicleDetails.window_permitImage2?.ID || '',
			usdotPermitImage: vehicleDetails.usdot_permitImage?.ID || '',
			mcImage: vehicleDetails.mc_image?.ID || '',
			sort_order: sortOrder
		};
	}

	private buildBooleanSelectionArray(optionList: any, selectedValues: any[]): boolean[] {
		if (!Array.isArray(optionList) || !optionList.length) {
			return [];
		}

		const selectedSet = new Set((selectedValues || []).map((value: any) => String(value)));
		return optionList.map((item: any) => selectedSet.has(String(item?.id)));
	}

	private extractSelectedAmenityIds(vehicleDetails: any): any[] {
		if (Array.isArray(vehicleDetails.amenities)) {
			return vehicleDetails.amenities;
		}

		const selectedAmenityIds = [
			...this.extractAmenityIdsFromGroup(vehicleDetails.chargableAmenities),
			...this.extractAmenityIdsFromGroup(vehicleDetails.nonChargableAmenities)
		];

		return [...new Set(selectedAmenityIds)];
	}

	private extractAmenityIdsFromGroup(amenityGroup: any): any[] {
		const amenityIds: any[] = [];
		if (!amenityGroup) {
			return amenityIds;
		}

		Object.values(amenityGroup).forEach((group: any) => {
			const amenities = Array.isArray(group) ? group : Object.values(group || {});
			amenities.forEach((amenity: any) => {
				if (amenity?.isSelected && amenity?.id !== undefined && amenity?.id !== null) {
					amenityIds.push(amenity.id);
				}
			});
		});

		return amenityIds;
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
