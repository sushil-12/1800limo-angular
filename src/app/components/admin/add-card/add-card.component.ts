import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { CustomvalidationService } from '../../../services/customvalidation.service';

@Component({
	selector: 'app-add-card',
	templateUrl: './add-card.component.html',
	styleUrls: ['./add-card.component.scss']
})
export class AddCardComponent implements OnInit
{

	public addCardForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public paramResponse: any;
	public accountId: string;
	public accountType: string;
	public yearOptions: any = [];


	constructor(
		private adminService: AdminService,
		private router: Router,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private stateManagementService: StateManagementService,
		private mapsAPILoader: MapsAPILoader,
		private spinner: NgxSpinnerService,
		private ngZone: NgZone,
		private customValidator: CustomvalidationService
	) { }

	ngOnInit(): void
	{
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

		const currentYear = (new Date()).getFullYear();
		for (let i = 0; i < 40; i++)
		{
			this.yearOptions.push(currentYear + i);
		}

		//add card form validation
		this.addCardForm = this.formBuilder.group({
			id: [''],
			card_type: ['personal', Validators.required],
			number: ['', [Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.minLength(19), Validators.maxLength(19), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			cvc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(5), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			name: ['', Validators.required],
		});
		/* Card Number Spacing */

		$('#card-number').on('keypress change blur', function ()
		{
			$(this).val(function (index, value)
			{
				return value.replace(/[^a-z0-9]+/gi, '').replace(/(.{4})/g, '$1 ');
			});
		});

		$('#card-number').on('copy cut paste', function ()
		{
			setTimeout(function ()
			{
				$('#card-number').trigger("change");
			});
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
	onCountryChange(event, type)
	{
		if (type == 'mobile')
		{
			this.addCardForm.patchValue({
				mobileIsd: '+' + event.dialCode
			});
		}
		else
		{
			this.addCardForm.patchValue({
				workIsd: '+' + event.dialCode
			});
		}
	}

	get f()
	{
		return this.addCardForm.controls;
	}

	submitForm()
	{
		console.log(this.addCardForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		this.addCardForm.value.acc_id = this.accountId
		// stop here if form is invalid
		if (this.addCardForm.invalid)
		{
			return;
		}

		console.log(this.addCardForm.value);
		this.spinner.show();
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.disableSubmitButton = true; //disable submit button

		this.adminService.addCard(this.addCardForm.value)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(result =>
			{
				this.response = result;
				this.spinner.hide();
				this.disableSubmitButton = false; //enable submit button

				this.router.navigate(['/admin/cards'], { queryParams: { accountType: this.accountType, accountId: this.accountId } });
			});
	}

	resetForm()
	{
		this.addCardForm.reset();
	}
	backButton()
	{
		this.router.navigate(['/admin/cards'], { queryParams: { accountType: this.accountType, accountId: this.accountId } });
	}

}
