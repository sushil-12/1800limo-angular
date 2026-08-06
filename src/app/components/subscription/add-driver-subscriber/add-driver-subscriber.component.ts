import { AfterViewInit, AfterViewChecked, Component, EventEmitter, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
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
import { CommonService } from 'src/app/services/common.service';
import * as intlTelInput from 'intl-tel-input';
declare var $: any;

@Component({
  selector: 'app-add-driver-subscriber',
  templateUrl: './add-driver-subscriber.component.html',
  styleUrls: ['./add-driver-subscriber.component.scss']
})
export class AddDriverSubscriberComponent implements OnInit, AfterViewInit {
  @ViewChild('cellInput') cellInput!: ElementRef;
  @ViewChild('backgroundCompanyTelInput') backgroundCompanyTelInput!: ElementRef;
  @ViewChild('policeTelInput') policeTelInput!: ElementRef;

  globalFunctions = this.globals

  color: ThemePalette = 'accent';
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
  public invite_acc_id: any;

  @Input() closeTab: EventEmitter<any> = new EventEmitter();
  proDriverYears: any;
  constructor(
    private adminService: AdminService,
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private stateManagementService: StateManagementService,
    private activatedroute: ActivatedRoute,
    private httpClient: HttpClient,
    private commonServices: CommonService,
    private customValidator: CustomvalidationService,
    private globals: SharedModule) { }




  ngOnInit(): void {
    this.currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.httpClient
      .get("assets/json/proDriverYears.json")
      .subscribe((data: any) => {
        this.proDriverYears = data;
      });
    //pick driver id from query params
    this.activatedroute.queryParamMap
      .subscribe((params) => {
        this.paramResponse = { ...params.keys, ...params };
        this.driverId = this.paramResponse.params.driverId;
        console.log("invite_acc_id", this.paramResponse?.params?.account_id)
        this.invite_acc_id = this.paramResponse?.params?.account_id
      });

    this.currentUser = JSON.parse(sessionStorage.getItem("affiliateUserData"));

    this.affiliateId = this.invite_acc_id ? this.invite_acc_id : JSON.parse(localStorage.getItem("currentUser"))?.account_id

    this.addDriverForm = this.formBuilder.group({
      id: [''],//driver id for edit purpose
      acc_id: [this.affiliateId, Validators.required],//affiliate account id
      FirstName: ['', Validators.required],
      MiddleName: [''],
      LastName: ['', Validators.required],
      Gender: ['male', Validators.required],
      CellNumber: ['', [Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(4), Validators.maxLength(15), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
      CellIsd: ['+1', Validators.required],
      CellNumberCountry: ['us', Validators.required],
      Email: ['', [Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i), Validators.required]],
      Dress: ['', Validators.required],
      StartDate: ['', Validators.required],
      FluentLanguages: this.formBuilder.array([], [Validators.required]),
      LanguagesGet: this.formBuilder.array([]),
      Veteran: ['no'],
      DoD: ['no'],
      FoidCard: ['no'],
      SchoolBusCertified: ['no'],
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
      BackgroundCompanyTelIsd: ['+1'],
      BackgroundCompanyTelNumberCountry: ['us'],
      VaccinationCardImage: [''],
      schoolBusCertificateImage: [''],
      PoliceForceTelephone: ['', [Validators.pattern("^[0-9+]*$"), Validators.minLength(4), Validators.maxLength(15), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
      PoliceForceTelephoneIsd: ['+1'],
      PoliceForceTelephoneCountry: ['us'],
      LastPoliceDepartment: [''],
      Country: [''],
      State: [''],
      City: [''],
      ZipCode: [''],
    });


    /** progress bar starts on init */
    // this.stateManagementService.setprogressBar(true);
    // Load Our languages using API
    this.adminService.driverDressLanguage()
      .pipe(
        catchError(err => {
          // this.stateManagementService.setprogressBar(false);
          return throwError(err);
        })
      ).subscribe(({ data }: any) => {
        let languagesData = data.languages;
        this.languages = languagesData.sort((a, b) => a.name.localeCompare(b.name));
        // this.languages = data.languages;
        this.dresses = data.dresses;

        if (this.affiliateId) {
          if (this.driverId) {
            this.driverAdded = true;
            // get data for editing using API
            this.adminService.getDriver(this.driverId)
              .pipe(
                catchError(err => {
                  // this.stateManagementService.setprogressBar(false);
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
            // if (this.currentUser.affiliate_type != 'fleet_operator') {
            // 	this.spinner.show()
            // 	// get data from logged in affiliate and set in driver fields
            // 	this.adminService.getAffiliateAccount(this.affiliateId)
            // 		.pipe(
            // 			catchError(err => {
            // 				this.spinner.hide()
            // 				// this.stateManagementService.setprogressBar(false);
            // 				return throwError(err);
            // 			})
            // 		).subscribe(({ data }: any) => {
            // 			this.spinner.hide()
            // 			this.addDriverForm.patchValue({
            // 				FirstName: data.FirstName,
            // 				MiddleName: data.MiddleName,
            // 				LastName: data.LastName,
            // 				Gender: data.Gender,
            // 				CellNumber: data.CellNumber,
            // 				CellIsd: data.CellIsd,
            // 				Email: data.Email,
            // 				StartDate: data.FirstYearBusiness,
            // 				Veteran: data.Veteran,
            // 				DoD: data.DoD,
            // 			});
            // 			this.CellNumberObject.setCountry(data.CellNumberCountry);
            // 			if (data.Veteran == 'yes')
            // 				this.VeteranCheck = true;
            // 			if (data.DoD == 'yes')
            // 				this.DoDCheck = true;
            // 		});
            // }
          }
        }
      });
    // this.stateManagementService.setprogressBar(false);
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


  ngAfterViewInit() {

    this.initallphonefields()

  }


  initallphonefields() {
    let countryCode = 'auto';
    if (this.currentUser && this.currentUser.CellNumberCountry) {
      countryCode = this.currentUser.CellNumberCountry;
    }
    const telOptions: any = this.commonServices.getTelInputOptions(countryCode);

    if (this.cellInput) {
      console.log('onput', this.cellInput, this.cellInput.nativeElement)
      this.CellNumberObject = intlTelInput(this.cellInput.nativeElement, telOptions);

      this.addCustomCountrySearch(this.cellInput.nativeElement);

      this.cellInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.CellNumberObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'CellNumber')
      });
    }

    if (this.backgroundCompanyTelInput) {
      console.log('onput', this.backgroundCompanyTelInput, this.backgroundCompanyTelInput.nativeElement)
      this.BackgroundCompanyTelNumberObject = intlTelInput(this.backgroundCompanyTelInput.nativeElement, telOptions);

      this.addCustomCountrySearch(this.backgroundCompanyTelInput.nativeElement);

      this.backgroundCompanyTelInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.BackgroundCompanyTelNumberObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'background');
      });
    }



    if (this.policeTelInput) {
      console.log('onput', this.policeTelInput, this.policeTelInput.nativeElement)
      this.PoliceForceTelephoneObject = intlTelInput(this.policeTelInput.nativeElement, telOptions);

      this.addCustomCountrySearch(this.policeTelInput.nativeElement);

      this.policeTelInput.nativeElement.addEventListener('countrychange', () => {
        const countryData = this.PoliceForceTelephoneObject.getSelectedCountryData();
        console.log("in change", countryData)
        this.onCountryChange(countryData, 'PoliceForceTelephone');
      });
    }

    //set current user country as default in phone number
    // this.CellNumberObject.setCountry(this.currentUser.CellNumberCountry);
    // this.BackgroundCompanyTelNumberObject.setCountry(this.currentUser.CellNumberCountry);
    // this.PoliceForceTelephoneObject.setCountry(this.currentUser.CellNumberCountry);
    this.changeCountry(this.currentUser.CellNumberCountry.toUpperCase());
    this.addDriverForm.patchValue({
      Country: this.currentUser.CellNumberCountry.toUpperCase()
    });



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
      this.addDriverForm.get('CellNumber').updateValueAndValidity();
      this.validateCellNumber();
    }
    else if (type == 'PoliceForceTelephone') {
      this.addDriverForm.patchValue({
        PoliceForceIsd: '+' + event.dialCode,
        PoliceForceTelephoneCountry: event.iso2
      });
      this.addDriverForm.get('PoliceForceTelephone').updateValueAndValidity();
      this.validatePoliceForce();
    }
    else {
      this.addDriverForm.patchValue({
        BackgroundCompanyTelIsd: '+' + event.dialCode,
        BackgroundCompanyTelNumberCountry: event.iso2
      });
      this.addDriverForm.get('BackgroundCompanyTelNumber').updateValueAndValidity();
      this.validateBackgroundCompany();
    }
  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    // Allow: backspace, delete, tab, escape, enter, + symbol (43)
    if (charCode === 43) {
      return true;
    }
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  validatePhoneGeneric(control: any, telInputObject: any) {
    if (telInputObject) {
      const value = control.value;
      if (!value) {
        if (control.errors) {
          const { invalidIntl, ...otherErrors } = control.errors;
          control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
        }
        return;
      }
      const isValid = telInputObject.isValidNumber();
      if (!isValid) {
        const errorCode = telInputObject.getValidationError();
        const errorMsg = ["Invalid phone number", "Invalid country code", "Invalid phone number", "Invalid phone number", "Invalid phone number"][errorCode] || "Invalid phone number";
        const currentErrors = control.errors || {};
        control.setErrors({ ...currentErrors, 'invalidIntl': errorMsg });
      } else {
        if (control.errors) {
          const { invalidIntl, ...otherErrors } = control.errors;
          control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
        }
      }
    }
  }

  validateCellNumber() {
    this.validatePhoneGeneric(this.addDriverForm.get('CellNumber'), this.CellNumberObject);
  }

  validatePoliceForce() {
    this.validatePhoneGeneric(this.addDriverForm.get('PoliceForceTelephone'), this.PoliceForceTelephoneObject);
  }

  validateBackgroundCompany() {
    this.validatePhoneGeneric(this.addDriverForm.get('BackgroundCompanyTelNumber'), this.BackgroundCompanyTelNumberObject);
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

  fetchImageBlob(url, key, id) {
    this.stateManagementService.setprogressBar(true);

    this.adminService.fetchImageBlob(url)
      .pipe(
        catchError(err => {
          this.stateManagementService.setprogressBar(false);
          return throwError(err);
        })
      )
      .subscribe(async ({ data }: any) => {
        this.stateManagementService.setprogressBar(false);
        const response = await fetch(data);
        const imageBlob = await response.blob()
        console.log('imageBlob', imageBlob)
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = URL.createObjectURL(imageBlob);
        console.log('img-->', img)
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

            this.blobToDataURL(blob, key, id);
            // });
          }, "image/jpeg");
        }
      })
  }
  blobToDataURL(blob: Blob, key, id) {
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      let dataUrl = reader.result;
      console.log(dataUrl); //DataURL
      this.vehicleOfficialImagesChange1(dataUrl, key, id);
    };
  }

  async vehicleOfficialImagesChange1(imgUrl, imageType, imageId) {
    if (!await this.commonServices.handleFile(event)) {
      return;
    }
    this.stateManagementService.setprogressBar(true);
    this.imageSrc = imgUrl
    this.adminService
      .uploadVehicleImage(this.imageSrc)
      .pipe(
        catchError((err) => {
          this.stateManagementService.setprogressBar(false);
          return throwError(err);
        })
      )
      .subscribe(({ data }: any) => {
        switch (imageType) {
          case "DriverImage": {
            this.addDriverForm.patchValue({
              DriverImage: data.id,
            });
            this.DriverImage = data.image;
            this.DriverImageId = data.id;
            break;
          }
          case "DriverLicense": {
            this.addDriverForm.patchValue({
              DriverLicense: data.id,
            });
            this.DriverLicense = data.image;
            break;
          }
          case "StarRating": {
            this.addDriverForm.patchValue({
              StarRating: data.id,
            });
            this.StarRating = data.image;
            break;
          }
          case "VeteranIdCard": {
            this.addDriverForm.patchValue({
              VeteranIdCard: data.id,
            });
            this.VeteranIdCard = data.image;
            break;
          }
          case "schoolBusCertificateImage": {
            this.addDriverForm.patchValue({
              schoolBusCertificateImage: data.id,
            });
            this.schoolBusCertificateImage = data.image;
            break;
          }
          case "FoidCardImage": {
            this.addDriverForm.patchValue({
              FoidCardImage: data.id,
            });
            this.FoidCardImage = data.image;
            break;
          }
          case "BackgroundCheckerID": {
            this.addDriverForm.patchValue({
              BackgroundCheckerID: data.id,
            });
            this.BackgroundCheckerID = data.image;
            break;
          }
          case "VaccinationCardImage": {
            this.addDriverForm.patchValue({
              VaccinationCardImage: data.id,
            });
            this.VaccinationCardImage = data.image;
            break;
          }
          case "DoDImage": {
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
  }


  async vehicleOfficialImagesChange(event, imageType, imageId) {
    if (!await this.commonServices.handleFile(event)) {
      return;
    }
    // this.stateManagementService.setprogressBar(true);
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imageSrc = reader.result as string;
        this.adminService.uploadVehicleImage(this.imageSrc)
          .pipe(
            catchError(err => {
              // this.stateManagementService.setprogressBar(false);
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
            // this.stateManagementService.setprogressBar(false);
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
        this.addDriverForm.controls['BackgroundCompanyTelNumber'].setValidators([Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(4), Validators.maxLength(15), this.customValidator.dashValidator(), this.customValidator.plusValidator()]);
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
        this.addDriverForm.controls['ZipCode'].setValidators([Validators.required]);
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
    console.log('onLanguageChange', val, ischecked)
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
    console.log(this.addDriverForm)
    if (this.addDriverForm.invalid) {
      return;
    }

    // Sanitize PoliceForceTelephone (remove Country Code if present)
    if (this.addDriverForm.value.PoliceForceTelephone && this.addDriverForm.value.PoliceForceTelephoneIsd && this.addDriverForm.value.PoliceForceTelephone.startsWith(this.addDriverForm.value.PoliceForceTelephoneIsd)) {
      this.addDriverForm.value.PoliceForceTelephone = this.addDriverForm.value.PoliceForceTelephone.substring(this.addDriverForm.value.PoliceForceTelephoneIsd.length);
    }

    // this.addDriverForm.value.stepCompleted = this.adminService.getUpdatedStepsLocal("4");
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
        if (this.invite_acc_id) {
          sessionStorage.setItem('clicked_login_role', 'driver');
          this.router.navigate(['/login'])
        } else {
          this.router.navigate(['/admin/driver-details'])
        }

      });
  }

  resetForm() {
    console.log('reseting values-->>', this.addDriverForm)
    this.addDriverForm.patchValue({
      FirstName: "",
      MiddleName: "",
      LastName: "",
      Gender: "",
      CellNumber: "",
      CellIsd: "+1",
      CellNumberCountry: "us",
      Email: "",
      Dress: 1,
      StartDate: "",
      Veteran: "no",
      DoD: "no",
      SchoolBusCertified: "no",
      FoidCard: "no",
      Covid19Vaccination: "no",
      BackgroundCertified: "no",
      ExPolice: "no",
      DriverImage: "",
      DriverLicense: "",
      StarRating: "",
      starRatingValue: "",
      VeteranIdCard: "",
      schoolBusCertificateImage: "",
      DoDImage: "",
      FoidCardImage: "",
      BackgroundCheckerID: "",
      CheckerID: "",
      BackgroundCompanyTelNumber: "",
      VaccinationCardImage: "",
      PoliceForceTelephone: "",
      LastPoliceDepartment: "",
      Country: "",
      State: "",
      City: "",
      ZipCode: "",
    });
    this.DriverImage = "";
    this.DriverLicense = "";
    this.StarRating = "";
    this.VeteranIdCard = "";
    this.FoidCardImage = "";
    this.BackgroundCheckerID = "";
    this.schoolBusCertificateImage = "";
    this.VaccinationCardImage = "";
    this.DoDImage = "";
    this.onLanguageChange('1', true);//set english as default language
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
  backButton() {
    this.router.navigate(['/admin/driver-details']);
  }


  private addCustomCountrySearch(element: HTMLElement) {
    element.addEventListener('open:countrydropdown', () => {
      const container = element.closest('.iti');
      const dropdown = container?.querySelector('.iti__country-list');
      if (!dropdown) return;

      // Check if search already exists
      if (dropdown.querySelector('.iti-search-input')) return;

      // Create search container
      const searchContainer = document.createElement('div');
      searchContainer.className = 'iti-search-container';

      // Create search input
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'iti-search-input';
      searchInput.placeholder = 'Search country...';

      searchContainer.appendChild(searchInput);

      // Prevent dropdown from closing when interacting with search
      searchInput.addEventListener('click', (e) => e.stopPropagation());
      searchInput.addEventListener('keydown', (e) => e.stopPropagation());

      // Insert at top of dropdown
      dropdown.insertBefore(searchContainer, dropdown.firstChild);

      // Focus on search
      setTimeout(() => searchInput.focus(), 100);

      // Filter countries on input
      searchInput.addEventListener('input', (e: any) => {
        e.stopPropagation();
        const searchTerm = e.target.value.toLowerCase();
        const countries = dropdown.querySelectorAll('.iti__country');
        let hasVisible = false;

        countries.forEach((country: any) => {
          // Search in the full text (Name + Dial Code)
          const text = country.textContent?.toLowerCase() || '';

          if (text.includes(searchTerm)) {
            country.classList.remove('iti__hide');
            country.style.display = 'block'; // Force show
            hasVisible = true;
          } else {
            country.classList.add('iti__hide');
            country.style.display = 'none'; // Force hide
          }
        });

        // Handle No Results
        let noResults = dropdown.querySelector('.iti-no-results');
        if (!noResults) {
          noResults = document.createElement('div');
          noResults.className = 'iti-no-results';
          noResults.textContent = 'No results found';
          dropdown.appendChild(noResults);
        }

        if (!hasVisible && searchTerm) {
          (noResults as HTMLElement).style.display = 'block';
        } else {
          (noResults as HTMLElement).style.display = 'none';
        }

        // Show all if search is empty
        if (!searchTerm) {
          countries.forEach((country: any) => {
            country.classList.remove('iti__hide');
            country.style.display = 'block';
          });
          (noResults as HTMLElement).style.display = 'none';
        }
      });
    });
  }
}
