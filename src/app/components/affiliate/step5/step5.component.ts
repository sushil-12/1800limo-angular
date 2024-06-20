import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
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
	public vehicles: any;
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
				this.router.navigate(['/affiliate/step5']);
			});
			this.spinner.hide();
			// console.log(response.data)
		})
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

