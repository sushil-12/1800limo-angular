import { Component, OnInit } from '@angular/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { StateManagementService } from '../../../services/statemanagement.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
declare var $: any;

@Component({
	selector: 'app-step4',
	templateUrl: './step4.component.html',
	styleUrls: ['./step4.component.scss']
})
export class Step4Component implements OnInit {

	public paramResponse: any;
	public accountId: string;
	public accountType: string;
	public driverId: string;
	public driverRes: any;
	public driverList: any;
	public affiliateId: any;
	public affiliateType: string;
	public alertMessage: string;

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
	public driverToDelete: number;
	public storeId: number;
	public storeStatus: string;
	message: any;
	eventId: any;

	constructor(
		private affiliateService: AffiliateService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private stateManagementService: StateManagementService,
		private activatedroute: ActivatedRoute) { }

	ngOnInit(): void {
		$('.HeadingH1').css({ display: "block" })
		const currentUser = JSON.parse(localStorage.getItem("currentUser"));
		this.affiliateId = currentUser.account_id;
		this.affiliateType = currentUser.affiliate_type;
		this.loadDriver();//load driver
	}

	// Suspend or continue driver
	accountStatus(accountStatus) {
		this.stateManagementService.setprogressBar(true);
		$('#suspendModal').modal('hide');
		console.log("value is", accountStatus)
		this.affiliateService.driverStatus(this.storeId, accountStatus)
			.pipe(
				catchError(err => {
					this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			).subscribe(result => {
				this.stateManagementService.setprogressBar(false);
				if (accountStatus == 'enable') {
					$('#Continue_' + this.storeId).addClass('checkedContinueLabel');
					$('#Suspend_' + this.storeId).removeClass('checkedSuspendLabel');
				} else if (accountStatus == 'suspend') {
					$('#Suspend_' + this.storeId).addClass('checkedSuspendLabel');
					$('#Continue_' + this.storeId).removeClass('checkedContinueLabel');
				}
			});

	}

	loadDriver() {
		this.spinner.show(); //show spinner
		// Load Our driver using API
		this.affiliateService.driverList().then(result => {
			this.driverRes = result;
			this.driverList = this.driverRes.data.data;
			this.spinner.hide(); //hide spinner
		}).
			catch(err => {
				this.spinner.hide(); //hide spinner
			});
	}

	addDriverClick(accountId) {
		this.router.navigate(['/affiliate/step4/add-driver']);
	}

	clickEditDriver(driverId) {
		this.router.navigate(['/affiliate/step4/add-driver'], { queryParams: { driverId: driverId } });
	}

	enableDisableClicked(id) {
		this.driverToDelete = id;
		this.alertMessage = "Are you sure you want to delete this Driver?"
	}

	driverAccountStatus(id, param) {
		this.storeId = id;
		this.storeStatus = param;
	}

	//Delete Driver
	delete() {
		this.stateManagementService.setprogressBar(true);
		var status = 'disable';
		$('#deleteConfirmationModal').modal('hide');

		this.affiliateService.driverStatus(this.driverToDelete, status)
			.pipe(
				catchError(err => {
					this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			).subscribe(result => {
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
					this.router.navigate(['/affiliate/step4']);
				});
				this.stateManagementService.setprogressBar(false);
			});
	}

	//for paginator
	counter() {
		var currentPage;
		var startFrom;
		var endTo;

		if (this.currentPage < 5) {
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
