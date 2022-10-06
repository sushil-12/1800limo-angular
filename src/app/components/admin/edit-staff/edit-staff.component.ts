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
	selector: 'app-edit-staff',
	templateUrl: './edit-staff.component.html',
	styleUrls: ['./edit-staff.component.scss'],
	// providers: [
	// 	{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
	// ]
})
export class EditStaffComponent implements OnInit
{

	public editStaffForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public response2: any;
	public paramResponse: any;
	public accountId: string;
	public accountType: string;
	public staffId: string;
	public languages: string;
	public languagesFormControl: any;
	public CellNumberObject: any;


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
				this.staffId = this.paramResponse.params.staffId;
				if (!this.accountId)
				{
					this.router.navigate(['/admin/staff'], { queryParams: { accountType: this.accountType, accountId: this.accountId } });
				}
			}
			);

		//edit staff form validation
		this.editStaffForm = this.formBuilder.group({
			id: [this.staffId, Validators.required],
			acc_id: [this.accountId, Validators.required],
			firstName: ['', Validators.required],
			middleName: [''],
			lastName: ['', Validators.required],
			email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
			deptTelIsd: ['+1', Validators.required],
			deptTel: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]],
			cellNumberIsd: ['+1', Validators.required],
			cellNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]],
			staffStartDate: ['', Validators.required],
			phoneType: ['', Validators.required],
			languageSpoken: this.formBuilder.array([], [Validators.required]),
			languagesGet: this.formBuilder.array([], [Validators.required]),
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

				this.adminService.getStaff(this.staffId)
					.pipe(
						catchError(err =>
						{
							this.spinner.hide();//hide spinner
							return throwError(err);
						})
					).subscribe(result2 =>
					{

						this.response2 = result2;

						this.editStaffForm.patchValue({
							id: this.response2.data.id,
							firstName: this.response2.data.first_name,
							lastName: this.response2.data.last_name,
							middleName: this.response2.data.middle_name,
							email: this.response2.data.email,
							deptTel: this.response2.data.dept_tel,
							deptTelIsd: this.response2.data.dept_tel_isd,
							cellNumber: this.response2.data.cell_number,
							cellNumberIsd: this.response2.data.cell_number_isd,
							staffStartDate: this.response2.data.start_date,
							phoneType: this.response2.data.phone_type,
						});

						const languagesGet: FormArray = this.editStaffForm.get('languagesGet') as FormArray;
						const languageSpoken: FormArray = this.editStaffForm.get('languageSpoken') as FormArray;
						var i;
						const totalLanguages: any = this.languages;
						const selectedLanguages = this.response2.data.languages;
						for (i = 0; i < totalLanguages.length; i++)
						{
							// console.log(totalLanguages[i]);
							var checkedLanguage = selectedLanguages.findIndex(function (post)
							{
								if (post == totalLanguages[i].id)
									return true;
							});
							// console.log(checkedLanguage);
							if (checkedLanguage >= 0)
							{
								var checkBool = true;
							}
							else
							{
								var checkBool = false;
							}
							languagesGet.push(new FormControl(checkBool));
						}
						this.languagesFormControl = languagesGet.controls;
						var j;
						for (j = 0; j < selectedLanguages.length; j++)
						{
							languageSpoken.push(new FormControl(selectedLanguages[j]));
						}
					});

				this.spinner.hide();//hide spinner
			});
	}
	changeDetection = {
		staffStartDate: (event: any) =>
		{
			this.editStaffForm.patchValue({
				staffStartDate: event.target.value
			})
		}
	}
	telInputObjectCell(obj)
	{
		this.CellNumberObject = obj;
	}
	onCountryChange(event, type)
	{
		if (type == 'deptTel')
		{
			this.editStaffForm.patchValue({
				deptTel: '+' + event.dialCode
			});
		}
		else
		{
			this.editStaffForm.patchValue({
				cell: '+' + event.dialCode
			});
		}
		// console.log(this.countryCode);
	}

	onCheckboxChange(e)
	{
		const languageSpoken: FormArray = this.editStaffForm.get('languageSpoken') as FormArray;

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
		return this.editStaffForm.controls;
	}

	submitForm()
	{
		console.log(this.editStaffForm);
		// console.log(JSON.stringify(this.editVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.editStaffForm.invalid)
		{
			return;
		}

		console.log(this.editStaffForm.value);
		// console.log(JSON.stringify(this.editVehicleRatesForm.value));
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button

		this.adminService.editStaff(this.editStaffForm.value)
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
		this.editStaffForm.reset();
	}
	backButton()
	{
		this.router.navigate(['/admin/staff'], { queryParams: { accountType: this.accountType, accountId: this.accountId } });
	}

}
