import { Component, OnInit, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WebsiteService } from 'src/app/services/website.service';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

declare var $: any;

interface VehicleSpecs {
	passengers: string | number;
	luggage: string | number;
}

interface Vehicle {
	id: number;
	name: string;
	category: string;
	badge?: string;
	description: string;
	price?: string;
	images: string[];
	specifications: VehicleSpecs;
	features: string[];
}

interface FleetData {
	meta: {
		title: string;
		description: string;
		keywords: string;
	};
	vehicles: Vehicle[];
}

@Component({
	selector: 'app-fleet',
	templateUrl: './fleet.component.html',
	styleUrls: ['./fleet.component.scss']
})
export class FleetComponent implements OnInit, AfterViewInit, OnDestroy {
	public fleetData: FleetData | null = null;
	public clientImages: any[] = [];
	public homePageData: any;

	// Swiper instances
	private vehicleSwipers: Swiper[] = [];

	// Filtering
	public filterCategory: string = 'All Vehicles';
	public categories: string[] = ['All Vehicles', 'Sedans', 'SUVs', 'Limousines', 'Vans & Sprinters', 'Buses'];

	get filteredVehicles(): Vehicle[] {
		if (!this.fleetData || !this.fleetData.vehicles) return [];
		if (this.filterCategory === 'All Vehicles') {
			return this.fleetData.vehicles;
		}
		return this.fleetData.vehicles.filter(v => v.category === this.filterCategory);
	}

	setFilter(category: string) {
		this.filterCategory = category;

		// Re-init swipers after view update
		setTimeout(() => {
			this.initVehicleCarousels();
		}, 100);
	}

	constructor(
		private http: HttpClient,
		private titleService: Title,
		private metaService: Meta,
		private spinner: NgxSpinnerService,
		private websiteService: WebsiteService,
		private el: ElementRef
	) { }

	ngOnInit(): void {
		this.spinner.show();
		this.loadFleetData();
		this.fetchHomePageData();
	}

	ngAfterViewInit(): void {
	}

	ngOnDestroy(): void {
		// Clean up Swipers
		this.vehicleSwipers.forEach(s => s.destroy());
	}

	loadFleetData() {
		this.http.get<FleetData>('assets/data/fleet.json').pipe(
			catchError(err => {
				console.error('Failed to load fleet data', err);
				return throwError(err);
			})
		).subscribe(data => {
			this.fleetData = data;
			this.setSeoMeta();
			this.spinner.hide();

			// Initialize carousels after data is rendered
			setTimeout(() => {
				this.initVehicleCarousels();
			}, 100);
		});
	}

	setSeoMeta() {
		if (this.fleetData?.meta) {
			this.titleService.setTitle(this.fleetData.meta.title);
			this.metaService.updateTag({ name: 'description', content: this.fleetData.meta.description });
			this.metaService.updateTag({ name: 'keywords', content: this.fleetData.meta.keywords });
		}
	}

	initVehicleCarousels() {
		// Destroy existing instances if any
		this.vehicleSwipers.forEach(s => s.destroy());
		this.vehicleSwipers = [];

		// Initialize new instances
		const swiperContainers = this.el.nativeElement.querySelectorAll('.vehicle-swiper');

		swiperContainers.forEach((container: HTMLElement, index: number) => {
			// Check if this specific vehicle has more than 1 image
			// We can check the number of slides inside
			const slides = container.querySelectorAll('.swiper-slide');
			const hasNavigation = slides.length > 1;

			const swiper = new Swiper(container, {
				modules: [Navigation, Pagination, Autoplay],
				slidesPerView: 1,
				spaceBetween: 0,
				loop: hasNavigation, // Only loop if more than 1 image
				autoplay: hasNavigation ? {
					delay: 3000,
					disableOnInteraction: false,
				} : false,
				pagination: hasNavigation ? {
					el: `.swiper-pagination-${index}`,
					clickable: true,
				} : false,
				navigation: hasNavigation ? {
					nextEl: `.swiper-button-next-${index}`,
					prevEl: `.swiper-button-prev-${index}`,
				} : false,
				allowTouchMove: hasNavigation
			});

			this.vehicleSwipers.push(swiper);
		});
	}

	initClientCarousel() {
		// Existing client carousel logic using owl-carousel as per request to keep it?
		// The requirement was specific to Fleet data.
		// "Our Clients" section logic from previous file:
		setTimeout(() => {
			$('.viewClientLogo').owlCarousel({
				loop: true,
				autoplay: true,
				autoplayTimeout: 2000,
				dotsEach: 3,
				dots: true,
				autoplayHoverPause: true,
				margin: 10,
				responsiveClass: true,
				responsive: {
					0: { items: 1, nav: false, loop: true, dots: true },
					600: { items: 2, nav: true, dots: true },
					1000: { items: 3, nav: true, loop: true, autoplay: true, margin: 20, dots: true },
					1199: { items: 4, nav: true, loop: true, autoplay: true, margin: 20, dots: true },
					1380: { items: 5, nav: true, loop: true, autoplay: true, margin: 20, dots: true }
				}
			});
		}, 200);
	}

	fetchHomePageData() {
		this.websiteService.fetchHomePageData()
			.pipe(
				catchError(err => {
					return throwError(err)
				})
			).subscribe(({ data }: any) => {
				this.homePageData = data;
				this.clientImages = this.fetchPageData('SOME OF OUR CLIENTS')?.images || [];
				this.initClientCarousel();
			})
	}

	fetchPageData(section: string) {
		if (section != undefined && this.homePageData != undefined) {
			if (this.homePageData) {
				for (let item in this.homePageData) {
					if (this.homePageData[item].hasOwnProperty('title') && this.homePageData[item]['title'].toLowerCase() == section.toLowerCase()) {
						return this.homePageData[item]
					}
				}
			}
		}
	}
}
