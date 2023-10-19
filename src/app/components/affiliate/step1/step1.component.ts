import { Component, OnInit, AfterViewInit, Input, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { AuthService } from "../../../services/auth.service";
import { AffiliateService } from "../../../services/affiliate.service";
import { StateManagementService } from "../../../services/statemanagement.service";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from "rxjs/operators";
import { throwError, from, Subscription } from "rxjs";
import { CustomvalidationService } from "../../../services/customvalidation.service";
import { HttpClient } from "@angular/common/http";
import { AdminService } from "src/app/services/admin.service";
declare var $: any;

@Component({
	selector: "app-step1",
	templateUrl: "./step1.component.html",
	styleUrls: ["./step1.component.scss"],
})
export class Step1Component implements OnInit, AfterViewInit
{
	@ViewChild("resetImages")
	imagesVariable: ElementRef;

	public addAffiliateAccountForm: FormGroup;
	public updateAffiliateEmailForm: FormGroup;
	public updateDispatchEmailForm: FormGroup;
	public submittedForm: boolean;
	public submittedAffiliateEmailForm: boolean;
	public submittedDispatcheEmailForm: boolean;
	public disableSubmitButton: boolean = false;
	public disableSubmitAffiliateEmailButton: boolean = false;
	public disableSubmitDispatchEmailButton: boolean = false;
	public response: any;
	public response2: any;
	public languages: any;
	public associations: any;
	public languagesFormControl: any;
	public AssociationsFormControl: any;
	public affiliateId: string;
	public affiliateType: string;
	public currentUser: any;
	public showCompanyInformation: boolean = true;
	public BusinessFrontPhoto: string;
	public BusinessBackPhoto: string;
	public BusinessFrontPhotoId: string;
	public BusinessBackPhotoId: string;
	public imageSrc: string;
	public CellNumberObject: any;
	public CompanyCellNumberObject: any;
	public FaxObject: any;
	public DispatchObject: any;
	public affiliateEmailStatus: string;
	public dispatchEmailStatus: string;
	public affiliateEmailReadonly: boolean = true;
	public dispatchEmailReadonly: boolean = true;
	public affiliateEmailProgressBar: boolean = false;
	public dispatchEmailProgressBar: boolean = false;
	public showOwnerInfoProgressBar: boolean = false;
	public displayMsg: string;
	public updatedAffiliateEmail: string;
	public updatedDispatchEmail: string;
	public emailErrorMsgs: string;
	public affiliateEmailButton: string;
	public dispatchEmailButton: string;
	public snackbarMsg: string;
	public disableAffiliateEmailResendButton: boolean;
	public disableDispatchEmailResendButton: boolean;
	public affiliateInstructionHeading: string;
	public affiliateInstruction: string;
	public modalAlertMessage: string;
	public selectedAffiliate: string;
	public modalImage: string;
	public startBusinessYears: Array<Object>;
	public filterGender: Array<Object>;
	errorMsg2: boolean;
	public filteredGender: Array<any>;
	public isBadgeCity : boolean = false;
	public tooltipText: string;




	private subs: Subscription = new Subscription()
	affiliateDetail: any;
	badgeOptions: any;
	filteredOptions: any;
	badge_cities_data: any;

	constructor(
		private affiliateService: AffiliateService,
		private adminService: AdminService,
		private stateManagementService: StateManagementService,
		private authService: AuthService,
		private httpClient: HttpClient,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder,
		private customValidator: CustomvalidationService
	) { }
	@Input() closeTab: EventEmitter<any> = new EventEmitter();

	ngAfterViewInit()
	{
		//set current user country as default in phone number
		this.CellNumberObject.setCountry(this.currentUser.phoneCountry);
		this.DispatchObject.setCountry(this.currentUser.phoneCountry);
		this.FaxObject.setCountry(this.currentUser.phoneCountry);
		this.CompanyCellNumberObject.setCountry(this.currentUser.phoneCountry);
	}

	ngOnInit(): void
	{
		$('.HeadingH1').css({display: "block"})
		this.filterGender = [
			{
				label: "Male",
				value: "Male",
			},
			{
				label: "Female",
				value: "Female",
			},
		];
		$("#genderField").focusout(() =>
		{
			this.errorMsg2 = true;
		});
		this.currentUser = this.authService.currentUserValue;
		// no modal unless uncompleted
		if (this.affiliateService.getLocalStepCompleted().findIndex((item) => item == "1") === -1)
		{
			$("#instructionsModal").modal("show");
		}
		//add affiliate form validation
		this.addAffiliateAccountForm = this.formBuilder.group({
			acc_id: [""],
			AffiliateType: ["", Validators.required],
			FirstName: ["", Validators.required],
			MiddleName: [""],
			LastName: ["", Validators.required],
			Gender: ["male", Validators.required],
			badge_city :[''],
			badge_city_name:[''],
			CellNumber: [
				this.currentUser.phone,
				[
					Validators.required,
					Validators.pattern("^[0-9]*$"),
					Validators.minLength(4),
					Validators.maxLength(15),
					this.customValidator.dashValidator(),
					this.customValidator.plusValidator(),
				],
			],
			CellIsd: ["+1", Validators.required],
			CellNumberCountry: ["us", Validators.required],
			Email: [
				"",
				[
					Validators.required,
					Validators.pattern("^[a-zA-Z0-9.]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
				],
			],
			FirstYearBusiness: ["2022", [Validators.required]],
			CompanyName: [""],
			DBA: [""],
			Dispatch: [
				"",
				[
					Validators.pattern("^[0-9]*$"),
					Validators.minLength(4),
					Validators.maxLength(15),
					this.customValidator.dashValidator(),
					this.customValidator.plusValidator(),
				],
			],
			DispatchIsd: ["+1"],
			DispatchCountry: ["us"],
			dispatchEmail: [
				"",
				[
					Validators.pattern(
						"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,4}$"
					),
				],
			],
			CompanyCellNumber: [
				"",
				[
					Validators.pattern("^[0-9]*$"),
					Validators.minLength(4),
					Validators.maxLength(15),
					this.customValidator.dashValidator(),
					this.customValidator.plusValidator(),
				],
			],
			CompanyCellIsd: ["+1"],
			CompanyCellNumberCountry: ["us"],
			Fax: [
				"",
				[
					Validators.pattern("^[0-9]*$"),
					Validators.minLength(4),
					Validators.maxLength(15),
					this.customValidator.dashValidator(),
					this.customValidator.plusValidator(),
				],
			],
			cpcn_tpc: [
				"",
				[
					Validators.pattern("^[0-9]*$"),
					Validators.minLength(4),
					Validators.maxLength(15),
					this.customValidator.dashValidator(),
					this.customValidator.plusValidator(),
				],
			],
			FaxIsd: ["+1"],
			FaxCountry: ["us"],
			BusinessFrontPhoto: [""],
			BusinessBackPhoto: [""],
			LanguagesSpoken: this.formBuilder.array([], [Validators.required]),
			LanguagesGet: this.formBuilder.array([]),
			Associations: this.formBuilder.array([]),
			AssociationsGet: this.formBuilder.array([]),
		});


		this.httpClient
			.get("assets/json/businessYear.json")
			.subscribe((data: any) =>
			{
				this.startBusinessYears = data;
			});

		this.spinner.show(); //show spinner
		// Load Our languages using API

		this.adminService.getAllEnableBadgeCities().pipe(
			catchError(err => {
				return throwError(err)
			})
		).subscribe((res:any)=> {
			this.badgeOptions = res?.data
			this.filteredOptions = res?.data
		})
		this.affiliateService
			.getAssicationsLanguages()
			.pipe(
				catchError((err) =>
				{
					this.spinner.hide(); //hide spinner
					return throwError(err);
				})
			)
			.subscribe(({ data }: any) =>
			{
				this.languages = data.languages;
				this.associations = data.associations;
				this.affiliateType = this.currentUser.affiliate_type;
				this.affiliateId = this.currentUser.account_id;
				const AffiliateType = this.currentUser.affiliate_type;
				if (this.affiliateId)
				{
					this.affiliateService
						.getAffiliateAccount(this.affiliateId)
						.pipe(
							catchError((err) =>
							{
								this.spinner.hide(); //hide spinner
								return throwError(err);
							})
						)
						.subscribe(({ data }: any) =>
						{
							this.affiliateDetail = data
							this.addAffiliateAccountForm.patchValue({
								acc_id: data.id,
								FirstName: data.FirstName,
								LastName: data.LastName,
								MiddleName: data.MiddleName,
								Email: data.Email,
								CellNumber: data.CellNumber,
								Gender: data.Gender,
								AffiliateType: data.AffiliateType,
								FirstYearBusiness: data.FirstYearBusiness,
							});
							this.badgeOptions.map((i:any)=>{
								if(i.id==data?.badge_city){
									this.addAffiliateAccountForm.patchValue({
										badge_city:i.id,
										badge_city_name:i.name
									})
								}
							})

							//Show edit/resend button on affiliate email field
							this.updatedAffiliateEmail = data.Email;
							this.affiliateEmailStatus = data.is_email_verified;
							if (this.affiliateEmailStatus == "yes")
							{
								this.affiliateEmailButton = "edit";
								this.affiliateEmailReadonly = true;
							} else
							{
								this.affiliateEmailButton =
									"resend_verification";
								this.affiliateEmailReadonly = false;
							}

							//Show edit/resend button on dispatch email field
							this.updatedDispatchEmail = data.dispatchEmail;
							this.dispatchEmailStatus =
								data.dispatch_is_email_verified;
							if (this.dispatchEmailStatus == "yes")
							{
								this.dispatchEmailButton = "edit";
								this.dispatchEmailReadonly = true;
							} else
							{
								this.dispatchEmailButton =
									"resend_verification";
								this.dispatchEmailReadonly = false;
							}

							//set country flag in phone number fields
							this.CellNumberObject.setCountry(
								data.CellNumberCountry
							);
							if (data.AffiliateType != "gig_operator")
							{
								//set images and their ID
								this.BusinessFrontPhoto =
									data.BusinessFrontPhoto.image;
								this.BusinessBackPhoto =
									data.BusinessBackPhoto.image;
								this.BusinessFrontPhotoId =
									data.BusinessFrontPhoto.ID;
								this.BusinessBackPhotoId =
									data.BusinessBackPhoto.ID;
								this.addAffiliateAccountForm.patchValue({
									CompanyName: data.CompanyName,
									DBA: data.DBA,
									Dispatch: data.Dispatch,
									dispatchEmail: data.dispatchEmail,
									CompanyCellNumber: data.CompanyCellNumber,
									Fax: data.Fax,
									cpcn_tpc: data.cpcn_tpc,
									BusinessFrontPhoto:
										data.BusinessFrontPhoto.ID,
									BusinessBackPhoto:
										data.BusinessBackPhoto.ID,
								});
								this.CompanyCellNumberObject.setCountry(
									data.CompanyCellNumberCountry
								);
								this.DispatchObject.setCountry(
									data.DispatchCountry
								);
								this.FaxObject.setCountry(data.FaxCountry);
							}

							this.affiliateTypeSwitch(
								data.AffiliateType,
								"onRefresh"
							); //to show/hide company information block

							//get and set languages
							const languagesGet: FormArray =
								this.addAffiliateAccountForm.get(
									"LanguagesGet"
								) as FormArray;
							const languageSpoken: FormArray =
								this.addAffiliateAccountForm.get(
									"LanguagesSpoken"
								) as FormArray;
							var i;
							const totalLanguages: any = this.languages;
							const selectedLanguages = data.LanguagesSpoken;
							for (i = 0; i < totalLanguages.length; i++)
							{
								// console.log(totalLanguages[i]);
								var checkedLanguage =
									selectedLanguages.findIndex(function (
										post
									)
									{
										if (post == totalLanguages[i].id)
											return true;
									});
								// console.log(checkedLanguage);
								if (checkedLanguage >= 0)
								{
									var checkBool = true;
								} else
								{
									var checkBool = false;
								}
								languagesGet.push(new FormControl(checkBool));
							}
							this.languagesFormControl = languagesGet.controls;
							var j;
							for (j = 0; j < selectedLanguages.length; j++)
							{
								languageSpoken.push(
									new FormControl(selectedLanguages[j])
								);
							}
							// console.log(languageSpoken);
							//get and set languages ends

							//get and set associations
							const AssociationsGet: FormArray =
								this.addAffiliateAccountForm.get(
									"AssociationsGet"
								) as FormArray;
							const associations: FormArray =
								this.addAffiliateAccountForm.get(
									"Associations"
								) as FormArray;
							var i;
							const totalAssociations: any = this.associations;
							const selectedAssociations = data.Associations;
							for (i = 0; i < totalAssociations.length; i++)
							{
								var checkedAssociation =
									selectedAssociations.findIndex(function (
										post
									)
									{
										if (post == totalAssociations[i].id)
											return true;
									});
								if (checkedAssociation >= 0)
								{
									var checkBool = true;
								} else
								{
									var checkBool = false;
								}
								AssociationsGet.push(
									new FormControl(checkBool)
								);
							}
							this.AssociationsFormControl =
								AssociationsGet.controls;
							var j;
							for (j = 0; j < selectedAssociations.length; j++)
							{
								associations.push(
									new FormControl(selectedAssociations[j])
								);
							}
							console.log("associations");
							//
							this.spinner.hide(); //hide spinner
						});

					//update affiliate email form validation
					this.updateAffiliateEmailForm = this.formBuilder.group({
						// phoneOtp: [
						// 	"",
						// 	[
						// 		Validators.required,
						// 		Validators.pattern("^[0-9]*$"),
						// 		Validators.minLength(6),
						// 		Validators.maxLength(6),
						// 	],
						// ],
						emailOtp: [
							"",
							[
								Validators.required,
								Validators.pattern("^[0-9]*$"),
								Validators.minLength(6),
								Validators.maxLength(6),
							],
						],
					});
					//update dispatch email form validation
					this.updateDispatchEmailForm = this.formBuilder.group({
						phoneOtp: [
							"",
							[
								Validators.required,
								Validators.pattern("^[0-9]*$"),
								Validators.minLength(6),
								Validators.maxLength(6),
							],
						],
						emailOtp: [
							"",
							[
								Validators.required,
								Validators.pattern("^[0-9]*$"),
								Validators.minLength(6),
								Validators.maxLength(6),
							],
						],
					});
				} else
				{
					this.addAffiliateAccountForm.patchValue({
						AffiliateType: AffiliateType ? AffiliateType : "black_limo_operator",
					});
					this.stateManagementService.setprogressBar(false);
					$("#instructionsModal").modal("show");

					this.onLanguageChange("1", true); //set english as default language
				}
				this.spinner.hide(); //hide spinner
			});

	}


	SetFormValue(form_control: string, value: any)
	{
		this.addAffiliateAccountForm.get(form_control).setValue(value)
		this.addAffiliateAccountForm.updateValueAndValidity()
	}

	closeButton()
	{
		this.closeTab.emit();
	}
	back(){
		this.router.navigate(['/affiliate/step0'])
	}
	handleBadgeCity(value:any){
		console.log(value , this.filteredOptions)
		this.filteredOptions = this.badgeOptions.filter((i:any)=> i.name.toLowerCase().includes(value.toLowerCase()))
		if(!value){
		this.isBadgeCity = false	
		}
	}
	selectBadgeCity(option:any,isUserInput){
		console.log('in function selectBadgeCity-->>>' ,option,isUserInput)
		if(isUserInput){
			this.addAffiliateAccountForm.patchValue({
				badge_city:option.id
			})
			// this.addAffiliateAccountForm.updateValueAndValidity()
			this.isBadgeCity = true
		}

	}

	showImageInModal(imageUrl)
	{
		this.modalImage = imageUrl;
		// console.log("11111",imageUrl)
		$("#imageModal").addClass("showImage");
		$("#imageModal").removeClass("d-none");
		// $("#imageModal").show();
	}
	onCountryChange(event, type)
	{
		console.log(event);
		if (type == "CellNumber")
		{
			this.addAffiliateAccountForm.patchValue({
				CellIsd: "+" + event.dialCode,
				CellNumberCountry: event.iso2,
			});
		} else if (type == "CompanyCellNumber")
		{
			this.addAffiliateAccountForm.patchValue({
				CompanyCellIsd: "+" + event.dialCode,
				CompanyCellNumberCountry: event.iso2,
			});
		} else if (type == "Dispatch")
		{
			this.addAffiliateAccountForm.patchValue({
				DispatchIsd: "+" + event.dialCode,
				DispatchCountry: event.iso2,
			});
		} else
		{
			this.addAffiliateAccountForm.patchValue({
				FaxIsd: "+" + event.dialCode,
				FaxCountry: event.iso2,
			});
		}
	}

	telInputObjectCell(obj)
	{
		this.CellNumberObject = obj;
	}
	telInputObjectCompanyCell(obj)
	{
		this.CompanyCellNumberObject = obj;
	}
	telInputObjectFax(obj)
	{
		this.FaxObject = obj;
	}
	telInputObjectDispatch(obj)
	{
		this.DispatchObject = obj;
	}

	onLanguageChange(val, ischecked)
	{
		const languageSpoken: FormArray = this.addAffiliateAccountForm.get(
			"LanguagesSpoken"
		) as FormArray;

		if (ischecked)
		{
			languageSpoken.push(new FormControl(val));
		} else
		{
			const index = languageSpoken.controls.findIndex(
				(x) => x.value === val
			);
			languageSpoken.removeAt(index);
		}
	}

	onAssociationChange(e)
	{
		const associations: FormArray = this.addAffiliateAccountForm.get(
			"Associations"
		) as FormArray;

		if (e.target.checked)
		{
			associations.push(new FormControl(e.target.value));
		} else
		{
			const index = associations.controls.findIndex(
				(x) => x.value === e.target.value
			);
			associations.removeAt(index);
		}
	}

	affiliateTypeSwitch(affiliateType: number | string, onRefresh = null)
	{
		const legend = {
			0: 'black_limo_operator',
			1: 'fleet_operator',
			2: 'taxi_operator',
			3: 'gig_operator'
		}
		if (typeof affiliateType == 'number')
		{
			affiliateType = legend[affiliateType]
		}


		switch (affiliateType)
		{
			case "fleet_operator": {
				this.showCompanyInformation = true;
				this.selectedAffiliate = "fleet_operator";
				this.affiliateInstructionHeading = "Fleet Operator";
				this.affiliateInstruction =
					"Fleet Operators must be fully licensed by city and state with a minimum $1,000,000 liability coverage. Fleet Operators may enter unlimited vehicles and drivers.";
				this.conditionalValidations("fleet_operator");
				this.subs = this.addAffiliateAccountForm.get('Email').valueChanges.subscribe((value) =>
				{
					this.SetFormValue('dispatchEmail', value)
				})
				break;
			}
			case "black_limo_operator": {
				if (this.affiliateId)
				{
					if (this.currentUser.affiliate_type == "fleet_operator")
					{
						this.modalAlertMessage =
							"Fleet Operator can not change on Black Car / Owner Operators";
						$("#affiliateAlertMessageModal").modal("show");
						return false;
					}
				}
				if (!onRefresh)
				{
					$("#affiliateInstructionsModal").modal("show");
				}
				this.showCompanyInformation = true;
				this.selectedAffiliate = "black_limo_operator";
				this.affiliateInstructionHeading =
					"Black Car / Owner Operators";
				this.affiliateInstruction =
					"Black Car / Owner Operators need to be fully licensed by city and state with a $500k/$500k minimum insurance policy. Only 2 vehicle maximum with same driver.";
				this.conditionalValidations("black_limo_operator");
				try
				{
					this.subs.unsubscribe()
				}
				catch (err)
				{
					console.log('Subs is undefined. Returned with Error: ', err)
				}
				break;
			}
			case "taxi_operator": {
				if (this.affiliateId)
				{
					switch (this.currentUser.affiliate_type)
					{
						case "black_limo_operator": {
							this.modalAlertMessage =
								"Black Car / Owner Operators can not change on Taxi Operators";
							$("#affiliateAlertMessageModal").modal("show");
							return false;
						}
						case "fleet_operator": {
							this.modalAlertMessage =
								"Fleet Operators can not change on Taxi Operators";
							$("#affiliateAlertMessageModal").modal("show");
							return false;
						}
						case "gig_operator": {
							this.modalAlertMessage =
								"Gig Operators can not change on Taxi Operators";
							$("#affiliateAlertMessageModal").modal("show");
							return false;
						}
					}
					if (!onRefresh)
					{
						$("#affiliateInstructionsModal").modal("show");
					}
				}
				this.showCompanyInformation = true;
				this.selectedAffiliate = "taxi_operator";
				this.affiliateInstructionHeading = "Taxi Operators";
				this.affiliateInstruction =
					"Taxi Operators need to fully licensed by city and state with a minimum $500k/$500k insurance policy. 1 vehicle operation.";
				this.conditionalValidations("taxi_operator");
				try
				{
					this.subs.unsubscribe()
				}
				catch (err)
				{
					console.log('Subs is undefined. Returned with Error: ', err)
				}
				break;
			}
			case "gig_operator": {
				if (this.affiliateId)
				{
					if (this.currentUser.affiliate_type == "fleet_operator")
					{
						this.modalAlertMessage =
							"Fleet Operator can not change on Gig Operators";
						$("#affiliateAlertMessageModal").modal("show");
						return false;
					}
				}
				if (!onRefresh)
				{
					$("#affiliateInstructionsModal").modal("show");
				}
				this.showCompanyInformation = false;
				this.selectedAffiliate = "gig_operator";
				this.affiliateInstructionHeading = "Gig Operators";
				this.affiliateInstruction = `
				<ul>
				<li>Operate a new Mid-Size Sedan or Larger</li>
				<li>Operate any like new luxury Mid-Size Sedan or Larger</li>
				<li>$ 500,000 Insurance</li>
				<li>6 months Driving Experience</li>
				<li><strong>4.5 Stars</strong> or better</li>
				</ul>`;
				this.conditionalValidations("gig_operator");
				try
				{
					this.subs.unsubscribe()
				}
				catch (err)
				{
					console.log('Subs is undefined. Returned with Error: ', err)
				}
				break;
			}
		}
		this.SetFormValue('AffiliateType', affiliateType)
		if (!onRefresh)
		{
			$("#affiliateInstructionsModal").modal("show");
		}
	}

	searchGender(keyword)
	{
		this.addAffiliateAccountForm.patchValue({
			Gender: "",
		});
		if (keyword == "")
		{
			this.filteredGender = this.filterGender;
		} else
		{
			this.filteredGender = this.filterGender
				.filter((gender: any) =>
				{
					if (gender.label.toLowerCase() === keyword.toLowerCase())
					{
						this.addAffiliateAccountForm.patchValue({
							Gender: gender.value,
						});
					}
					return gender.label
						.toLowerCase()
						.includes(keyword.toLowerCase());
				})
				.sort((a: any, b: any) =>
				{
					return this.searchSorting(keyword, a, b);
				});
		}
	}
	selectGender(val, isSelected)
	{
		if (isSelected)
		{
			// ignore on deselection of the previous option
			this.addAffiliateAccountForm.patchValue({
				Gender: val,
			});
		}
	}

	searchSorting(keyword, a, b)
	{
		// Sort results by matching name with keyword position in name
		if (
			a.label.toLowerCase().indexOf(keyword.toLowerCase()) >
			b.label.toLowerCase().indexOf(keyword.toLowerCase())
		)
		{
			return 1;
		} else if (
			a.label.toLowerCase().indexOf(keyword.toLowerCase()) <
			b.label.toLowerCase().indexOf(keyword.toLowerCase())
		)
		{
			return -1;
		} else
		{
			if (a.label > b.label) return 1;
			else return -1;
		}
	}

	conditionalValidations(affiliateType)
	{
		if (affiliateType != "gig_operator")
		{
			this.addAffiliateAccountForm.controls["CompanyName"].setValidators([
				Validators.required,
			]);
			this.addAffiliateAccountForm.controls[
				"dispatchEmail"
			].setValidators([Validators.required]);
			this.addAffiliateAccountForm.controls["Dispatch"].setValidators([
				Validators.required,
				Validators.pattern("^[0-9]*$"),
				Validators.minLength(4),
				Validators.maxLength(15),
				this.customValidator.dashValidator(),
				this.customValidator.plusValidator(),
			]);
			this.addAffiliateAccountForm.controls["DispatchIsd"].setValidators([
				Validators.required,
			]);
			this.addAffiliateAccountForm.controls[
				"DispatchCountry"
			].setValidators([Validators.required]);
			this.addAffiliateAccountForm.controls[
				"BusinessFrontPhoto"
			].setValidators([Validators.required]);
		} else
		{
			this.addAffiliateAccountForm.controls[
				"CompanyName"
			].clearValidators();
			this.addAffiliateAccountForm.controls[
				"dispatchEmail"
			].clearValidators();
			this.addAffiliateAccountForm.controls["Dispatch"].clearValidators();
			this.addAffiliateAccountForm.controls[
				"DispatchIsd"
			].clearValidators();
			this.addAffiliateAccountForm.controls[
				"DispatchCountry"
			].clearValidators();
			this.addAffiliateAccountForm.controls[
				"BusinessFrontPhoto"
			].clearValidators();
		}
		this.addAffiliateAccountForm.controls[
			"CompanyName"
		].updateValueAndValidity();
		this.addAffiliateAccountForm.controls[
			"dispatchEmail"
		].updateValueAndValidity();
		this.addAffiliateAccountForm.controls[
			"Dispatch"
		].updateValueAndValidity();
		this.addAffiliateAccountForm.controls[
			"DispatchIsd"
		].updateValueAndValidity();
		this.addAffiliateAccountForm.controls[
			"DispatchCountry"
		].updateValueAndValidity();
		this.addAffiliateAccountForm.controls[
			"BusinessFrontPhoto"
		].updateValueAndValidity();
	}

	affiliateEmailButtonClick(action)
	{
		if (action === "edit")
		{
			$("#emailText").addClass("emailText");
			this.affiliateEmailReadonly = false;
			this.affiliateEmailStatus = "in-process";
			this.affiliateEmailButton = "update";
		} else if (action == "save")
		{
			if (
				this.addAffiliateAccountForm.value.Email ===
				this.updatedAffiliateEmail
			)
			{
				this.displayMsg =
					"New entered Email is similar to previous one.";
			} else
			{
				this.displayMsg = "";
				this.affiliateEmailButton = "edit";
				this.affiliateEmailReadonly = true;
				this.affiliateEmailProgressBar = true; //show progressbar
				this.affiliateService
					.editAffiliateEmail(
						this.addAffiliateAccountForm.value.Email
					)
					.pipe(
						catchError((err) =>
						{
							this.affiliateEmailProgressBar = false; //hide progressbar
							return throwError(err);
						})
					)
					.subscribe(({ data }: any) =>
					{
						this.affiliateEmailProgressBar = false; //hide progressbar
						this.snackbarMsg = "OTP sent Successfully";
						this.openSnackbar();
					});
			}
			$("#editAffiliateEmailModal").modal("show");
		} else
		{
			this.disableAffiliateEmailResendButton = true;
			this.stateManagementService.setprogressBar(true);
			this.affiliateService
				.resendAffiliateEmailVerification(
					this.addAffiliateAccountForm.value.Email
				)
				.pipe(
					catchError((err) =>
					{
						this.disableAffiliateEmailResendButton = false;
						this.stateManagementService.setprogressBar(false);
						return throwError(err);
					})
				)
				.subscribe(({ data }: any) =>
				{
					this.disableAffiliateEmailResendButton = false;
					this.stateManagementService.setprogressBar(false);
					this.snackbarMsg = "Email Verification Sent.";
					this.openSnackbar();
				});
		}
	}
	get fAffiliateEmail()
	{
		return this.updateAffiliateEmailForm.controls;
	}
	updateAffiliateEmail()
	{
		console.log(this.updateAffiliateEmailForm);
		this.submittedAffiliateEmailForm = true;
		// stop here if form is invalid
		if (this.updateAffiliateEmailForm.invalid)
		{
			return;
		}
		this.affiliateEmailProgressBar = true; //show progressbar
		this.disableSubmitAffiliateEmailButton = true; //disable submit button

		this.affiliateService
			.updateAffiliateEmail(this.updateAffiliateEmailForm.value)
			.pipe(
				catchError((err) =>
				{
					this.affiliateEmailProgressBar = false; //hide progressbar
					this.disableSubmitAffiliateEmailButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(({ message, success }: any) =>
			{
				this.affiliateEmailProgressBar = false; //hide progressbar
				this.disableSubmitAffiliateEmailButton = false; //enable submit button
				if (success == true)
				{
					this.displayMsg = "Email changed successfully.";
					this.updatedAffiliateEmail =
						this.addAffiliateAccountForm.value.Email;
					this.affiliateEmailStatus = "yes";
				} else
				{
					this.emailErrorMsgs = message;
				}
			});
	}

	dispatchEmailButtonClick(action)
	{
		if (action === "edit")
		{
			$("#email_Text").addClass("emailText");
			this.dispatchEmailReadonly = false;
			this.dispatchEmailStatus = "in-process";
			this.dispatchEmailButton = "update";
		} else if (action == "save")
		{
			if (
				this.addAffiliateAccountForm.value.dispatchEmail ===
				this.updatedDispatchEmail
			)
			{
				this.displayMsg =
					"New entered Email is similar to previous one.";
			} else
			{
				this.displayMsg = "";
				this.dispatchEmailButton = "edit";
				this.dispatchEmailReadonly = true;
				this.dispatchEmailProgressBar = true; //show progressbar
				this.affiliateService
					.editDispatchEmail(
						this.addAffiliateAccountForm.value.dispatchEmail
					)
					.pipe(
						catchError((err) =>
						{
							this.dispatchEmailProgressBar = false; //hide progressbar
							return throwError(err);
						})
					)
					.subscribe(({ data }: any) =>
					{
						this.dispatchEmailProgressBar = false; //hide progressbar
						this.snackbarMsg = "OTP sent Successfully";
						this.openSnackbar();
					});
			}
			$("#editDispatchEmailModal").modal("show");
		} else
		{
			this.disableDispatchEmailResendButton = true;
			this.stateManagementService.setprogressBar(true);
			this.affiliateService
				.resendDispatchEmailVerification(
					this.addAffiliateAccountForm.value.dispatchEmail
				)
				.pipe(
					catchError((err) =>
					{
						this.disableDispatchEmailResendButton = false;
						this.stateManagementService.setprogressBar(false);
						return throwError(err);
					})
				)
				.subscribe(({ data }: any) =>
				{
					this.disableDispatchEmailResendButton = false;
					this.stateManagementService.setprogressBar(false);
					this.snackbarMsg = "Email Verification Sent.";
					this.openSnackbar();
				});
		}
	}
	get fDispatchEmail()
	{
		return this.updateDispatchEmailForm.controls;
	}
	updateDispatchEmail()
	{
		console.log(this.updateDispatchEmailForm);
		this.submittedDispatcheEmailForm = true;
		// stop here if form is invalid
		if (this.updateDispatchEmailForm.invalid)
		{
			return;
		}
		this.dispatchEmailProgressBar = true; //show progressbar
		this.disableSubmitDispatchEmailButton = true; //disable submit button

		this.affiliateService
			.updateDispatchEmail(this.updateDispatchEmailForm.value)
			.pipe(
				catchError((err) =>
				{
					this.dispatchEmailProgressBar = false; //hide progressbar
					this.disableSubmitDispatchEmailButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(({ message, success }: any) =>
			{
				this.dispatchEmailProgressBar = false; //hide progressbar
				this.disableSubmitDispatchEmailButton = false; //enable submit button
				if (success == true)
				{
					this.displayMsg = "Email changed successfully.";
					this.updatedDispatchEmail =
						this.addAffiliateAccountForm.value.Email;
					this.dispatchEmailStatus = "yes";
				} else
				{
					this.emailErrorMsgs = message;
				}
			});
	}

	openSnackbar()
	{
		var x = document.getElementById("snackbar");
		x.className = "show";
		setTimeout(function ()
		{
			x.className = x.className.replace("show", "");
		}, 5000);
	}

	businessCardImageChange(event, imageType, imageId = null)
	{
		this.stateManagementService.setprogressBar(true); //show progressBar
		const reader = new FileReader();
		if (event.target.files && event.target.files.length)
		{
			const [file] = event.target.files;
			reader.readAsDataURL(file);
			reader.onload = () =>
			{
				this.imageSrc = reader.result as string;
				this.affiliateService
					.uploadVehicleImage(this.imageSrc)
					.pipe(
						catchError((err) =>
						{
							this.stateManagementService.setprogressBar(false); // hide progressBar
							return throwError(err);
						})
					)
					.subscribe(({ data }: any) =>
					{
						switch (imageType)
						{
							case "BusinessFrontPhoto": {
								this.addAffiliateAccountForm.patchValue({
									BusinessFrontPhoto: data.id,
								});
								this.BusinessFrontPhoto = data.image;
								this.BusinessFrontPhotoId = data.id;
								break;
							}
							case "BusinessBackPhoto": {
								this.addAffiliateAccountForm.patchValue({
									BusinessBackPhoto: data.id,
								});
								this.BusinessBackPhoto = data.image;
								this.BusinessBackPhotoId = data.id;
								break;
							}
							default: {
								break;
							}
						}
						this.stateManagementService.setprogressBar(false); // hide progressBar
					});
			};
		}
		// console.log(this.addInsuranceForm.value);
	}

	deleteImage(id, imageType)
	{
		switch (imageType)
		{
			case "BusinessFrontPhoto": {
				this.addAffiliateAccountForm.patchValue({
					BusinessFrontPhoto: "",
				});
				this.BusinessFrontPhoto = "";
				break;
			}
			case "BusinessBackPhoto": {
				this.addAffiliateAccountForm.patchValue({
					BusinessBackPhoto: "",
				});
				this.BusinessBackPhoto = "";
				break;
			}
			default: {
				break;
			}
		}
	}
	// Focus on FirstName field
	FocusField()
	{
		$("#FirstName").focus();
	}

	get f()
	{
		return this.addAffiliateAccountForm.controls;
	}

	submitForm()
	{
		console.log(this.addAffiliateAccountForm);
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addAffiliateAccountForm.invalid)
		{
			return;
		}
		this.addAffiliateAccountForm.value.stepCompleted =
			this.affiliateService.getUpdatedStepsLocal("1");

		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button

		this.affiliateService
			.addAffiliateAccount(this.addAffiliateAccountForm.value)
			.pipe(
				catchError((err) =>
				{
					this.spinner.hide(); //hide spinner
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(({ success, data }: any) =>
			{
				this.spinner.hide(); //hide spinner
				this.disableSubmitButton = false; //enable submit button

				if (!this.addAffiliateAccountForm.value.id)
				{
					console.log(data, "check data");
					console.log(
						"Id not get",
						this.addAffiliateAccountForm.value.id
					);
					localStorage.setItem(
						"currentUser",
						JSON.stringify(data.user)
					);
					if (success == true)
					{
						this.affiliateService.updateStepsLocal("1");
					}

					this.router
						.navigateByUrl("/RefreshComponent", {
							skipLocationChange: true,
						})
						.then(() =>
						{
							this.router.navigate(["/affiliate/step2"]);
						});
				} else
				{
					console.log("Id get");
					this.router.navigate(["/affiliate/step1"]);
				}
				//save value in session storage to show email sent modal on next step
				if (!this.addAffiliateAccountForm.value.acc_id)
				{
					sessionStorage.setItem("showEmailVerificationAlert", "yes");
				}
			});
	}
	fetchImageBlob(url ,key ,id){
		this.stateManagementService.setprogressBar(true);
		
		this.adminService.fetchImageBlob(url)
		.pipe(
			catchError(err => {
				this.stateManagementService.setprogressBar(false);
				return throwError(err);
			})
		)
		.subscribe(async({ data }: any) => {
			this.stateManagementService.setprogressBar(false);
			const response = await fetch(data);
			const imageBlob = await response.blob()
			console.log('imageBlob',imageBlob)
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();
		img.src = URL.createObjectURL(imageBlob);
		console.log('img-->' , img)
		img.onload = () => {
			// Rotate the image by 90 degrees (or your desired angle)
			canvas.width = img.width; 
			canvas.height = img.height;
			ctx.translate(canvas.width / 2, canvas.height / 2);
			ctx.rotate(Math.PI); // Rotate by 180 degrees
			ctx.drawImage(img, -img.width / 2, -img.height / 2);
			// ctx.drawImage(img, 0, -canvas.width);

			// Convert the canvas to a Blob (JPEG format)
			canvas.toBlob((blob) => {
				console.log(blob);

				this.blobToDataURL(blob, key ,id);
				// });
			}, "image/jpeg");
		}
		})
	}
	blobToDataURL(blob: Blob , key , id) {
		var reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onload = () => {
			let dataUrl = reader.result;
			console.log(dataUrl); //DataURL
			this.businessCardImageChange1(dataUrl, key,id);
		};
	}

	businessCardImageChange1(imageUrl, imageType, imageId = null)
	{
		this.stateManagementService.setprogressBar(true); //show progressBar
				this.imageSrc = imageUrl;
				this.affiliateService
					.uploadVehicleImage(this.imageSrc)
					.pipe(
						catchError((err) =>
						{
							this.stateManagementService.setprogressBar(false); // hide progressBar
							return throwError(err);
						})
					)
					.subscribe(({ data }: any) =>
					{
						switch (imageType)
						{
							case "BusinessFrontPhoto": {
								this.addAffiliateAccountForm.patchValue({
									BusinessFrontPhoto: data.id,
								});
								this.BusinessFrontPhoto = data.image;
								this.BusinessFrontPhotoId = data.id;
								break;
							}
							case "BusinessBackPhoto": {
								this.addAffiliateAccountForm.patchValue({
									BusinessBackPhoto: data.id,
								});
								this.BusinessBackPhoto = data.image;
								this.BusinessBackPhotoId = data.id;
								break;
							}
							default: {
								break;
							}
						}
						this.stateManagementService.setprogressBar(false); // hide progressBar
					});
		// console.log(this.addInsuranceForm.value);
	}

	changeLang(event)
	{
		console.log(event);

		var $frame = $(".goog-te-menu-frame:first");
		if (!$frame.size())
		{
			alert("Error: Could not find Google translate frame.");
			return false;
		}
		$frame
			.contents()
			.find(".goog-te-menu2-item span.text:contains(" + event.value + ")")
			.get(0)
			.click();
		return false;
	}
	scroll(id){
		let el = document.getElementById(id);
		let elementRect = el.getBoundingClientRect();
		let absoluteElementTop = elementRect.top + window.pageYOffset;
		let topElement = absoluteElementTop - 200;
		
		console.log(`scrolling to ${id}`, el , absoluteElementTop ,window.innerHeight);
		window.scrollTo({
			top: topElement,
			behavior: 'smooth'
		});
	}
	changeTooltipText(value){
		if(value == "black_limo_operator"){
			this.tooltipText = "Only 2 vehicle maximum with same driver."
		}
		else if(value == "fleet_operator"){
			this.tooltipText = "Fleet Operators may enter unlimited vehicles and drivers."
		}
		else if(value == "taxi_operator"){
			this.tooltipText = "Operators can only have 1 vehicle operation."
		}
		else{
			this.tooltipText = "Operate any like new luxury Mid-Size Sedan or Larger"
		}
	}

	resetForm()
	{
		console.log('this.affiliateDetail?.acc_id--->>' , this.affiliateDetail)
		// this.addAffiliateAccountForm.reset();
		this.addAffiliateAccountForm = this.formBuilder.group({
			acc_id: [this.affiliateDetail?.id],
			AffiliateType: ["", Validators.required],
			FirstName: ["", Validators.required],
			MiddleName: [""],
			LastName: ["", Validators.required],
			Gender: ["", Validators.required],
			badge_city :[''],
			badge_city_name:[''],
			CellNumber: [
				this.currentUser.phone,
				[
					Validators.required,
					Validators.pattern("^[0-9]*$"),
					Validators.minLength(4),
					Validators.maxLength(15),
					this.customValidator.dashValidator(),
					this.customValidator.plusValidator(),
				],
			],
			CellIsd: ["+1", Validators.required],
			CellNumberCountry: ["us", Validators.required],
			Email: [
				"",
				[
					Validators.required,
					Validators.pattern("^[a-zA-Z0-9.]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
				],
			],
			FirstYearBusiness: ["", [Validators.required]],
			CompanyName: ["" , [Validators.required]],
			DBA: [""],
			Dispatch: [
				"",
				[
					Validators.pattern("^[0-9]*$"),
					Validators.minLength(4),
					Validators.maxLength(15),
					Validators.required,
					this.customValidator.dashValidator(),
					this.customValidator.plusValidator(),
				],
			],
			DispatchIsd: ["+1"],
			DispatchCountry: ["us"],
			dispatchEmail: [
				"",
				[
					Validators.pattern(
						"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,4}$"
					),
				],
			],
			CompanyCellNumber: [
				"",
				[
					Validators.pattern("^[0-9]*$"),
					Validators.minLength(4),
					Validators.maxLength(15),
					this.customValidator.dashValidator(),
					this.customValidator.plusValidator(),
				],
			],
			CompanyCellIsd: ["+1"],
			CompanyCellNumberCountry: ["us"],
			Fax: [
				"",
				[
					Validators.pattern("^[0-9]*$"),
					Validators.minLength(4),
					Validators.maxLength(15),
					this.customValidator.dashValidator(),
					this.customValidator.plusValidator(),
				],
			],
			cpcn_tpc: [
				"",
				[
					Validators.pattern("^[0-9]*$"),
					Validators.minLength(4),
					Validators.maxLength(15),
					this.customValidator.dashValidator(),
					this.customValidator.plusValidator(),
				],
			],
			FaxIsd: ["+1"],
			FaxCountry: ["us"],
			BusinessFrontPhoto: ["" , [Validators.required]],
			BusinessBackPhoto: [""],
			LanguagesSpoken: this.formBuilder.array([], [Validators.required]),
			LanguagesGet: this.formBuilder.array([]),
			Associations: this.formBuilder.array([]),
			AssociationsGet: this.formBuilder.array([]),
		});
		this.BusinessFrontPhoto = "";
		this.BusinessBackPhoto = "";
		this.onLanguageChange("1", true);
		this.addAffiliateAccountForm.patchValue({
			Email: this.affiliateDetail.Email,
			CellNumber: this.affiliateDetail.CellNumber,
			AffiliateType : this.affiliateDetail.AffiliateType
		});
		if (this.affiliateDetail.AffiliateType != "gig_operator")
							{
								this.addAffiliateAccountForm.patchValue({
									dispatchEmail: this.affiliateDetail.dispatchEmail,
								});
							}
		this.addAffiliateAccountForm.updateValueAndValidity()
		this.scroll('owner_info')
	}
}
