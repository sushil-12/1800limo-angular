import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';



@Component({
	selector: 'app-master-vehicles',
	templateUrl: './master-vehicles.component.html',
	styleUrls: ['./master-vehicles.component.scss']
})
export class MasterVehiclesComponent implements OnInit
{

	paramResponse: any;
	vehicle_type_id: number;
	vehiclesRes: any;
	vehicles: any;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private activatedroute: ActivatedRoute) { }

	ngOnInit(): void
	{

		/** spinner starts on init */
		this.spinner.show();

		//pick vehicle id from query params
		this.activatedroute.queryParams
			.subscribe((params) =>
			{
				this.vehicle_type_id = parseInt(params.vehicleTypeId)
				console.log(this.vehicle_type_id)
				if (this.vehicle_type_id == null || this.vehicle_type_id == undefined)
				{
					this.router.navigate(['/admin/master-vehicle-types']);
				}
			}
			);

		// fetch vehicles 
		this.fetchVehicles(this.vehicle_type_id)
	}
	// ngOnInit ends

	/**
	 * Fetch list of all vehicles via vehicle type
	 */
	fetchVehicles(type: number)
	{
		this.spinner.show()
		this.adminService.vehicles(type).then((response: any) =>
		{
			this.vehicles = response.data

			this.spinner.hide();
		});
	}

	addVehicleClick(vehicleTypeId)
	{
		// console.log(vehicleTypeId);
		this.router.navigate(['/admin/master-vehicle-types/add-vehicle'], { queryParamsHandling: 'preserve' });
	}

	editVehicle(vehicle_id: number)
	{
		this.router.navigate(['/admin/master-vehicle-types/edit-vehicle'], {
			queryParams: {
				vehicleId: vehicle_id,
			},
			queryParamsHandling: 'merge'
		});
	}

	editVehicleRates(vehicleId)
	{
		this.router.navigate(['/admin/master-vehicle-types/edit-vehicle-rate'], {
			queryParams: {
				vehicleId: vehicleId,
			},
			queryParamsHandling: 'merge'
		});
	}

	enableDisableClicked(event, id)
	{
		this.spinner.show();//show spinner
		console.log(event.checked);
		if (event.checked)
		{
			var status = 'enable';
		}
		else
		{
			var status = 'disable';
		}
		this.adminService.vehicleStatus(id, status)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result =>
			{
				this.spinner.hide();//hide spinner
			});
	}
}

