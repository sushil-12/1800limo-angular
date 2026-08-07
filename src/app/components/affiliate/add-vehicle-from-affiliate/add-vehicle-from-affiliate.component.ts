import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { AdminService } from 'src/app/services/admin.service';
import { CommonService } from 'src/app/services/common.service';
import { PHOTO_GUIDES, PhotoGuide } from './photo-guide.config';
declare var $: any;

@Component({
	selector: 'app-add-vehicle-from-affiliate',
	templateUrl: './add-vehicle-from-affiliate.component.html',
	styleUrls: [
		'../affiliate-registration-style.css',
		'./add-vehicle-from-affiliate.component.scss'
	]
})
export class AddVehicleFromAffiliateComponent implements OnInit, AfterViewChecked {

	public tree: any;
	public affiliateId: string;
	public affiliateType: string;
	public paramResponse: any;
	public vehicleTypeId: string;
	public vehicleId: string;
	public isEditMode: boolean = false;
	public response2: any;
	public originalNumberOfVehicles: number = 0;
	public selectedChargableAmenities = new Set<number>();
	public selectedNonChargableAmenities = new Set<number>();
	public selectedSpecialAmenities = new Set<number>();
	public selectedInteriors = new Set<number>();
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
	public filteredModel: Array<any>;
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
	isVehicleTypeSelected: boolean = true;
	changeNonCharterCancelPolicy: boolean = false
	changeCharterCancelPolicy: boolean = false

	@Input() closeTab: EventEmitter<any> = new EventEmitter();

	@ViewChild('sharedFileInput') sharedFileInput: ElementRef<HTMLInputElement>;

	isGuideVisible = false;
	currentGuide: PhotoGuide | null = null;
	pendingSlot = '';

	errorMsg: boolean;
	errorMsg1: boolean;
	errorMsg2: boolean;
	errorMsg3: boolean;
	errorMsg4: boolean;
	chargableAmenitiesRes: any;
	nonChargableAmenitiesRes: any;
	public duplicateVehicleId: string;
    public isDuplicateMode: boolean = false;

	public driverRes: any;
    public driverList: any[] = [];

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

	ngAfterViewChecked() {
		$(".camera-svg").tooltip({
			trigger: 'hover'
		});
		$(".camera-svg").on('mouseleave', function () {
			$(this).tooltip('dispose');
		});
		$(".camera-svg").on('click', function () {
			$(this).tooltip('dispose');
		});
		$(".backbutton").tooltip({
			trigger: 'hover'
		});
		$(".backbutton").on('mouseleave', function () {
			$(this).tooltip('dispose');
		});
		$(".backbutton").on('click', function () {
			$(this).tooltip('dispose');
		});
		// this.Subscriptions()
	}

