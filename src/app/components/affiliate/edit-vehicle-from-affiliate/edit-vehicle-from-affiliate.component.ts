import { AfterViewChecked, Component, EventEmitter, Input, OnInit } from '@angular/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { AdminService } from 'src/app/services/admin.service';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;

@Component({
	selector: 'app-edit-vehicle-from-affiliate',
	templateUrl: './edit-vehicle-from-affiliate.component.html',
	styleUrls: ['./edit-vehicle-from-affiliate.component.scss']
})
export class EditVehicleFromAffiliateComponent implements OnInit, AfterViewChecked
{

	public tree: any;
	public affiliateId: string;
	public affiliateType: string;
	public paramResponse: any;
	isVehicleTypeSelected: boolean=true;
	public vehicleTypeId: string;
	public vehicleId: string;
	public imageSrc: string;
	public vehicleImageArray: Array<object> = [];
	public onFirstLoad :number=1;
	public addVehicleForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public editVehicleSettingProgressBar: boolean = false;

	public response: any;
	public response2: any;
	public year: Array<object>;
	public filteredYear: Array<object>;
	public make: Array<any>;
	public filteredMake: Array<object>;
	public model: Array<any>;
	public filteredModel: Array<any>;
	public vehicleTypes: Array<object>;
	public filteredVehicleTypes: Array<object>;
	public color: Array<object>;
	public filteredColor: Array<object>;
	public chargableAmenities: object;
	public nonChargableAmenities: object;
	public amenitiesFormControl: any;
	public specialAmenities: any;
	public specialAmenitiesFormControl: any;
	public interiors: any;
	public interiorsFormControl: any;

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
	service: Array<any> = []
	changeNonCharterCancelPolicy : boolean = true
	changeCharterCancelPolicy : boolean = true

	@Input() closeTab: EventEmitter<any> = new EventEmitter();
	errorMsg: boolean;
	errorMsg1: boolean;
	errorMsg2: boolean;
	errorMsg3: boolean;
	errorMsg4: boolean;
	constructor(
		private affiliateService: AffiliateService,
		private stateManagementService: StateManagementService,
		private adminService: AdminService,
		private router: Router,
		private formBuilder: FormBuilder,
		private spinner: NgxSpinnerService,
		private activatedroute: ActivatedRoute,
		private httpClient: HttpClient,
		private commonServices: CommonService,
		private errorModal: ErrorDialogService
	) { }

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

		//pick individual id from query params
		this.activatedroute.queryParamMap
			.subscribe((params) =>
			{
				this.paramResponse = { ...params.keys, ...params };
				this.vehicleTypeId = this.paramResponse.params.vehicleTypeId;
				this.vehicleId = this.paramResponse.params.vehicleId;
			}
			);
		this.httpClient.get("assets/json/charterOptions.json").subscribe((data: any) =>
		{
			this.nonCharterCancelOptions = data;
			this.charterCancelOptions = data;
		});
		const currentUser = JSON.parse(localStorage.getItem("currentUser"));
		this.affiliateId = currentUser?.account_id;

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
			id: ['', Validators.required],
			vehicleType: ['', Validators.required],
			make: ['', Validators.required],
			model: ['', Validators.required],
			year: ['', Validators.required],
			color: ['', Validators.required],
			licensePlate: ['', ],
			numberOfVehicles: [],
			seats: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
			luggage: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
			charterCancelPolicy: ['2', Validators.required],
			nonCharterCancelPolicy: ['2', Validators.required],
			typeOfService: this.formBuilder.array([]),
			amenities: this.formBuilder.array([], [Validators.required]),
			specialAmenitiesGet: this.formBuilder.array([]),
			specialAmenities: this.formBuilder.array([]),
			vehicleInteriorGet: this.formBuilder.array([], [Validators.required]),
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

		this.affiliateType = currentUser?.affiliate_type;

