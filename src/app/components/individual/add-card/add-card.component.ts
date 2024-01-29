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
import { IndividualService } from 'src/app/services/individual.service';


@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss']
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
    private individualService: IndividualService,
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

		const currentYear = (new Date()).getFullYear();
		for (let i = 0; i < 40; i++)
		{
			this.yearOptions.push(currentYear + i);
		}

		//add card form validation
		this.addCardForm = this.formBuilder.group({
			card_type: ['personal', Validators.required],
			number: ['', [Validators.required, Validators.pattern("^[0-9\\s]*$"), Validators.minLength(16),Validators.maxLength(20), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			cvc: ['', [Validators.required, Validators.pattern("^[0-9]*$"),Validators.minLength(3), Validators.maxLength(5), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			name: ['', Validators.required],
		});

		$('#card-number').on('copy cut paste', function ()
		{
			setTimeout(function ()
			{
				$('#card-number').trigger("change");
			});
		});
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
		// stop here if form is invalid
		if (this.addCardForm.invalid)
		{
			return;
		}

		console.log(this.addCardForm.value);
		this.spinner.show();
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.disableSubmitButton = true; //disable submit button

		this.individualService.addIndividualCreditCard(this.addCardForm.value)
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
					this.router.navigate(['/individual/profile'])
				
			});
	}

	resetForm()
	{
		this.addCardForm.reset();
	}
	backButton()
	{
		this.router.navigate(['/individual/profile']);
	}

}
