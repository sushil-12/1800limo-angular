import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';

@Component({
	selector: 'app-step6',
	templateUrl: './step6.component.html',
	styleUrls: ['./step6.component.scss']
})
export class Step6Component implements OnInit
{
	step6ContentForm: FormGroup;


	heading: string = "Step 6 - Terms and Conditions"

	step6Contents: any

	constructor(
		private adminServices: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder
	) { }

	ngOnInit(): void
	{
		this.Step6ContentData()
	}

	/**
	 * Fetch data for step 6 content from database
	 */
	Step6ContentData()
	{
		this.adminServices.getStepContentData('step6').pipe(
			catchError(err => 
			{
				return throwError(err)
			})).subscribe(({ data }: any) =>
			{
				console.log('\n\n\n -----------------------------------------------\n')
				console.log('Receiving Data from Backend: ', data)
				console.log('\n\n\n ----------------------------------------------- \n\n\n')
				if (Object.keys(data).length > 0)
				{
					this.step6Contents = data
				}
			}
			)
	}

	changeSectionStatus(id: number, event: any)
	{
		this.spinner.show()

		this.adminServices.changeStep6SectionStatus(id, event.checked).pipe(
			catchError(err =>
			{
				this.spinner.hide()
				return throwError(err)
			})
		).subscribe(({ data }: any) =>
		{
			console.log('\n\n\n ------------------------------------------ \n')
			console.log('Receiving Data from Backend: ', data)
			console.log('\n\n\n ------------------------------------------- \n\n\n')

			if (Object.keys(data).length > 0)
			{
				this.spinner.hide()
				this.step6Contents = data
			}
		})
	}

	editAction(section_id: number | string)
	{
		this.router.navigate([
			'admin/cms/step6/edit/' + section_id.toString()
		])
	}



}
