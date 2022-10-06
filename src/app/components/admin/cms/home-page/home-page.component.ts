import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
declare var $: any;

@Component({
	selector: 'app-home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit
{

	public heading: string;
	public homePageContents: any;

	constructor(
		private adminServices: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService
	) { }

	ngOnInit(): void
	{

		this.heading = "Home Page";
		this.homepagecontent();

	}

	homepagecontent()
	{
		this.spinner.show();
		this.adminServices.getHomePagesSectionContent().pipe(
			catchError(err => { this.spinner.hide(); return throwError(err) })
		).subscribe(({ data }: any) =>
		{
			this.spinner.hide();
			console.log(data)
			this.homePageContents = data;
			console.log("check data", this.homePageContents)
		})
	}

	editHomePageSectionContent(ID)
	{
		this.router.navigate(['/admin/cms/home-page/edit/' + ID])
	}

	changeSectionStatus(event, id)
	{
		this.spinner.show();
		this.adminServices.changeStauts(id, event.checked).pipe(catchError(err =>
		{
			this.spinner.hide();
			return throwError(err)
		})
		).subscribe(({ data }: any) =>
		{
			console.log(data);
			this.spinner.hide();
		})
		// $("#statusEnabledisabledModal").modal('show');
	}

}
