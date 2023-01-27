import { AfterViewInit, AfterViewChecked, Component, EventEmitter, Input, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { StateManagementService } from '../../../services/statemanagement.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { formatDate } from '@angular/common';
import { ThemePalette } from '@angular/material/core';
import { HttpClient } from "@angular/common/http";
import { CustomvalidationService } from '../../../services/customvalidation.service';
import { SharedModule } from '../../shared/shared.module';
declare var $: any;

@Component({
	selector: 'app-add-driver',
	templateUrl: './add-driver.component.html',
	styleUrls: ['./add-driver.component.scss']
})
export class AddDriverComponent implements OnInit {
	globalFunctions = this.globals

	color: ThemePalette = 'primary';
	public driverId: string;
	public paramResponse: any;
	public imageSrc: string;
	public addDriverForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public response2: any;
	public affiliateId: string;
	public driverAdded: boolean = false;
	public DriverImage: string;
	public DriverLicense: string;
	public StarRating: string;
	public VeteranIdCard: string;
	public DoDImage: string;
	public FoidCardImage: string;
	public BackgroundCheckerID: string;
	public VaccinationCardImage: string;
	public DriverImageId: string;
	public DriverLicenseId: string;
	public StarRatingId: string;
	public VeteranIdCardId: string;
	public DoDImageId: string;
	public schoolBusCertificateImage: string;
	public schoolBusCertificateImageId: string;
	public FoidCardImageId: string;
	public BackgroundCheckerIDId: string;
	public VaccinationCardImageId: string;
	public languages: any;
	public languagesFormControl: any;
	public dresses: any;
	public affiliateType: any;
	public currentUser: any;

	public VeteranCheck: boolean = false;
	public DoDCheck: boolean = false;
	public FoidCheck: boolean = false;
	public Covid19VaccinationCheck: boolean = false;
	public BackgroundCertificateCheck: boolean = false;
	public ExPoliceCheck: boolean = false;
	public SchoolBusCertifiedCheck: boolean = false;
	public CellNumberObject: any;
	public BackgroundCompanyTelNumberObject: any;
	public BackgroundCompanyTelNumber: any;
	public PoliceForceTelephoneObject: any;
	public PoliceForceTelephone: any;
	public currentDate: string;
	public modalImage: string;
	public countryOptions: any = [];
	public stateOptions: any = [];

	@Input() closeTab: EventEmitter<any> = new EventEmitter();
	constructor(
		private adminService: AdminService,
		private router: Router,
		private formBuilder: FormBuilder,
		private spinner: NgxSpinnerService,
		private stateManagementService: StateManagementService,
		private activatedroute: ActivatedRoute,
		private httpClient: HttpClient,
		private customValidator: CustomvalidationService,
		private globals: SharedModule) { }

	ngAfterViewInit() {
		//set current user country as default in phone number
		this.CellNumberObject.setCountry(this.currentUser.CellNumberCountry);
		this.BackgroundCompanyTelNumberObject.setCountry(this.currentUser.CellNumberCountry);
		this.PoliceForceTelephoneObject.setCountry(this.currentUser.CellNumberCountry);
		this.changeCountry(this.currentUser.CellNumberCountry.toUpperCase());
		this.addDriverForm.patchValue({
			Country: this.currentUser.CellNumberCountry.toUpperCase()
		});
	}
	ngAfterViewChecked() {
		$(".backbutton").tooltip({
			trigger: 'hover'
		});
		$(".backbutton").on('mouseleave', function () {
			$(this).tooltip('dispose');
		});
		$(".backbutton").on('click', function () {
			$(this).tooltip('dispose');
		});
	}
	ngOnInit(): void {
		this.currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');

		//pick driver id from query params
		this.activatedroute.queryParamMap
			.subscribe((params) => {
				this.paramResponse = { ...params.keys, ...params };
				this.driverId = this.paramResponse.params.driverId;
			}
			);

		this.currentUser = JSON.parse(sessionStorage.getItem("affiliateUserData"));
		this.affiliateId = sessionStorage.getItem("affiliateId");
		//hide star rating field
		this.affiliateType = this.currentUser.AffiliateType;

		//add driver form validation
		this.addDriverForm = this.formBuilder.group({
			id: [''],//driver id for edit purpose
			acc_id: [this.affiliateId, Validators.required],//affiliate account id
			FirstName: ['', Validators.required],
			MiddleName: [''],
			LastName: ['', Validators.required],
			Gender: ['male', Validators.required],
			CellNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			CellIsd: ['+1', Validators.required],
			CellNumberCountry: ['us', Validators.required],
			Email: ['', [Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
			Dress: ['', Validators.required],
			StartDate: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(4), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			FluentLanguages: this.formBuilder.array([], [Validators.required]),
			LanguagesGet: this.formBuilder.array([]),
			Veteran: ['no'],
			DoD: ['no'],
			FoidCard: ['no'],
			SchoolBusCertified: ['no', Validators.required],
			Covid19Vaccination: ['no'],
			BackgroundCertified: ['no'],
			ExPolice: ['no'],
			DriverImage: ['', Validators.required],
			DriverLicense: ['', Validators.required],
			StarRating: [''],
			starRatingValue: [''],
			VeteranIdCard: [''],
			DoDImage: [''],
			FoidCardImage: [''],
			BackgroundCheckerID: [''],
			CheckerID: [''],
			BackgroundCompanyTelNumber: [''],
			BackgroundCompanyTelIsd: ['+1', Validators.required],
			BackgroundCompanyTelNumberCountry: ['us', Validators.required],
			VaccinationCardImage: [''],
			schoolBusCertificateImage: [''],
			PoliceForceTelephone: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			PoliceForceTelephoneIsd: ['+1', Validators.required],
			PoliceForceTelephoneCountry: ['us', Validators.required],
			LastPoliceDepartment: [''],
			Country: [''],
			State: [''],
			City: [''],
			ZipCode: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
		});

		if (this.affiliateType != 'fleet_operator') {
			this.addDriverForm.controls['Email'].setValidators([Validators.required])
			this.addDriverForm.controls['Email'].updateValueAndValidity()
		}

		/** progress bar starts on init */
		this.stateManagementService.setprogressBar(true);
		// Load Our languages using API
		this.adminService.driverDressLanguage()
			.pipe(
				catchError(err => {
					this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			).subscribe(({ data }: any) => {
				this.languages = data.languages;
				this.dresses = data.dresses;

				if (this.affiliateId) {
					if (this.driverId) {
						this.driverAdded = true;
						// get data for editing using API
						this.adminService.getDriver(this.driverId)
							.pipe(
								catchError(err => {
									this.stateManagementService.setprogressBar(false);
									return throwError(err);
								})
							).subscribe(({ data }: any) => {
								//Set Phone field country
								this.CellNumberObject.setCountry(data.CellNumberCountry);
								//if background certified is checked
								if (data.BackgroundCertified == 'yes') {
									this.onChildVeteranDoDChange(true, 'BackgroundCertificate')
									this.BackgroundCompanyTelNumberObject.setCountry(data.BackgroundCompanyTelNumberCountry);
									this.addDriverForm.patchValue({
										BackgroundCompanyTelNumber: data.BackgroundCompanyTelNumber,
										BackgroundCompanyTelIsd: data.BackgroundCompanyTelIsd,
										CheckerID: data.CheckerID
									});
								}
								if (data.ExPolice == 'yes') {
									this.onChildVeteranDoDChange(true, 'ExPolice');
									this.addDriverForm.patchValue({
										LastPoliceDepartment: data.LastPoliceDepartment,
										PoliceForceTelephone: data.PoliceForceTelephone,
										PoliceForceIsd: data.PoliceForceIsd,
										Country: data.Country,
										State: data.State,
										City: data.City,
										ZipCode: data.ZipCode
									});
									this.PoliceForceTelephoneObject.setCountry(data.PoliceForceTelephoneCountry);
								}

								//show images in case of edit
								if (data.DriverImage) {
									this.addDriverForm.patchValue({
										DriverImage: data.DriverImage.ID
									});
									this.DriverImage = data.DriverImage.image;
									this.DriverImageId = data.DriverImage.ID;
								}
								if (data.schoolBusCertificateImage) {
									this.addDriverForm.patchValue({
										schoolBusCertificateImage: data.schoolBusCertificateImage.ID,
									});
									this.schoolBusCertificateImage = data.schoolBusCertificateImage.image;
									this.schoolBusCertificateImageId = data.schoolBusCertificateImage.ID;
								}
								if (data.DriverLicense) {
									this.addDriverForm.patchValue({
										DriverLicense: data.DriverLicense.ID,
									});
									this.DriverLicense = data.DriverLicense.image;
									this.DriverLicenseId = data.DriverLicense.ID;
								}
								if (data.StarRating) {
									this.addDriverForm.patchValue({
										StarRating: data.StarRating.ID,
									});
									this.StarRating = data.StarRating.image;
									this.StarRatingId = data.StarRating.ID;
								}
								if (data.VeteranIdCard) {
									this.addDriverForm.patchValue({
										VeteranIdCard: data.VeteranIdCard.ID,
									});
									this.VeteranIdCard = data.VeteranIdCard.image;
									this.VeteranIdCardId = data.VeteranIdCard.ID;
								}
								if (data.FoidCardImage) {
									this.addDriverForm.patchValue({
										FoidCardImage: data.FoidCardImage.ID,
									});
									this.FoidCardImage = data.FoidCardImage.image;
									this.FoidCardImageId = data.FoidCardImage.ID;
								}
								if (data.BackgroundCheckerID) {
									this.addDriverForm.patchValue({
										BackgroundCheckerID: data.BackgroundCheckerID.ID,
									});
									this.BackgroundCheckerID = data.BackgroundCheckerID.image;
									this.BackgroundCheckerIDId = data.BackgroundCheckerID.ID;
								}
								if (data.VaccinationCardImage) {
									this.addDriverForm.patchValue({
										VaccinationCardImage: data.VaccinationCardImage.ID,
									});
									this.VaccinationCardImage = data.VaccinationCardImage.image;
									this.VaccinationCardImageId = data.VaccinationCardImage.ID;
								}
								if (data.DoDImage) {
									this.addDriverForm.patchValue({
										DoDImage: data.DoDImage.ID,
									});
									this.DoDImage = data.DoDImage.image;
									this.DoDImageId = data.DoDImage.ID;
								}

								//check checkboxes conditionally and show their images conditionally
								if (data.Veteran == 'yes')
									this.VeteranCheck = true;
								if (data.DoD == 'yes')
									this.DoDCheck = true;
								if (data.FoidCard == 'yes')
									this.FoidCheck = true;
								if (data.SchoolBusCertified == 'yes')
									this.SchoolBusCertifiedCheck = true;
								if (data.Covid19Vaccination == 'yes')
									this.Covid19VaccinationCheck = true;
								if (data.BackgroundCertified == 'yes')
									this.BackgroundCertificateCheck = true;
								if (data.ExPolice == 'yes') {
									this.ExPoliceCheck = true;
									this.changeCountry(data.Country);//for selected country
								}

								//Patch values of all fields
								this.addDriverForm.patchValue({
									id: data.id,
									FirstName: data.FirstName,
									MiddleName: data.MiddleName,
									LastName: data.LastName,
									Gender: data.Gender,
									CellNumber: data.CellNumber,
									CellIsd: data.CellIsd,
									Email: data.Email,
									Dress: data.Dress,
									StartDate: data.StartDate,
									starRatingValue: data.starRatingValue,
									CheckerID: data.CheckerID,
									BackgroundCompanyTelNumber: data.BackgroundCompanyTelNumber,
									BackgroundCompanyTelIsd: data.BackgroundCompanyTelIsd,
									Veteran: data.Veteran,
									DoD: data.DoD,
									FoidCard: data.FoidCard,
									SchoolBusCertified: data.SchoolBusCertified,
									Covid19Vaccination: data.Covid19Vaccination,
									BackgroundCertified: data.BackgroundCertified,
									ExPolice: data.ExPolice,
								});

								//get and set languages
								const languagesGet: FormArray = this.addDriverForm.get('LanguagesGet') as FormArray;
								const FluentLanguages: FormArray = this.addDriverForm.get('FluentLanguages') as FormArray;
								var i;
								const totalLanguages: any = this.languages;
								const selectedLanguages = data.FluentLanguages;
								for (i = 0; i < totalLanguages.length; i++) {
									var checkedLanguage = selectedLanguages.findIndex(function (post) {
										if (post == totalLanguages[i].id)
											return true;
									});
									if (checkedLanguage >= 0) {
										var checkBool = true;
									}
									else {
										var checkBool = false;
									}
									languagesGet.push(new FormControl(checkBool));
								}
								this.languagesFormControl = languagesGet.controls;
								var j;
								for (j = 0; j < selectedLanguages.length; j++) {
									FluentLanguages.push(new FormControl(selectedLanguages[j]));
								}
							});
					}
					else {
						this.onLanguageChange('1', true);//set english as default language
						if (this.currentUser.affiliate_type != 'fleet_operator') {
							this.spinner.show()
							// get data from logged in affiliate and set in driver fields
							this.adminService.getAffiliateAccount(this.affiliateId)
								.pipe(
									catchError(err => {
										this.spinner.hide()
										this.stateManagementService.setprogressBar(false);
										return throwError(err);
									})
								).subscribe(({ data }: any) => {
									this.spinner.hide()
									this.addDriverForm.patchValue({
										FirstName: data.FirstName,
										MiddleName: data.MiddleName,
										LastName: data.LastName,
										Gender: data.Gender,
										CellNumber: data.CellNumber,
										CellIsd: data.CellIsd,
										Email: data.Email,
										StartDate: data.FirstYearBusiness,
										Veteran: data.Veteran,
										DoD: data.DoD,
									});
									this.CellNumberObject.setCountry(data.CellNumberCountry);
									if (data.Veteran == 'yes')
										this.VeteranCheck = true;
									if (data.DoD == 'yes')
										this.DoDCheck = true;
								});
						}
					}
				}
			});
		this.stateManagementService.setprogressBar(false);
	}

	closeButton() {
		this.closeTab.emit();
	}

	onCountryChange(event, type) {
		if (type == 'CellNumber') {
			this.addDriverForm.patchValue({
				CellIsd: '+' + event.dialCode,
				CellNumberCountry: event.iso2
			});
		}
		else if (type == 'PoliceForceTelephone') {
			this.addDriverForm.patchValue({
				PoliceForceIsd: '+' + event.dialCode,
				PoliceForceTelephoneCountry: event.iso2
			});
		}
		else {
			this.addDriverForm.patchValue({
				BackgroundCompanyTelIsd: '+' + event.dialCode,
				BackgroundCompanyTelNumberCountry: event.iso2
			});
		}
	}
	telInputObjectCell(obj) {
		this.CellNumberObject = obj;
	}
	telInputObjectBackgroundCompanyTelNumber(obj) {
		this.BackgroundCompanyTelNumberObject = obj;
	}
	telInputObjectPoliceForceTelephone(obj) {
		this.PoliceForceTelephoneObject = obj;
	}

	changeCountry(selectedCountryCode) {
		let selectedCountryData: any;

		this.httpClient.get("assets/json/countryStateList.json").subscribe(data => {
			this.countryOptions = data;
			selectedCountryData = this.countryOptions.filter(function (countryOption) {
				return countryOption.countryShortCode == selectedCountryCode;
			});
			if (selectedCountryData) {
				this.stateOptions = selectedCountryData[0].regions;
			}
		});
	}

	vehicleOfficialImagesChange(event, imageType, imageId) {
		this.stateManagementService.setprogressBar(true);
		const reader = new FileReader();
		if (event.target.files && event.target.files.length) {
			const [file] = event.target.files;
			reader.readAsDataURL(file);
			reader.onload = () => {
				this.imageSrc = reader.result as string;
				this.adminService.uploadVehicleImage(this.imageSrc)
					.pipe(
						catchError(err => {
							this.stateManagementService.setprogressBar(false);
							return throwError(err);
						})
					)
					.subscribe(({ data }: any) => {
						switch (imageType) {
							case 'DriverImage': {
								this.addDriverForm.patchValue({
									DriverImage: data.id,
								});
								this.DriverImage = data.image;
								this.DriverImageId = data.id;
								break;
							}
							case 'DriverLicense': {
								this.addDriverForm.patchValue({
									DriverLicense: data.id,
								});
								this.DriverLicense = data.image;
								break;
							}
							case 'StarRating': {
								this.addDriverForm.patchValue({
									StarRating: data.id,
								});
								this.StarRating = data.image;
								break;
							}
							case 'VeteranIdCard': {
								this.addDriverForm.patchValue({
									VeteranIdCard: data.id,
								});
								this.VeteranIdCard = data.image;
								break;
							}
							case 'FoidCardImage': {
								this.addDriverForm.patchValue({
									FoidCardImage: data.id,
								});
								this.FoidCardImage = data.image;
								break;
							}
							case 'schoolBusCertificateImage': {
								this.addDriverForm.patchValue({
									schoolBusCertificateImage: data.id,
								});
								this.schoolBusCertificateImage = data.image;
								break;
							}
							case 'BackgroundCheckerID': {
								this.addDriverForm.patchValue({
									BackgroundCheckerID: data.id,
								});
								this.BackgroundCheckerID = data.image;
								break;
							}
							case 'VaccinationCardImage': {
								this.addDriverForm.patchValue({
									VaccinationCardImage: data.id,
								});
								this.VaccinationCardImage = data.image;
								break;
							}
							case 'DoDImage': {
								this.addDriverForm.patchValue({
									DoDImage: data.id,
								});
								this.DoDImage = data.image;
								break;
							}
							default: {
								break;
							}
						}
						this.stateManagementService.setprogressBar(false);
					});
			};
		}
	}

	deleteImage(id, imageType, imageNumber = null) {
		switch (imageType) {
			case 'DriverImage': {
				this.addDriverForm.patchValue({
					DriverImage: '',
				});
				this.DriverImage = '';
				break;
			}
			case 'DriverLicense': {
				this.addDriverForm.patchValue({
					DriverLicense: '',
				});
				this.DriverLicense = '';
				break;
			}
			case 'StarRating': {
				this.addDriverForm.patchValue({
					StarRating: '',
				});
				this.StarRating = '';
				break;
			}
			case 'VeteranIdCard': {
				this.addDriverForm.patchValue({
					VeteranIdCard: '',
				});
				this.VeteranIdCard = '';
				break;
			}
			case 'FoidCardImage': {
				this.addDriverForm.patchValue({
					FoidCardImage: '',
				});
				this.FoidCardImage = '';
				break;
			}
			case 'schoolBusCertificateImage': {
				this.addDriverForm.patchValue({
					schoolBusCertificateImage: '',
				});
				this.schoolBusCertificateImage = '';
				break;
			}
			case 'BackgroundCheckerID': {
				this.addDriverForm.patchValue({
					BackgroundCheckerID: '',
				});
				this.BackgroundCheckerID = '';
				break;
			}
			case 'VaccinationCardImage': {
				this.addDriverForm.patchValue({
					VaccinationCardImage: '',
				});
				this.VaccinationCardImage = '';
				break;
			}
			case 'DoDImage': {
				this.addDriverForm.patchValue({
					DoDImage: '',
				});
				this.DoDImage = '';
				break;
			}
			default: {
				break;
			}
		}
	}

	onChildVeteranDoDChange(isChecked, type) {
		if (type == 'Veteran') {
			if (isChecked) {
				console.log('Is Checked')
				this.addDriverForm.patchValue({
					Veteran: 'yes'
				});
				this.VeteranCheck = true;
				this.addDriverForm.controls['VeteranIdCard'].setValidators([Validators.required]);
			} else {
				console.log('Not Checked')
				this.addDriverForm.patchValue({
					Veteran: 'no'
				});
				this.VeteranCheck = false;
				this.addDriverForm.controls['VeteranIdCard'].clearValidators();
			}
			this.addDriverForm.controls['VeteranIdCard'].updateValueAndValidity();
		}
		else if (type == 'SchoolBusCertified') {
			if (isChecked) {
				this.addDriverForm.patchValue({
					SchoolBusCertified: 'yes'
				});
				this.SchoolBusCertifiedCheck = true;
				this.addDriverForm.controls['schoolBusCertificateImage'].setValidators([Validators.required]);
			} else {
				this.addDriverForm.patchValue({
					SchoolBusCertified: 'no'
				});
				this.SchoolBusCertifiedCheck = false;
				this.addDriverForm.controls['schoolBusCertificateImage'].clearValidators();
			}
			this.addDriverForm.controls['schoolBusCertificateImage'].updateValueAndValidity();
		}
		else if (type == 'DoD') {
			if (isChecked) {
				this.addDriverForm.patchValue({
					DoD: 'yes'
				});
				this.DoDCheck = true;
				this.addDriverForm.controls['DoDImage'].setValidators([Validators.required]);
			} else {
				this.addDriverForm.patchValue({
					DoD: 'no'
				});
				this.DoDCheck = false;
				this.addDriverForm.controls['DoDImage'].clearValidators();
			}
			this.addDriverForm.controls['DoDImage'].updateValueAndValidity();
		}
		else if (type == 'Foid') {
			if (isChecked) {
				this.addDriverForm.patchValue({
					FoidCard: 'yes'
				});
				this.FoidCheck = true;
				this.addDriverForm.controls['FoidCardImage'].setValidators([Validators.required]);
			} else {
				this.addDriverForm.patchValue({
					FoidCard: 'no'
				});
				this.FoidCheck = false;
				this.addDriverForm.controls['FoidCardImage'].clearValidators();
			}
			this.addDriverForm.controls['FoidCardImage'].updateValueAndValidity();
		}
		else if (type == 'BackgroundCertificate') {
			if (isChecked) {
				this.addDriverForm.patchValue({
					BackgroundCertified: 'yes'
				});
				this.BackgroundCertificateCheck = true;
				this.addDriverForm.controls['BackgroundCompanyTelNumber'].setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15), this.customValidator.dashValidator(), this.customValidator.plusValidator()]);
				this.addDriverForm.controls['BackgroundCompanyTelNumberCountry'].setValidators([Validators.required]);
				this.addDriverForm.controls['BackgroundCompanyTelIsd'].setValidators([Validators.required]);
				this.addDriverForm.controls['CheckerID'].setValidators([Validators.required]);
			} else {
				this.addDriverForm.patchValue({
					BackgroundCertified: 'no'
				});
				this.BackgroundCertificateCheck = false;
				this.addDriverForm.controls['BackgroundCompanyTelNumber'].clearValidators();
				this.addDriverForm.controls['BackgroundCompanyTelNumberCountry'].clearValidators();
				this.addDriverForm.controls['BackgroundCompanyTelIsd'].clearValidators();
				this.addDriverForm.controls['CheckerID'].clearValidators();
			}
			this.addDriverForm.controls['BackgroundCompanyTelNumber'].updateValueAndValidity();
			this.addDriverForm.controls['BackgroundCompanyTelNumberCountry'].updateValueAndValidity();
			this.addDriverForm.controls['BackgroundCompanyTelIsd'].updateValueAndValidity();
			this.addDriverForm.controls['CheckerID'].updateValueAndValidity();
		}
		else if (type == 'ExPolice') {
			if (isChecked) {
				this.addDriverForm.patchValue({
					ExPolice: 'yes'
				});
				this.ExPoliceCheck = true;
				this.addDriverForm.controls['LastPoliceDepartment'].setValidators([Validators.required]);
				this.addDriverForm.controls['Country'].setValidators([Validators.required]);
				this.addDriverForm.controls['State'].setValidators([Validators.required]);
				this.addDriverForm.controls['City'].setValidators([Validators.required]);
				this.addDriverForm.controls['ZipCode'].setValidators([Validators.required, Validators.pattern("^[0-9]*$"), this.customValidator.dashValidator(), this.customValidator.plusValidator()]);
			} else {
				this.addDriverForm.patchValue({
					ExPolice: 'no'
				});
				this.ExPoliceCheck = false;
				this.addDriverForm.controls['LastPoliceDepartment'].clearValidators();
				this.addDriverForm.controls['Country'].clearValidators();
				this.addDriverForm.controls['State'].clearValidators();
				this.addDriverForm.controls['City'].clearValidators();
				this.addDriverForm.controls['ZipCode'].clearValidators();
			}
			this.addDriverForm.controls['LastPoliceDepartment'].updateValueAndValidity();
			this.addDriverForm.controls['Country'].updateValueAndValidity();
			this.addDriverForm.controls['State'].updateValueAndValidity();
			this.addDriverForm.controls['City'].updateValueAndValidity();
			this.addDriverForm.controls['ZipCode'].updateValueAndValidity();
		}
		else {
			if (isChecked) {
				this.addDriverForm.patchValue({
					Covid19Vaccination: 'yes'
				});
				this.Covid19VaccinationCheck = true;
			} else {
				this.addDriverForm.patchValue({
					Covid19Vaccination: 'no'
				});
				this.Covid19VaccinationCheck = false;
			}
		}
	}

	onLanguageChange(val, ischecked) {
		const FluentLanguages: FormArray = this.addDriverForm.get('FluentLanguages') as FormArray;

		if (ischecked) {
			FluentLanguages.push(new FormControl(val));
		} else {
			const index = FluentLanguages.controls.findIndex(x => x.value === val);
			FluentLanguages.removeAt(index);
		}
	}

	showImageInModal(imageUrl) {
		this.modalImage = imageUrl;
		$("#imageModal").addClass("showImage");
		$("#imageModal").removeClass("d-none");
	}

	get f() {
		return this.addDriverForm.controls;
	}

	submitForm() {
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addDriverForm.invalid) {
			return;
		}
		this.adminService.setSessionStepsCompleted(4)
		this.addDriverForm.value.stepCompleted = this.adminService.getSessionStepsCompleted();
		this.spinner.show();// show spinner
		this.disableSubmitButton = true; //disable submit button

		this.adminService.addDriver(this.addDriverForm.value)
			.pipe(
				catchError(err => {
					this.spinner.hide();// hide spinner
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(({ success, data }: any) => {
				this.spinner.hide();// hide spinner
				this.disableSubmitButton = true; //enable submit button

				if (success == true) {
					this.adminService.setSessionStepsCompleted('4');
				}
				if (success.errors || success.error) {
					this.adminService.unsetSessionStepsCompleted(4)
				}

				this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
					this.router.navigate(['/admin/affiliate/step4'])
				);
			});
	}

	resetForm() {
		this.addDriverForm.reset();
		this.DriverImage = "";
		this.DriverLicense = "";
		this.StarRating = "";
		this.VeteranIdCard = "";
		this.FoidCardImage = "";
		this.BackgroundCheckerID = "";
		this.schoolBusCertificateImage = "";
		this.VaccinationCardImage = "";
		this.DoDImage = "";
	}
	backButton() {
		this.router.navigate(['/admin/affiliate/step4']);
	}

}
