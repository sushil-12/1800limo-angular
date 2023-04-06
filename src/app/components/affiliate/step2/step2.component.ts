import { Component, OnInit, ViewChild, ElementRef, NgZone, EventEmitter, Input } from '@angular/core';
import { AgmCoreModule, MapsAPILoader } from '@agm/core'; import { AffiliateService } from '../../../services/affiliate.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StateManagementService } from '../../../services/statemanagement.service';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { CustomvalidationService } from '../../../services/customvalidation.service';
import { SharedModule } from '../../shared/shared.module';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $: any;

@Component({
	selector: 'app-step2',
	templateUrl: './step2.component.html',
	styleUrls: ['./step2.component.scss'],
})
export class Step2Component implements OnInit {

	public addBankForm: FormGroup;
	public requestAddressChangeForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public affiliateId: string;
	public stepCompleted: any;
	public getCountryName: any;
	public postCountryName: any;
	public isStep2Completed: boolean = false;
	public countryDocumentsArray: any = [];
	public countryOptions: any = [];
	public stateOptions: any = [];
	public stateOptionsAddressChange: any = [];
	public currencyOptions: any = [];
	public currencyOptions_copy: any = [];
	public yearOptions: any = [];
	public id_front_image: string;
	public id_back_image: string;
	public id_front_image_id: string;
	public id_back_image_id: string;
	public imageSrc: string;
	public cardToDelete: number;
	public date25YearsBack: string;
	public stripeErrors: Array<Object>;
	public modalImage: string;
	public dobDay: Array<number> = [];
	public dobYear: Array<number> = [];
	public canChangeDocument: Boolean = false;
	public canChangeAddress: Boolean = false;
	public displayMsg: string;
	public alertMessage: string;
	public submittedRequestAddressChangeForm: boolean;
	public disableSubmitRequestAddressChangeButton: boolean = false;
	public showProgressBar: boolean = false;
	public haveEinNo: boolean = true;

	@Input() closeTab: EventEmitter<any> = new EventEmitter();
	selectedCountryName: any;
	constructor(
		private affiliateService: AffiliateService,
		private router: Router,
		private formBuilder: FormBuilder,
		private httpClient: HttpClient,
		private activatedroute: ActivatedRoute,
		private stateManagementService: StateManagementService,
		private mapsAPILoader: MapsAPILoader,
		private ngZone: NgZone,
		private el: ElementRef,
		private spinner: NgxSpinnerService,
		private customValidator: CustomvalidationService,
		private globalFunctions: SharedModule
	) { }

