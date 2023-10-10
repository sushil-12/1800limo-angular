import { MapsAPILoader } from '@agm/core';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { CustomvalidationService } from 'src/app/services/customvalidation.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { TravelAgentService } from 'src/app/services/travel-agent.service';
import { SharedModule } from '../../shared/shared.module';
declare var $: any;
@Component({
	selector: 'app-stripe-form',
	templateUrl: './stripe-form.component.html',
	styleUrls: ['./stripe-form.component.scss']
})
export class StripeFormComponent implements OnInit {



	public addBankForm: FormGroup;
	public requestAddressChangeForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public response: any;
	public stepCompleted: any;
	public isStep2Completed: boolean = false;
	public countryDocumentsArray: any = [];
	public countryOptions: any = [];
	public stateOptions: any = [];
	public stateOptionsAddressChange: any = [];
	public currencyOptions: any = [];
	public currencyOptions_copy: any = [];
	public yearOptions: any = [];
	public id_front_image: string = null;
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
	travelAgentId: any;

	constructor(
		private adminService: AdminService,
		private travelService: TravelAgentService,
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
		const currentUser = JSON.parse(localStorage.getItem("currentUser"));
		this.travelAgentId = currentUser?.account_id

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
		//add amenity form validation
		this.addBankForm = this.formBuilder.group({
			id: [''],//bank id for edit purpose
			acc_id: [this.travelAgentId, [Validators.required, Validators.pattern("^[0-9].*$")]],//affiliate account id
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
			badge_city: [''],
			badge_city_name: [''],
			street: [''],
			city: [''],
			state: [''],
			country: ['', Validators.required],
			zipCode: [''],
			unit: [''],
			primaryCardType: ['personal'],
			// primaryCardNumber: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(16), Validators.maxLength(16), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			// primaryCSC: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(3), Validators.maxLength(3), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			primaryMM: [''],
			primaryYY: [''],
			primaryCardHolderName: ['']
		});
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

		// this.adminService.getAllEnableBadgeCities().pipe(
		// 	catchError(err => {
		// 		return throwError(err)
		// 	})
		// ).subscribe((res:any)=> {
		// 	this.badgeOptions = res?.data
		// 	this.filteredOptions = res?.data
		// })

		this.httpClient.get("assets/json/countryStateList.json").subscribe(data => {
			this.countryOptions = data;
		})
		if (this.travelAgentId) {
			this.getFormData()
		}
		else {
			//for selected country
			// this.changeCountry(currentUser.CellNumberCountry.toUpperCase());
			// this.addBankForm.patchValue({
			// 	country: currentUser.CellNumberCountry.toUpperCase()
			// });
		}

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
			console.log('---search ref element-->>>>>>', this.searchElementRef.nativeElement.value)
			let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
			autocomplete.addListener("place_changed", () => {
				this.ngZone.run(() => {
					//get the place result
					let place: google.maps.places.PlaceResult = autocomplete.getPlace();

					//verify result
					if (place.geometry === undefined || place.geometry === null) {
						return;
					}
					console.log('---->> place', place)
					for (var i = 0; i < place.address_components.length; i++) {
						for (var j = 0; j < place.address_components[i].types.length; j++) {
							if (place.address_components[i].types[j] == "country") {
								this.addBankForm.patchValue({
									country: place.address_components[i].short_name
								});
								this.changeCountry(place.address_components[i].short_name)
							}
							else if (place.address_components[i].types[j] == "administrative_area_level_1") {
								this.addBankForm.patchValue({
									state: place.address_components[i].short_name
								});
							}
							else if (place.address_components[i].types[j] == "administrative_area_level_2" || place.address_components[i].types[j] == "administrative_area_level_3") {
								this.addBankForm.patchValue({
									city: place.address_components[i].long_name
								});
							}
							else if (place.address_components[i].types[j] == "postal_code") {
								this.addBankForm.patchValue({
									zipCode: place.address_components[i].long_name
								});
							}
							else if (place.address_components[i].types[j] == "street_number") {
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
			this.spinner.hide()
		});
	}

	getFormData() {
		console.log('in function get bank data travel agent')
		// const currentUser = JSON.parse(sessionStorage.getItem("affiliateUserData"));
		// this.stepCompleted.includes('2')
		if (true) {
			// this.isStep2Completed = true;
			// this.stateManagementService.setprogressBar(true);

			this.travelService.getBankOfAffiliate(this.travelAgentId)
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
					this.stateManagementService.setprogressBar(false);
				});
		}
		else {
			this.canChangeDocument = true;//can add or change documents
			// this.canChangeAddress = true;//can add or change address

			//for selected country
			// this.changeCountry(currentUser.CellNumberCountry.toUpperCase());
			// this.addBankForm.patchValue({
			// 	country: currentUser.CellNumberCountry.toUpperCase(),AccountHolderFirstName: currentUser?.FirstName,
			// 	AccountHolderMiddleName: currentUser?.MiddleName,
			// 	AccountHolderLastName: currentUser?.LastName
			// });
		}

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


	changeCountry(selectedCountryCode) {
		let selectedCountryData: any;

		selectedCountryData = this.countryOptions.filter(function (countryOption) {
			return countryOption.countryShortCode == selectedCountryCode;
		});
		if (selectedCountryData) {
			this.stateOptions = selectedCountryData[0].regions;
		}
	}

	haveEin(haveEinNo) {
		switch (haveEinNo) {
			case 'noEin': {
				this.haveEinNo = false;
				this.addBankForm.patchValue({
					haveEin: false
				})
				break;
			}
			case 'yesEin': {
				this.haveEinNo = true;
				console.log('validation updated')
				this.addBankForm.patchValue({
					haveEin: true
				})
				this.addBankForm.controls['ein'].setValidators([Validators.required])
				this.addBankForm.controls['ein'].updateValueAndValidity()
				break;
			}
		}
	}

	handleBadgeCity(value: any) {
		console.log(value, this.filteredOptions)
		this.filteredOptions = this.badgeOptions.filter((i: any) => i.name.toLowerCase().includes(value.toLowerCase()))
	}

	selectBadgeCity(option: any, isUserInput) {
		console.log('in function selectBadgeCity-->>>', isUserInput)
		if (isUserInput) {
			this.addBankForm.patchValue({
				badge_city: option.id
			})
			// this.addAffiliateAccountForm.updateValueAndValidity()
		}

	}

	get f() {
		return this.addBankForm.controls;
	}

	SetFormValue(form_control: string, value: any) {
		this.addBankForm.get(form_control).setValue(value)
		this.addBankForm.updateValueAndValidity()
	}

	changeRadio(form_control: string, value: any) {
		this.SetFormValue(form_control, value)
		if (value) {
			this.addBankForm.controls['ein'].setValidators([Validators.required])
			this.addBankForm.controls['ein'].updateValueAndValidity()
		}
		else {
			this.addBankForm.controls['ein'].setValidators([])
			this.addBankForm.controls['ein'].updateValueAndValidity()
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

	showImageInModal(imageUrl) {
		this.modalImage = imageUrl;
		$("#imageModal").addClass("showImage");
		$("#imageModal").removeClass("d-none");
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
			this.idCardImageChange1(dataUrl, key, id);
		};
	}

	idCardImageChange1(dataUrl, imageType, imageId = null) {
		this.stateManagementService.setprogressBar(true);
		this.imageSrc = dataUrl;
		this.adminService.uploadVehicleImage(this.imageSrc)
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
	}

	idCardImageChange(event, imageType, imageId = null) {
		this.stateManagementService.setprogressBar(true);
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
							this.stateManagementService.setprogressBar(false);
							return throwError(err);
						})
					)
					.subscribe(({ data }: any) => {
						this.stateManagementService.setprogressBar(false);

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
	submitForm() {
		console.log(this.addBankForm);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addBankForm.invalid) {
			return;
		}
		// this.addBankForm.value.stepCompleted = this.adminService.getUpdatedStepsLocal('2');
		console.log(this.addBankForm.value);
		// console.log(JSON.stringify(this.addVehicleRatesForm.value));
		this.disableSubmitButton = true; //disable submit button
		this.spinner.show();
		this.travelService.addBankOfAffiliate(this.addBankForm.value)
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
				this.travelService.getStepsCompleted(this.travelAgentId)
				.pipe(
					catchError(err => {
						return throwError(err);
					})
				).subscribe(({ data }: any) => {
					if (data) {
						const stepCompleted = data.step_completed;
						const stepCompletedObj = data.step_completed_obj;
						sessionStorage.setItem('step_completed_obj',JSON.stringify(stepCompletedObj))
					}
					this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
					this.router.navigate(['/travel_agent/bookings'])
				);
				});				
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

}
