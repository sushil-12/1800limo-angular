import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { StateManagementService } from '../../../services/statemanagement.service';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import * as moment from 'moment';
declare var $: any;

@Component({
	selector: 'app-cards',
	templateUrl: './cards.component.html',
	styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit
{

	color: ThemePalette = 'primary';
	checked = false;
	disabled = false;

	public paramResponse: any;
	public accountId: string;
	public accountType: string;
	public cardToDelete: any;
	public alertMessage: string;
	public cardId: string;
	public cardsRes: any;
	public cards: any;
	public ID:any

	public firstPage: Number;
	public lastPage: Number;
	public totalPage: Number;
	public currentPage: any;
	public from: Number;
	public to: Number;
	public path: string;
	public firstPageUrl: string;
	public lastPageUrl: string;
	public prevPageUrl: string;
	paymentForm: FormGroup
	public nextPageUrl: string;
	show: boolean;
	paymentJson: any;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
		private $form: FormBuilder,
		private stateManagementService: StateManagementService,
		private activatedroute: ActivatedRoute) { }

	ngOnInit(): void
	{
		this.buildPaymentForm()

		/** spinner starts on init */
		this.stateManagementService.setprogressBar(true);

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

		this.loadCards(this.accountId);//load cards
	}

	loadCards(accountId)
	{
		// Load Our cards using API
		this.adminService.cardsList(accountId).then(result =>
		{
			this.cardsRes = result;
			this.cards = this.cardsRes.data;
			console.log("<><><>><>><>><><><<><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<", JSON.stringify(this.cards))
			this.stateManagementService.setprogressBar(false);
		});
	}

	addCardClick(accountId)
	{
		this.router.navigate(['/admin/add-card'], { queryParams: { accountType: this.accountType, accountId: accountId } });
	}

	clickEditCard(cardId)
	{
		this.router.navigate(['/admin/edit-card'], { queryParams: { accountType: this.accountType, accountId: this.accountId, cardId: cardId } });
	}

	enableDisableClicked(id)
	{
		this.cardToDelete = id;
		console.log("hgsdfj>>>>>>>>>>>>>>>>>>>>??????????????????????????", this.cardToDelete)
		this.alertMessage = "Are you sure you want to delete this Card?"
	}
	delete()
	{
		this.stateManagementService.setprogressBar(true);
		$('#deleteConfirmationModal').modal('hide');
		this.adminService.deleteCard(this.cardToDelete, this.accountId)
			.pipe(
				catchError(err =>
				{
					this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			).subscribe(result =>
			{
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
				{
					this.router.navigate(['/admin/cards'], { queryParams: { accountType: this.accountType, accountId: this.accountId } });
				});
				this.stateManagementService.setprogressBar(false);
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
			case 'blackCarLimoBus': {
				this.router.navigate(['/admin/affiliates/all-operators']);
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
	get Form() {
		return this.paymentForm.controls;
	}
	buildPaymentForm() {
		this.paymentForm = this.$form.group({
			amount: ['', [Validators.required]],
			payment_description:['']
		})
	}
	formatDate(date:any){
		return moment(date).format('YYYY-MM-DD')
	}
	paymentLogs(){
		this.spinner.show()
		this.adminService.paymentLogs(this.accountId).subscribe((response: any) => {
			// this.$errors.openDialog({
			// 	errors: {
			// 		error: `<span class='text-success'>${response.message}</span>`
			// 	}
			// })
			this.paymentJson = response.data
			this.spinner.hide()
			// this.spinner.hide()
		})
	}

	payment(){
		this.spinner.show()
		let body = {
			customerId : this.accountId,
			cardId : this.ID, 
			amount : this.Form.amount.value,
			description :  this.Form.payment_description.value
		}
		console.log('in function payment',body)
		this.adminService.chargeByCard(body).subscribe((response: any) => {
			this.$errors.openDialog({
				errors: {
					error: `<span class='text-success'>${response.message}</span>`
				}
			})
			this.spinner.hide()
		})
		this.ID = ""
		this.show = false
		this.paymentForm.patchValue({
			amount: 0,
			payment_description:'' })
		$("#paymentModal").modal("hide");
	}
	navigate(record:any){
		$("#paymentLogs").modal("hide");
		console.log('Navigate to invoice--->>',record)
		this.router.navigate(['/admin/custom-invoice-summary'],{ queryParams: { invoiceId: record.id} });
	}

	closeModal() {
		this.paymentForm.patchValue({
			amount: 0,
			payment_description:'' })
		this.show = false
		$("#paymentModal").modal("hide");
	}
}