	ngOnInit(): void {
		//code related to autocomplete and map
		this.mapFunction();

		//show Email verification modal on first time completing step 1
		const showEmailVerificationAlert = sessionStorage.getItem("showEmailVerificationAlert");
		if (showEmailVerificationAlert == 'yes') {
			$('#showEmailVerificationAlert').modal('show');
			sessionStorage.removeItem("showEmailVerificationAlert");
		}
		//prepare list of years for add card
		const currentYear = (new Date()).getFullYear();
		for (let i = 0; i < 40; i++) {
			this.yearOptions.push(currentYear + i);
		}
		//prepare list of days for DOB
		for (let i = 1; i <= 31; i++) {
			this.dobDay.push(i);
		}
		//prepare list of year for DOB
		let year = currentYear - 25;
		let temp = 0;
		while (temp < 55)//max 80 year age
		{
			this.dobYear.push(year);
			year--;
			temp++;
		}

		const currentUser = JSON.parse(localStorage.getItem("currentUser"));
		this.affiliateId = currentUser.account_id;
		this.stepCompleted = this.affiliateService.getLocalStepCompleted();
		//add bank form validation
		this.addBankForm = this.formBuilder.group({
			id: [''],//bank id for edit purpose
			acc_id: [this.affiliateId, [Validators.required, Validators.pattern("^[0-9].*$")]],//affiliate account id
			BankName: [''],
			BankAddress: [''],
			AccountHolderFirstName: ['', Validators.required],
			AccountHolderMiddleName: [''],
			AccountHolderLastName: ['', Validators.required],
			AccountNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$"), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			Routing: ['', Validators.required],
			AccountType: ['company', Validators.required],
			ssn: ['', [Validators.required, Validators.pattern("^[0-9]*$"), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			haveEin: ['yesEin'],
			ein: [''],
			currency: ['', Validators.required],
			dobDay: ['', Validators.required],
			dobMonth: ['', Validators.required],
			dobYear: ['', Validators.required],
			id_front_image: ['', Validators.required],
			id_back_image: [''],
			address: ['', Validators.required],
			latitude: ['', Validators.required],
			longitude: ['', Validators.required],
			street: ['', Validators.required],
			city: ['', Validators.required],
			state: ['', Validators.required],
			country: ['', Validators.required],
			zipCode: ['', [Validators.required, this.customValidator.plusValidator()]],
			unit: [''],
			primaryCardType: ['personal'],
			primaryCardNumber: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(16), Validators.maxLength(16), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			primaryCSC: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(3), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			primaryMM: [''],
			primaryYY: [''],
			primaryCardHolderName: ['']
		});

		//load list of currencies
		this.httpClient.get("assets/json/currencyOptions.json").subscribe(data => {
			// convert currency options into an array of objects
			for (const key in data) {
				this.currencyOptions.push(data[key])
				this.currencyOptions_copy.push(data[key])
			}
			this.currencyOptions.sort((a: any, b: any) => {
				if (a.countryName.toLowerCase() > b.countryName.toLowerCase()) {
					return 1
				}
				else if (a.countryName.toLowerCase() < b.countryName.toLowerCase()) {
					return -1
				}
				else {
					return 0
				}

			})

			this.fillGlobalValue('', 'currency', true)


			// this.postCountryName = this.currencyOptions.countryName;
			// for (const key of Object.keys(this.currencyOptions))
			// {
			// 	if (key.toLowerCase() == currentUser.phoneCountry.toLowerCase())
			// 	{
			// 		this.addBankForm.patchValue({
			// 			currency: this.currcopy
			// 		});
			// 	}
			// }
		})

		//request address change form validation
		this.requestAddressChangeForm = this.formBuilder.group({
			requestAddress: ['', Validators.required],
			requestLatitude: ['', Validators.required],
			requestLongitude: ['', Validators.required],
			requestStreet: ['', Validators.required],
			requestCity: ['', Validators.required],
			requestState: ['', Validators.required],
			requestCountry: ['', Validators.required],
			requestZipCode: ['', [Validators.required, Validators.pattern("^[0-9]*$"), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			requestUnit: [''],
		});
		this.spinner.show(); //show spinner
		this.httpClient.get("assets/json/countryStateList.json").subscribe(data => {
			this.countryOptions = data;
			this.spinner.hide();
			if (this.affiliateId) {
				if (this.stepCompleted.includes('2')) {
					this.isStep2Completed = true;
					
					this.affiliateService.getBankOfAffiliate(this.affiliateId)
						.pipe(
							catchError(err => {
								this.spinner.hide(); //hide spinner
								return throwError(err);
							})
							).subscribe(result => {
								console.log('response--->>>>' , result)
								this.response = result;
								this.spinner.hide(); //hide spinner
							this.getCountryName = this.response?.data?.bankinfo?.countryName;
							//to show stripe errors at the top
							if (this.response.data?.stripeDetail?.stripe_errors) {
								this.stripeErrors = this.response.data?.stripeDetail?.stripe_errors;
							}
							//set images and their ID
							this.id_front_image = this.response.data?.bankinfo?.id_front_image?.image;
							this.id_back_image = this.response.data?.bankinfo?.id_back_image?.image;
							this.id_front_image_id = this.response.data.bankinfo?.id_front_image?.ID;
							this.id_back_image_id = this.response.data?.bankinfo?.id_back_image?.ID;
							//Documents changable or not.
							if (this.response.data?.stripeDetail?.additional_doc_verification_status == 'unverified') {
								this.canChangeDocument = true;
							}
							else {
								this.canChangeDocument = false;
							}
							//Documents changable or not
							if (this.response.data?.stripeDetail?.stripe_address_status == 'invalid') {
								this.canChangeAddress = true;
							}
							else {
								this.canChangeAddress = false;
							}

							this.addBankForm.patchValue({
								id: this.response.data?.bankinfo?.id,
								BankName: this.response.data?.bankinfo?.BankName,
								BankAddress: this.response.data?.bankinfo?.BankAddress,
								AccountHolderFirstName: this.response.data?.bankinfo?.AccountHolderFirstName,
								AccountHolderMiddleName: this.response.data?.bankinfo?.AccountHolderMiddleName,
								AccountHolderLastName: this.response.data?.bankinfo?.AccountHolderLastName,
								AccountNumber: this.response.data?.bankinfo?.AccountNumber,
								Routing: this.response.data?.bankinfo?.Routing,
								AccountType: this.response.data?.bankinfo?.AccountType,
								currency: this.response.data?.bankinfo?.currency,
								ssn: this.response.data?.bankinfo?.ssn,
								haveEin: this.response.data?.bankinfo?.ein,
								ein: this.response.data?.bankinfo?.ein,
								address: this.response.data?.bankinfo?.address,
								latitude: this.response.data?.bankinfo?.latitude,
								longitude: this.response.data?.bankinfo?.longitude,
								street: this.response.data?.bankinfo?.street,
								unit: this.response.data?.bankinfo?.unit,
								city: this.response.data?.bankinfo?.city,
								state: this.response.data?.bankinfo?.state,
								country: this.response.data?.bankinfo?.country,
								zipCode: this.response.data?.bankinfo?.zipCode,
								dobDay: this.response.data?.bankinfo?.dobDay,
								dobMonth: this.response.data?.bankinfo?.dobMonth,
								dobYear: this.response.data?.bankinfo?.dobYear,
								id_front_image: this.response.data?.bankinfo?.id_front_image?.ID,
								id_back_image: this.response.data?.bankinfo?.id_back_image?.ID,
							});
							this.changeCountry(this.response.data?.bankinfo?.country);//for selected country

							// if (this.postCountryName == this.getCountryName)
							// {
							// 	this.addBankForm.value.currency = this.response.data.bankinfo.currency;
							// 	console.log(this.addBankForm.value.currency, "jhjhjgufytfhguhgjgfjjvj")
							// }
						});
						this.spinner.hide(); //hide spinner

				}
				else {
					this.canChangeDocument = true;//can add or change documents
					this.canChangeAddress = true;//can add or change address

					//for selected country
					this.changeCountry(currentUser?.phoneCountry.toUpperCase());
					this.addBankForm.patchValue({
						country: currentUser?.phoneCountry.toUpperCase(),
						AccountHolderFirstName: currentUser?.FirstName,
						AccountHolderMiddleName: currentUser?.MiddleName,
						AccountHolderLastName: currentUser?.LastName
					});
				}
			}
			else {
				//for selected country
			this.spinner.hide();
			this.changeCountry(currentUser?.phoneCountry.toUpperCase());
				this.addBankForm.patchValue({
					country: currentUser?.phoneCountry.toUpperCase()
				});
			}
		})
	}
	// ngOnInit Ends 

	//google map autocomplete
	latitude: number;
	longitude: number;
	requestLatitude: number;
	requestLongitude: number;
	@ViewChild('search1')
	public searchElementRef: ElementRef;
	@ViewChild('search2')
	public search2ElementRef: ElementRef;


	mapFunction() {
		this.mapsAPILoader.load().then(() => {
			//For Address field
			console.log(this.searchElementRef.nativeElement.value, this.search2ElementRef.nativeElement)
			// if(this.canChangeAddress){// disable suggestion for set location field in edit case
			let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
			autocomplete.addListener("place_changed", () => {
				this.ngZone.run(() => {
					//get the place result
					let place: google.maps.places.PlaceResult = autocomplete.getPlace();

					//verify result
					if (place.geometry === undefined || place.geometry === null) {
						return;
					}
					console.log(place)
					for (var i = 0; i < place.address_components.length; i++) {
						for (let j = 0; j < place.address_components[i].types.length; j++) {
							if (place.address_components[i]?.types[j] == "country") {
								this.addBankForm.patchValue({
									country: place.address_components[i].short_name
								});
								this.changeCountry(place.address_components[i].short_name)
							}
							else if (place.address_components[i]?.types[j] == "administrative_area_level_1") {
								this.addBankForm.patchValue({
									state: place.address_components[i].short_name
								});
							}
							else if (place.address_components[i]?.types[j] == "administrative_area_level_2") {
								this.addBankForm.patchValue({
									city: place.address_components[i].long_name
								});
							}
							else if (place.address_components[i]?.types[j] == "postal_code") {
								this.addBankForm.patchValue({
									zipCode: place.address_components[i].long_name
								});
							}
							else if (place.address_components[i]?.types[j] == "street_number") {
								this.addBankForm.patchValue({
									street: place.address_components[i].long_name
								});
							}
						}
					}
					this.addBankForm.patchValue({
						address: place.formatted_address,
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng(),
					});
					this.latitude = place.geometry.location.lat();
					this.longitude = place.geometry.location.lng();
				});
			});
			// }     

			//For request Address change
			let autocomplete2 = new google.maps.places.Autocomplete(this.search2ElementRef.nativeElement);
			autocomplete2.addListener("place_changed", () => {
				this.ngZone.run(() => {
					//get the place result
					let place: google.maps.places.PlaceResult = autocomplete2.getPlace();

					//verify result
					if (place.geometry === undefined || place.geometry === null) {
						return;
					}
					console.log(place)
					for (var i = 0; i < place.address_components.length; i++) {
						for (let j = 0; j < place.address_components[i].types.length; j++) {
							if (place.address_components[i]?.types[j] == "country") {
								this.requestAddressChangeForm.patchValue({
									requestCountry: place.address_components[i].short_name
								});
								this.changeCountryRequestAddresschange(place.address_components[i].short_name)
							}
							else if (place.address_components[i]?.types[j] == "administrative_area_level_1") {
								this.requestAddressChangeForm.patchValue({
									requestState: place.address_components[i].short_name
								});
							}
							else if (place.address_components[i]?.types[j] == "administrative_area_level_2") {
								this.requestAddressChangeForm.patchValue({
									requestCity: place.address_components[i].long_name
								});
							}
							else if (place.address_components[i]?.types[j] == "postal_code") {
								this.requestAddressChangeForm.patchValue({
									requestZipCode: place.address_components[i].long_name
								});
							}
							else if (place.address_components[i]?.types[j] == "street_number") {
								this.requestAddressChangeForm.patchValue({
									requestStreet: place.address_components[i].long_name
								});
							}
						}
					}
					this.requestAddressChangeForm.patchValue({
						requestAddress: place.formatted_address,
						requestLatitude: place.geometry.location.lat(),
						requestLongitude: place.geometry.location.lng(),
					});
					this.requestLatitude = place.geometry.location.lat();
					this.requestLongitude = place.geometry.location.lng();
				});
			});
		});
	}

	closeButton() {
		this.closeTab.emit();
	}

	// searchCurrency(keyword) {
	//   console.log(111)
	//   this.addBankForm.patchValue({
	//     currency: '',
	//   });
	//   if (keyword == '') {
	//     this.filteredCurrency = this.currencyOptions;
	//   }
	//   else {
	//     this.filteredCurrency = this.currencyOptions.filter((cr: any) => {
	//       if (cr.name.toLowerCase() === keyword.toLowerCase()) {
	//         this.addBankForm.patchValue({
	//           currency: cr.code,
	//         });
	//       }
	//       return cr.name.toLowerCase().includes(keyword.toLowerCase());
	//     })
	//       .sort((a: any, b: any) => {
	//         return this.searchSorting(keyword, a, b)
	//       });
	//   }
	// }
	// selectCurrency(val, isSelected) {
	//   if (isSelected)// ignore on deselection of the previous option
	//   {
	//     this.addBankForm.patchValue({
	//       currency: val,
	//     });
	//   }
	// }
	//Start of autocomplete search and selection
	searchSorting(keyword, a, b) {
		// Sort results by matching name with keyword position in name
		if (a.name.toLowerCase().indexOf(keyword.toLowerCase()) > b.name.toLowerCase().indexOf(keyword.toLowerCase())) {
			return 1;
		} else if (a.name.toLowerCase().indexOf(keyword.toLowerCase()) < b.name.toLowerCase().indexOf(keyword.toLowerCase())) {
			return -1;
		} else {
			if (a.name > b.name)
				return 1;
			else
				return -1;
		}
	}

	changeCountry(selectedCountryCode) {
		let selectedCountryData: any;

		selectedCountryData = this.countryOptions.filter(function (countryOption) {
			return countryOption.countryShortCode == selectedCountryCode;
		});
		if (selectedCountryData) {
			this.stateOptions = selectedCountryData[0]?.regions;
		}
	}

	changeRadio(form_control: string, value: any) {
		this.SetFormValue(form_control, value)
	}

	changeIdentityCountry(selectedCountryCode) {
		this.httpClient.get("assets/json/stripeDocumentData.json").subscribe((stripeDocumentData: any) => {
			const selectedCountryData = stripeDocumentData.filter(function (eachCountryObj) {
				return eachCountryObj.value[0].value === selectedCountryCode;
			});
			this.countryDocumentsArray = selectedCountryData[0].value[1].value.value;
		})
	}

	addCardClick(accountId) {
		this.router.navigate(['/affiliate/step2/add-card']);
	}

	enableDisableClicked(id) {
		this.cardToDelete = id;
		this.alertMessage = "Are you sure you want to delete this Card?"
	}

	delete() {
		this.stateManagementService.setprogressBar(true);
		$('#deleteConfirmationModal').modal('hide');
		this.affiliateService.cardStatus(this.cardToDelete)
			.pipe(
				catchError(err => {
					this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			).subscribe(result => {
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
					this.router.navigate(['/affiliate/step2']);
				});
				this.stateManagementService.setprogressBar(false);
			});
	}

	idCardImageChange(event, imageType, imageId = null) {
		this.stateManagementService.setprogressBar(true);
		const reader = new FileReader();
		if (event.target.files && event.target.files.length) {
			const [file] = event.target.files;
			reader.readAsDataURL(file);
			reader.onload = () => {
				this.imageSrc = reader.result as string;
				this.affiliateService.uploadVehicleImage(this.imageSrc)
					.pipe(
						catchError(err => {
							this.stateManagementService.setprogressBar(false);
							return throwError(err);
						})
					)
					.subscribe(({ data }: any) => {

						switch (imageType) {
							case 'id_front_image': {
								this.addBankForm.patchValue({
									id_front_image: data.id,
								});
								this.id_front_image = data.image;
								this.id_front_image_id = data.id;
								break;
							}
							case 'id_back_image': {
								this.addBankForm.patchValue({
									id_back_image: data.id,
								});
								this.id_back_image = data.image;
								this.id_back_image_id = data.id;
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

	deleteImage(id, imageType) {
		switch (imageType) {
			case 'id_front_image': {
				this.addBankForm.patchValue({
					id_front_image: '',
				});
				this.id_front_image = '';
				break;
			}
			case 'id_back_image': {
				this.addBankForm.patchValue({
					id_back_image: '',
				});
				this.id_back_image = '';
				break;
			}
			default: {
				break;
			}
		}
	}

	showImageInModal(imageUrl) {
		this.modalImage = imageUrl;
		$("#imageModal").addClass("showImage");
		$("#imageModal").removeClass("d-none");
	}

	stripeRefreshAccountLink() {
		this.affiliateService.stripeRefreshAccountLink(this.response.stripeDetail.stripe_conncet_account_id)
			.pipe(
				catchError(err => {
					this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			).subscribe(({ data }: any) => {
				if (data.account_link.url) {
					window.open(data.account_link.url, "_self");
				}
			});
	}

	changeCountryRequestAddresschange(selectedCountryCode) {
		let selectedCountryData: any;
		selectedCountryData = this.countryOptions.filter(function (countryOption) {
			return countryOption.countryShortCode == selectedCountryCode;
		});
		if (selectedCountryData) {
			this.stateOptionsAddressChange = selectedCountryData[0].regions;
		}
	}
	get fRequestAddressChange() {
		return this.requestAddressChangeForm.controls;
	}
	requestAddressChange() {
		console.log(this.requestAddressChangeForm);
		this.submittedRequestAddressChangeForm = true;
		// stop here if form is invalid
		if (this.requestAddressChangeForm.invalid) {
			return;
		}
		this.showProgressBar = true; //show progressbar
		this.disableSubmitRequestAddressChangeButton = true; //disable submit button

		this.affiliateService.requestAddressChange(this.requestAddressChangeForm.value)
			.pipe(
				catchError(err => {
					this.showProgressBar = false; //hide progressbar
					this.disableSubmitRequestAddressChangeButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(({ message, success }: any) => {
				this.showProgressBar = false; //hide progressbar
				this.disableSubmitRequestAddressChangeButton = false; //enable submit button
				if (success == true) {
					this.displayMsg = "Request Submitted successfully.";
				}
			});
	}

	private scrollToErrorFormControlName(formControlName) {
		console.log(formControlName)
		let firstInvalidControl: HTMLElement;
		firstInvalidControl = this.el.nativeElement.querySelector(
			"input[formControlName='" + formControlName + "']"
		);
		if (!firstInvalidControl) {
			firstInvalidControl = this.el.nativeElement.querySelector(
				"mat-select[formControlName='" + formControlName + "']"
			);
		}
		console.log("input[formControlName='" + formControlName + "']", firstInvalidControl)
		window.scroll({
			top: this.getTopOffset(firstInvalidControl),
			left: 0,
			behavior: "smooth"
		});
	}
	private getTopOffset(controlEl: HTMLElement): number {
		console.log(controlEl.getBoundingClientRect());
		const labelOffset = 110;
		return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
	}
	get f() {
		return this.addBankForm.controls;
	}
	updateStripeURL() {
		this.spinner.show();
		this.affiliateService.stripeUpdateUrl(this.affiliateId)
			.pipe(
				catchError(err => {
					console.log(err);
					return throwError(err);
				})
			)
			.subscribe(({ data }: any) => {
				window.location.href = data.url;
				this.spinner.hide();
			})
	}
	submitForm() {
		console.log(this.addBankForm);
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addBankForm.invalid) {
			return;
		}
		this.addBankForm.value.stepCompleted = this.affiliateService.getUpdatedStepsLocal('2');

		console.log(this.addBankForm.value);
		this.spinner.show();//show spinner
		// this.stateManagementService.setprogressBar(true);
		this.disableSubmitButton = true; //disable submit button
		localStorage.setItem("driverFrontLicense", this.id_front_image);
		this.affiliateService.addBankOfAffiliate(this.addBankForm.value)
			.pipe(
				catchError(err => {
					console.log(err)
					if (err.otherParams.formcontrolname) {
						this.scrollToErrorFormControlName(err.otherParams.formcontrolname)
					}
					this.spinner.hide();//hide spinner
					// this.stateManagementService.setprogressBar(false);
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(({ success, data }: any) => {
				this.spinner.hide();//hide spinner
				// this.stateManagementService.setprogressBar(false);
				if (success == true) {
					//save value in session storage to show "stripe can take upo 24 hours" message in modal on next step first time user omplete step 2
					if (!this.stepCompleted.includes('2')) {
						sessionStorage.setItem("showStripe24HourAlert", "yes");
					}

					this.disableSubmitButton = false; //enable submit button
					if (data.stripe_account_type == 'standard') {
						if (data.stripe_response.account_link) {
							window.open(data.stripe_response.account_link.url, "_self");
							// window.location.href=data.stripe_response.account_link.url;
						}
					}
					else {
						this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
							this.router.navigate(['/affiliate/step3'])
						);
					}
					//save completed steps in local storage
					this.affiliateService.updateStepsLocal('2');
				}
			});
	}

	resetForm() {
		this.addBankForm.reset();
		this.id_front_image = "";
		this.id_back_image = "";
	}

	/**
	 * Search a particular text value from list
	 * 
	 * @params type: String [Required] type of the calling field. Default ''
	 * @params text: String [Require] text to search for in the list
	 */
	searchGlobalValue(type: string = '', text: string) {
		if (text == '') {
			this.currencyOptions = this.currencyOptions_copy
		}
		else {
			// fetch the values matching the text
			let object_arr = this.globalFunctions.ListSearch('filter', this.currencyOptions, text, 'countryName')
			if (object_arr.length <= 0) {
				object_arr = this.globalFunctions.ListSearch('filter', this.currencyOptions, text, 'currency')
			}

			// assign the array
			if (object_arr.length > 0) {
				this.currencyOptions = object_arr
			} else {
				console.error('Could not find the specified value, ', text)
			}
		}
	}

	/**
	 * fill the value from form into the calling field
	 * 
	 * @params type: String [Required] type of the calling field. Default ''
	 * @params form_control: String [Required] Form key to Fill in/Pull off, the value from
	 */
	fillGlobalValue(type: string = '', form_control: string, autofill: boolean = false) {
		let object: any;
		if (autofill) {
			// fetch the phone country in current user logged in from local storage. Default is 'US'
			const current_user = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : { phoneCountry: 'US' }
			object = this.globalFunctions.ListSearch('find', this.currencyOptions, current_user.phoneCountry, 'currencyCountry')
			console.log(object)
			this.selectedCountryName = object.currencyCountry
		}
		else {
			object = this.globalFunctions.ListSearch('filter', this.currencyOptions, this.f.currency.value, 'currency')
			object = this.globalFunctions.ListSearch('find', this.currencyOptions, 'us', 'currencyCountry')
		}

		this.SetFormValue(form_control, object['currency'] + '-' + object['currencyCountry'])

		// assign the object value
		if (object) {
			return `${object['countryName']} - ${object['symbol']}`
		}
		else {
			return ''
		}
	}

	SetFormValue(form_control: string, value: any) {
		this.addBankForm.get(form_control).setValue(value)
		this.addBankForm.updateValueAndValidity()
	}


	selectGlobalValue(type: string, selected_value: any, form_control: string, autofill: boolean = false) {
		const object = this.globalFunctions.ListSearch('find', this.currencyOptions, selected_value, 'currency')

		if (object) {
			this.SetFormValue(form_control, object['currency'])
		}
	}

	selectDropdownAccount() {
		$('.selectAccountLabel').removeClass('selectAccountLabel ').addClass('select-account-label');
	}

	selectDropdownDay() {
		$('.selectDayLabel').removeClass('selectDayLabel ').addClass('select-day-label');
	}
	selectDropdownMonth() {
		$('.selectMonthLabel').removeClass('selectMonthLabel ').addClass('select-month-label');
	}
	selectDropdownYear() {
		$('.selectYearLabel').removeClass('selectYearLabel ').addClass('select-year-label');
	}
	selectDropdownCurrency() {
		$('.selectCurrencyLabel').removeClass('selectCurrencyLabel ').addClass('select-currency-label');
	}
	selectDropdownCountry() {
		$('.selectCountryLabel').removeClass('selectCountryLabel ').addClass('select-country-label');
	}
	selectDropdownState() {
		$('.selectStateLabel').removeClass('selectStateLabel ').addClass('select-state-label');
	}
	selectDropdownExMonth() {
		$('.selectExMonthLabel').removeClass('selectExMonthLabel ').addClass('select-ex-month-label');
	}
	selectDropdownExYear() {
		$('.selectExYearLabel').removeClass('selectExYearLabel ').addClass('select-ex-year-label');
	}
}
