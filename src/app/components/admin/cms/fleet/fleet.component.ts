import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormGroup, FormBuilder, Validator } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';

@Component({
	selector: 'app-fleet',
	templateUrl: './fleet.component.html',
	styleUrls: ['./fleet.component.scss']
})
export class FleetComponent implements OnInit {

	public heading: string;
	public fleetContents: any;
	color: ThemePalette = 'accent';

	constructor(
		private adminServices: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBulider: FormBuilder,
	) { }

	ngOnInit(): void {
		this.heading = 'Fleet';
		this.getFleetContent();
	}

	getFleetContent() {
		this.adminServices.getStepContentData('fleet').pipe(
			catchError(err => {

				return throwError(err);
			})
		).subscribe(({ data }: any) => {
			console.log(data);
			this.fleetContents = data;
		})

	}

	editAction(sectionID) {
		this.router.navigate(['/admin/cms/fleet/edit/' + sectionID]);
	}

	changeFleetActionStatus(event, id) {
		this.adminServices.changeFleetSectionStatus(id, event.checked).pipe(catchError(err => {
			return throwError(err)
		})
		).subscribe(({ data }: any) => {
			console.log(data);
		})
		//$("#statusEnabledisabledModal").modal();
	}

}
