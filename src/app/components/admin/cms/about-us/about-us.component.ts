import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';

@Component({
	selector: 'app-about-us',
	templateUrl: './about-us.component.html',
	styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

	public heading: string;
	public aboutUsSecionsData: any;
	color: ThemePalette = 'accent';

	constructor(
		private spinner: NgxSpinnerService,
		private route: Router,
		private adminService: AdminService
	) { }

	ngOnInit(): void {
		this.heading = 'About Us';
		this.getAboutPageContent();
	}

	getAboutPageContent() {
		//this.spinner.show();
		this.adminService.getAboutUsPageContent().pipe(
			catchError(err => {
				return throwError(err);
			})
		).subscribe(({ data }: any) => {
			console.log(data);
			this.spinner.hide();
			this.aboutUsSecionsData = data;
		})
	}


	// after clicking edit button
	editAboutUsPageSectionContent(id) {
		this.route.navigate(['admin/cms/about-us/edit/' + id]);
	}

	changeSectionStatus(event, id) {
		this.spinner.show();
		this.adminService.changeAboutUSSectionStauts(id, event.checked).pipe(catchError(err => {
			this.spinner.hide();
			return throwError(err)
		})
		).subscribe(({ data }: any) => {
			console.log(data);
			this.spinner.hide();
		})
		//$("#statusEnabledisabledModal").modal();
	}


}
