import { Component, OnInit, ViewChild, ElementRef, NgZone, EventEmitter, Input } from '@angular/core';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StateManagementService } from '../../../services/statemanagement.service';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";
import { throwError } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { CustomvalidationService } from '../../../services/customvalidation.service';
import { SharedModule } from '../../shared/shared.module';
declare var $: any;

@Component({
	selector: 'app-affiliate-step2',
	templateUrl: './affiliate-step2.component.html',
	styleUrls: ['./affiliate-step2.component.scss']
})
export class AffiliateStep2Component implements OnInit {

	public addBankForm: FormGroup;
	public requestAddressChangeForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public affiliateId: string;
	public stepCompleted: any;
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
	public displayMsg: string;
	public alertMessage: string;
	public submittedRequestAddressChangeForm: boolean;
	public disableSubmitRequestAddressChangeButton: boolean = false;
	public showProgressBar: boolean = false;
	public haveEinNo: boolean = true;

	@Input() closeTab: EventEmitter<any> = new EventEmitter();
	stepsObj: any;
	filteredOptions: any;
	badgeOptions: any;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private formBuilder: FormBuilder,
		private httpClient: HttpClient,
		private spinner: NgxSpinnerService,
		private activatedroute: ActivatedRoute,
		private stateManagementService: StateManagementService,
		private mapsAPILoader: MapsAPILoader,
		private ngZone: NgZone,
		private el: ElementRef,
		private customValidator: CustomvalidationService,
		private globalFunctions: SharedModule
	) { }

	ngOnInit(): void {

		//code related to autocomplete and map
		this.spinner.show()
		this.mapFunction();
		const currentYear = (new Date()).getFullYear();
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
		const currentUser = JSON.parse(sessionStorage.getItem("affiliateUserData"));
		this.affiliateId = sessionStorage.getItem("affiliateId");
		this.stepCompleted = this.adminService.getLocalStepsCompleted();
		//add amenity form validation
		this.addBankForm = this.formBuilder.group({
			id: [''],//bank id for edit purpose
			acc_id: [this.affiliateId, [Validators.required, Validators.pattern("^[0-9].*$")]],//affiliate account id
			BankName: [''],
			BankAddress: [''],
			AccountHolderFirstName: ['', Validators.required],
			AccountHolderLastName: ['', Validators.required],
			AccountNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$"), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			Routing: ['', [Validators.required]],
			AccountType: ['company', Validators.required],
			ssn: ['', [Validators.required, Validators.pattern("^[0-9]*$"), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			haveEin: ['yesEin'],
			ein: ['', []],
			currency: ['', Validators.required],
			dobDay: ['', Validators.required],
			dobMonth: ['', Validators.required],
			dobYear: ['', Validators.required],
			id_front_image: ['', Validators.required],
			id_back_image: [''],
			address: ['', Validators.required],
			latitude: ['', Validators.required],
			longitude: ['', Validators.required],
			badge_city :[''],
			badge_city_name:[''],
			street: ['', Validators.required],
			city: ['', Validators.required],
			state: ['', Validators.required],
			country: ['', Validators.required],
			zipCode: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
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
		})
		this.adminService.getAllEnableBadgeCities().pipe(
			catchError(err => {
				return throwError(err)
			})
		).subscribe((res:any)=> {
			this.badgeOptions = res?.data
			this.filteredOptions = res?.data
		})

		this.httpClient.get("assets/json/countryStateList.json").subscribe(data => {
			this.countryOptions = data;
			if (this.affiliateId) {
				if (this.stepCompleted.includes('2')) {
					this.isStep2Completed = true;
					// this.stateManagementService.setprogressBar(true);

					this.adminService.getBankOfAffiliate(this.affiliateId)
						.pipe(
							catchError(err => {
								// this.stateManagementService.setprogressBar(false);
								return throwError(err);
							})
						).subscribe(result => {
							this.response = result;
							//to show stripe errors at the top
							if (this.response.data.stripeDetail.stripe_errors) {
								this.stripeErrors = this.response.data.stripeDetail.stripe_errors;
							}
							//set images and their ID
							this.badgeOptions.map((i:any)=>{
								if(i?.id==this.response?.data?.badge_city){
									this.addBankForm.patchValue({
										badge_city:i?.id,
										badge_city_name:i?.name
									})
								}
							})
							this.id_front_image = this.response.data.bankinfo.id_front_image.image;
							this.id_back_image = this.response.data.bankinfo.id_back_image.image;
							this.id_front_image_id = this.response.data.bankinfo.id_front_image.ID;
							this.id_back_image_id = this.response.data.bankinfo.id_back_image.ID;
							//Documents changable or not.
							if (this.response.data.stripeDetail.additional_doc_verification_status == 'unverified') {
								this.canChangeDocument = true;
							}
							else {
								this.canChangeDocument = false;
							}

							this.addBankForm.patchValue({
								id: this.response.data.bankinfo.id,
								BankName: this.response.data.bankinfo.BankName,
								BankAddress: this.response.data.bankinfo.BankAddress,
								AccountHolderFirstName: this.response.data.bankinfo.AccountHolderFirstName,
								AccountHolderLastName: this.response.data.bankinfo.AccountHolderLastName,
								AccountNumber: this.response.data.bankinfo.AccountNumber,
								Routing: this.response.data.bankinfo.Routing,
								AccountType: this.response.data.bankinfo.AccountType,
								currency: this.response.data.bankinfo.currency,
								ssn: this.response.data.bankinfo.ssn,
								haveEin: this.response.data.bankinfo.ein ? 'yesEin' : 'noEin',
								ein: this.response.data.bankinfo.ein,
								address: this.response.data.bankinfo.address,
								latitude: this.response.data.bankinfo.latitude,
								longitude: this.response.data.bankinfo.longitude,
								street: this.response.data.bankinfo.street,
								unit: this.response.data.bankinfo.unit,
								city: this.response.data.bankinfo.city,
								state: this.response.data.bankinfo.state,
								country: this.response.data.bankinfo.country,
								zipCode: this.response.data.bankinfo.zipCode,
								dobDay: this.response.data.bankinfo.dobDay,
								dobMonth: this.response.data.bankinfo.dobMonth,
								dobYear: this.response.data.bankinfo.dobYear,
								id_front_image: this.response.data.bankinfo.id_front_image.ID,
								id_back_image: this.response.data.bankinfo.id_back_image.ID,
							});

							this.haveEin(this.response.data.bankinfo.ein ? 'yesEin' : 'noEin');
							this.changeCountry(this.response.data.bankinfo.country);//for selected country
							// this.stateManagementService.setprogressBar(false);
						});
				}
				else {
					this.canChangeDocument = true;//can add or change documents

					//for selected country
					this.changeCountry(currentUser.CellNumberCountry.toUpperCase());
					this.addBankForm.patchValue({
						country: currentUser.CellNumberCountry.toUpperCase()
					});
				}
			}
			else {
				//for selected country
				this.changeCountry(currentUser.CellNumberCountry.toUpperCase());
				this.addBankForm.patchValue({
					country: currentUser.CellNumberCountry.toUpperCase()
				});
			}
		})
	}//google map autocomplete
	latitude: number;
	longitude: number;
	requestLatitude: number;
	requestLongitude: number;
	@ViewChild('search1')
	public searchElementRef: ElementRef;

	mapFunction() {
		this.mapsAPILoader.load().then(() => {
			//For Address field
			console.log('---search ref element-->>>>>>',this.searchElementRef.nativeElement.value)
			let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
			autocomplete.addListener("place_changed", () => {
				this.ngZone.run(() => {
					//get the place result
					let place: google.maps.places.PlaceResult = autocomplete.getPlace();

					//verify result
					if (place.geometry === undefined || place.geometry === null) {
						return;
					}
					console.log('---->> place',place)
					// for (var i = 0; i < place.address_components.length; i++) {
					// 	for (var j = 0; j < place.address_components[i].types.length; j++) {
					// 		if (place.address_components[i].types[j] == "country") {
					// 			this.addBankForm.patchValue({
					// 				country: place.address_components[i].short_name
					// 			});
					// 			this.changeCountry(place.address_components[i].short_name)
					// 		}
					// 		else if (place.address_components[i].types[j] == "administrative_area_level_1") {
					// 			this.addBankForm.patchValue({
					// 				state: place.address_components[i].short_name
					// 			});
					// 		}
					// 		else if (place.address_components[i].types[j] == "administrative_area_level_2") {
					// 			this.addBankForm.patchValue({
					// 				city: place.address_components[i].long_name
					// 			});
					// 		}
					// 		else if (place.address_components[i].types[j] == "postal_code") {
					// 			this.addBankForm.patchValue({
					// 				zipCode: place.address_components[i].long_name
					// 			});
					// 		}
					// 		else if (place.address_components[i].types[j] == "street_number") {
					// 			this.addBankForm.patchValue({
					// 				street: place.address_components[i].long_name
					// 			});
					// 		}
					// 	}
					// }
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
		this.spinner.hide()
		});
	}

	get f() {
		return this.addBankForm.controls;
	}
	haveEin(haveEinNo) {
		switch (haveEinNo) {
			case 'noEin': {
				this.haveEinNo = false;
				this.addBankForm.patchValue({
					haveEin : false
				})
				break;
			}
			case 'yesEin': {
				this.haveEinNo = true;
				console.log('validation updated')
				this.addBankForm.patchValue({
					haveEin : true
				})
				this.addBankForm.controls['ein'].setValidators([Validators.required])
				this.addBankForm.controls['ein'].updateValueAndValidity()
				break;
			}
		}
	}

	changeRadio(form_control: string, value: any) {
		this.SetFormValue(form_control, value)
		if (value) {
			this.addBankForm.controls['ein'].setValidators([Validators.required])
			this.addBankForm.controls['ein'].updateValueAndValidity()
		}
		else{
			this.addBankForm.controls['ein'].setValidators([])
			this.addBankForm.controls['ein'].updateValueAndValidity()
		}
	}

	changeCountry(selectedCountryCode) {
		let selectedCountryData: any;

		selectedCountryData = this.countryOptions.filter(function (countryOption) {
			return countryOption.countryShortCode == selectedCountryCode;
		});
		if (selectedCountryData) {
			this.stateOptions = selectedCountryData[0].regions;
		}
	}
	handleBadgeCity(value:any){
		console.log(value , this.filteredOptions)
		this.filteredOptions = this.badgeOptions.filter((i:any)=> i.name.toLowerCase().includes(value.toLowerCase()))
	}
	selectBadgeCity(option:any,isUserInput){
		console.log('in function selectBadgeCity-->>>' ,isUserInput)
		if(isUserInput){
			this.addBankForm.patchValue({
				badge_city:option.id
			})
			// this.addAffiliateAccountForm.updateValueAndValidity()
		}

	}
	changeIdentityCountry(selectedCountryCode) {
		this.httpClient.get("assets/json/stripeDocumentData.json").subscribe((stripeDocumentData: any) => {
			const selectedCountryData = stripeDocumentData.filter(function (eachCountryObj) {
				return eachCountryObj.value[0].value === selectedCountryCode;
			});
			this.countryDocumentsArray = selectedCountryData[0].value[1].value.value;
		})
	}

	idCardImageChange(event, imageType, imageId = null) {
		// this.stateManagementService.setprogressBar(true);
		const reader = new FileReader();
		if (event.target.files && event.target.files.length)
			console.log(event.target.files, ">>>>>>>>>>>><<<<<<<<<<", event.target.files.length)
		{
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
						// this.stateManagementService.setprogressBar(false);
					});
			};
		}
	}

	// addCardClick(accountId)
	// {
	// 	this.router.navigate(['/admin/add-card'], { queryParams: { accountType: 'blackCarLimoBus', accountId: this.affiliateId } })
	// }
	delete() {
		// this.stateManagementService.setprogressBar(true);
		$('#deleteConfirmationModal').modal('hide');
		this.adminService.deleteCard(this.cardToDelete, this.affiliateId)
			.pipe(
				catchError(err => {
					// this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			).subscribe(result => {
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
					this.router.navigate(['/admin /affiliate/step2']);
				});
				// this.stateManagementService.setprogressBar(false);
			});
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
	submitForm() {
		console.log(this.addBankForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addBankForm.invalid) {
			return;
		}
		this.addBankForm.value.stepCompleted = this.adminService.getUpdatedStepsLocal('2');
		console.log(this.addBankForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.disableSubmitButton = true; //disable submit button
		this.spinner.show();
		this.adminService.addBankOfAffiliate(this.addBankForm.value)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;
				this.spinner.hide();//hide spinner
				this.disableSubmitButton = false; //enable submit button


				this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
					this.router.navigate(['/admin/affiliate/step3'])
				);
			});
	}
	closeButton() {
		this.closeTab.emit();
	}
	resetForm() {
		this.addBankForm.reset();
		this.id_front_image = "";
		this.id_back_image = "";
	}
	showImageInModal(imageUrl) {
		this.modalImage = imageUrl;
		$("#imageModal").addClass("showImage");
		$("#imageModal").removeClass("d-none");
	}
	fillGlobalValue(type: string = '', form_control: string, autofill: boolean = false) {
		let object: any;
		if (autofill) {
			// fetch the phone country in current user logged in from local storage. Default is 'US'
			const current_user = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : { phoneCountry: 'US' }
			object = this.globalFunctions.ListSearch('find', this.currencyOptions, current_user.phoneCountry, 'currencyCountry')
			console.log(object)
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

}