		/** progress bar starts on init */
		this.spinner.show()
		// Load field data using API
		this.affiliateService.getFieldsData()
			.pipe(
				catchError(err =>
				{
					this.spinner.hide()
					return throwError(err);
				})
			).subscribe(result =>
			{
				this.response = result;
				this.filteredYear = this.year = this.response?.data?.years;
				this.filteredMake = this.make = this.response?.data?.make;
				this.filteredModel = this.model = this.response?.data?.model;
				this.filteredVehicleTypes = this.vehicleTypes = this.response?.data?.vehicle_types;
				this.filteredColor = this.color = this.response?.data?.color;
				this.specialAmenities = this.response?.data?.specialAmenities;
				this.interiors = this.response?.data?.vehicleInterior;
				this.oldvehicleImage[0] = this.response?.data?.vehicleImage1?.image;
				this.oldvehicleImage[1] = this.response?.data?.vehicleImage2?.image;
				this.oldvehicleImage[2] = this.response?.data?.vehicleImage3?.image;
				this.oldvehicleImage[3] = this.response?.data?.vehicleImage4?.image;
				this.oldvehicleImage[4] = this.response?.data?.vehicleImage5?.image;
				this.oldvehicleImage[5] = this.response?.data?.vehicleImage6?.image;
				this.oldvehicleImage[6] = this.response?.data?.vehicleImage7?.image;
				this.oldvehicleImage[7] = this.response?.data?.vehicleImage8?.image;
				this.oldvehicleImage[8] = this.response?.data?.vehicleImage9?.image;

				this.oldvehicleImage[9] = this.response?.data?.rear_plate?.image;
				this.oldvehicleImage[10] = this.response?.data?.window_permit?.image;
				this.oldvehicleImage[11] = this.response?.data?.window_permit_1?.image;
				this.oldvehicleImage[12] = this.response?.data?.USDOT_permit?.image;
				this.oldvehicleImage[13] = this.response?.data?.mc?.image;


				sessionStorage.setItem('models', JSON.stringify(this.model));

				this.affiliateService.getVehicleData(this.vehicleId)
					.pipe(
						catchError(err =>
						{
							this.spinner.hide()
							return throwError(err);
						})
					).subscribe(result2 =>
					{
						console.log('response2-------_>>>>>>>>>>>>>>>>>>')
						this.response2 = result2;
						if (this.response2?.data?.vehicle_image_1)
						{
							this.vehicleImage1 = this.response2?.data?.vehicle_image_1?.image;
							this.vehicleImageId1 = this.response2?.data?.vehicle_image_1?.ID;
							this.addVehicleForm.patchValue({
								vehicle_image_1: this.vehicleImageId1
							});
						}
						else
						{
							this.vehicleImage1 = '';
							this.vehicleImageId1 = '';
						}
						if (this.response2?.data?.vehicle_image_2)
						{
							this.vehicleImage2 = this.response2?.data?.vehicle_image_2?.image;
							this.vehicleImageId2 = this.response2?.data?.vehicle_image_2?.ID;
							this.addVehicleForm.patchValue({
								vehicle_image_2: this.vehicleImageId2
							});
						}
						else
						{
							this.vehicleImage2 = '';
							this.vehicleImageId2 = '';
						}
						if (this.response2?.data?.vehicle_image_3)
						{
							this.vehicleImage3 = this.response2?.data?.vehicle_image_3?.image;
							this.vehicleImageId3 = this.response2?.data?.vehicle_image_3?.ID;
							this.addVehicleForm.patchValue({
								vehicle_image_3: this.vehicleImageId3
							});
						}
						else
						{
							this.vehicleImage3 = '';
							this.vehicleImageId3 = '';
						}
						if (this.response2?.data?.vehicle_image_4)
						{
							this.vehicleImage4 = this.response2?.data?.vehicle_image_4?.image;
							this.vehicleImageId4 = this.response2?.data?.vehicle_image_4?.ID;
							this.addVehicleForm.patchValue({
								vehicle_image_4: this.vehicleImageId4
							});
						}
						else
						{
							this.vehicleImage4 = '';
							this.vehicleImageId4 = '';
						}
						if (this.response2?.data?.vehicle_image_5)
						{
							this.vehicleImage5 = this.response2?.data?.vehicle_image_5?.image;
							this.vehicleImageId5 = this.response2?.data?.vehicle_image_5?.ID;
							this.addVehicleForm.patchValue({
								vehicle_image_5: this.vehicleImageId5
							});
						}
						else
						{
							this.vehicleImage5 = '';
							this.vehicleImageId5 = '';
						}
						if (this.response2?.data?.vehicle_image_6)
						{
							this.vehicleImage6 = this.response2?.data?.vehicle_image_6?.image;
							this.vehicleImageId6 = this.response2?.data?.vehicle_image_6?.ID;
							this.addVehicleForm.patchValue({
								vehicle_image_6: this.vehicleImageId6
							});
						}
						else
						{
							this.vehicleImage6 = '';
							this.vehicleImageId6 = '';
						}
						if (this.response2?.data?.vehicle_image_7)
						{
							this.vehicleImage7 = this.response2?.data?.vehicle_image_7?.image;
							this.vehicleImageId7 = this.response2?.data?.vehicle_image_7?.ID;
							this.addVehicleForm.patchValue({
								vehicle_image_7: this.vehicleImageId7
							});
						}
						else
						{
							this.vehicleImage7 = '';
							this.vehicleImageId7 = '';
						}
						if (this.response2?.data?.vehicle_image_8)
						{
							this.vehicleImage8 = this.response2?.data?.vehicle_image_8?.image;
							this.vehicleImageId8 = this.response2?.data?.vehicle_image_8?.ID;
							this.addVehicleForm.patchValue({
								vehicle_image_8: this.vehicleImageId8
							});
						}
						else
						{
							this.vehicleImage8 = '';
							this.vehicleImageId8 = '';
						}
						if (this.response2?.data?.vehicle_image_9)
						{
							this.vehicleImage9 = this.response2?.data?.vehicle_image_9?.image;
							this.vehicleImageId9 = this.response2?.data?.vehicle_image_9?.ID;
							this.addVehicleForm.patchValue({
								vehicle_image_9: this.vehicleImageId9
							});
						}
						else
						{
							this.vehicleImage9 = '';
							this.vehicleImageId9 = '';
						}

						this.rearPlateImage = this.response2.data?.rear_plate_image?.image;
						this.windowPermitImage = this.response2?.data?.window_permitImage?.image;
						this.windowPermit2Image = this.response2.data?.window_permitImage2?.image;
						this.usdotPermitImage = this.response2?.data?.usdot_permitImage?.image;
						this.mcImage = this.response2?.data?.mc_image?.image;

						this.rearPlateId = this.response2?.data?.rear_plate_image?.ID;
						this.windowPermitId = this.response2?.data?.window_permitImage?.ID;
						this.windowPermit2Id = this.response2?.data?.window_permitImage2?.ID;
						this.usdotPermitId = this.response2?.data?.usdot_permitImage?.ID;
						this.mcId = this.response2?.data?.mc_image?.ID;

						//get models as per make
						let models = JSON.parse(sessionStorage.getItem('models'));
						let selectedMake = this.response2?.data?.make;
						let resmodels = models?.filter(function (model)
						{
							if (model?.make_id == selectedMake)
							{
								return true;
							}
						});
						this.model = resmodels;
						//

						//show selected chargable and non chargable amenities.
						this.chargableAmenities = this.response2?.data?.chargableAmenities;
						this.nonChargableAmenities = this.response2?.data?.nonChargableAmenities;
						//patch form values
						this.addVehicleForm.patchValue({
							id: this.vehicleId,
							rearPlateImage: this.rearPlateId,
							windowPermitImage: this.windowPermitId,
							windowPermit2Image: this.windowPermit2Id,
							usdotPermitImage: this.usdotPermitId,
							mcImage: this.mcId,
							vehicleType: parseInt(this.response2?.data?.vehicle_type),
							make: parseInt(this.response2?.data?.make),
							year: parseInt(this.response2?.data?.year),
							color: parseInt(this.response2?.data?.color),
							numberOfVehicles: this.response2?.data?.numberOfVehicles,
							licensePlate: this.response2?.data?.license_plate,
							seats: this.response2?.data?.seats,
							luggage: this.response2?.data?.luggage,
							charterCancelPolicy: this.response2?.data?.charterCancelPolicy,
							nonCharterCancelPolicy: this.response2?.data?.nonCharterCancelPolicy,
							typeOfService: this.response2.data.typeOfService
						});

						
						//
						console.log('onfirstLoad call change make')
						this.changeMake(this.response2?.data?.make, 'onFirstLoad');//to show selected model
						// this.handleInteriorsCheckbox(this.response2?.data?.vehicleInterior)
						this.setAmenities();//show selected amenities
						this.setSpecialAmenities();//show selected special amenities
						this.setInteriors();//show selected interiors

						this.stateManagementService.getNumberOfVehicles().subscribe(numberOfVehicles =>
						{
							let numberOfVehiclesCanBeAdded;
							if (this.affiliateType == 'fleet_operator')
							{
								this.addVehicleForm.controls['numberOfVehicles'].setValidators([Validators.required, Validators.pattern("^[0-9]*$")]);
							}
							else if (this.affiliateType == 'black_limo_operator')
							{
								numberOfVehiclesCanBeAdded = 2 - (numberOfVehicles - this.response2?.data?.numberOfVehicles);
								this.addVehicleForm.controls['numberOfVehicles'].setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), Validators.max(numberOfVehiclesCanBeAdded)]);
							}
							else
							{
								numberOfVehiclesCanBeAdded = 1 - (numberOfVehicles - this.response2?.data?.numberOfVehicles);
								this.addVehicleForm.controls['numberOfVehicles'].setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), Validators.max(numberOfVehiclesCanBeAdded)]);
							}
							this.addVehicleForm.controls['numberOfVehicles'].updateValueAndValidity();
						});
						this.pushValuesTypeOfService(this.response2?.data?.typeOfService) // push into form

						//Set values in autocomplete fields
						let vehicleTypeField: any = document.getElementById('vehicleTypeField');
						vehicleTypeField.value = this.response2?.data?.vehicle_typeName;
						let makeField: any = document.getElementById('makeField');
						makeField.value = this.response2?.data?.makeName;
						let modelField: any = document.getElementById('modelField');
						modelField.value = this.response2?.data?.modelName;
						let yearField: any = document.getElementById('yearField');
						yearField.value = this.response2?.data?.yearName;
						let colorField: any = document.getElementById('colorField');
						colorField.value = this.response2?.data?.colorName;
					});
				this.spinner.hide();
			});


		this.typeOfService // assign the global variable - service.
		this.Subscriptions();
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
	handleChangeVehicleType(value){
		console.log('Selected Value:', value);
		
		this.isVehicleTypeSelected = value ? true : false
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
					console.log(1, mk.ID)
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
			console.log(2, val)
			this.changeMake(val);
			let modelField: any = document.getElementById('modelField');
			modelField.value = '';
		}
	}
	handleNonCharterCancelPolicy(event){
		console.log('in function handleNonCharterCancelPolicy--->>', event)
		this.changeNonCharterCancelPolicy = true
	}
	handleChangeCharterCancelPolicy(event){
		this.changeCharterCancelPolicy = true
	}

	Subscriptions() {
		this.addVehicleForm.get('make')?.valueChanges.subscribe((value: string) => {
			this.changeMake(value);
			let modelField: any = document.getElementById('modelField');
			modelField.value = '';
		})
	
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
					console.log(1, mdl.ID)
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
			console.log(2, val)
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
					console.log(1, yr.ID)
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
			console.log(2, val)
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
						color: cl?.ID,
					});
					console.log(1, cl?.ID)
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
			console.log(2, val)
		}
	}
	//End of autocomplete search and selection


	setAmenities()
	{
		var chargableAmenities = this.chargableAmenities;
		for (var key in chargableAmenities)
		{
			chargableAmenities[key].forEach(chargableAmenity =>
			{
				if (chargableAmenity?.isSelected)
				{
					this.onAmenitiesCheckboxChange(chargableAmenity?.id, true);
				}
			});
		}

		var nonChargableAmenities = this.nonChargableAmenities;
		for (var key in nonChargableAmenities)
		{
			console.log(key, nonChargableAmenities[key]);
			nonChargableAmenities[key].forEach(nonChargableAmenity =>
			{
				console.log('nonChargableAmenity-->>>>>>>>',nonChargableAmenity?.isSelected)
				if (nonChargableAmenity?.isSelected)
				{
					this.onAmenitiesCheckboxChange(nonChargableAmenity?.id, true);
				}
			});
		}
	}

	setSpecialAmenities()
	{
		const specialAmenitiesGet: FormArray = this.addVehicleForm.get('specialAmenitiesGet') as FormArray;
		const specialAmenities: FormArray = this.addVehicleForm.get('specialAmenities') as FormArray;
		var i;
		const totalSpecialAmenities = this.specialAmenities;
		const selectedSpecialAmenities = this.response2?.data?.specialAmenities;
		for (i = 0; i < totalSpecialAmenities.length; i++)
		{
			var checkedSpecialAmenity = selectedSpecialAmenities.findIndex(function (post)
			{
				if (post == totalSpecialAmenities[i].id)
					return true;
			});
			if (checkedSpecialAmenity >= 0)
			{
				var checkBool = true;
			}
			else
			{
				var checkBool = false;
			}
			specialAmenitiesGet.push(new FormControl(checkBool));
		}
		this.specialAmenitiesFormControl = specialAmenitiesGet.controls;
		var j;
		for (j = 0; j < selectedSpecialAmenities.length; j++)
		{
			specialAmenities.push(new FormControl(selectedSpecialAmenities[j]));
		}
	}
	setInteriors()
	{
		const interiorsGet: FormArray = this.addVehicleForm.get('vehicleInteriorGet') as FormArray;
		const interiors: FormArray = this.addVehicleForm.get('vehicleInterior') as FormArray;
		var i;
		const totalInterior = this.interiors;
		const selectedInterior = this.response2?.data?.vehicleInterior;
		for (i = 0; i < totalInterior.length; i++)
		{
			var checkedInterior = selectedInterior.findIndex(function (post)
			{
				if (post == totalInterior[i].id)
					return true;
			});
			if (checkedInterior >= 0)
			{
				var checkBool = true;
			}
			else
			{
				var checkBool = false;
			}
			interiorsGet.push(new FormControl(checkBool));
		}
		this.interiorsFormControl = interiorsGet.controls;
		var j;
		for (j = 0; j < selectedInterior.length; j++)
		{
			interiors.push(new FormControl(selectedInterior[j]));
		}
	}

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
	// handleInteriorsCheckbox(vehicleInteriorList:any){
	// 	console.log('in function handleInteriorsCheckbox-->>' , vehicleInteriorList)
	// 	const vehicleInterior: FormArray = this.addVehicleForm.get('vehicleInterior') as FormArray;
	// 	vehicleInteriorList.map(i=> vehicleInterior.push(new FormControl(parseInt(i))))
	// }

	async onFileChange(event, imageId, imageNumber)
	{
		if(!await this.commonServices.handleFile(event)) {
			return;
		}
		this.stateManagementService.setprogressBar(true);
		const reader = new FileReader();
		if (event.target.files && event.target.files.length)
		{
			const [file] = event.target.files;
			reader.readAsDataURL(file);
			reader.onload = () =>
			{
				this.imageSrc = reader.result as string;
				this.affiliateService.uploadVehicleImage(this.imageSrc)
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
							["vehicle_image_" + imageNumber]: this.response?.data?.id,
						});
						this["vehicleImage" + imageNumber] = this.response?.data?.image;

						this.stateManagementService.setprogressBar(false);
					});
			};
		}
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
			isNaN(parseInt(key)) ? this.vehicleOfficialImagesChange1(dataUrl, key,id) :this.onFileChange1(dataUrl, key,id);
		};
	}
	async onFileChange1(dataUrl, imageNumber,imageId)
	{
		if(!await this.commonServices.handleFile(event)) {
			return;
		}
		this.stateManagementService.setprogressBar(true);
				this.imageSrc = dataUrl;
				this.affiliateService.uploadVehicleImage(this.imageSrc)
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
	}


	async vehicleOfficialImagesChange1(url, imageType, imageId)
	{
		if(!await this.commonServices.handleFile(event)) {
			return;
		}
		this.stateManagementService.setprogressBar(true);
				this.imageSrc = url;
				this.affiliateService.uploadVehicleImage(this.imageSrc)
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
	}


	async vehicleOfficialImagesChange(event, imageType, imageId)
	{
		if(!await this.commonServices.handleFile(event)) {
			return;
		}
		this.stateManagementService.setprogressBar(true);
		const reader = new FileReader();
		if (event.target.files && event.target.files.length)
		{
			const [file] = event.target.files;
			reader.readAsDataURL(file);
			reader.onload = () =>
			{
				this.imageSrc = reader.result as string;
				this.affiliateService.uploadVehicleImage(this.imageSrc)
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
									rearPlateImage: this.response?.data?.id,
								});
								this.rearPlateImage = this.response?.data?.image;
								break;
							}
							case 'windowPermit': {
								this.addVehicleForm.patchValue({
									windowPermitImage: this.response?.data?.id,
								});
								this.windowPermitImage = this.response?.data?.image;
								break;
							}
							case 'windowPermit2': {
								this.addVehicleForm.patchValue({
									windowPermit2Image: this.response?.data?.id,
								});
								this.windowPermit2Image = this.response?.data?.image;
								break;
							}
							case 'usdotPermit': {
								this.addVehicleForm.patchValue({
									usdotPermitImage: this.response?.data?.id,
								});
								this.usdotPermitImage = this.response?.data?.image;
								break;
							}
							case 'mc': {
								this.addVehicleForm.patchValue({
									mcImage: this.response?.data?.id,
								});
								this.mcImage = this.response?.data?.image;
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
		console.log(this.addVehicleForm);

		this.pushValuesTypeOfService(this.service)
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addVehicleForm.invalid)
		{
			return;
		}

		this.spinner.show(); // show spinner
		this.disableSubmitButton = true; //disable submit button

		this.affiliateService.editVehicle(this.addVehicleForm.value)
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

				this.stateManagementService.addNumberOfVehicles(this.addVehicleForm.value.numberOfVehicles - this.response2.data.numberOfVehicles);

				this.router.navigate(['/affiliate/step5']);
			});
	}

	resetForm()
	{
		this.submittedForm = true;

		// this.addVehicleForm.reset();
		this.addVehicleForm.patchValue({
			vehicleType: ['', Validators.required],
			make: '',
			model: '',
			year: '',
			color: '',
			licensePlate: '',
			numberOfVehicles: '',
			seats: '',
			luggage: '',
			charterCancelPolicy: '2',
			nonCharterCancelPolicy: '2',
			rearPlateImage: '',
			windowPermitImage: '',
			windowPermit2Image: '',
			usdotPermitImage: '',
			mcImage: '',
		})
		this.vehicleImageArray = [];
		let vehicleTypeField: any = document.getElementById('vehicleTypeField');
		vehicleTypeField.value = "";
		let makeField: any = document.getElementById('makeField');
		makeField.value = "";
		let modelField: any = document.getElementById('modelField');
		modelField.value = "";
		let yearField: any = document.getElementById('yearField');
		yearField.value = "";
		let colorField: any = document.getElementById('colorField');
		colorField.value = "";
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
		this.router.navigate(['/affiliate/step5']);
	}

	changeMake(selectedMake, onFirstLoad = null)
	{
		console.log('------>>>>' , onFirstLoad)
		if(!selectedMake){
			this.addVehicleForm.patchValue({
				model : ''
			})
			this.filteredModel = []
			return false
		}
		
		let models = JSON.parse(sessionStorage.getItem('models'));
		this.filteredModel = models.filter(function (model)
		{
			if (model.make_id == selectedMake)
			{
				return true;
			}
		});
		this.addVehicleForm.patchValue({
			model : this.filteredModel[0]?.ID
		})
		if (onFirstLoad == 'onFirstLoad' || this.onFirstLoad==1)
		{
			console.log('->>' , this.onFirstLoad)
			this.onFirstLoad = 2
			this.addVehicleForm.patchValue({
				model: parseInt(this.response2?.data?.model)
			});
		}
	}





	get typeOfService(): FormArray
	{
		return this.addVehicleForm.get('typeOfService') as FormArray;
	}

	pushValuesTypeOfService(value: Array<any>)
	{
		console.log('type of srvicer',value)
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
		if (!is_service_valid(value, this.service))
		{
			this.errorModal.openDialog({
				errors: {
					error: 'Cannot choose Local and Over The Road service at the same time'
				}
			})
			this.service = this.service.filter(val => val != value)
			return
		}
		console.log('Inital Array: ', this.service)

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
