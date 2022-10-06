import { AfterViewChecked, Component, EventEmitter, Input, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient } from "@angular/common/http";
declare var $: any;

@Component({
	selector: 'app-add-master-vehicle',
	templateUrl: './add-master-vehicle.component.html',
	styleUrls: ['./add-master-vehicle.component.scss']
})
export class AddMasterVehicleComponent implements OnInit
{

	public tree: any;
	//   public affiliateId: string;
	public affiliateType: string;
	public paramResponse: any;
	public vehicleTypeId: string;
	public vehicle_type_name: any;
	public imageSrc: string;
	public vehicleImageArray: Array<object> = [];

	public addVehicleForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public vehicleSettingProgressBar: boolean = false;
	public response: any;
	public year: Array<object>;
	public filteredYear: Array<object>;
	public make: Array<any>;
	public filteredMake: Array<object>;
	public model: Array<any>;
	public filteredModel: Array<object>;
	public vehicleTypes: Array<object>;
	public filteredVehicleTypes: Array<object>;
	public color: Array<object>;
	public filteredColor: Array<object>;
	public chargableAmenities: object;
	public nonChargableAmenities: object;
	public specialAmenities: object;
	public interiors: object;

	public vehicleImage1: string;
	public vehicleImage2: string;
	public vehicleImage3: string;
	public vehicleImage4: string;
	public vehicleImage5: string;
	public vehicleImage6: string;
	public vehicleImage7: string;
	public vehicleImage8: string;
	public vehicleImage9: string;

	public oldvehicleImage: any = [];

	public vehicleImageId1: string;
	public vehicleImageId2: string;
	public vehicleImageId3: string;
	public vehicleImageId4: string;
	public vehicleImageId5: string;
	public vehicleImageId6: string;
	public vehicleImageId7: string;
	public vehicleImageId8: string;
	public vehicleImageId9: string;

	public rearPlateImage: string;
	public windowPermitImage: string;
	public windowPermit2Image: string;
	public usdotPermitImage: string;
	public mcImage: string;

	public rearPlateId: string;
	public windowPermitId: string;
	public windowPermit2Id: string;
	public usdotPermitId: string;
	public mcId: string;
	public modalImage: string;
	public luggageOptions: any = [];
	public seatOptions: any = [];
	public charterCancelOptions: Array<Object>;
	public nonCharterCancelOptions: Array<Object>;
	public serviceType: string;

	@Input() closeTab: EventEmitter<any> = new EventEmitter();
	errorMsg: boolean;
	errorMsg1: boolean;
	errorMsg2: boolean;
	errorMsg3: boolean;
	errorMsg4: boolean;
	constructor(
		private adminService: AdminService,
		private stateManagementService: StateManagementService,
		private router: Router,
		private formBuilder: FormBuilder,
		private spinner: NgxSpinnerService,
		private activatedroute: ActivatedRoute,
		private httpClient: HttpClient) { }

	ngAfterViewChecked()
	{
		$(".camera-svg").tooltip({
			trigger: 'hover'
		});
		$(".camera-svg").on('mouseleave', function ()
		{
			$(this).tooltip('dispose');
		});
		$(".camera-svg").on('click', function ()
		{
			$(this).tooltip('dispose');
		});
		$(".backbutton").tooltip({
			trigger: 'hover'
		});
		$(".backbutton").on('mouseleave', function ()
		{
			$(this).tooltip('dispose');
		});
		$(".backbutton").on('click', function ()
		{
			$(this).tooltip('dispose');
		});
	}

