import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
declare var $: any;

@Component({
	selector: 'app-affiliate-accounts',
	templateUrl: './affiliate-accounts.component.html',
	styleUrls: ['./affiliate-accounts.component.scss']
})
export class AffiliateAccountsComponent implements OnInit
{

	color: ThemePalette = 'primary';
	checked = false;
	disabled = false;

	public paramResponse: any;
	public blackCarLimoBusId: string;
	public blackCarLimoBusRes: any;
	public blackCarLimoBuses: any;
	public affiliateType: string;
	public heading: string;
	public addButton: string;
	public tree: any;
	public submitted: boolean = false;
	public lastPartUrl: any;
	public rejectCauseForm: FormGroup;

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
	operatorSelect: string;
	affiliateName: string;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute) { }

	ngOnInit(): void
	{
		this.operatorSelect = 'all-operators';
		// this.activatedRoute.params.subscribe(_operator => {
		//   console.log("hello world", _operator._affiliateType)
		//   this.setAffiliateType(_operator._affiliateType);
		// })
		this.affiliateTypeSwitch('all-operators')
		sessionStorage.clear();//clear session storage    

		this.rejectCauseForm = this.formBuilder.group({
			acc_id: ['', Validators.required],
			reject_cause: ['', Validators.required],
		});
	}
	// affiliateTypeSwitch(_affiliateType: string) {
	//   this.router.navigateByUrl('/admin/affiliates/' + _affiliateType);
	// }
	affiliateTypeSwitch(_affiliateType: string)
	{
		switch (_affiliateType)
		{
			case 'black-limo-operator': {
				this.heading = "Black Car / Limo Accounts";
				this.addButton = "Add Black Car / Limo Account";
				this.affiliateType = 'black_limo_operator';
				this.affiliateName = "Black Car / Limo";
				this.loadAffiliateOperators();//load blackCarLimoBus
				break;
			}
			case 'fleet-operator': {
				this.heading = "Fleet Accounts";
				this.addButton = "Add Fleet Account";
				this.affiliateType = 'fleet_operator';
				this.affiliateName = "Fleet";
				this.loadAffiliateOperators();//load blackCarLimoBus
				break;
			}
			case 'taxi-operator': {
				this.heading = "Taxi Accounts";
				this.addButton = "Add Taxi Account";
				this.affiliateType = 'taxi_operator';
				this.affiliateName = "Taxi";
				this.loadAffiliateOperators();//load blackCarLimoBus
				break;
			}
			case 'gig-operator': {
				this.heading = "Gig Accounts";
				this.addButton = "Add Gig Account";
				this.affiliateType = 'gig_operator';
				this.affiliateName = "Gig";
				this.loadAffiliateOperators();//load blackCarLimoBus
				break;
			}
			default: {
				this.heading = "All Accounts";
				this.addButton = "Add Affiliate Account";
				this.affiliateType = 'all_operators';
				this.affiliateName = "Affiliate";
				this.loadAffiliateOperators();//load blackCarLimoBus
				break;
			}
		}
	}

	loadAffiliateOperators(pageUrl = null)
	{
		/** spinner starts on init */
		this.spinner.show();

		var keyword = ((document.getElementById("keyword") as HTMLInputElement).value);
		// console.log(keyword);
		// Load Our blackCarLimoBus using API
		this.adminService.blackCarLimoBusAccounts(pageUrl, this.affiliateType, keyword).then(result =>
		{
			this.blackCarLimoBusRes = result;
			console.log(this.blackCarLimoBusRes.data.data, "check data")
			this.blackCarLimoBuses = this.blackCarLimoBusRes.data.data;
			console.log('Black Car Limo Buswe: >>>>>>>>>>>>>>>>>>', this.blackCarLimoBuses)

			this.firstPage = 1;
			this.lastPage = this.blackCarLimoBusRes.data.last_page;
			this.totalPage = this.blackCarLimoBusRes.data.last_page;
			this.currentPage = this.blackCarLimoBusRes.data.current_page;
			this.from = this.blackCarLimoBusRes.data.from;
			this.to = this.blackCarLimoBusRes.data.to;
			this.path = this.blackCarLimoBusRes.data.path;
			this.firstPageUrl = this.blackCarLimoBusRes.data.first_page_url;
			this.lastPageUrl = this.blackCarLimoBusRes.data.last_page_url;
			this.prevPageUrl = this.blackCarLimoBusRes.data.prev_page_url;
			this.nextPageUrl = this.blackCarLimoBusRes.data.next_page_url;
			// sessionStorage.setItem('blackCarLimoBus',JSON.stringify(this.blackCarLimoBus));
			this.spinner.hide();//hide spinner
		})
			.catch(err =>
			{
				this.spinner.hide();//hide spinner
			});
	}

	addAffiliateAccountClick() 
	{
		// localStorage.setItem("account_approval", this.response.data.affiliateParmas.account_approval);
		// localStorage.setItem("recject_cause_message", this.response.data.affiliateParmas.recject_cause_message);
		sessionStorage.setItem("affiliateType", this.affiliateType);
		this.router.navigate(['/admin/affiliate/step1']);
	}

	clickEditAffiliateAccount(blackCarLimoBusId)
	{
		// this.affiliateService.updateStepsArrayLocal(this.response.data.affiliateParmas.step_completed);
		// this.affiliateService.updateStepsCompletedObject(this.response.data.affiliateParmas.step_completed_obj);
		sessionStorage.setItem('affiliateId', blackCarLimoBusId)
		if (this.affiliateType !== "all_operators")
		{
			sessionStorage.setItem("affiliateType", this.affiliateType);
		}
		this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
		{
			this.router.navigate(['/admin/affiliate/step1']);
		});

	}

	clickBlackCarLimoBusCards(blackCarLimoBusId)
	{
		this.router.navigate(['/admin/cards'], { queryParams: { accountType: 'blackCarLimoBus', accountId: blackCarLimoBusId } });
	}

	acceptAffiliate(acc_id)
	{
		this.spinner.show();
		// this.disableSubmitButton=true; //disable submit button
		console.log('acc_id', acc_id)

		this.adminService.acceptAffiliate(acc_id)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) =>
			{
				if (success == true)
				{
					this.spinner.hide();//hide spinner
					location.reload()
				}
			});
	}

	get rejectCauseF()
	{
		return this.rejectCauseForm.controls;
	}

	rejectAffiliateClick(acc_id)
	{
		this.rejectCauseForm.patchValue({
			acc_id: acc_id
		});
	}

	rejectAffiliate()
	{
		this.submitted = true;
		console.log(this.rejectCauseForm);
		// stop here if form is invalid
		if (this.rejectCauseForm.invalid)
		{
			return;
		}

		this.spinner.show();
		// this.disableSubmitButton=true; //disable submit button

		this.adminService.rejectAffiliate(this.rejectCauseForm.value)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					$('#rejectCauseModal').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) =>
			{
				if (success == true)
				{
					this.spinner.hide();//hide spinner
					$('#rejectCauseModal').modal('hide');
					this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
					{
						this.router.navigate(['/admin/' + this.lastPartUrl]);
					});
				}
			});
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
		this.adminService.blackCarLimoBusAccountStatus(id, status)
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

	//for pagination
	counter()
	{
		var currentPage;
		var startFrom;
		var endTo;

		if (this.currentPage < 5)
		{
			startFrom = 0;
			endTo = this.totalPage;
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

	formatter(text: string)
	{
		return text.replace(/[_|-]/g, ' ')
	}
}