import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { forkJoin, throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AdminService } from 'src/app/services/admin.service';
declare var $: any;

@Component({
	selector: 'app-step5',
	templateUrl: './step5.component.html',
	styleUrls: ['./step5.component.scss']
})
export class Step5Component implements OnInit, AfterViewChecked {

	public paramResponse: any;
	public vehicleTypeId: string;
	public vehiclesRes: any;
	public vehicles: any[] = [];
	public affiliateId: any;
	public canAddVehicle: boolean = false;
	public currentUser: any = {};
	public vehicleToDelete: number;
	public amenityList: Array<string>;
	public stepCompleted: any;
	public alertMessage: string;
	public showInstructionIfStepNotCompleted: boolean = false;
	affiliate_type: any;
	is_account_accepted: boolean = false

	constructor(
		private affiliateService: AffiliateService,
		private stateManagementService: StateManagementService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private adminService: AdminService,
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
		$('.HeadingH1').css({ display: "block" })
		this.spinner.show(); //show spinner

		this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
		this.affiliateId = this.currentUser?.account_id;

		this.stepCompleted = this.affiliateService?.getLocalStepCompleted();
		if (!this.stepCompleted.includes('5') && this.currentUser?.affiliate_type == 'fleet_operator') {
			this.showInstructionIfStepNotCompleted = true;
		}
		this.is_account_accepted = localStorage.getItem('account_approval') == 'accepted'

		// Load Our vehicles using API
		this.affiliateService.affiliateVehicleList(true).then(result => {
			this.vehiclesRes = result;
			this.vehicles = this.vehiclesRes?.data?.vehicleList;
			this.affiliate_type = this.currentUser?.affiliate_type.toLowerCase()

			if (this.affiliate_type.includes('gig') || this.affiliate_type.includes('taxi')) {
				this.checkCanAddVehicle(1) // only one allowed
			}
			else if (this.affiliate_type.includes('black')) {
				this.checkCanAddVehicle(2)	// only two allowed
			} else {
				this.canAddVehicle = true;
			}

			this.spinner.hide(); //hide spinner
			this.stateManagementService?.setNumberOfVehicles(this.vehiclesRes?.data?.totalNumberOfVehicles);
			setTimeout(() => {
				$('[data-toggle="dropdown"]').tooltip();//Bootstrap tooltip
			}, 500);
		});
	}

	checkCanAddVehicle(numOfVehicles) {
		if (this.vehiclesRes?.data?.totalNumberOfVehicles >= numOfVehicles) {
			this.canAddVehicle = false;
		}
		else {
			console.log('&&&&&&&&&&&&&&&&&&&', this.canAddVehicle)
			this.canAddVehicle = true;
		}
	}

	updateAmenityList(amenityList) {
		this.amenityList = amenityList;
		$('#amenityListModal').modal('show');
	}

