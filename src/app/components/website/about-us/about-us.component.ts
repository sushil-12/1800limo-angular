import { Component, OnInit } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
declare var $: any;
@Component({
    selector: 'app-about-us',
    templateUrl: './about-us.component.html',
    styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit
{
    public carouselLabel: string;
    public carouselHeading: string;
    public carouselInstructions: string;
    public carouselType: string;
    public carouselInformation: boolean = true;
    public selectedCarousel: string;
    public aboutUsSecionsData: any;
    public timeLineData:any;

    carouselSwitch(carouselType)
    {
        switch (carouselType)
        {
            case '1994': {
                this.carouselInformation = true;
                this.selectedCarousel = '1994';
                this.carouselLabel = "1994";
                this.carouselHeading = "The First Wireless Communication Vision For The Limo Industry";
                this.carouselInstructions = "<p>SKYLIMO, Joe Anselmo's first global limouinse network, had the opportunity to be the first global limousine service to advertise at 35,000 ft. on commercial aircraft through In-Flight Phone Corporations' FlightLink Infotainment system, beginning with US Airlines.</p><p>He needed a duplex wireless communication system which at that time was not available except for one-way paging; which was inefficient, and cell phones, which were expensive to purchase and use.He needed a cost efficient and multifunctional device to communicate in real-time with his global affiliates so that airline passengers would have a car and driver waiting for them before landing, at any airport around the world.</p><p>Joe realized he needed a software and hardware partner and approached the leader in mobility, Motorola, to design, manufacture and distribute the devices; as it was critical in dispatching bookings to individual drivers in real-time.Motorola said, “nice idea” and declined, but suggested speaking with Apple, since they made the chipset for Apple’s Newton, one of the first hand-held flat panel computers.</p><p> Apple also said, “nice idea” and declined because Apple was almost bankrupt and Newton's budget was axed.12 years later Apple introduced the smartphone called the iPhone. Uber and Lyft came to market 14 and 16 years later respectively. Neither technology company could have come to market without a smartphone that incorporated two-way voice, text and GPS.</p><p>Joe will tell you that Steve Jobs at Apple was not the first to think of the smartphone and Travis Kalanick and Garret Camp at Uber and Logan Green and John Zimmer at Lyft weren’t the first to think of using wireless hardware and software to create an on-demand livery service. Joe had the vision decades before any investors could understand the utility and profit potential of a smartphone and global transportation network. </p><p>In retrospect, Joe combined the two largest global industries, wireless technology and and on-demand transportation in one company, which would have been SKYLIMO, providing transportation by land, air, or sea. (see link to Apple letter and Sun Times Article) Joe's problems were not dissimilar to other visionaries dating back to 1946 when they approached investors to fund the first two-way radio telephone. </p><p>The technology was unproven and still in its developmental stages with range limitations and without specific application; hence Investors thought it was malarkey.Fast forward to 2019, Joe has taken today's wireless technology and global networking to a higher level by providing a more personalized ground transportation experience and made it easier for travelers to book the safest drivers and newest vehicles around the world.1995 - Proposed Partnership with In-Flight Phone Corp and Boston Coach Apple Letter.pdf</p>";
                break;
            }
            case '1995': {
                this.carouselInformation = true;
                this.selectedCarousel = '1995';
                this.carouselLabel = "1995";
                this.carouselHeading = "Proposed Partnership with In-Flight Phone Corp and Boston Coach";
                this.carouselInstructions = "";
                break;
            }
            case '2001': {
                this.carouselInformation = true;
                this.selectedCarousel = '2001';
                this.carouselLabel = "2001";
                this.carouselHeading = "Chicago Sun-Times Article 1-800-LIMO.COM Comes To Market";
                this.carouselInstructions = "";
                break;
            }
            case '2007': {
                this.carouselInformation = true;
                this.selectedCarousel = '2007';
                this.carouselLabel = "2007";
                this.carouselHeading = "2007 – iPhone Comes To Market";
                this.carouselInstructions = "";
                break;
            }
            case '2008': {
                this.carouselInformation = true;
                this.selectedCarousel = '2008';
                this.carouselLabel = "2008";
                this.carouselHeading = "March 2009 – Uber Technologies Starts funded by Google Ventures and others.";
                this.carouselInstructions = "";
                break;
            }
            case '2010': {
                this.carouselInformation = true;
                this.selectedCarousel = '2010';
                this.carouselLabel = "2010";
                this.carouselHeading = "June 2012 – Lyft, Inc Starts and funded by numerous Silicon Venture firms and others.";
                this.carouselInstructions = "";
                break;
            }
        }
    }
    constructor(
        private adminService: AdminService,
    ) {}
    ngOnInit(): void
    {
        $('.aboutnw_slideriner').trigger('to.owl.carousel', -1);
        this.carouselSwitch('1994');
        $('.loopd').owlCarousel({
            center: false,
            dots: false,
            items: 2,
            loop: false,
            nav: true,
            margin: 20,
            autoplay: false,
			URLhashListener:true,
        	startPosition: 'URLHash',
            responsive: {
                320: {
                    items: 2,
                    autoplay: false,
                    nav: true,
                    loop: true
                },
                767: {
                    items: 3,
                    autoplay: false,
                    nav: true,
                    loop: false
                },
                992: {
                    items: 4,
                    autoplay: false,
                    nav: true,
                    loop: false
                }
            }
        });
        
        this.getAboutPageContent();
        // this.getAboutUsSectionDataByID();
    }

    getAboutPageContent()
	{
		//this.spinner.show();
		this.adminService.getAboutUsPageContent().pipe(
			catchError(err =>
			{
				return throwError(err);
			})
		).subscribe(({ data }: any) =>
		{
			console.log(data);
			this.aboutUsSecionsData = data;
		})
	}

    getAboutUsSectionDataByID()
	{
		//this.spinner.show();
		this.adminService.getAboutUsSectionDataByID('18').pipe(
			catchError(err =>
			{
				return throwError(err);
			})
		).subscribe(({ data }: any) =>
		{
			console.log(data);
			this.timeLineData = data;
		})
	}


}