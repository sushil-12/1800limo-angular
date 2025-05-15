import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { StateManagementService } from '../../../services/statemanagement.service';
declare var $: any;

@Component({
	selector: 'app-affiliate-step4',
	templateUrl: './affiliate-step4.component.html',
	styleUrls: ['./affiliate-step4.component.scss']
})
export class AffiliateStep4Component implements OnInit {

	color: ThemePalette = 'primary';
	checked = false;
	disabled = false;

	public paramResponse: any;
	public accountId: string;
	public affiliateType: string;
	public accountType: string;
	public driverId: string;
	public driverRes: any;
	public driverList: any;
	public affiliateId: any;
	public driverToDelete: number;
	public alertMessage: string;
	public storeId: number;
	public storeStatus: string;

	public firstPage: Number;
	public lastPage: Number;
	public totalPage: Number;
	public currentPage: Number;
	public from: Number;
	public to: Number;
	public path: string;
	public firstPageUrl: string;
	public lastPageUrl: string;
	public prevPageUrl: string;
	public nextPageUrl: string;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private stateManagementService: StateManagementService,
		private spinner: NgxSpinnerService,
		private activatedroute: ActivatedRoute) { }

	ngOnInit(): void {

		/** spinner starts on init */
		this.affiliateType = sessionStorage.getItem("affiliateType");
		this.affiliateId = sessionStorage.getItem("affiliateId");
		this.loadDriver();//load driver
	}

	enableDisableClicked(id) {
		this.driverToDelete = id;
		this.alertMessage = "Are you sure you want to delete this Driver?"
	}
	loadDriver() {
		// this.stateManagementService.setprogressBar(true);
		// Load Our driver using API
		this.adminService.driverList(this.affiliateId).then(result => {
			this.driverRes = result;
			this.driverList = this.driverRes.data.data;
			// this.stateManagementService.setprogressBar(false);
		})
	}
	driverAccountStatus(id, param) {
		this.storeId = id;
		this.storeStatus = param;
	}

	addDriverClick(accountId) {
		this.router.navigate(['/admin/affiliate/step4/add-driver']);
	}

	clickEditDriver(driverId) {
		this.router.navigate(['/admin/affiliate/step4/add-driver'], { queryParams: { driverId: driverId } });
	}
	// Suspend or continue driver
	accountStatus(accountStatus) {
		// this.stateManagementService.setprogressBar(true);
		$('#suspendModal').modal('hide');
		console.log("value is", accountStatus)
		this.adminService.driverStatus(this.storeId, accountStatus)
			.pipe(
				catchError(err => {
					// this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			).subscribe(result => {
				// this.stateManagementService.setprogressBar(false);
			});
		if (accountStatus == 'enable') {
			$('#Continue_' + this.storeId).addClass('checkedContinueLabel');
			$('#Suspend_' + this.storeId).removeClass('checkedSuspendLabel');
		} else if (accountStatus == 'suspend') {
			$('#Suspend_' + this.storeId).addClass('checkedSuspendLabel');
			$('#Continue_' + this.storeId).removeClass('checkedContinueLabel');
		}
	}
	//Delete Driver
	delete() {
		// this.stateManagementService.setprogressBar(true);
		var status = 'disable';
		$('#deleteConfirmationModal').modal('hide');

		this.adminService.driverStatus(this.driverToDelete, status)
			.pipe(
				catchError(err => {
					// this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			).subscribe(result => {
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
					this.router.navigate(['/admin/affiliate/step4']);
				});
				// this.stateManagementService.setprogressBar(false);
			});
	}

	//for paginator
	counter() {
		var currentPage;
		var startFrom;
		var endTo;

		if (this.currentPage as number < 5) {
			startFrom = 0;
			endTo = 5;
		}
		else if (this.currentPage < this.totalPage) {
			currentPage = this.currentPage
			endTo = currentPage + 1;
			startFrom = endTo - 5;
		}
		else {
			endTo = this.totalPage;
			startFrom = endTo - 5;
		}

		var i;
		var udpArr = new Array();
		for (i = startFrom; i < endTo; i++) {
			udpArr.push(i + 1);
		}
		return udpArr;
	}
}
