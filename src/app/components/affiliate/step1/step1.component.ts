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

			this.badge_cities_data= [
				{
					"id": 1,
					"name": "Hong Kong",
					"sort_order": 1,
					"status": "enable"
				},
				{
					"id": 2,
					"name": "Singapore",
					"sort_order": 2,
					"status": "enable"
				},
				{
					"id": 3,
					"name": "London",
					"sort_order": 3,
					"status": "enable"
				},
				{
					"id": 4,
					"name": "Bangkok",
					"sort_order": 4,
					"status": "enable"
				},
				{
					"id": 5,
					"name": "Kuala Lumpur",
					"sort_order": 5,
					"status": "enable"
				},
				{
					"id": 6,
					"name": "Macau",
					"sort_order": 6,
					"status": "enable"
				},
				{
					"id": 7,
					"name": "New York City",
					"sort_order": 7,
					"status": "enable"
				},
				{
					"id": 8,
					"name": "Shenzhen",
					"sort_order": 8,
					"status": "enable"
				},
				{
					"id": 9,
					"name": "Paris",
					"sort_order": 9,
					"status": "enable"
				},
				{
					"id": 10,
					"name": "Antalya",
					"sort_order": 10,
					"status": "enable"
				},
				{
					"id": 11,
					"name": "Rome",
					"sort_order": 11,
					"status": "enable"
				},
				{
					"id": 12,
					"name": "Istanbul",
					"sort_order": 12,
					"status": "enable"
				},
				{
					"id": 13,
					"name": "Dubai",
					"sort_order": 13,
					"status": "enable"
				},
				{
					"id": 14,
					"name": "Guangzhou",
					"sort_order": 14,
					"status": "enable"
				},
				{
					"id": 15,
					"name": "Phuket",
					"sort_order": 15,
					"status": "enable"
				},
				{
					"id": 16,
					"name": "Shanghai",
					"sort_order": 16,
					"status": "enable"
				},
				{
					"id": 17,
					"name": "Prague",
					"sort_order": 17,
					"status": "enable"
				},
				{
					"id": 18,
					"name": "Miami",
					"sort_order": 18,
					"status": "enable"
				},
				{
					"id": 19,
					"name": "Taipei",
					"sort_order": 19,
					"status": "enable"
				},
				{
					"id": 20,
					"name": "Vatican City",
					"sort_order": 20,
					"status": "enable"
				},
				{
					"id": 21,
					"name": "Las Vegas",
					"sort_order": 21,
					"status": "enable"
				},
				{
					"id": 22,
					"name": "Pattaya",
					"sort_order": 22,
					"status": "enable"
				},
				{
					"id": 23,
					"name": "Barcelona",
					"sort_order": 23,
					"status": "enable"
				},
				{
					"id": 24,
					"name": "Moscow",
					"sort_order": 24,
					"status": "enable"
				},
				{
					"id": 25,
					"name": "Beijing",
					"sort_order": 25,
					"status": "enable"
				},
				{
					"id": 26,
					"name": "Vienna",
					"sort_order": 26,
					"status": "enable"
				},
				{
					"id": 27,
					"name": "Budapest",
					"sort_order": 27,
					"status": "enable"
				},
				{
					"id": 28,
					"name": "Los Angeles",
					"sort_order": 28,
					"status": "enable"
				},
				{
					"id": 29,
					"name": "Sofia",
					"sort_order": 29,
					"status": "enable"
				},
				{
					"id": 30,
					"name": "Madrid",
					"sort_order": 30,
					"status": "enable"
				},
				{
					"id": 31,
					"name": "Amsterdam",
					"sort_order": 31,
					"status": "enable"
				},
				{
					"id": 32,
					"name": "Orlando",
					"sort_order": 32,
					"status": "enable"
				},
				{
					"id": 33,
					"name": "Ho Chi Minh City",
					"sort_order": 33,
					"status": "enable"
				},
				{
					"id": 34,
					"name": "Mecca",
					"sort_order": 34,
					"status": "enable"
				},
				{
					"id": 35,
					"name": "Warsaw",
					"sort_order": 35,
					"status": "enable"
				},
				{
					"id": 36,
					"name": "Lima",
					"sort_order": 36,
					"status": "enable"
				},
				{
					"id": 37,
					"name": "Cairo",
					"sort_order": 37,
					"status": "enable"
				},
				{
					"id": 38,
					"name": "Nairobi",
					"sort_order": 38,
					"status": "enable"
				},
				{
					"id": 39,
					"name": "Hangzhou",
					"sort_order": 39,
					"status": "enable"
				},
				{
					"id": 40,
					"name": "Mexico City",
					"sort_order": 40,
					"status": "enable"
				},
				{
					"id": 41,
					"name": "Milan",
					"sort_order": 41,
					"status": "enable"
				},
				{
					"id": 42,
					"name": "Venice",
					"sort_order": 42,
					"status": "enable"
				},
				{
					"id": 43,
					"name": "Buenos Aires",
					"sort_order": 43,
					"status": "enable"
				},
				{
					"id": 44,
					"name": "San Francisco",
					"sort_order": 44,
					"status": "enable"
				},
				{
					"id": 45,
					"name": "Mumbai",
					"sort_order": 45,
					"status": "enable"
				},
				{
					"id": 46,
					"name": "Mugla",
					"sort_order": 46,
					"status": "enable"
				},
				{
					"id": 47,
					"name": "Seoul",
					"sort_order": 47,
					"status": "enable"
				},
				{
					"id": 48,
					"name": "Dublin",
					"sort_order": 48,
					"status": "enable"
				},
				{
					"id": 49,
					"name": "Denpasar",
					"sort_order": 49,
					"status": "enable"
				},
				{
					"id": 50,
					"name": "Delhi",
					"sort_order": 50,
					"status": "enable"
				},
				{
					"id": 51,
					"name": "St. Petersburg",
					"sort_order": 51,
					"status": "enable"
				},
				{
					"id": 52,
					"name": "Burgas",
					"sort_order": 52,
					"status": "enable"
				},
				{
					"id": 53,
					"name": "Sydney",
					"sort_order": 53,
					"status": "enable"
				},
				{
					"id": 54,
					"name": "Djerba",
					"sort_order": 54,
					"status": "enable"
				},
				{
					"id": 55,
					"name": "Jerusalem",
					"sort_order": 55,
					"status": "enable"
				},
				{
					"id": 56,
					"name": "Munich",
					"sort_order": 56,
					"status": "enable"
				},
				{
					"id": 57,
					"name": "Johannesburg",
					"sort_order": 57,
					"status": "enable"
				},
				{
					"id": 58,
					"name": "Cancun",
					"sort_order": 58,
					"status": "enable"
				},
				{
					"id": 59,
					"name": "Edirne",
					"sort_order": 59,
					"status": "enable"
				},
				{
					"id": 60,
					"name": "Suzhou",
					"sort_order": 60,
					"status": "enable"
				},
				{
					"id": 61,
					"name": "Bucharest",
					"sort_order": 61,
					"status": "enable"
				},
				{
					"id": 62,
					"name": "Punta Cana",
					"sort_order": 62,
					"status": "enable"
				},
				{
					"id": 63,
					"name": "Agra",
					"sort_order": 63,
					"status": "enable"
				},
				{
					"id": 64,
					"name": "Jaipur",
					"sort_order": 64,
					"status": "enable"
				},
				{
					"id": 65,
					"name": "Brussels",
					"sort_order": 65,
					"status": "enable"
				},
				{
					"id": 66,
					"name": "Nice",
					"sort_order": 66,
					"status": "enable"
				},
				{
					"id": 67,
					"name": "Chiang Mai",
					"sort_order": 67,
					"status": "enable"
				},
				{
					"id": 68,
					"name": "Sharm-el- Sheikh",
					"sort_order": 68,
					"status": "enable"
				},
				{
					"id": 69,
					"name": "Jakarta",
					"sort_order": 69,
					"status": "enable"
				},
				{
					"id": 70,
					"name": "Marrakesh",
					"sort_order": 70,
					"status": "enable"
				},
				{
					"id": 71,
					"name": "Lisbon",
					"sort_order": 71,
					"status": "enable"
				},
				{
					"id": 72,
					"name": "Auckland",
					"sort_order": 72,
					"status": "enable"
				},
				{
					"id": 73,
					"name": "Guilin",
					"sort_order": 73,
					"status": "enable"
				},
				{
					"id": 74,
					"name": "Manila",
					"sort_order": 74,
					"status": "enable"
				},
				{
					"id": 75,
					"name": "Honolulu",
					"sort_order": 75,
					"status": "enable"
				},
				{
					"id": 76,
					"name": "Hanoi",
					"sort_order": 76,
					"status": "enable"
				},
				{
					"id": 77,
					"name": "Melbourne",
					"sort_order": 77,
					"status": "enable"
				},
				{
					"id": 78,
					"name": "Rio de Janeiro",
					"sort_order": 78,
					"status": "enable"
				},
				{
					"id": 79,
					"name": "Florence",
					"sort_order": 79,
					"status": "enable"
				},
				{
					"id": 80,
					"name": "Doha",
					"sort_order": 80,
					"status": "enable"
				},
				{
					"id": 81,
					"name": "Kiev",
					"sort_order": 81,
					"status": "enable"
				},
				{
					"id": 82,
					"name": "Abu Dhabi",
					"sort_order": 82,
					"status": "enable"
				},
				{
					"id": 83,
					"name": "Vancouver",
					"sort_order": 83,
					"status": "enable"
				},
				{
					"id": 84,
					"name": "Amman",
					"sort_order": 84,
					"status": "enable"
				},
				{
					"id": 85,
					"name": "Sousse",
					"sort_order": 85,
					"status": "enable"
				},
				{
					"id": 86,
					"name": "Siem Reap",
					"sort_order": 86,
					"status": "enable"
				},
				{
					"id": 87,
					"name": "Kolkata",
					"sort_order": 87,
					"status": "enable"
				},
				{
					"id": 88,
					"name": "Nanjing",
					"sort_order": 88,
					"status": "enable"
				},
				{
					"id": 89,
					"name": "Baku",
					"sort_order": 89,
					"status": "enable"
				},
				{
					"id": 90,
					"name": "Frankfurt",
					"sort_order": 90,
					"status": "enable"
				},
				{
					"id": 91,
					"name": "Christchurch",
					"sort_order": 91,
					"status": "enable"
				},
				{
					"id": 92,
					"name": "Riyadh",
					"sort_order": 92,
					"status": "enable"
				},
				{
					"id": 93,
					"name": "Cape Town",
					"sort_order": 93,
					"status": "enable"
				},
				{
					"id": 94,
					"name": "Krakow",
					"sort_order": 94,
					"status": "enable"
				},
				{
					"id": 95,
					"name": "Edinburgh",
					"sort_order": 95,
					"status": "enable"
				},
				{
					"id": 96,
					"name": "Athens",
					"sort_order": 96,
					"status": "enable"
				},
				{
					"id": 97,
					"name": "Montreal",
					"sort_order": 97,
					"status": "enable"
				},
				{
					"id": 98,
					"name": "Kathmandu",
					"sort_order": 98,
					"status": "enable"
				},
				{
					"id": 99,
					"name": "Kyoto",
					"sort_order": 99,
					"status": "enable"
				},
				{
					"id": 100,
					"name": "Stockholm",
					"sort_order": 100,
					"status": "enable"
				},
				{
					"id": 101,
					"name": "Luang Prabang",
					"sort_order": 101,
					"status": "enable"
				},
				{
					"id": 102,
					"name": "Perth",
					"sort_order": 102,
					"status": "enable"
				},
				{
					"id": 103,
					"name": "Dubrovnik",
					"sort_order": 103,
					"status": "enable"
				},
				{
					"id": 104,
					"name": "Seattle",
					"sort_order": 104,
					"status": "enable"
				},
				{
					"id": 105,
					"name": "Tehran",
					"sort_order": 105,
					"status": "enable"
				},
				{
					"id": 106,
					"name": "cartagena",
					"sort_order": 106,
					"status": "enable"
				},
				{
					"id": 107,
					"name": "Zanzibar",
					"sort_order": 107,
					"status": "enable"
				},
				{
					"id": 108,
					"name": "Fes",
					"sort_order": 108,
					"status": "enable"
				},
				{
					"id": 109,
					"name": "Helsinki",
					"sort_order": 109,
					"status": "enable"
				},
				{
					"id": 110,
					"name": "Santiago",
					"sort_order": 110,
					"status": "enable"
				},
				{
					"id": 111,
					"name": "Quebec City",
					"sort_order": 111,
					"status": "enable"
				},
				{
					"id": 112,
					"name": "Glasgow",
					"sort_order": 112,
					"status": "enable"
				},
				{
					"id": 113,
					"name": "Dhaka",
					"sort_order": 113,
					"status": "enable"
				},
				{
					"id": 114,
					"name": "Bratislava",
					"sort_order": 114,
					"status": "enable"
				},
				{
					"id": 115,
					"name": "Panama City",
					"sort_order": 115,
					"status": "enable"
				},
				{
					"id": 116,
					"name": "Muscat",
					"sort_order": 116,
					"status": "enable"
				},
				{
					"id": 117,
					"name": "San Sebastian, Spain",
					"sort_order": 117,
					"status": "enable"
				},
				{
					"id": 118,
					"name": "Riga",
					"sort_order": 118,
					"status": "enable"
				},
				{
					"id": 119,
					"name": "Zagreb",
					"sort_order": 119,
					"status": "enable"
				},
				{
					"id": 120,
					"name": "Reykjavik",
					"sort_order": 120,
					"status": "enable"
				},
				{
					"id": 121,
					"name": "Tel Aviv",
					"sort_order": 121,
					"status": "enable"
				},
				{
					"id": 122,
					"name": "Hiroshima",
					"sort_order": 122,
					"status": "enable"
				},
				{
					"id": 123,
					"name": "Beirut",
					"sort_order": 123,
					"status": "enable"
				},
				{
					"id": 124,
					"name": "Mendoza",
					"sort_order": 124,
					"status": "enable"
				},
				{
					"id": 125,
					"name": "Belgrade",
					"sort_order": 125,
					"status": "enable"
				},
				{
					"id": 126,
					"name": "Bukhara",
					"sort_order": 126,
					"status": "enable"
				},
				{
					"id": 127,
					"name": "Kampala",
					"sort_order": 127,
					"status": "enable"
				},
				{
					"id": 128,
					"name": "Vilnius",
					"sort_order": 128,
					"status": "enable"
				},
				{
					"id": 129,
					"name": "Quito",
					"sort_order": 129,
					"status": "enable"
				},
				{
					"id": 130,
					"name": "Asuncion",
					"sort_order": 130,
					"status": "enable"
				},
				{
					"id": 131,
					"name": "Bogota",
					"sort_order": 131,
					"status": "enable"
				},
				{
					"id": 132,
					"name": "Malaga",
					"sort_order": 132,
					"status": "enable"
				},
				{
					"id": 133,
					"name": "Lahore",
					"sort_order": 133,
					"status": "enable"
				},
				{
					"id": 134,
					"name": "Karachi",
					"sort_order": 134,
					"status": "enable"
				},
				{
					"id": 135,
					"name": "Kinshasa",
					"sort_order": 135,
					"status": "enable"
				},
				{
					"id": 136,
					"name": "Mombasa",
					"sort_order": 136,
					"status": "enable"
				},
				{
					"id": 137,
					"name": "Bangalore",
					"sort_order": 137,
					"status": "enable"
				},
				{
					"id": 138,
					"name": "Abidjan",
					"sort_order": 138,
					"status": "enable"
				},
				{
					"id": 139,
					"name": "Valletta",
					"sort_order": 139,
					"status": "enable"
				},
				{
					"id": 140,
					"name": "La Paz",
					"sort_order": 140,
					"status": "enable"
				},
				{
					"id": 141,
					"name": "Tokyo",
					"sort_order": 141,
					"status": "enable"
				},
				{
					"id": 142,
					"name": "East Province ",
					"sort_order": 142,
					"status": "enable"
				},
				{
					"id": 143,
					"name": "Washington D.C.",
					"sort_order": 143,
					"status": "enable"
				},
				{
					"id": 144,
					"name": "Chicago",
					"sort_order": 144,
					"status": "enable"
				},
				{
					"id": 145,
					"name": "Havana",
					"sort_order": 145,
					"status": "enable"
				},
				{
					"id": 146,
					"name": "Sarajevo",
					"sort_order": 146,
					"status": "enable"
				},
				{
					"id": 147,
					"name": "Damascus",
					"sort_order": 147,
					"status": "enable"
				},
				{
					"id": 148,
					"name": "Seville",
					"sort_order": 148,
					"status": "enable"
				},
				{
					"id": 149,
					"name": "Cusco",
					"sort_order": 149,
					"status": "enable"
				},
				{
					"id": 150,
					"name": "Phnom Penh",
					"sort_order": 150,
					"status": "enable"
				}
			]
			this.badgeOptions = JSON.parse(JSON.stringify(this.badge_cities_data)) 
			this.filteredOptions = JSON.parse(JSON.stringify(this.badge_cities_data))
			// this.adminService.getAllEnableBadgeCities().pipe(
			// 	catchError(err => {
			// 		return throwError(err)
			// 	})
			// ).subscribe((res:any)=> {
			// 	this.badgeOptions = res?.data
			// 	this.filteredOptions = res?.data
			// })
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
	handleBadgeCity(value:any){
		console.log(value , this.filteredOptions)
		this.filteredOptions = this.badgeOptions.filter((i:any)=> i.name.toLowerCase().includes(value.toLowerCase()))
	}
	selectBadgeCity(option:any,isUserInput){
		console.log('in function selectBadgeCity-->>>' ,isUserInput)
		if(isUserInput){
			this.addAffiliateAccountForm.patchValue({
				badge_city:option.id
			})
			// this.addAffiliateAccountForm.updateValueAndValidity()
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

	resetForm()
	{
		// this.addAffiliateAccountForm.reset();
		this.addAffiliateAccountForm = this.formBuilder.group({
			acc_id: [""],
			AffiliateType: ["", Validators.required],
			FirstName: ["", Validators.required],
			MiddleName: [""],
			LastName: ["", Validators.required],
			Gender: ["", Validators.required],
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
	}
}