	ngOnInit(): void
	{
		$('#vehicleTypeField').focusout(() =>
		{
			this.errorMsg = true;
		})
		$('#makeField').focusout(() =>
		{
			this.errorMsg1 = true;
		})
		$('#modelField').focusout(() =>
		{
			this.errorMsg2 = true;
		})
		$('#yearField').focusout(() =>
		{
			this.errorMsg3 = true;
		})
		$('#colorField').focusout(() =>
		{
			this.errorMsg4 = true;
		})
		this.vehicle_type_name = JSON.parse(sessionStorage.getItem("vehiclesTypes"))
		console.log(this.vehicle_type_name, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
		//pick vehicle type id from query params
		this.activatedroute.queryParamMap
			.subscribe((params) =>
			{
				this.paramResponse = { ...params.keys, ...params };
				this.vehicleTypeId = this.paramResponse.params.vehicleTypeId;
			}
			);
		this.httpClient.get("assets/json/charterOptions.json").subscribe((data: any) =>
		{
			this.nonCharterCancelOptions = data;
			this.charterCancelOptions = data;
		});
		// const currentUser = JSON.parse(localStorage.getItem("currentUser"));
		// this.affiliateId = sessionStorage.getItem("affiliateId")

		//data for dropdown of seats and luggage
		for (let i = 2; i <= 75; i++)
		{
			this.luggageOptions.push(i);
		}
		for (let i = 4; i <= 75; i++)
		{
			this.seatOptions.push(i);
		}

		//add vehicle form validation
		this.addVehicleForm = this.formBuilder.group({
			acc_id: [''],
			vehicleType: [""],
			make: ['', Validators.required],
			model: ['', Validators.required],
			year: ['', Validators.required],
			color: ['', Validators.required],
			licensePlate: [''],
			numberOfVehicles: [1],
			seats: [4, [Validators.required, Validators.pattern("^[0-9]*$")]],
			luggage: [2, [Validators.required, Validators.pattern("^[0-9]*$")]],
			charterCancelPolicy: ['2', Validators.required],
			nonCharterCancelPolicy: ['2', Validators.required],
			typeOfService: this.formBuilder.array([]),
			amenities: this.formBuilder.array([], [Validators.required]),
			specialAmenities: this.formBuilder.array([]),
			vehicleInterior: this.formBuilder.array([], [Validators.required]),
			vehicle_image_1: ['', Validators.required],
			vehicle_image_2: [''],
			vehicle_image_3: [''],
			vehicle_image_4: [''],
			vehicle_image_5: [''],
			vehicle_image_6: [''],
			vehicle_image_7: [''],
			vehicle_image_8: [''],
			vehicle_image_9: [''],
			rearPlateImage: [''],
			windowPermitImage: [''],
			windowPermit2Image: [''],
			usdotPermitImage: [''],
			mcImage: [''],
		});

		//Put Black color value by default in Color
		let colorField: any = document.getElementById('colorField');
		colorField.value = "Black";
		this.addVehicleForm.patchValue({
			color: 1,
		});
		//

		// this.affiliateType = currentUser.affiliate_type;
		// if (this.affiliateType != 'fleet_operator') {
		//   this.addVehicleForm.controls['licensePlate'].setValidators([Validators.required]);
		//   this.addVehicleForm.controls['licensePlate'].updateValueAndValidity();
		//   this.addVehicleForm.controls['rearPlateImage'].setValidators([Validators.required]);
		//   this.addVehicleForm.controls['rearPlateImage'].updateValueAndValidity();
		// }

		// this.stateManagementService.getNumberOfVehicles().subscribe(numberOfVehicles => {
		//   let numberOfVehiclesCanBeAdded;
		//   if (this.affiliateType == 'fleet_operator') {
		//     this.addVehicleForm.controls['numberOfVehicles'].setValidators([Validators.required, Validators.pattern("^[0-9]*$")]);
		//   }
		//   else if (this.affiliateType == 'black_limo_operator') {
		//     numberOfVehiclesCanBeAdded = 2 - numberOfVehicles;
		//     this.addVehicleForm.controls['numberOfVehicles'].setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), Validators.max(numberOfVehiclesCanBeAdded)]);
		//   }
		//   else {
		//     numberOfVehiclesCanBeAdded = 1 - numberOfVehicles;
		//     this.addVehicleForm.controls['numberOfVehicles'].setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), Validators.max(numberOfVehiclesCanBeAdded)]);
		//   }
		//   this.addVehicleForm.controls['numberOfVehicles'].updateValueAndValidity();
		// });

		/** progress bar starts on init */
		// this.stateManagementService.setprogressBar(true);

		// show spinner
		this.spinner.show();
		// Load data for form
		this.adminService.getFieldsData()
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();
					return throwError(err);
				})
			).subscribe(result =>
			{
				this.response = result;
				this.filteredYear = this.year = this.response.data.years;
				this.filteredMake = this.make = this.response.data.make;
				this.filteredModel = this.model = this.response.data.model;
				this.filteredVehicleTypes = this.vehicleTypes = this.response.data.vehicle_types;
				this.filteredColor = this.color = this.response.data.color;
				this.chargableAmenities = this.response.data.chargableAmenities;
				this.nonChargableAmenities = this.response.data.nonChargableAmenities;
				this.specialAmenities = this.response.data.specialAmenities;
				this.interiors = this.response.data.vehicleInterior;

				sessionStorage.setItem('models', JSON.stringify(this.model));

				this.vehicleImage1 = this.oldvehicleImage[0] = JSON.parse(sessionStorage.getItem('selected_type')).vehicle_cat_image
				this.vehicleImage2 = this.oldvehicleImage[1] = ""
				this.vehicleImage3 = this.oldvehicleImage[2] = ""
				this.vehicleImage4 = this.oldvehicleImage[3] = ""
				this.vehicleImage5 = this.oldvehicleImage[4] = ""
				this.vehicleImage6 = this.oldvehicleImage[5] = ""
				this.vehicleImage7 = this.oldvehicleImage[6] = ""
				this.vehicleImage8 = this.oldvehicleImage[7] = ""
				this.vehicleImage9 = this.oldvehicleImage[8] = ""

				this.vehicleImageId1 = JSON.parse(sessionStorage.getItem('selected_type')).id
				this.vehicleImageId2 = ""
				this.vehicleImageId3 = ""
				this.vehicleImageId4 = ""
				this.vehicleImageId5 = ""
				this.vehicleImageId6 = ""
				this.vehicleImageId7 = ""
				this.vehicleImageId8 = ""
				this.vehicleImageId9 = ""

				this.rearPlateImage = this.oldvehicleImage[9] = this.response.data.rearPlateImage.image;
				this.windowPermitImage = this.oldvehicleImage[10] = this.response.data.windowPermitImage.image;
				this.windowPermit2Image = this.oldvehicleImage[11] = this.response.data.windowPermit2Image.image;
				this.usdotPermitImage = this.oldvehicleImage[12] = this.response.data.usdotPermitImage.image;
				this.mcImage = this.oldvehicleImage[13] = this.response.data.mcImage.image;

				this.rearPlateId = this.response.data.rearPlateImage.id;
				this.windowPermitId = this.response.data.windowPermitImage.id;
				this.windowPermit2Id = this.response.data.windowPermit2Image.id;
				this.usdotPermitId = this.response.data.usdotPermitImage.id;
				this.mcId = this.response.data.mcImage.id;

				//get models as per make
				let models = JSON.parse(sessionStorage.getItem('models'));
				let selectedMake = this.make[0].ID;
				let resmodels = models.filter(function (model)
				{
					if (model.make_id == selectedMake)
					{
						return true;
					}
				});
				this.model = resmodels;

				this.addVehicleForm.patchValue({
					vehicle_image_1: this.vehicleImageId1,
					vehicle_image_2: this.vehicleImageId2,
					vehicle_image_3: this.vehicleImageId3,
					vehicle_image_4: this.vehicleImageId4,
					vehicle_image_5: this.vehicleImageId5,
					vehicle_image_6: this.vehicleImageId6,
					vehicle_image_7: this.vehicleImageId7,
					vehicle_image_8: this.vehicleImageId8,
					vehicle_image_9: this.vehicleImageId9,
					rearPlateImage: this.rearPlateId,
					windowPermitImage: this.windowPermitId,
					windowPermit2Image: this.windowPermit2Id,
					usdotPermitImage: this.usdotPermitId,
					mcImage: this.mcId,
				});
				this.spinner.hide();
			});
	}

	closeButton()
	{
		this.closeTab.emit();
	}
	//Start of autocomplete search and selection
	searchSorting(keyword, a, b)
	{
		// Sort results by matching name with keyword position in name
		if (a.name.toLowerCase().indexOf(keyword.toLowerCase()) > b.name.toLowerCase().indexOf(keyword.toLowerCase()))
		{
			return 1;
		} else if (a.name.toLowerCase().indexOf(keyword.toLowerCase()) < b.name.toLowerCase().indexOf(keyword.toLowerCase()))
		{
			return -1;
		} else
		{
			if (a.name > b.name)
				return 1;
			else
				return -1;
		}
	}

	searchVehicleType(keyword)
	{
		this.addVehicleForm.patchValue({
			vehicleType: '',
		});
		if (keyword == '')
		{
			this.filteredVehicleTypes = this.vehicleTypes;
		}
		else
		{
			this.filteredVehicleTypes = this.vehicleTypes.filter((vehicle_Type: any) =>
			{
				if (vehicle_Type.name.toLowerCase() === keyword.toLowerCase())
				{
					this.addVehicleForm.patchValue({
						vehicleType: vehicle_Type.ID,
					});
				}
				return vehicle_Type.name.toLowerCase().includes(keyword.toLowerCase());
			})
				.sort((a: any, b: any) =>
				{
					return this.searchSorting(keyword, a, b)
				});
		}
	}

	selectVehicleType(val, isSelected)
	{
		if (isSelected)// ignore on deselection of the previous option
		{
			this.addVehicleForm.patchValue({
				vehicleType: val,
			});
		}
	}

	searchMake(keyword)
	{
		this.addVehicleForm.patchValue({
			make: '',
		});
		if (keyword == '')
		{
			this.filteredMake = this.make;
		}
		else
		{
			this.filteredMake = this.make.filter((mk: any) =>
			{
				if (mk.name.toLowerCase() === keyword.toLowerCase())
				{
					this.addVehicleForm.patchValue({
						make: mk.ID,
					});
				}
				return mk.name.toLowerCase().includes(keyword.toLowerCase());
			})
				.sort((a: any, b: any) =>
				{
					return this.searchSorting(keyword, a, b)
				});
		}
	}
	selectMake(val, isSelected)
	{
		if (isSelected)// ignore on deselection of the previous option
		{
			this.addVehicleForm.patchValue({
				make: val,
			});
			this.changeMake(val);
			let modelField: any = document.getElementById('modelField');
			modelField.value = '';
		}
	}

	searchModel(keyword)
	{
		this.addVehicleForm.patchValue({
			model: '',
		});
		if (keyword == '')
		{
			this.filteredModel = this.model;
		}
		else
		{
			this.filteredModel = this.model.filter((mdl: any) =>
			{
				if (mdl.name.toLowerCase() === keyword.toLowerCase())
				{
					this.addVehicleForm.patchValue({
						model: mdl.ID,
					});
				}
				return mdl.name.toLowerCase().includes(keyword.toLowerCase());
			})
				.sort((a: any, b: any) =>
				{
					return this.searchSorting(keyword, a, b)
				});
		}
	}
	selectModel(val, isSelected)
	{
		if (isSelected)// ignore on deselection of the previous option
		{
			this.addVehicleForm.patchValue({
				model: val,
			});
		}
	}

	searchYear(keyword)
	{
		this.addVehicleForm.patchValue({
			year: '',
		});
		if (keyword == '')
		{
			this.filteredYear = this.year;
		}
		else
		{
			this.filteredYear = this.year.filter((yr: any) =>
			{
				if (yr.name.toLowerCase() === keyword.toLowerCase())
				{
					this.addVehicleForm.patchValue({
						year: yr.ID,
					});
				}
				return yr.name.toLowerCase().includes(keyword.toLowerCase());
			})
				.sort((a: any, b: any) =>
				{
					return this.searchSorting(keyword, a, b)
				});
		}
	}
	selectYear(val, isSelected)
	{
		if (isSelected)// ignore on deselection of the previous option
		{
			this.addVehicleForm.patchValue({
				year: val,
			});
		}
	}

	searchColor(keyword)
	{
		this.addVehicleForm.patchValue({
			color: '',
		});
		if (keyword == '')
		{
			this.filteredColor = this.color;
		}
		else
		{
			this.filteredColor = this.color.filter((cl: any) =>
			{
				if (cl.name.toLowerCase() === keyword.toLowerCase())
				{
					this.addVehicleForm.patchValue({
						color: cl.ID,
					});
				}
				return cl.name.toLowerCase().includes(keyword.toLowerCase());
			})
				.sort((a: any, b: any) =>
				{
					return this.searchSorting(keyword, a, b)
				});
		}
	}
	selectColor(val, isSelected)
	{
		if (isSelected)// ignore on deselection of the previous option
		{
			this.addVehicleForm.patchValue({
				color: val,
			});
		}
	}
	//End of autocomplete search and selection



	onAmenitiesCheckboxChange(val, ischecked)
	{
		const amenities: FormArray = this.addVehicleForm.get('amenities') as FormArray;
		if (ischecked)
		{
			amenities.push(new FormControl(val));
		} else
		{
			const index = amenities.controls.findIndex(x => x.value === val);
			amenities.removeAt(index);
		}
	}
	onSpecialAmenitiesCheckboxChange(e)
	{
		const specialAmenities: FormArray = this.addVehicleForm.get('specialAmenities') as FormArray;
		if (e.target.checked)
		{
			specialAmenities.push(new FormControl(e.target.value));
		} else
		{
			const index = specialAmenities.controls.findIndex(x => x.value === e.target.value);
			specialAmenities.removeAt(index);
		}
	}

	onInteriorsCheckboxChange(e)
	{
		const vehicleInterior: FormArray = this.addVehicleForm.get('vehicleInterior') as FormArray;
		if (e.target.checked)
		{
			vehicleInterior.push(new FormControl(e.target.value));
		} else
		{
			const index = vehicleInterior.controls.findIndex(x => x.value === e.target.value);
			vehicleInterior.removeAt(index);
		}
	}

	onFileChange(event, imageId, imageNumber)
	{
		this.stateManagementService.setprogressBar(true);
		const reader = new FileReader();
		if (event.target.files && event.target.files.length)
		{
			const [file] = event.target.files;
			reader.readAsDataURL(file);
			reader.onload = () =>
			{
				this.imageSrc = reader.result as string;
				this.adminService.uploadVehicleImage(this.imageSrc)
					.pipe(
						catchError(err =>
						{
							this.stateManagementService.setprogressBar(false);
							return throwError(err);
						})
					)
					.subscribe(result =>
					{
						this.response = result;
						this.addVehicleForm.patchValue({
							["vehicle_image_" + imageNumber]: this.response.data.id,
						});
						this["vehicleImage" + imageNumber] = this.response.data.image;

						this.stateManagementService.setprogressBar(false);
					});
			};
		}
	}

	vehicleOfficialImagesChange(event, imageType, imageId)
	{
		this.stateManagementService.setprogressBar(true);
		const reader = new FileReader();
		if (event.target.files && event.target.files.length)
		{
			const [file] = event.target.files;
			reader.readAsDataURL(file);
			reader.onload = () =>
			{
				this.imageSrc = reader.result as string;
				this.adminService.uploadVehicleImage(this.imageSrc)
					.pipe(
						catchError(err =>
						{
							this.stateManagementService.setprogressBar(false);
							return throwError(err);
						})
					)
					.subscribe(result =>
					{
						this.response = result;

						switch (imageType)
						{
							case 'rearPlate': {
								this.addVehicleForm.patchValue({
									rearPlateImage: this.response.data.id,
								});
								// this.rearPlateUploaded=true;
								this.rearPlateImage = this.response.data.image;
								// this.deleteImage(imageId,'rearPlate');//delete previous image
								break;
							}
							case 'windowPermit': {
								this.addVehicleForm.patchValue({
									windowPermitImage: this.response.data.id,
								});
								// this.windowPermitUploaded=true;
								this.windowPermitImage = this.response.data.image;
								// this.deleteImage(imageId,'windowPermit');//delete previous image
								break;
							}
							case 'windowPermit2': {
								this.addVehicleForm.patchValue({
									windowPermit2Image: this.response.data.id,
								});
								// this.windowPermit2Uploaded=true;
								this.windowPermit2Image = this.response.data.image;
								// this.deleteImage(imageId,'windowPermit2');//delete previous image
								break;
							}
							case 'usdotPermit': {
								this.addVehicleForm.patchValue({
									usdotPermitImage: this.response.data.id,
								});
								// this.usdotPermitUploaded=true;
								this.usdotPermitImage = this.response.data.image;
								// this.deleteImage(imageId,'usdotPermit');//delete previous image
								break;
							}
							case 'mc': {
								// this.deleteImage(imageId,'mc');//delete previous image
								this.addVehicleForm.patchValue({
									mcImage: this.response.data.id,
								});
								// this.mcUploaded=true;
								this.mcImage = this.response.data.image;
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

	deleteImage(id, imageType, imageNumber = null)
	{
		switch (imageType)
		{
			case 'rearPlate': {
				this.addVehicleForm.patchValue({
					rearPlateImage: '',
				});
				this.rearPlateImage = '';
				break;
			}
			case 'windowPermit': {
				this.addVehicleForm.patchValue({
					windowPermitImage: '',
				});
				this.windowPermitImage = '';
				break;
			}
			case 'windowPermit2': {
				this.addVehicleForm.patchValue({
					windowPermit2Image: '',
				});
				this.windowPermit2Image = '';
				break;
			}
			case 'usdotPermit': {
				this.addVehicleForm.patchValue({
					usdotPermitImage: '',
				});
				this.usdotPermitImage = '';
				break;
			}
			case 'mc': {
				this.addVehicleForm.patchValue({
					mcImage: '',
				});
				this.mcImage = '';
				break;
			}
			case 'vehicleImage': {
				this.addVehicleForm.patchValue({
					["vehicle_image_" + imageNumber]: '',
				});
				this["vehicleImage" + imageNumber] = '';
				break;
			}
			default: {
				break;
			}
		}
	}

	showImageInModal(imageUrl)
	{
		this.modalImage = imageUrl;
		$("#imageModal").addClass("showImage");
		$("#imageModal").removeClass("d-none");
	}

	get f()
	{
		return this.addVehicleForm.controls;
	}

	submitForm()
	{
		this.addVehicleForm.patchValue({
			vehicleType: this.vehicleTypeId
		});

		this.pushValuesTypeOfService(this.service)

		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addVehicleForm.invalid)
		{
			console.log(this.addVehicleForm)
			return;
		}
		this.spinner.show(); // show spinner
		this.disableSubmitButton = true; //disable submit button

		this.adminService.submitVehicle(this.addVehicleForm.value)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide(); // hide spinner
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(result =>
			{
				this.response = result;
				this.spinner.hide(); // hide spinner
				this.disableSubmitButton = true; //enable submit button

				this.stateManagementService.addNumberOfVehicles(this.addVehicleForm.value.numberOfVehicles);

				this.router.navigate(['/admin/master-vehicle-types/add-vehicle-rate'], { queryParams: { vehicleId: this.response.data.id } });
			});
	}

	resetForm()
	{
		this.submittedForm = true;
		this.addVehicleForm.reset();
		this.vehicleImageArray = [];

		let vehicleTypeField: any = document.getElementById('vehicleTypeField');
		vehicleTypeField.value = "";
		let colorField: any = document.getElementById('colorField');
		colorField.value = "";
		let makeField: any = document.getElementById('makeField');
		makeField.value = "";
		let modelField: any = document.getElementById('modelField');
		modelField.value = "";
		let yearField: any = document.getElementById('yearField');
		yearField.value = "";
		this.vehicleImage1 = this.oldvehicleImage[0];
		this.vehicleImage2 = this.oldvehicleImage[1];
		this.vehicleImage3 = this.oldvehicleImage[2];
		this.vehicleImage4 = this.oldvehicleImage[3];
		this.vehicleImage5 = this.oldvehicleImage[4];
		this.vehicleImage6 = this.oldvehicleImage[5];
		this.vehicleImage7 = this.oldvehicleImage[6];
		this.vehicleImage8 = this.oldvehicleImage[7];
		this.vehicleImage9 = this.oldvehicleImage[8];
		this.rearPlateImage = this.oldvehicleImage[9];
		this.windowPermitImage = this.oldvehicleImage[10];
		this.windowPermit2Image = this.oldvehicleImage[11];
		this.usdotPermitImage = this.oldvehicleImage[12];
		this.mcImage = this.oldvehicleImage[13];
	}

	backButton()
	{
		this.router.navigate(['/admin/master-vehicle-types']);
	}

	changeMake(selectedMake)
	{
		let models = JSON.parse(sessionStorage.getItem('models'));
		this.filteredModel = this.model = models.filter(function (model)
		{
			if (model.make_id == selectedMake)
			{
				return true;
			}
		});
	}



	get typeOfService(): FormArray
	{
		return this.addVehicleForm.get('typeOfService') as FormArray;
	}

	pushValuesTypeOfService(value: Array<any>)
	{
		this.typeOfService.clear()
		if (value.length == 0)
		{
			return
		}
		value.forEach((item: string) =>
		{
			!this.service.includes(item) && this.service.push(item)
			this.typeOfService.push(this.formBuilder.control(item))
		})
	}

	service: Array<any> = []
	onServiceChange(value: string)
	{
		console.log(value)
		if (this.service.includes(value))
		{
			// a never reaching code line
			this.service = this.service.filter(val => val != value)
		} else
		{
			this.service = []
			this.service.push(value)
		}

		// as per new update from client: he wants to make the whole thing work as a radio button
		return
		/* if (!is_service_valid(value, this.service))
		{
			this.errorModal.openDialog({
				errors: {
					error: 'Cannot choose Local and Over The Road service at the same time'
				}
			})
			this.service = this.service.filter(val => val != value)
			return
		}
		console.log('Inital Array: ', this.service) */

		/**
		 * The Array Validation Check function
		 * - make sure the array doesn't containe 'local' and 'over_the_road' values at a time.
		 * 
		 * @param value: String [Required] value to check
		 */
		function is_service_valid(value: string, service: Array<any>)
		{
			if (value == 'local' && service.includes('over_the_road'))
			{
				return false
			} else if (value == 'over_the_road' && service.includes('local'))
			{
				return false
			}
			else
			{
				return true
			}
		}
	}



}
