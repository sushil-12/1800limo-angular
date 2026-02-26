import { Component, OnInit } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { aboutUsData } from './about-us-data';

@Component({
    selector: 'app-about-us',
    templateUrl: './about-us.component.html',
    styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {
    public aboutUsSecionsData: any;
    public pageData = aboutUsData;

    constructor(
        private adminService: AdminService,
    ) { }

    ngOnInit(): void {
        this.getAboutPageContent();
    }

    getAboutPageContent() {
        this.adminService.getAboutUsPageContent().pipe(
            catchError(err => {
                return throwError(err);
            })
        ).subscribe(({ data }: any) => {
            console.log(data);
            this.aboutUsSecionsData = data;
        })
    }
}