import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormGroup, FormBuilder, Validator } from '@angular/forms';

@Component({
	selector: 'app-step0',
	templateUrl: './step0.component.html',
	styleUrls: ['./step0.component.scss']
})
export class Step0Component implements OnInit
{

	public heading: string;
	public step0Contents: any;

	constructor(
		private adminServices: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBulider: FormBuilder
	) { }

	ngOnInit(): void
	{
		this.heading = 'Step 0 - Agreement';
		this.getStep0ContentDynamic();

	}

	getStep0ContentDynamic()
	{
		this.spinner.show();
		this.adminServices.getStepContentData('step0').pipe(
			catchError(err =>
			{

				return throwError(err);
				this.spinner.hide;
			})
		).subscribe(({ data }: any) =>
		{
			console.log(data);
			this.step0Contents = data;
			this.spinner.hide();
		})

	}

	editAction(sectionID)
	{
		this.router.navigate(['/admin/cms/step0/edit/' + sectionID]);
	}

	changeStep0SectionStatus(event, id)
	{
		this.spinner.show();
		this.adminServices.changeStepOSectionStauts(id, event.checked).pipe(catchError(err =>
		{
			this.spinner.hide();
			return throwError(err)
		})
		).subscribe(({ data }: any) =>
		{
			console.log(data);
			this.spinner.hide();
		})
		//$("#statusEnabledisabledModal").modal();
	}

}
