import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
// import { MAT_DATE_FORMATS } from '@angular/material/core';

// export const MY_DATE_FORMATS = {
// 	parse: {
// 		dateInput: 'DD/MM/YYYY',
// 	},
// 	display: {
// 		dateInput: 'MMM DD, YYYY',
// 		monthYearLabel: 'MMMM YYYY',
// 		dateA11yLabel: 'LL',
// 		monthYearA11yLabel: 'MMMM YYYY'
// 	},
// };


@Component({
	selector: 'app-add-staff',
	templateUrl: './add-staff.component.html',
	styleUrls: ['./add-staff.component.scss'],
	// providers: [
	// 	{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
	// ]
})
export class AddStaffComponent implements OnInit
{

	public addStaffForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public paramResponse: any;
	public accountId: string;
	public accountType: string;
	public languages: string;
	public CellNumberObject: any;
	public DeptNumberObject: any;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
	) { }

	ngOnInit(): void
	{

		//pick vehicle id from query params
		this.activatedroute.queryParamMap
			.subscribe((params) =>
			{
				this.paramResponse = { ...params.keys, ...params };
				this.accountId = this.paramResponse.params.accountId;
				this.accountType = this.paramResponse.params.accountType;
				if (!this.accountId)
				{
					this.router.navigate(['/admin/staff'], { queryParams: { accountType: this.accountType, accountId: this.accountId } });
				}
			}
			);

		//add staff form validation
		this.addStaffForm = this.formBuilder.group({
			acc_id: [this.accountId, [Validators.required, Validators.pattern("^[0-9].*$")]],
			firstName: ['', Validators.required],
			middleName: [''],
			lastName: ['', Validators.required],
			email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/i)]],
			deptTelIsd: ['+1', Validators.required],
			deptTel: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]],
			cellNumberIsd: ['+1', Validators.required],
			cellNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]],
			staffStartDate: ['', Validators.required],
			phoneType: ['', Validators.required],
			languageSpoken: this.formBuilder.array([], [Validators.required]),
		});

		/** spinner starts on init */
		this.spinner.show();
		// Load Our languages using API
		this.adminService.staffLanguages()
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result =>
			{
				this.response = result;
				this.languages = this.response.data;

				this.spinner.hide();//hide spinner
			});
	}

	onCountryChange(event, type)
	{
		if (type == 'deptTel')
		{
			this.addStaffForm.patchValue({
				deptTel: '+' + event.dialCode
			});
		}
		else
		{
			this.addStaffForm.patchValue({
				cell: '+' + event.dialCode
			});
		}
		// console.log(this.countryCode);
	}
	changeDetection = {
		staffStartDate: (event: any) =>
		{
			this.addStaffForm.patchValue({
				staffStartDate: event.target.value
			})
		}
	}
	telInputObjectCell(obj)
	{
		this.CellNumberObject = obj;
	}
	telInputObjectDeptTel(obj)
	{
		this.DeptNumberObject = obj;
	}
	onCheckboxChange(e)
	{
		const languageSpoken: FormArray = this.addStaffForm.get('languageSpoken') as FormArray;

		if (e.target.checked)
		{
			languageSpoken.push(new FormControl(e.target.value));
		} else
		{
			const index = languageSpoken.controls.findIndex(x => x.value === e.target.value);
			languageSpoken.removeAt(index);
		}
	}

	get f()
	{
		return this.addStaffForm.controls;
	}

	submitForm()
	{
		console.log(this.addStaffForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addStaffForm.invalid)
		{
			return;
		}

		console.log(this.addStaffForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button

		this.adminService.addStaff(this.addStaffForm.value)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(result =>
			{
				this.response = result;
				this.spinner.hide();//hide spinner
				this.disableSubmitButton = false; //enable submit button

				this.router.navigate(['/admin/staff'], { queryParams: { accountType: this.accountType, accountId: this.accountId } });
			});
	}

	resetForm()
	{
		this.addStaffForm.reset();
	}
	backButton()
	{
		this.router.navigate(['/admin/staff'], { queryParams: { accountType: this.accountType, accountId: this.accountId } });
	}

}
