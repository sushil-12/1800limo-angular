import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StateManagementService } from '../../../services/statemanagement.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { CustomvalidationService } from '../../../services/customvalidation.service';
import { IndividualService } from '../../../services/individual.service';
import * as moment from "moment";
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

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
	]
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
	expiryDateControl = new FormControl(moment());


	constructor(
		private adminService: AdminService,
		private individualService: IndividualService,
		private router: Router,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private stateManagementService: StateManagementService,
		private spinner: NgxSpinnerService,
		private ngZone: NgZone,
		private customValidator: CustomvalidationService
	) { }

	ngOnInit(): void {

		const currentYear = (new Date()).getFullYear();
		for (let i = 0; i < 40; i++) {
			this.yearOptions.push(currentYear + i);
		}

		//add card form validation
		const currentDate = moment();
		this.addCardForm = this.formBuilder.group({
			card_type: ['personal', Validators.required],
			number: ['', [Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.minLength(14), Validators.maxLength(20), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			cvc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(5), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			exp_month: [currentDate.format('MM'), Validators.required],
			exp_year: [currentDate.year(), Validators.required],
			name: ['', Validators.required],
		}, { validators: this.expiryDateValidator() });

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
		this.expiryDateControl.markAsTouched();
		// stop here if form is invalid
		if (this.addCardForm.invalid) {
			return;
		}

		console.log(this.addCardForm.value);
		this.spinner.show();
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.disableSubmitButton = true; //disable submit button

		this.individualService.addIndividualCreditCard(this.addCardForm.value)
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
				this.router.navigate(['/individual/profile'])

			});
	}

	resetForm() {
		this.addCardForm.reset();
		this.addCardForm.patchValue({
			card_type: 'personal',
			exp_month: moment().format('MM'),
			exp_year: moment().year()
		});
		this.expiryDateControl.setValue(moment().startOf('month'));
		this.addCardForm.updateValueAndValidity();
	}
	backButton() {
		this.router.navigate(['/individual/profile']);
	}

	get minExpiryDate() {
		return moment().startOf('month');
	}

	chosenYearHandler(normalizedYear: moment.Moment) {
		const ctrlValue = this.expiryDateControl.value || moment();
		ctrlValue.year(normalizedYear.year());
		this.expiryDateControl.setValue(ctrlValue);
	}

	chosenMonthHandler(normalizedMonth: moment.Moment, datepicker: any) {
		const selectedDate = normalizedMonth.clone().year(normalizedMonth.year()).month(normalizedMonth.month());
		this.expiryDateControl.setValue(selectedDate);
		this.addCardForm.patchValue({
			exp_month: selectedDate.format('MM'),
			exp_year: selectedDate.year()
		});
		this.addCardForm.get('exp_month').markAsDirty();
		this.addCardForm.get('exp_year').markAsDirty();
		this.addCardForm.get('exp_month').markAsTouched();
		this.addCardForm.get('exp_year').markAsTouched();
		this.expiryDateControl.markAsTouched();
		datepicker.close();
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
}
