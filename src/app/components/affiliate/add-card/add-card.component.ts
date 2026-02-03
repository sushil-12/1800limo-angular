import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StateManagementService } from '../../../services/statemanagement.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CustomvalidationService } from '../../../services/customvalidation.service';
import { FormControl } from '@angular/forms';
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

	constructor(
		private affiliateService: AffiliateService,
		private router: Router,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private stateManagementService: StateManagementService,
		private ngZone: NgZone,
		private customValidator: CustomvalidationService
	) { }

	ngOnInit(): void {

		const currentYear = (new Date()).getFullYear();
		for (let i = 0; i < 40; i++) {
			this.yearOptions.push(currentYear + i);
		}

		//add card form validation
		this.addCardForm = this.formBuilder.group({
			card_type: ['personal', Validators.required],
			number: ['', [Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.minLength(19), Validators.maxLength(19), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			cvc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(3), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			name: ['', Validators.required],
		});

		/* Card Number Spacing */

		$('#card-number').on('keypress change blur', function () {
			$(this).val(function (index, value) {
				return value.replace(/[^a-z0-9]+/gi, '').replace(/(.{4})/g, '$1 ');
			});
		});

		$('#card-number').on('copy cut paste', function () {
			setTimeout(function () {
				$('#card-number').trigger("change");
			});
		});

	}

	SetFormValue(form_control: string, value: any) {
		this.addCardForm.get(form_control).setValue(value)
		this.addCardForm.updateValueAndValidity()
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
		this.submittedForm = true;
		if (this.addCardForm.invalid) {
			return;
		}

		this.stateManagementService.setprogressBar(true); // show progress bar
		this.disableSubmitButton = true; //disable submit button

		this.affiliateService.addCard(this.addCardForm.value)
			.pipe(
				catchError(err => {
					this.stateManagementService.setprogressBar(false);//hide progress bar
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;
				this.stateManagementService.setprogressBar(false);//hide progress bar
				this.disableSubmitButton = false; //enable submit button

				this.router.navigate(['/affiliate/step2']);
			});
	}

	resetForm() {
		this.addCardForm.reset();
	}
	backButton() {
		this.router.navigate(['/affiliate/step2']);
	}

	changeRadio(form_control: string, value: any) {
		this.SetFormValue(form_control, value)
	}

	// Month-Year Picker Logic
	expiryDateControl = new FormControl(moment());

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

		// Mark as dirty/touched for validation display
		this.addCardForm.get('exp_month').markAsDirty();
		this.addCardForm.get('exp_year').markAsDirty();

		datepicker.close();
	}
}