	ngOnInit(): void {
		$('#vehicleTypeField').focusout(() => {
			this.errorMsg = true;
		})
		$('#makeField').focusout(() => {
			this.errorMsg1 = true;
		})
		$('#modelField').focusout(() => {
			this.errorMsg2 = true;
		})
		$('#yearField').focusout(() => {
			this.errorMsg3 = true;
		})
		$('#colorField').focusout(() => {
			this.errorMsg4 = true;
		})

		//pick vehicle type id and optional vehicle id from query params
		this.activatedroute.queryParamMap.subscribe((params) => {
			this.paramResponse = { ...params.keys, ...params };
			this.vehicleTypeId = this.paramResponse.params.vehicleTypeId;
			this.vehicleId = this.paramResponse.params.vehicleId;
			this.duplicateVehicleId = this.paramResponse.params.duplicateVehicleId;
			this.isEditMode = !!this.vehicleId;
			this.isDuplicateMode = !!this.duplicateVehicleId;
		});
		this.httpClient.get("assets/json/charterOptions.json").subscribe((data: any) => {
			this.nonCharterCancelOptions = data;
			this.charterCancelOptions = data;
		});
		const currentUser = JSON.parse(localStorage.getItem("currentUser"));
		this.affiliateId = currentUser.account_id;

		//data for dropdown of seats and luggage
		for (let i = 0; i <= 75; i++) {
			this.luggageOptions.push(i);
		}
		for (let i = 4; i <= 75; i++) {
			this.seatOptions.push(i);
		}

		//add vehicle form validation
		this.addVehicleForm = this.formBuilder.group({
			id: [''],
			acc_id: [''],
			vehicleType: ['', Validators.required],
			make: ['', Validators.required],
			model: ['', Validators.required],
			year: ['', Validators.required],
			color: ['', Validators.required],
			licensePlate: [''],
			numberOfVehicles: [1],
			seats: [4, [Validators.required, Validators.pattern("^[0-9]*$")]],
			luggage: [2, [Validators.required, Validators.pattern("^[0-9]*$")]],
			charterCancelPolicy: ['24', Validators.required],
			nonCharterCancelPolicy: ['24', Validators.required],
			typeOfService: this.formBuilder.array([], [Validators.required]),
			chargableAmenitiesArray: this.formBuilder.array([]),
			nonChargableAmenitiesArray: this.formBuilder.array([], [Validators.required]),
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
			associatedDriver: [null],
		});

		//Put Black color value by default in Color
		let colorField: any = document.getElementById('colorField');
		colorField.value = "Black";
		this.addVehicleForm.patchValue({
			color: 1,
		});

		//Put Black color value by default in Color
		let vehicleTypeField: any = document.getElementById('vehicleTypeField');
		vehicleTypeField.value = "Mid-Size Vehicle";
		this.addVehicleForm.patchValue({
			vehicleType: 1,
		});

		this.affiliateType = currentUser.affiliate_type;

		this.stateManagementService.getNumberOfVehicles().subscribe(numberOfVehicles => {
			let numberOfVehiclesCanBeAdded;
			console.log("IN BLACK CAR LIMO", this.affiliateType, numberOfVehicles)

			if (this.affiliateType == 'fleet_operator') {
				this.addVehicleForm.controls['numberOfVehicles'].setValidators([Validators.required, Validators.pattern("^[0-9]*$")]);
			}
			else if (this.affiliateType == 'black_limo_operator' || this.affiliateType == 'Black Car/Limo Owner Operator') {
				console.log("IN BLACK CAR LIMO", numberOfVehicles)
				numberOfVehiclesCanBeAdded = 2 - numberOfVehicles;
				this.addVehicleForm.controls['numberOfVehicles'].setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), Validators.max(numberOfVehiclesCanBeAdded)]);
			}
			else {
				numberOfVehiclesCanBeAdded = 1 - numberOfVehicles;
				this.addVehicleForm.controls['numberOfVehicles'].setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), Validators.max(numberOfVehiclesCanBeAdded)]);
			}
			this.addVehicleForm.controls['numberOfVehicles'].updateValueAndValidity();
		});

		/** progress bar starts on init */
		this.spinner.show() //show spinner
		// Load data for form
		this.affiliateService.getFieldsData()
			.pipe(
				catchError(err => {
					this.spinner.hide() //hide spinner
					return throwError(err);
				})
			).subscribe(result => {
				this.response = result;
				this.filteredYear = this.year = this.response.data.years;
				this.filteredMake = this.make = this.response.data.make;
				this.filteredModel = this.model = this.response.data.model;
				this.filteredVehicleTypes = this.vehicleTypes = this.response.data.vehicle_types;
				this.filteredColor = this.color = this.response.data.color;
				this.chargableAmenitiesRes = this.response.data.chargableAmenities;
				this.chargableAmenities = this.chargableAmenitiesRes;
				this.nonChargableAmenitiesRes = this.response.data.nonChargableAmenities;
				this.nonChargableAmenities = this.nonChargableAmenitiesRes;
				this.specialAmenities = this.response.data.specialAmenities;
				this.interiors = this.response.data.vehicleInterior;

				sessionStorage.setItem('models', JSON.stringify(this.model));

				this.vehicleImage1 = this.oldvehicleImage[0] = null;
				this.vehicleImage2 = this.oldvehicleImage[1] = null;
				this.vehicleImage3 = this.oldvehicleImage[2] = null;
				this.vehicleImage4 = this.oldvehicleImage[3] = null;
				this.vehicleImage5 = this.oldvehicleImage[4] = null;
				this.vehicleImage6 = this.oldvehicleImage[5] = null;
				this.vehicleImage7 = this.oldvehicleImage[6] = null;
				this.vehicleImage8 = this.oldvehicleImage[7] = null;
				this.vehicleImage9 = this.oldvehicleImage[8] = null;

				this.vehicleImageId1 = this.response.data.vehicleImage1.id;
				this.vehicleImageId2 = this.response.data.vehicleImage2.id;
				this.vehicleImageId3 = this.response.data.vehicleImage3.id;
				this.vehicleImageId4 = this.response.data.vehicleImage4.id;
				this.vehicleImageId5 = this.response.data.vehicleImage5.id;
				this.vehicleImageId6 = this.response.data.vehicleImage6.id;
				this.vehicleImageId7 = this.response.data.vehicleImage7.id;
				this.vehicleImageId8 = this.response.data.vehicleImage8.id;
				this.vehicleImageId9 = this.response.data.vehicleImage9.id;

				if (this.affiliateType != 'fleet_operator') {
					this.rearPlateImage = this.oldvehicleImage[9] = '';
					this.windowPermitImage = this.oldvehicleImage[10] = '';
					this.windowPermit2Image = this.oldvehicleImage[11] = '';
					this.usdotPermitImage = this.oldvehicleImage[12] = '';
					this.mcImage = this.oldvehicleImage[13] = '';

					this.rearPlateId = this.response.data.rear_plate.id;
					this.windowPermitId = this.response.data.window_permit.id;
					this.windowPermit2Id = this.response.data.window_permit_1.id;
					this.usdotPermitId = this.response.data.USDOT_permit.id;
					this.mcId = this.response.data.mc.id;
				}

				console.log('chargableAmenities', this.chargableAmenities)
				//get models as per make
				let models = JSON.parse(sessionStorage.getItem('models'));
				let selectedMake = this.make[0].ID;
				let resmodels = models.filter(function (model) {
					if (model.make_id == selectedMake) {
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
				});
				if (this.affiliateType != 'fleet_operator') {
					this.addVehicleForm.patchValue({
						rearPlateImage: this.rearPlateId,
						windowPermitImage: this.windowPermitId,
						windowPermit2Image: this.windowPermit2Id,
						usdotPermitImage: this.usdotPermitId,
						mcImage: this.mcId,
					})
				}
				if (this.isDuplicateMode) {
				this.loadDuplicateVehicleData();
				} else if (this.isEditMode) {
				this.loadEditVehicleData();
				}
				this.spinner.hide() //hide spinner
			});
		this.pushValuesTypeOfService(['local'])
		this.loadDriver();
	}

	loadDriver() {
		this.affiliateService.driverList(this.affiliateId).then(result => {
			this.driverRes = result;
			this.driverList = this.driverRes.data.data;
		}).catch(err => {
			console.error(err);
		});
    }

	loadDuplicateVehicleData() {
	if (!this.duplicateVehicleId) return;
	this.spinner.show();
	this.affiliateService.getVehicleData(this.duplicateVehicleId)
		.pipe(catchError(err => { this.spinner.hide(); return throwError(err); }))
		.subscribe(result2 => {
		this.response2 = result2;
			const detail = this.response2?.data || {};

			// Load vehicle images from duplicate source
			this.setVehicleImages(detail);

			// Patch form with the new image IDs so validation passes
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

		// Use duplicate vehicle's amenities/images
		this.chargableAmenities = detail.chargableAmenities || this.chargableAmenities;
		this.nonChargableAmenities = detail.nonChargableAmenities || this.nonChargableAmenities;

		this.selectedChargableAmenities.clear();
		this.selectedNonChargableAmenities.clear();
		this.initializeSelectedAmenities();

		this.selectedSpecialAmenities.clear();
		this.initializeSelectedSpecialAmenities(detail.specialAmenities || []);

		this.selectedInteriors.clear();
		this.initializeSelectedInteriors(detail.vehicleInterior || []);

		this.service = Array.isArray(detail.typeOfService) ? [...detail.typeOfService] : [];
		this.pushValuesTypeOfService(this.service);

		this.changeMake(parseInt(detail.make, 10));
		this.addVehicleForm.patchValue({
			// Note: no 'id' — this is a new vehicle (duplicate), not editing
			vehicleType: parseInt(detail.vehicle_type, 10),
			make: parseInt(detail.make, 10),
			model: parseInt(detail.model, 10),
			year: parseInt(detail.year, 10),
			color: parseInt(detail.color, 10),
			numberOfVehicles: detail.numberOfVehicles,
			licensePlate: detail.license_plate,
			seats: detail.seats,
			luggage: detail.luggage,
			charterCancelPolicy: detail.charterCancelPolicy,
			nonCharterCancelPolicy: detail.nonCharterCancelPolicy,
			associatedDriver: (detail.associatedDriver !== undefined && detail.associatedDriver !== null) ? Number(detail.associatedDriver) : (detail.driver ? Number(detail.driver) : null),
		});

		const vehicleTypeField: any = document.getElementById('vehicleTypeField');
		if (vehicleTypeField) vehicleTypeField.value = detail.vehicle_typeName || '';
		const makeField: any = document.getElementById('makeField');
		if (makeField) makeField.value = detail.makeName || '';
		const modelField: any = document.getElementById('modelField');
		if (modelField) modelField.value = detail.modelName || '';
		const yearField: any = document.getElementById('yearField');
		if (yearField) yearField.value = detail.yearName || '';
		const colorField: any = document.getElementById('colorField');
		if (colorField) colorField.value = detail.colorName || '';

		this.spinner.hide();
		});
	}

	openGuide(slotKey: string) {
		this.currentGuide = PHOTO_GUIDES[slotKey] ?? null;
		this.pendingSlot = slotKey;
		this.isGuideVisible = true;
	}

	onGuideConfirmed() {
		this.isGuideVisible = false;
		this.sharedFileInput.nativeElement.click();
	}

	onGuideDismissed() {
		this.isGuideVisible = false;
	}

	handleSharedFileChange(event: Event) {
		const vehicleSlots = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
		const slot = this.pendingSlot;

		if (vehicleSlots.includes(slot)) {
			const imageId = this['vehicleImageId' + slot];
			this.onFileChange(event, imageId, slot);
		} else {
			const idMap = {
				rearPlate: this.rearPlateId,
				windowPermit: this.windowPermitId,
				windowPermit2: this.windowPermit2Id,
				usdotPermit: this.usdotPermitId,
				mc: this.mcId,
			};
			this.vehicleOfficialImagesChange(event, slot, idMap[slot]);
		}
	}

	closeButton() {
		this.closeTab.emit();
	}
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

	searchVehicleType(keyword) {
		this.addVehicleForm.patchValue({
			vehicleType: '',
		});
		if (keyword == '') {
			this.filteredVehicleTypes = this.vehicleTypes;
		}
		else {
			this.filteredVehicleTypes = this.vehicleTypes.filter((vehicle_Type: any) => {
				if (vehicle_Type.name.toLowerCase() === keyword.toLowerCase()) {
					this.addVehicleForm.patchValue({
						vehicleType: vehicle_Type.ID,
					});
				}
				return vehicle_Type.name.toLowerCase().includes(keyword.toLowerCase());
			})
				.sort((a: any, b: any) => {
					return this.searchSorting(keyword, a, b)
				});
		}
	}
	handleChangeVehicleType(value) {
		console.log('Selected Value:', value);

		this.isVehicleTypeSelected = value ? true : false
	}

	selectVehicleType(val, isSelected) {
		if (isSelected)// ignore on deselection of the previous option
		{
			this.addVehicleForm.patchValue({
				vehicleType: val,
			});
		}
	}

	searchMake(keyword) {
		this.addVehicleForm.patchValue({
			make: '',
		});
		if (keyword == '') {
			this.filteredMake = this.make;
		}
		else {
			this.filteredMake = this.make.filter((mk: any) => {
				if (mk.name.toLowerCase() === keyword.toLowerCase()) {
					this.addVehicleForm.patchValue({
						make: mk.ID,
					});
				}
				return mk.name.toLowerCase().includes(keyword.toLowerCase());
			})
				.sort((a: any, b: any) => {
					return this.searchSorting(keyword, a, b)
				});
		}
	}
	selectMake(val, isSelected) {
		if (isSelected)// ignore on deselection of the previous option
		{
			this.addVehicleForm.patchValue({
				make: val,
			});
			this.changeMake(val);
			// let modelField: any = document.getElementById('modelField');
			// modelField.value = '';
		}
	}
	// Subscriptions() {
	// 	this.addVehicleForm.get('vehicleType')?.valueChanges.subscribe((value: string) => {
	// 		console.log('change in vehicle type-->>' , value)
	// 	})

	// }
	handleSelectMake() {
		console.log('in function handle select make->>', this.addVehicleForm.controls['make'].value)
		this.changeMake(this.addVehicleForm.controls['make'].value);
		let modelField: any = document.getElementById('modelField');
		modelField.value = '';
	}

	searchModel(keyword) {
		this.addVehicleForm.patchValue({
			model: '',
		});
		if (keyword == '') {
			this.filteredModel = this.model;
		}
		else {
			this.filteredModel = this.model.filter((mdl: any) => {
				if (mdl.name.toLowerCase() === keyword.toLowerCase()) {
					this.addVehicleForm.patchValue({
						model: mdl.ID,
					});
				}
				return mdl.name.toLowerCase().includes(keyword.toLowerCase());
			})
				.sort((a: any, b: any) => {
					return this.searchSorting(keyword, a, b)
				});
		}
	}
	selectModel(val, isSelected) {
		if (isSelected)// ignore on deselection of the previous option
		{
			this.addVehicleForm.patchValue({
				model: val,
			});
		}
	}

	searchYear(keyword) {
		this.addVehicleForm.patchValue({
			year: '',
		});
		if (keyword == '') {
			this.filteredYear = this.year;
		}
		else {
			this.filteredYear = this.year.filter((yr: any) => {
				if (yr.name.toLowerCase() === keyword.toLowerCase()) {
					this.addVehicleForm.patchValue({
						year: yr.ID,
					});
				}
				return yr.name.toLowerCase().includes(keyword.toLowerCase());
			})
				.sort((a: any, b: any) => {
					return this.searchSorting(keyword, a, b)
				});
		}
	}
	selectYear(val, isSelected) {
		if (isSelected)// ignore on deselection of the previous option
		{
			this.addVehicleForm.patchValue({
				year: val,
			});
		}
	}

	searchColor(keyword) {
		this.addVehicleForm.patchValue({
			color: '',
		});
		if (keyword == '') {
			this.filteredColor = this.color;
		}
		else {
			this.filteredColor = this.color.filter((cl: any) => {
				if (cl.name.toLowerCase() === keyword.toLowerCase()) {
					this.addVehicleForm.patchValue({
						color: cl.ID,
					});
				}
				return cl.name.toLowerCase().includes(keyword.toLowerCase());
			})
				.sort((a: any, b: any) => {
					return this.searchSorting(keyword, a, b)
				});
		}
	}
	selectColor(val, isSelected) {
		if (isSelected)// ignore on deselection of the previous option
		{
			this.addVehicleForm.patchValue({
				color: val,
			});
		}
	}
	//End of autocomplete search and selection



	onAmenitiesCheckboxChange(val, ischecked, type) {
		const value = Number(val);
		let amenities: FormArray;
		if (type === 'chargable') {
			amenities = this.addVehicleForm.get('chargableAmenitiesArray') as FormArray;
		} else {
			amenities = this.addVehicleForm.get('nonChargableAmenitiesArray') as FormArray;
		}

		if (ischecked) {
			const exists = amenities.controls.findIndex(x => x.value === value) !== -1;
			if (!exists) {
				amenities.push(new FormControl(value));
			}
			if (type === 'chargable') {
				this.selectedChargableAmenities.add(value);
			} else {
				this.selectedNonChargableAmenities.add(value);
			}
		} else {
			const index = amenities.controls.findIndex(x => x.value === value);
			if (index !== -1) {
				amenities.removeAt(index);
			}
			if (type === 'chargable') {
				this.selectedChargableAmenities.delete(value);
			} else {
				this.selectedNonChargableAmenities.delete(value);
			}
		}
	}
	onSpecialAmenitiesCheckboxChange(e) {
		const specialAmenities: FormArray = this.addVehicleForm.get('specialAmenities') as FormArray;
		const value = Number(e.target.value);
		if (e.target.checked) {
			specialAmenities.push(new FormControl(value));
			this.selectedSpecialAmenities.add(value);
		} else {
			const index = specialAmenities.controls.findIndex(x => x.value === value);
			if (index !== -1) {
				specialAmenities.removeAt(index);
			}
			this.selectedSpecialAmenities.delete(value);
		}
	}
	handleNonCharterCancelPolicy(event) {
		console.log('in function handleNonCharterCancelPolicy--->>', event)
		this.addVehicleForm.patchValue({
			charterCancelPolicy: event.target.value
		})
		this.changeNonCharterCancelPolicy = true
	}
	handleChangeCharterCancelPolicy(event) {
		this.changeCharterCancelPolicy = true
	}

	onInteriorsCheckboxChange(e) {
		const vehicleInterior: FormArray = this.addVehicleForm.get('vehicleInterior') as FormArray;
		const value = Number(e.target.value);
		if (e.target.checked) {
			vehicleInterior.push(new FormControl(value));
			this.selectedInteriors.add(value);
		} else {
			const index = vehicleInterior.controls.findIndex(x => x.value === value);
			if (index !== -1) {
				vehicleInterior.removeAt(index);
			}
			this.selectedInteriors.delete(value);
		}
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
			isNaN(parseInt(key)) ? this.vehicleOfficialImagesChange1(dataUrl, key, id) : this.onFileChange1(dataUrl, key, id);
		};
	}
	async onFileChange1(dataUrl, imageNumber, imageId) {
		if (!await this.commonServices.handleFile(event)) {
			return;
		}
		this.stateManagementService.setprogressBar(true);
		this.imageSrc = dataUrl;
		this.affiliateService.uploadVehicleImage(this.imageSrc)
			.pipe(
				catchError(err => {
					this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;
				this.addVehicleForm.patchValue({
					["vehicle_image_" + imageNumber]: this.response.data.id,
				});
				this["vehicleImage" + imageNumber] = this.response.data.image;

				this.stateManagementService.setprogressBar(false);
			});
	}


	async onFileChange(event, imageId, imageNumber) {
		if (!await this.commonServices.handleFile(event)) {
			if (event.target) {
				event.target.value = '';
			}
			return;
		}
		this.stateManagementService.setprogressBar(true);
		const reader = new FileReader();
		if (event.target.files && event.target.files.length) {
			const [file] = event.target.files;
			event.target.value = '';
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
					.subscribe(result => {
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

	async vehicleOfficialImagesChange1(url, imageType, imageId) {
		if (!await this.commonServices.handleFile(event)) {
			return;
		}
		this.stateManagementService.setprogressBar(true);
		this.imageSrc = url;
		this.affiliateService.uploadVehicleImage(this.imageSrc)
			.pipe(
				catchError(err => {
					this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;

				switch (imageType) {
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

	async vehicleOfficialImagesChange(event, imageType, imageId) {
		if (!await this.commonServices.handleFile(event)) {
			if (event.target) {
				event.target.value = '';
			}
			return;
		}
		this.stateManagementService.setprogressBar(true);
		const reader = new FileReader();
		if (event.target.files && event.target.files.length) {
			const [file] = event.target.files;
			event.target.value = '';
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
					.subscribe(result => {
						this.response = result;

						switch (imageType) {
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

	deleteImage(id, imageType, imageNumber = null) {
		switch (imageType) {
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

	showImageInModal(imageUrl) {
		this.modalImage = imageUrl;
		$("#imageModal").addClass("showImage");
		$("#imageModal").removeClass("d-none");
	}

	get f() {
		return this.addVehicleForm.controls;
	}

	submitForm() {
		this.addVehicleForm.patchValue({
			acc_id: this.affiliateId,
			associatedDriver: this.addVehicleForm.value.associatedDriver ? Number(this.addVehicleForm.value.associatedDriver) : null
		});

		this.pushValuesTypeOfService(this.service)

		console.log(this.addVehicleForm)

		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addVehicleForm.invalid || !this.vehicleImage1) {
			if (!this.vehicleImage1) {
				setTimeout(() => {
					document.getElementById('primaryAngleSection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
				}, 50);
			}
			return;
		}
		if (!this.isEditMode && !this.isDuplicateMode && this.addVehicleForm.get('vehicle_image_1').value == this.vehicleImageId1) {
			this.errorModal.openDialog({
				errors: {
					error: 'Please change Vehicle Image!'
				}
			})
			return;
		}
		this.spinner.show(); // show spinner
		this.disableSubmitButton = true; //disable submit button

		// Build payload with grouped amenities using original amenity objects (include encoded `id`)
		const formValue = this.addVehicleForm.value;
		const selectedChargableIds: number[] = formValue.chargableAmenitiesArray || [];
		const selectedNonChargableIds: number[] = formValue.nonChargableAmenitiesArray || [];

		// Build flattened arrays of encoded ids for non-chargable (and chargable if needed)
		const flattenSelectedEncodedIds = (source: any, selectedIds: number[]) => {
			const out: string[] = [];
			if (!source) return out;
			Object.keys(source).forEach((category) => {
				const group = source[category];
				Object.values(group).forEach((amen: any) => {
					if (selectedIds.includes(Number(amen.ID))) {
						out.push(amen.id);
					}
				});
			});
			return out;
		};

		const payload = {
			...formValue,
			nonChargableAmenitiesArray: flattenSelectedEncodedIds(this.nonChargableAmenities, selectedNonChargableIds),
			chargableAmenitiesArray: flattenSelectedEncodedIds(this.chargableAmenities, selectedChargableIds),
			amenities: [
				...flattenSelectedEncodedIds(this.chargableAmenities, selectedChargableIds),
				...flattenSelectedEncodedIds(this.nonChargableAmenities, selectedNonChargableIds)
			],
			specialAmenities: formValue.specialAmenities || [],
			vehicleInterior: formValue.vehicleInterior || []
		};

		let request;
		if (this.isDuplicateMode) {
		request = this.affiliateService.duplicateVehicle(payload);
		} else if (this.isEditMode) {
		request = this.affiliateService.editVehicle(payload);
		} else {
		request = this.affiliateService.submitVehicle(payload);
		}

		request
			.pipe(
				catchError(err => {
					this.spinner.hide(); // hide spinner
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(result => {
  this.response = result;
  this.spinner.hide(); // hide spinner
  this.disableSubmitButton = true; //enable submit button

  if (this.isDuplicateMode) {
    this.stateManagementService.addNumberOfVehicles(this.addVehicleForm.value.numberOfVehicles);
    this.router.navigate(['/affiliate/step5/duplicate-vehicle-rates'], {
      queryParams: { vehicleId: this.response.data.id, duplicateVehicleId: this.duplicateVehicleId }
    });
  } else if (this.isEditMode) {
    this.stateManagementService.addNumberOfVehicles(this.addVehicleForm.value.numberOfVehicles - this.originalNumberOfVehicles);
    this.router.navigate(['/affiliate/step5']);
  } else {
    this.stateManagementService.addNumberOfVehicles(this.addVehicleForm.value.numberOfVehicles);
    this.router.navigate(['/affiliate/step5/add-vehicle-rates'], { queryParams: { vehicleId: this.response.data.id } });
  }
});
	}

	resetForm() {
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
		if (this.affiliateType != 'fleet_operator') {
			// this.vehicleImage2 = this.oldvehicleImage[1];
			// this.vehicleImage3 = this.oldvehicleImage[2];
			// this.vehicleImage4 = this.oldvehicleImage[3];
			// this.vehicleImage5 = this.oldvehicleImage[4];
			// this.vehicleImage6 = this.oldvehicleImage[5];
			// this.vehicleImage7 = this.oldvehicleImage[6];
			// this.vehicleImage8 = this.oldvehicleImage[7];
			// this.vehicleImage9 = this.oldvehicleImage[8];
			// this.rearPlateImage = this.oldvehicleImage[9];
			// this.windowPermitImage = this.oldvehicleImage[10];
			// this.windowPermit2Image = this.oldvehicleImage[11];
			// this.usdotPermitImage = this.oldvehicleImage[12];
			// this.mcImage = this.oldvehicleImage[13];
		}
	}

	backButton() {
		this.router.navigate(['/affiliate/step5']);
	}

	changeMake(selectedMake) {
		console.log('spinner show in function change make', selectedMake)
		if (!selectedMake) {
			this.addVehicleForm.patchValue({
				model: ''
			})
			this.filteredModel = []
			return false
		}
		this.spinner.show()
		let models = JSON.parse(sessionStorage.getItem('models'));
		this.filteredModel = this.model = models.filter(function (model) {
			if (model.make_id == selectedMake) {
				return true;
			}
		});
		console.log('spinner hide in function change make')
		this.addVehicleForm.patchValue({
			model: this.filteredModel[0]?.ID
		})
		this.spinner.hide()
	}

	get typeOfService(): FormArray {
		return this.addVehicleForm.get('typeOfService') as FormArray;
	}

	pushValuesTypeOfService(value: Array<any>) {
		this.typeOfService.clear()
		this.service = this.addVehicleForm.get('typeOfService').value
		value.forEach((item: string) => {
			!this.service.includes(item) && this.service.push(item)
			this.typeOfService.push(this.formBuilder.control(item))
		})
	}

	loadEditVehicleData() {
		if (!this.vehicleId) {
			return;
		}
		this.spinner.show();
		this.affiliateService.getVehicleData(this.vehicleId)
			.pipe(
				catchError(err => {
					this.spinner.hide();
					return throwError(err);
				})
			)
			.subscribe(result2 => {
				this.response2 = result2;
				this.originalNumberOfVehicles = this.response2?.data?.numberOfVehicles || 0;

				const detail = this.response2?.data || {};

				this.setVehicleImages(detail);

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
				});

				this.chargableAmenities = detail.chargableAmenities || this.chargableAmenities;
				this.nonChargableAmenities = detail.nonChargableAmenities || this.nonChargableAmenities;

				this.selectedChargableAmenities.clear();
				this.selectedNonChargableAmenities.clear();
				this.initializeSelectedAmenities();

				this.selectedSpecialAmenities.clear();
				this.initializeSelectedSpecialAmenities(detail.specialAmenities || []);

				this.selectedInteriors.clear();
				this.initializeSelectedInteriors(detail.vehicleInterior || []);

				this.service = Array.isArray(detail.typeOfService) ? [...detail.typeOfService] : [];
				this.pushValuesTypeOfService(this.service);

				this.changeMake(parseInt(detail.make, 10));
				this.addVehicleForm.patchValue({
					id: this.vehicleId,
					vehicleType: parseInt(detail.vehicle_type, 10),
					make: parseInt(detail.make, 10),
					model: parseInt(detail.model, 10),
					year: parseInt(detail.year, 10),
					color: parseInt(detail.color, 10),
					numberOfVehicles: detail.numberOfVehicles,
					licensePlate: detail.license_plate,
					seats: detail.seats,
					luggage: detail.luggage,
					charterCancelPolicy: detail.charterCancelPolicy,
					nonCharterCancelPolicy: detail.nonCharterCancelPolicy,
					associatedDriver: (detail.associatedDriver !== undefined && detail.associatedDriver !== null) ? Number(detail.associatedDriver) : (detail.driver ? Number(detail.driver) : null),
				});

				if (this.affiliateType != 'fleet_operator') {
					this.addVehicleForm.patchValue({
						rearPlateImage: this.rearPlateId,
						windowPermitImage: this.windowPermitId,
						windowPermit2Image: this.windowPermit2Id,
						usdotPermitImage: this.usdotPermitId,
						mcImage: this.mcId,
					});
				}

				const vehicleTypeField: any = document.getElementById('vehicleTypeField');
				if (vehicleTypeField) {
					vehicleTypeField.value = detail.vehicle_typeName || vehicleTypeField.value;
				}
				const makeField: any = document.getElementById('makeField');
				if (makeField) {
					makeField.value = detail.makeName || makeField.value;
				}
				const modelField: any = document.getElementById('modelField');
				if (modelField) {
					modelField.value = detail.modelName || modelField.value;
				}
				const yearField: any = document.getElementById('yearField');
				if (yearField) {
					yearField.value = detail.yearName || yearField.value;
				}
				const colorField: any = document.getElementById('colorField');
				if (colorField) {
					colorField.value = detail.colorName || colorField.value;
				}

				this.stateManagementService.getNumberOfVehicles().subscribe(numberOfVehicles => {
					let numberOfVehiclesCanBeAdded;
					if (this.affiliateType == 'fleet_operator') {
						this.addVehicleForm.controls['numberOfVehicles'].setValidators([Validators.required, Validators.pattern("^[0-9]*$")]);
					}
					else if (this.affiliateType == 'black_limo_operator' || this.affiliateType == 'Black Car/Limo Owner Operator') {
						numberOfVehiclesCanBeAdded = 2 - (numberOfVehicles - detail.numberOfVehicles);
						this.addVehicleForm.controls['numberOfVehicles'].setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), Validators.max(numberOfVehiclesCanBeAdded)]);
					}
					else {
						numberOfVehiclesCanBeAdded = 1 - (numberOfVehicles - detail.numberOfVehicles);
						this.addVehicleForm.controls['numberOfVehicles'].setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1), Validators.max(numberOfVehiclesCanBeAdded)]);
					}
					this.addVehicleForm.controls['numberOfVehicles'].updateValueAndValidity();
				});

				this.spinner.hide();
			});
	}

	private setVehicleImages(detail: any) {
		// ✅ Only update each slot if the API actually returned data for it.
		// If the API returns nothing, leave the existing value untouched.
		if (detail.vehicle_image_1) {
			this.vehicleImage1 = detail.vehicle_image_1.image;
			this.vehicleImageId1 = detail.vehicle_image_1.ID;
		}
		if (detail.vehicle_image_2) {
			this.vehicleImage2 = detail.vehicle_image_2.image;
			this.vehicleImageId2 = detail.vehicle_image_2.ID;
		}
		if (detail.vehicle_image_3) {
			this.vehicleImage3 = detail.vehicle_image_3.image;
			this.vehicleImageId3 = detail.vehicle_image_3.ID;
		}
		if (detail.vehicle_image_4) {
			this.vehicleImage4 = detail.vehicle_image_4.image;
			this.vehicleImageId4 = detail.vehicle_image_4.ID;
		}
		if (detail.vehicle_image_5) {
			this.vehicleImage5 = detail.vehicle_image_5.image;
			this.vehicleImageId5 = detail.vehicle_image_5.ID;
		}
		if (detail.vehicle_image_6) {
			this.vehicleImage6 = detail.vehicle_image_6.image;
			this.vehicleImageId6 = detail.vehicle_image_6.ID;
		}
		if (detail.vehicle_image_7) {
			this.vehicleImage7 = detail.vehicle_image_7.image;
			this.vehicleImageId7 = detail.vehicle_image_7.ID;
		}
		if (detail.vehicle_image_8) {
			this.vehicleImage8 = detail.vehicle_image_8.image;
			this.vehicleImageId8 = detail.vehicle_image_8.ID;
		}
		if (detail.vehicle_image_9) {
			this.vehicleImage9 = detail.vehicle_image_9.image;
			this.vehicleImageId9 = detail.vehicle_image_9.ID;
		}

		// ✅ Permit images: only overwrite if the API returned something
		if (detail.rear_plate_image?.image) {
			this.rearPlateImage = detail.rear_plate_image.image;
			this.rearPlateId = detail.rear_plate_image.ID;
		}
		if (detail.window_permitImage?.image) {
			this.windowPermitImage = detail.window_permitImage.image;
			this.windowPermitId = detail.window_permitImage.ID;
		}
		if (detail.window_permitImage2?.image) {
			this.windowPermit2Image = detail.window_permitImage2.image;
			this.windowPermit2Id = detail.window_permitImage2.ID;
		}
		if (detail.usdot_permitImage?.image) {
			this.usdotPermitImage = detail.usdot_permitImage.image;
			this.usdotPermitId = detail.usdot_permitImage.ID;
		}
		if (detail.mc_image?.image) {
			this.mcImage = detail.mc_image.image;
			this.mcId = detail.mc_image.ID;
		}
	}

	private initializeSelectedAmenities() {
		if (!this.chargableAmenities) {
			return;
		}
		Object.values(this.chargableAmenities).forEach((group: any) => {
			Object.values(group).forEach((amenity: any) => {
				if (amenity.isSelected) {
					this.onAmenitiesCheckboxChange(amenity.ID, true, 'chargable');
				}
			});
		});

		if (!this.nonChargableAmenities) {
			return;
		}
		Object.values(this.nonChargableAmenities).forEach((group: any) => {
			Object.values(group).forEach((amenity: any) => {
				if (amenity.isSelected) {
					this.onAmenitiesCheckboxChange(amenity.ID, true, 'nonChargable');
				}
			});
		});
	}

	private initializeSelectedSpecialAmenities(selected: any[]) {
		const specialAmenities: FormArray = this.addVehicleForm.get('specialAmenities') as FormArray;
		selected.forEach((amenityId: any) => {
			const value = Number(amenityId);
			specialAmenities.push(new FormControl(value));
			this.selectedSpecialAmenities.add(value);
		});
	}

	private initializeSelectedInteriors(selected: any[]) {
		const vehicleInterior: FormArray = this.addVehicleForm.get('vehicleInterior') as FormArray;
		selected.forEach((interiorId: any) => {
			const value = Number(interiorId);
			vehicleInterior.push(new FormControl(value));
			this.selectedInteriors.add(value);
		});
	}

	isChargableAmenitySelected(id: number) {
		return this.selectedChargableAmenities.has(Number(id));
	}

	isNonChargableAmenitySelected(id: number) {
		return this.selectedNonChargableAmenities.has(Number(id));
	}

	isSpecialAmenitySelected(id: number) {
		return this.selectedSpecialAmenities.has(Number(id));
	}

	isInteriorSelected(id: number) {
		return this.selectedInteriors.has(Number(id));
	}

	service: Array<any> = []
	onServiceChange(value: string) {
		console.log(value)
		const index = this.service.indexOf(value);
		if (index === -1) {
			// If the service type is not selected, add it to the array
			this.service.push(value);
		} else {
			// If the service type is already selected, remove it from the array
			this.service.splice(index, 1);
		}
		// if (this.service.includes(value)) {
		// 	// a never reaching code line
		// 	this.service = this.service.filter(val => val != value)
		// } else {
		// 	this.service = []
		// 	this.service.push(value)
		// }

		// as per new update from client: he wants to make the whole thing work as a radio button
		// return
		// if (!is_service_valid(value, this.service)) {
		// 	this.errorModal.openDialog({
		// 		errors: {
		// 			error: 'Cannot choose Local and Over The Road service at the same time'
		// 		}
		// 	})
		// 	this.service = this.service.filter(val => val != value)
		// 	return
		// }
		// console.log('Inital Array: ', this.service)

		/**
		 * The Array Validation Check function
		 * - make sure the array doesn't containe 'local' and 'over_the_road' values at a time.
		 * 
		 * @param value: String [Required] value to check
		 */
		// function is_service_valid(value: string, service: Array<any>) {
		// 	if (value == 'local' && service.includes('over_the_road')) {
		// 		return false
		// 	} else if (value == 'over_the_road' && service.includes('local')) {
		// 		return false
		// 	}
		// 	else {
		// 		return true
		// 	}
		// }
	}
}
