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
declare var $:any;
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
			street: [''],
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
		else{
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
			this.idCardImageChange1(dataUrl, key,id);
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

}
