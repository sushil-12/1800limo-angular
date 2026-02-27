import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
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
        private titleService: Title,
        private metaService: Meta
    ) { }

    ngOnInit(): void {
        // Set SEO Metadata
        this.titleService.setTitle(this.pageData.meta.title);
        this.metaService.updateTag({ name: 'description', content: this.pageData.meta.description });
        this.metaService.updateTag({ name: 'keywords', content: this.pageData.meta.keywords });

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