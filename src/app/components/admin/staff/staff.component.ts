import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';

@Component({
	selector: 'app-staff',
	templateUrl: './staff.component.html',
	styleUrls: ['./staff.component.scss']
})
export class StaffComponent implements OnInit
{

	color: ThemePalette = 'primary';
	checked = false;
	disabled = false;

	public paramResponse: any;
	public accountId: string;
	public accountType: string;
	public staffId: string;
	public staffRes: any;
	public staffList: any;

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
		private spinner: NgxSpinnerService,
		private activatedroute: ActivatedRoute) { }

	ngOnInit(): void
	{

		/** spinner starts on init */
		this.spinner.show();

		//pick vehicle id from query params
		this.activatedroute.queryParamMap
			.subscribe((params) =>
			{
				this.paramResponse = { ...params.keys, ...params };
				this.accountId = this.paramResponse.params.accountId;
				this.accountType = this.paramResponse.params.accountType;
				if (!this.accountId)
				{
					this.redirectCases();
				}
			}
			);

		this.loadStaff(this.paramResponse.params.accountId);//load staff
	}

	loadStaff(accountId)
	{
		// Load Our staff using API
		this.adminService.staffList(accountId).then(result =>
		{
			this.staffRes = result;
			this.staffList = this.staffRes.data.data;
			this.spinner.hide();//hide spinner
		}).
			catch(err =>
			{
				this.spinner.hide();//hide spinner
			});
	}

	addStaffClick(accountId)
	{
		this.router.navigate(['/admin/add-staff'], { queryParams: { accountType: this.accountType, accountId: accountId } });
	}

	clickEditStaff(staffId)
	{
		this.router.navigate(['/admin/edit-staff'], { queryParams: { accountType: this.accountType, accountId: this.accountId, staffId: staffId } });
	}

	enableDisableClicked(event, id)
	{
		this.spinner.show();//show spinner
		console.log(event.checked);
		if (event.checked)
		{
			var status = 'enable';
		}
		else
		{
			var status = 'disable';
		}

		this.adminService.staffStatus(id, status)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result =>
			{

				this.spinner.hide();//hide spinner
			});
	}

	backButtonClick()
	{
		this.redirectCases();
	}

	redirectCases()
	{
		switch (this.accountType)
		{
			case 'individual': {
				this.router.navigate(['/admin/individual-account-admin']);
				break;
			}
			case 'corporate': {
				this.router.navigate(['/admin/corporate-account-admin']);
				break;
			}
			case 'travelPlanner': {
				this.router.navigate(['/admin/travel-planner-account-admin']);
				break;
			}
			case 'affiliate': {
				this.router.navigate(['/admin/affiliate-account-admin']);
				break;
			}
			default: {
				//statements; 
				break;
			}
		}
	}

	//for paginator
	counter()
	{
		var currentPage;
		var startFrom;
		var endTo;

		if (this.currentPage < 5)
		{
			startFrom = 0;
			endTo = 5;
		}
		else if (this.currentPage < this.totalPage)
		{
			currentPage = this.currentPage
			endTo = currentPage + 1;
			startFrom = endTo - 5;
		}
		else
		{
			endTo = this.totalPage;
			startFrom = endTo - 5;
		}

		var i;
		var udpArr = new Array();
		for (i = startFrom; i < endTo; i++)
		{
			udpArr.push(i + 1);
		}
		return udpArr;
	}
}
