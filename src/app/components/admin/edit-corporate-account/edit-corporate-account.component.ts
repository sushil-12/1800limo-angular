import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
	selector: 'app-edit-corporate-account',
	templateUrl: './edit-corporate-account.component.html',
	styleUrls: ['./edit-corporate-account.component.scss']
})
export class EditCorporateAccountComponent implements OnInit
{

	public editCorporateAccountForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public HomeObject: any;
	public OfficeObject: any;
	public MobileObject: any;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private activatedroute: ActivatedRoute,
		private ngZone: NgZone
	) { }


	//google map autocomplete
	public paramResponse: any;
	public corporateId: any;
	latitude: number;
	longitude: number;
	zoom: number;
	address: string;
	private geoCoder;
	@ViewChild('search1')
	public searchElementRef: ElementRef;

	ngOnInit(): void
	{
		this.spinner.show();//hide spinner

		//pick vehicle type id from query params
		this.activatedroute.queryParamMap
			.subscribe((params) =>
			{
				this.paramResponse = { ...params.keys, ...params };
				// console.log(this.paramResponse.params.vehicleTypeId);
				this.corporateId = this.paramResponse.params.corporateId;
				// console.log(this.vehicleId);
			}
			);

		//fetch data to display on edit screen
		this.adminService.getCorporateAccount(this.corporateId)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result =>
			{
				this.response = result;
				console.log(this.response.data, "check data")
				this.editCorporateAccountForm.patchValue({
					id: this.corporateId,
					firstName: this.response.data.first_name,
					middleName: this.response.data.middle_name,
					lastName: this.response.data.last_name,
					mobile: this.response.data.mobile,
					mobileIsd: '+1',
					office: this.response.data.office_number,
					officeIsd: '+1',
					home: this.response.data.home_phone,
					homeIsd: '+1',
					email: this.response.data.email,
					address: this.response.data.street,
					city: this.response.data.city,
					state: this.response.data.state,
					country: this.response.data.country,
					zipCode: this.response.data.zip,
					companyName: this.response.data.company_name,
					department: this.response.data.department,
					businessDescription: this.response.data.zip,
					// latitude:this.response.data.latitude,
					// longitude:this.response.data.longitude,
				});
				this.spinner.hide();//hide spinner
				this.MobileObject.setCountry(this.response.data.mobileCountry);
				this.OfficeObject.setCountry(this.response.data.officeCountry);
				this.HomeObject.setCountry(this.response.data.homeCountry);
			});


		//add amenity form validation
		this.editCorporateAccountForm = this.formBuilder.group({
			id: ['', [Validators.required, Validators.pattern("^[0-9].*$")]],//corporate
			role: ['4', [Validators.required, Validators.pattern("^[0-9].*$")]],//corporate
			firstName: ['', Validators.required],
			middleName: ['', Validators.required],
			lastName: ['', Validators.required],
			home: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			homeIsd: ['+1', Validators.required],
			homeCountry: ['us'],
			office: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			officeIsd: ['+1', Validators.required],
			officeCountry: ['us'],
			mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			mobileIsd: ['+1', Validators.required],
			mobileCountry: ['us'],
			email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
			address: ['', Validators.required],
			city: ['', Validators.required],
			state: ['', Validators.required],
			country: ['', Validators.required],
			zipCode: ['', Validators.required],
			companyName: ['', Validators.required],
			department: ['', Validators.required],
			businessDescription: ['', Validators.required],
			latitude: [''],
			longitude: [''],
		});
	}

	onCountryChange(event, type)
	{
		if (type == 'mobile')
		{
			this.editCorporateAccountForm.patchValue({
				mobileIsd: '+' + event.dialCode,
				mobileCountry: event.iso2
			});
		}
		else if (type = 'office')
		{
			this.editCorporateAccountForm.patchValue({
				officeIsd: '+' + event.dialCode,
				officeCountry: event.iso2
			});
		}
		else
		{
			this.editCorporateAccountForm.patchValue({
				homeIsd: '+' + event.dialCode,
				homeCountry: event.iso2
			});
		}
		// console.log(this.countryCode);
	}
	telInputObjectHome(obj)
	{
		this.HomeObject = obj;
	}
	telInputObjectOffice(obj)
	{
		this.OfficeObject = obj;
	}
	telInputObjectMobile(obj)
	{
		this.MobileObject = obj;
	}

	get f()
	{
		return this.editCorporateAccountForm.controls;
	}

	submitForm()
	{
		console.log(this.editCorporateAccountForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.editCorporateAccountForm.invalid)
		{
			return;
		}

		console.log(this.editCorporateAccountForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button

		this.adminService.updateCorporateAccount(this.editCorporateAccountForm.value)
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

				this.router.navigate(['/admin/corporate-account-admin']);
			});
	}

	resetForm()
	{
		this.editCorporateAccountForm.reset();
	}
	backButton()
	{
		this.router.navigate(['/admin/corporate-account-admin']);
	}

}
