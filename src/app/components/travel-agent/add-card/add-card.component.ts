import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { CustomvalidationService } from '../../../services/customvalidation.service';
import { TravelAgentService } from 'src/app/services/travel-agent.service';
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
	currentUser: any;
	expiryDateControl = new FormControl(moment());


	constructor(
		private TravelService: TravelAgentService,
		private router: Router,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private stateManagementService: StateManagementService,
		private spinner: NgxSpinnerService,
		private ngZone: NgZone,
		private customValidator: CustomvalidationService
	) { }

	ngOnInit(): void {
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'))

		this.activatedroute.queryParamMap
			.subscribe((params) => {
				this.paramResponse = { ...params.keys, ...params };
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
			number: ['', [Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.maxLength(20), Validators.minLength(14), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			cvc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(5), Validators.minLength(3), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			name: ['', Validators.required],
		}, { validators: this.expiryDateValidator() });
		this.setExpiryDate(moment());
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
		if (this.addCardForm.invalid) {
			return;
		}

		console.log(this.addCardForm.value);
		this.spinner.show();
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.disableSubmitButton = true; //disable submit button

		this.TravelService.addCard(this.addCardForm.value)
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

				this.router.navigate([`${this.currentUser?.roleName}/debit-cc-card`]);
			});
	}

	resetForm() {
		this.addCardForm.reset();
		this.addCardForm.patchValue({
			card_type: 'personal'
		});
		this.setExpiryDate(moment());
	}
	backButton() {
		this.router.navigate(['/admin/cards'], { queryParams: { accountType: this.accountType, accountId: this.accountId } });
	}

	// Month-Year Picker Logic
	get minExpiryDate() {
		return moment().startOf('month');
	}

	private setExpiryDate(date: moment.Moment) {
		const selectedDate = date.clone().startOf('month');
		this.expiryDateControl.setValue(selectedDate);
		this.addCardForm.patchValue({
			exp_month: selectedDate.format('MM'),
			exp_year: selectedDate.year()
		}, { emitEvent: false });
		this.addCardForm.updateValueAndValidity({ emitEvent: false });
	}

	private expiryDateValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const expMonth = control.get('exp_month')?.value;
			const expYear = control.get('exp_year')?.value;

			if (!expMonth || !expYear) {
				return null;
			}

			const selectedDate = moment(`${expYear}-${expMonth}-01`, 'YYYY-MM-DD', true);
			if (!selectedDate.isValid()) {
				return { invalidExpiryDate: true };
			}

			return selectedDate.isBefore(moment().startOf('month')) ? { invalidExpiryDate: true } : null;
		};
	}

	chosenYearHandler(normalizedYear: moment.Moment) {
		const ctrlValue = this.expiryDateControl.value || moment();
		ctrlValue.year(normalizedYear.year());
		this.expiryDateControl.setValue(ctrlValue);
	}

	chosenMonthHandler(normalizedMonth: moment.Moment, datepicker: any) {
		const selectedDate = normalizedMonth.clone().year(normalizedMonth.year()).month(normalizedMonth.month());
		this.setExpiryDate(selectedDate);

		this.addCardForm.get('exp_month').markAsDirty();
		this.addCardForm.get('exp_year').markAsDirty();
		this.addCardForm.get('exp_month').markAsTouched();
		this.addCardForm.get('exp_year').markAsTouched();
		this.expiryDateControl.markAsTouched();

		datepicker.close();
	}
}
