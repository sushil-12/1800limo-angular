import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ThemePalette } from '@angular/material/core';
declare var $: any;


@Component({
	selector: 'app-master-vehicle-types',
	templateUrl: './master-vehicle-types.component.html',
	styleUrls: ['./master-vehicle-types.component.scss']
})
export class MasterVehicleTypesComponent implements OnInit {

	vehicles: any;
	vehiclesRes: any;

	public addVehicleTypeForm: FormGroup;
	public editVehicleTypeForm: FormGroup;

	public submitted = false;
	public submittedEditForm = false;
	public file: any;
	public response: any;
	public imageSrc: string;
	public disableAddButton: boolean = false;
	public disableEditButton: boolean = false;
	public showProgressBar: boolean = false;
	public showProgressBarEdit: boolean = false;
	public editVehiclePic: string;
	vehicleId: any;
	currentUser:any;
	color: ThemePalette = 'accent';
	disabled = false;
	convertCurrenyResp:any

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder) { }

	ngOnInit(): void {

		// this.drop;
		/** spinner starts on init */
		this.spinner.show();

		// Load Our vehicles using API
		this.adminService.getOurVehicles().then(result => {
			this.vehiclesRes = result;
			this.vehicles = this.vehiclesRes.data;
			sessionStorage.setItem('vehiclesTypes', JSON.stringify(this.vehicles));
			this.spinner.hide();//hide spinner
		})
			.catch(err => {
				this.spinner.hide();//hide spinner
			});

		this.currentUser = JSON.parse(localStorage.getItem("currentUser"));

		this.convertCurrenyResp = this.currentUser.convert_currency == 0 ? false : true 

		//add vehicle type form validation
		this.addVehicleTypeForm = this.formBuilder.group({
			vehicleType: ['', Validators.required],
			vehicleImage: ['', Validators.required],
			vehicleImageInput: ['', Validators.required],
			seats: [1],
			luggage: [0]
		});

		// edit vehicle type form validation
		this.editVehicleTypeForm = this.formBuilder.group({
			vehicleId: ['', Validators.required],
			vehicleType: ['', Validators.required],
			vehicleImageInput: '',
			vehicleImage: '',
			seats: [1],
			luggage: [0]
		});
	}

	enableDisableClicked(event) {
		this.spinner.show();//show spinner
		console.log(event.checked);
		if (event.checked) {
			var status = 1;
		}
		else {
			var status = 0;
		}
		this.adminService.converCurrenyEnableDisable(status)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe((result:any) => {
				this.spinner.hide(); // Hide spinner when successful
				this.convertCurrenyResp = result.data.convert_currency == 0 ? false : true 
				  this.currentUser.convert_currency = result.data.convert_currency;
				  localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
	          
			});
				
	}

	drop(event: CdkDragDrop<string[]>) {
		// moveItemInArray(this.vehicles, event.previousIndex, event.currentIndex);'
		console.log(event, "check event")
		console.log("previous index", event.previousIndex)
		console.log("current index", event.currentIndex)
		this.spinner.show();
		let id = this.vehicles[event.previousIndex].ID
		console.log(id, "////////////")
		this.adminService.changeSortOrder({ vehicle_id: id, currentIndex: event.currentIndex, previousIndex: event.previousIndex, type: "master-vehicle" }).subscribe((response: any) => {
			this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
				this.router.navigate(['/admin/master-vehicle-types']);
			});
			this.spinner.hide();
			// console.log(response.data)
		})
	}
	serach(val) {
		console.log(val);
		let allVehicleTypes = JSON.parse(sessionStorage.getItem('vehiclesTypes'));
		let searchVehicles = allVehicleTypes.filter(function (vehicleType) {
			if (vehicleType.vehicle_name.toLowerCase().search(val) != -1) {
				return true;
			}
		});
		// console.log(searchVehicles);
		this.vehicles = searchVehicles;
	}

	get f() {
		return this.addVehicleTypeForm.controls;
	}

	onFileChange(event) {
		const reader = new FileReader();

		if (event.target.files && event.target.files.length) {
			const [file] = event.target.files;
			reader.readAsDataURL(file);

			reader.onload = () => {

				this.imageSrc = reader.result as string;

				this.addVehicleTypeForm.patchValue({
					vehicleImage: reader.result
				});

			};
		}
	}
	openAddModal() {
		this.imageSrc = '';
		this.addVehicleTypeForm.reset();
		this.addVehicleTypeForm.patchValue({ seats: 1, luggage: 0 });


		$('#addVehicleTypeModal').modal('show');
	}
	submitForm() {
		this.submitted = true;
		// stop here if form is invalid
		if (this.addVehicleTypeForm.invalid) {
			return;
		}

		this.spinner.show();
		this.disableAddButton = true; //disable submit button
		// this.showProgressBar=true; //show progressbar

		this.adminService.addVehicleType(this.addVehicleTypeForm.value)
			.pipe(
				catchError(err => {
					$('#addVehicleTypeModal').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;
				// this.router.navigateByUrl('/admin/master-vehicle-types');
				$('#addVehicleTypeModal').modal('hide');
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
					this.router.navigate(['/admin/master-vehicle-types']);
				});
			});

		// this.showProgressBar=false; //hide progressbar
	}

	editVehicleType(id) {
		this.spinner.show();

		this.adminService.getVehicleType(id)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;
				this.vehicleId = this.response.data.ID

				this.editVehicleTypeForm.patchValue({
					vehicleId: this.response.data.id,
					vehicleType: this.response.data.vehicle_cat_name,
					seats: this.response.data.seats,
					luggage: this.response.data.luggage
				});
				this.editVehiclePic = this.response.data.vehicle_cat_image;
				$('#editVehicleTypeModal').modal('show');
				this.spinner.hide();//hide spinner
			});
	}

	onFileUpdate(event) {
		const reader = new FileReader();

		if (event.target.files && event.target.files.length) {
			const [file] = event.target.files;
			reader.readAsDataURL(file);

			reader.onload = () => {

				this.imageSrc = reader.result as string;

				this.addVehicleTypeForm.patchValue({
					vehicleImage: reader.result
				});

			};
		}
	}

	//increment/decrement in ONE WAY form
	if() {

	}
	change(changeType: 'i' | 'd', fieldName: 'l' | 'p') {
		let max_length = 75
		if (fieldName == 'p') {
			// for passenger
			if (changeType == 'i' && this.addVehicleTypeForm.value.seats < max_length) {
				this.f.seats.setValue(this.addVehicleTypeForm.value.seats + 1)
			} else if (changeType == 'd' && this.addVehicleTypeForm.value.seats > 1) {
				this.f.seats.setValue(this.addVehicleTypeForm.value.seats - 1)
			}
		} else {
			// for luggage
			if (changeType == 'i' && this.addVehicleTypeForm.value.luggage < max_length) {
				this.f.luggage.setValue(this.addVehicleTypeForm.value.luggage + 1)
			} else if (changeType == 'd' && this.addVehicleTypeForm.value.luggage >= 1) {
				this.f.luggage.setValue(this.addVehicleTypeForm.value.luggage - 1)
			}
		}
	}

	editChange(changeType: 'i' | 'd', fieldName: 'l' | 'p') {
		let max_length = 75
		if (fieldName == 'p') {
			// for passenger
			if (changeType == 'i' && this.editVehicleTypeForm.value.seats < max_length) {
				this.fEdit.seats.setValue(this.editVehicleTypeForm.value.seats + 1)
			} else if (changeType == 'd' && this.editVehicleTypeForm.value.seats > 1) {
				this.fEdit.seats.setValue(this.editVehicleTypeForm.value.seats - 1)
			}
		} else {
			// for luggage
			if (changeType == 'i' && this.editVehicleTypeForm.value.luggage < max_length) {
				this.fEdit.luggage.setValue(this.editVehicleTypeForm.value.luggage + 1)
			} else if (changeType == 'd' && this.editVehicleTypeForm.value.luggage >= 1) {
				this.fEdit.luggage.setValue(this.editVehicleTypeForm.value.luggage - 1)
			}
		}
	}

	get fEdit() {
		return this.editVehicleTypeForm.controls;
	}
	updateVehicleForm() {
		this.submitted = true;
		// stop here if form is invalid
		if (this.editVehicleTypeForm.invalid) {
			return;
		}

		this.spinner.show();
		// this.showProgressBarEdit=true; //show progressbar
		this.disableEditButton = true; //disable submit button

		this.adminService.updateVehicleType(this.editVehicleTypeForm.value)
			.pipe(
				catchError(err => {
					$('#editVehicleTypeModal').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;
				// this.router.navigateByUrl('/admin/master-vehicle-types');
				$('#editVehicleTypeModal').modal('hide');
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
					this.router.navigate(['/admin/master-vehicle-types']);
				});
			});

		// this.showProgressBarEdit=false; //hide progressbar
	}

	/* addVehicleClick(vehicleTypeId)
	{
		this.router.navigate(['/admin/master-vehicle-types/add-vehicle'], { queryParams: { vehicleTypeId: vehicleTypeId } });
	}

	viewVehicleClick(vehicleTypeId)
	{
		this.router.navigate(['/admin/master-vehicle-types/vehicles'], { queryParams: { vehicleTypeId: vehicleTypeId } });
	} */

	/**
	 * Change Routing with provided configuration options
	 * @param type : String [Required] kind of response to make
	 * @param type_iden : Number [Required] vehicle type identification number
	 * @param vehicle_iden : Number [Required] vehicle identification number
	 */
	changeRouting(type_selected: any) {

		// * End Step: hit the api with all current configurations
		this.router.navigate([`/admin/master-vehicle-types/master-vehicle-fare`], {
			queryParams: {
				vehicleTypeId: type_selected.ID
			}
		})

	}
	resetForm() {
		this.addVehicleTypeForm.reset();
		this.addVehicleTypeForm.patchValue({ seats: 1, luggage: 0 });
		this.editVehicleTypeForm.reset();
		this.editVehicleTypeForm.patchValue({ seats: 1, luggage: 0 })
	}
}
