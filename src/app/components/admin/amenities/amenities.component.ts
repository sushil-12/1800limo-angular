import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
declare var $: any;


@Component({
	selector: 'app-amenities',
	templateUrl: './amenities.component.html',
	styleUrls: ['./amenities.component.scss']
})
export class AmenitiesComponent implements OnInit {

	color: ThemePalette = 'accent';
	checked = false;
	disabled = false;

	amenities: any;
	amenitiesRes: any;

	public addAmenitiesForm: FormGroup;
	public editAmenitiesForm: FormGroup;

	public submitted = false;
	public submittedEditForm = false;
	public response: any;
	public disableAddButton: boolean = false;
	public disableEditButton: boolean = false;
	public checkChargeable: boolean;
	currentUser: any;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder) { }

	ngOnInit(): void {
		/** spinner starts on init */
		this.spinner.show();

		// Load Our amenities using API
		this.adminService.getAmenities().then(result => {
			this.amenitiesRes = result;
			this.amenities = this.amenitiesRes.data;
			sessionStorage.setItem('amenities', JSON.stringify(this.amenities));
			this.spinner.hide();//hide spinner
		})
			.catch(err => {
				this.spinner.hide();//hide spinner
			});

		this.currentUser = JSON.parse(localStorage.getItem("currentUser"));

		//add amenity type form validation
		this.addAmenitiesForm = this.formBuilder.group({
			name: ['', Validators.required],
			chargeable: ['no', Validators.required]
		});

		//edit amenity type form validation
		this.editAmenitiesForm = this.formBuilder.group({
			id: ['', Validators.required],
			name: ['', Validators.required],
			chargeable: ['', Validators.required]
		});
	}

	serach(val) {
		let allAmenities = JSON.parse(sessionStorage.getItem('amenities'));
		let searchAmenities = allAmenities.filter(function (amenity) {
			if (amenity.name.toLowerCase().search(val) != -1) {
				return true;
			}
		});
		// console.log(searchVehicles);
		this.amenities = searchAmenities;
	}

	get f() {
		return this.addAmenitiesForm.controls;
	}

	submitForm() {
		this.submitted = true;
		// console.log(this.addAmenitiesForm);return false;
		// stop here if form is invalid
		if (this.addAmenitiesForm.invalid) {
			return;
		}

		this.spinner.show();
		this.disableAddButton = true; //disable submit button

		this.adminService.addAmenity(this.addAmenitiesForm.value)
			.pipe(
				catchError(err => {
					$('#addAmenityModal').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;
				$('#addAmenityModal').modal('hide');
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
					this.router.navigate(['/admin/amenities']);
				});
			});
	}

	editAmenity(id) {
		this.spinner.show();

		this.adminService.getAmenity(id)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;
				console.log(this.response)
				this.editAmenitiesForm.patchValue({
					id: this.response.data.id,
					name: this.response.data.name,
					chargeable: this.response.data.chargeable
					// chargeable:'no'
				});
				if (this.response.data.chargeable == 'yes') {
					this.checkChargeable = true;
				}
				else {
					this.checkChargeable = false;
				}
				$('#editAmenityModal').modal('show');
				this.spinner.hide();//hide spinner
			});
	}

	get fEdit() {
		return this.editAmenitiesForm.controls;
	}
	updateAmenityForm() {
		// console.log(this.editAmenitiesForm);return false;
		this.submittedEditForm = true;
		// stop here if form is invalid
		if (this.editAmenitiesForm.invalid) {
			return;
		}

		this.spinner.show();
		this.disableEditButton = true; //disable submit button

		this.adminService.updateAmenity(this.editAmenitiesForm.value)
			.pipe(
				catchError(err => {
					$('#editAmenityModal').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(result => {
				this.response = result;
				$('#editAmenityModal').modal('hide');
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
					this.router.navigate(['/admin/amenities']);
				});
			});
	}

	enableDisableClicked(event, id) {
		this.spinner.show();//show spinner
		console.log(event.checked);
		if (event.checked) {
			var status = 'enable';
		}
		else {
			var status = 'disable';
		}
		this.adminService.amenityStatus(id, status)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result => {

				this.spinner.hide();//hide spinner
			});
	}

	chargeableChange(e) {
		if (e.target.checked) {
			this.addAmenitiesForm.patchValue({
				chargeable: 'yes'
			});
		} else {
			this.addAmenitiesForm.patchValue({
				chargeable: 'no'
			});
		}
	}

	editChargeableChange(e) {
		if (e.target.checked) {
			this.editAmenitiesForm.patchValue({
				chargeable: 'yes'
			});
		} else {
			this.editAmenitiesForm.patchValue({
				chargeable: 'no'
			});
		}
	}

	drop(event: CdkDragDrop<string[]>) {
		// moveItemInArray(this.amenities, event.previousIndex, event.currentIndex);
		console.log(event, "check event")
		console.log("previous index", event.previousIndex)
		console.log("current index", event.currentIndex)
		this.spinner.show();
		let id = this.amenities[event.previousIndex].ID
		console.log(id, "////////////")
		this.adminService.changeAmenitySortingOrder({ amenity_id: id, currentIndex: event.currentIndex, previousIndex: event.previousIndex }).subscribe((response: any) => {
			this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
				this.router.navigate(['/admin/amenities']);
			});
			this.spinner.hide();
			// console.log(response.data)
		})
	}
}