	drop(event: CdkDragDrop<any[]>) {
		if (event.previousIndex === event.currentIndex) {
			return;
		}

		const previousVehicles = [...this.vehicles];
		moveItemInArray(this.vehicles, event.previousIndex, event.currentIndex);

		this.spinner.show();

		const fieldDataRequest = this.affiliateService.getFieldsData();
		const vehicleDetailsRequests = this.vehicles.map((vehicle: any) =>
			this.affiliateService.getVehicleData(vehicle.ID || vehicle.id)
		);

		forkJoin([fieldDataRequest, ...vehicleDetailsRequests]).pipe(
			switchMap((responses: any[]) => {
				const fieldData = responses[0]?.data || {};
				const vehicleResponses = responses.slice(1);
				const updateRequests = vehicleResponses.map((response: any, index: number) =>
					this.affiliateService.editVehicle(
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
		const vehicleId = vehicleSummary?.ID || vehicleSummary?.id || vehicleDetails?.id || vehicleDetails?.ID || '';
		const selectedSpecialAmenities = Array.isArray(vehicleDetails?.specialAmenities) ? vehicleDetails.specialAmenities : [];
		const selectedInteriors = Array.isArray(vehicleDetails?.vehicleInterior) ? vehicleDetails.vehicleInterior : [];
		const chargableAmenitiesArray = this.extractAmenityIdsFromGroup(vehicleDetails?.chargableAmenities);
		const nonChargableAmenitiesArray = this.extractAmenityIdsFromGroup(vehicleDetails?.nonChargableAmenities);
		const amenities = [...new Set([...chargableAmenitiesArray, ...nonChargableAmenitiesArray])];

		return {
			id: vehicleId,
			vehicleType: parseInt(vehicleDetails?.vehicle_type || vehicleDetails?.vehicleType || vehicleDetails?.vehicleType_id, 10) || '',
			make: parseInt(vehicleDetails?.make, 10) || '',
			model: parseInt(vehicleDetails?.model, 10) || '',
			year: parseInt(vehicleDetails?.year, 10) || '',
			color: parseInt(vehicleDetails?.color, 10) || '',
			licensePlate: vehicleDetails?.license_plate || vehicleDetails?.licensePlate || '',
			numberOfVehicles: vehicleDetails?.numberOfVehicles || vehicleDetails?.number_of_vehicles || 1,
			seats: vehicleDetails?.seats || '',
			luggage: vehicleDetails?.luggage || '',
			charterCancelPolicy: vehicleDetails?.charterCancelPolicy || '24',
			nonCharterCancelPolicy: vehicleDetails?.nonCharterCancelPolicy || '24',
			typeOfService: Array.isArray(vehicleDetails?.typeOfService) ? vehicleDetails.typeOfService : [],
			chargableAmenitiesArray: chargableAmenitiesArray,
			nonChargableAmenitiesArray: nonChargableAmenitiesArray,
			amenities: amenities,
			specialAmenitiesGet: this.buildBooleanSelectionArray(fieldData?.specialAmenities, selectedSpecialAmenities),
			specialAmenities: selectedSpecialAmenities,
			vehicleInteriorGet: this.buildBooleanSelectionArray(fieldData?.vehicleInterior, selectedInteriors),
			vehicleInterior: selectedInteriors,
			vehicle_image_1: vehicleDetails?.vehicle_image_1?.ID || '',
			vehicle_image_2: vehicleDetails?.vehicle_image_2?.ID || '',
			vehicle_image_3: vehicleDetails?.vehicle_image_3?.ID || '',
			vehicle_image_4: vehicleDetails?.vehicle_image_4?.ID || '',
			vehicle_image_5: vehicleDetails?.vehicle_image_5?.ID || '',
			vehicle_image_6: vehicleDetails?.vehicle_image_6?.ID || '',
			vehicle_image_7: vehicleDetails?.vehicle_image_7?.ID || '',
			vehicle_image_8: vehicleDetails?.vehicle_image_8?.ID || '',
			vehicle_image_9: vehicleDetails?.vehicle_image_9?.ID || '',
			rearPlateImage: vehicleDetails?.rear_plate_image?.ID || '',
			windowPermitImage: vehicleDetails?.window_permitImage?.ID || '',
			windowPermit2Image: vehicleDetails?.window_permitImage2?.ID || '',
			usdotPermitImage: vehicleDetails?.usdot_permitImage?.ID || '',
			mcImage: vehicleDetails?.mc_image?.ID || '',
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

	addVehicleClick(vehicleTypeId) {
		this.router.navigate(['/affiliate/step5/add-vehicle'], { queryParams: { vehicleTypeId: vehicleTypeId } });
	}

	clickEditVehicle(vehicleId) {
		this.router.navigate(['/affiliate/step5/edit-vehicle'], { queryParams: { vehicleId: vehicleId, vehicleTypeId: this.vehicleTypeId } });
	}

	clickDuplicateVehicle(vehicleId) {
		this.router.navigate(['/affiliate/step5/duplicate-vehicle'], { queryParams: { duplicateVehicleId: vehicleId } });
	}

	clickEditVehicleRates(vehicleId) {
		this.router.navigate(['/affiliate/step5/edit-vehicle-rates'], { queryParams: { vehicleId: vehicleId, vehicleTypeId: this.vehicleTypeId } });
	}

	enableDisableClicked(id) {
		this.vehicleToDelete = id;
		this.alertMessage = "Are you sure you want to delete this Vehicle?"
	}

	delete() {
		this.stateManagementService.setprogressBar(true);
		var status = 'disable';
		$('#deleteConfirmationModal').modal('hide');

		this.affiliateService.vehicleStatus(this.vehicleToDelete, status)
			.pipe(
				catchError(err => {
					this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			).subscribe(result => {
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
					this.router.navigate(['/affiliate/step5']);
				});
				this.stateManagementService.setprogressBar(false);
			});

	}
}
