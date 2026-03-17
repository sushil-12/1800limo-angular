import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StateManagementService } from '../../../services/statemanagement.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { CustomvalidationService } from '../../../services/customvalidation.service';
import * as moment from "moment";
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

declare var $: any;

export const MY_FORMATS = {
	parse: {
		dateInput: 'MM/YYYY',
	},
	display: {
		dateInput: 'MM/YYYY',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};

@Component({
	selector: 'app-add-card',
	templateUrl: './add-card.component.html',
	styleUrls: ['./add-card.component.scss'],
	providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
		},
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
})
export class AddCardComponent implements OnInit {

	public addCardForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public paramResponse: any;
	public accountId: string;
	public accountType: string;
	public yearOptions: any = [];
	addingCartFor: any;


	constructor(
		private adminService: AdminService,
		private router: Router,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private stateManagementService: StateManagementService,
		private spinner: NgxSpinnerService,
		private ngZone: NgZone,
		private customValidator: CustomvalidationService
	) { }

	ngOnInit(): void {
		this.activatedroute.queryParamMap
			.subscribe((params) => {
				this.paramResponse = { ...params.keys, ...params };
				this.accountId = this.paramResponse.params.accountId;
				this.accountType = this.paramResponse.params.accountType;
				this.addingCartFor = this.paramResponse.params.for;
				if (!this.accountId) {
					this.redirectCases();
				}
			}
			);

		const currentYear = (new Date()).getFullYear();
		for (let i = 0; i < 40; i++) {
			this.yearOptions.push(currentYear + i);
		}

		//add card form validation
		this.addCardForm = this.formBuilder.group({
			id: [''],
			card_type: ['personal', Validators.required],
			number: ['', [Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.minLength(14), Validators.maxLength(20), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			cvc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(5), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			name: ['', Validators.required],
		});
		/* Card Number Spacing */

		// $('#card-number').on('keypress change blur', function ()
		// {
		// 	$(this).val(function (index, value)
		// 	{
		// 		return value.replace(/[^a-z0-9]+/gi, '').replace(/(.{4})/g, '$1 ');
		// 	});
		// });

		$('#card-number').on('copy cut paste', function () {
			setTimeout(function () {
				$('#card-number').trigger("change");
			});
		});
	}
	backButtonClick() {
		this.redirectCases();
	}

	redirectCases() {
		switch (this.accountType) {
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
	onCountryChange(event, type) {
		if (type == 'mobile') {
			this.addCardForm.patchValue({
				mobileIsd: '+' + event.dialCode
			});
		}
		else {
			this.addCardForm.patchValue({
				workIsd: '+' + event.dialCode
			});
		}
	}

	get f() {
		return this.addCardForm.controls;
	}

	submitForm() {
		console.log(this.addCardForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		this.addCardForm.value.acc_id = this.accountId
		this.expiryDateControl.markAsTouched();
		// stop here if form is invalid
		if (this.addCardForm.invalid || this.expiryDateControl.invalid) {
			return;
		}

		console.log(this.addCardForm.value);
		this.spinner.show();
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.disableSubmitButton = true; //disable submit button

		this.adminService.addCard(this.addCardForm.value)
			.pipe(
				catchError(err => {
					this.spinner.hide();
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;
				this.spinner.hide();
				this.disableSubmitButton = false; //enable submit button
				if (this.addingCartFor === 'affiliate') {
					this.router.navigate(['/admin/affiliate/step2'])
				}
				else {

					this.router.navigate(['/admin/cards'], { queryParams: { accountType: this.accountType, accountId: this.accountId } });
				}
			});
	}

	resetForm() {
		this.addCardForm.reset();
	}
	backButton() {
		this.router.navigate(['/admin/cards'], { queryParams: { accountType: this.accountType, accountId: this.accountId } });
	}
	// Month-Year Picker Logic
	expiryDateControl = new FormControl(null, [Validators.required]);

	chosenYearHandler(normalizedYear: moment.Moment) {
		const ctrlValue = this.expiryDateControl.value || moment();
		ctrlValue.year(normalizedYear.year());
		this.expiryDateControl.setValue(ctrlValue);
	}

	chosenMonthHandler(normalizedMonth: moment.Moment, datepicker: any) {
		const ctrlValue = this.expiryDateControl.value || moment();
		ctrlValue.month(normalizedMonth.month());
		ctrlValue.year(normalizedMonth.year());
		this.expiryDateControl.setValue(ctrlValue);

		// Patch Form Values
		const monthStr = (normalizedMonth.month() + 1).toString().padStart(2, '0');
		const yearStr = normalizedMonth.year();

		this.addCardForm.patchValue({
			exp_month: monthStr,
			exp_year: yearStr
		});

		// Validation check for past date
		const today = moment().startOf('month');
		if (normalizedMonth.isBefore(today)) {
			this.addCardForm.get('exp_month').setErrors({ 'pastDate': true });
			this.expiryDateControl.setErrors({ 'pastDate': true });
		} else {
			this.addCardForm.get('exp_month').setErrors(null);
			this.expiryDateControl.setErrors(null);
		}

		// Mark as dirty/touched for validation display
		this.addCardForm.get('exp_month').markAsDirty();
		this.addCardForm.get('exp_year').markAsDirty();

		datepicker.close();
	}
}
