import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { WebsiteService } from 'src/app/services/website.service';
import { Swiper } from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';
declare var $: any;
@Component({
	selector: 'app-fleet',
	templateUrl: './fleet.component.html',
	styleUrls: ['./fleet.component.scss']
})
export class FleetComponent implements OnInit {
	public fleetContents: any;
	clientLogoSwiper: Swiper | null = null;
	clientImages: any[] = [];
	vehicleImages: any[] = [];
	homePageData: any;
	stepRotationInterval: any;
	currentActiveStep: number = 1;
	progressWidth: number = 25; // Progress line width percentage

	@ViewChild('clientLogoContainer') clientLogoContainer!: ElementRef;

	constructor(private adminServices: AdminService, private spinner: NgxSpinnerService, private websiteService: WebsiteService,) { }
	initOtherCarousels() {
		// Initialize all other carousels with 1 item on mobile
		setTimeout(() => {
			// General owl carousels
			$('.owl-carousels').owlCarousel({
				loop: true,
				autoplay: true,
				autoplayTimeout: 2000,
				dotsEach: 3,
				dots: true,
				autoplayHoverPause: true,
				margin: 10,
				responsiveClass: true,
				// navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
				// 	'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"> <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
				responsive: {
					0: {
						items: 1, // Mobile: 1 item
						nav: false,
						loop: true,
						dots: true
					},
					600: {
						items: 2, // Tablet: 2 items
						nav: true,
						dots: true
					},
					1000: {
						items: 3, // Desktop: 3 items
						nav: true,
						loop: true,
						autoplay: true,
						margin: 20
					}
				}
			});

			// Destination carousel
			$('.destinationCarousel').owlCarousel({
				loop: true,
				autoplay: false,
				dotsEach: 3,
				dots: true,
				autoplayTimeout: 2000,
				autoplayHoverPause: true,
				margin: 10,
				responsiveClass: true,
				// navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
				// 	'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"> <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
				responsive: {
					0: {
						items: 1, // Mobile: 1 item
						nav: false,
						loop: true,
						dots: true
					},
					600: {
						items: 2, // Tablet: 2 items
						nav: true,
						dots: true
					},
					1000: {
						items: 3, // Desktop: 3 items
						nav: true,
						loop: true,
						autoplay: false,
						margin: 10,
						dots: true
					}
				}
			});

			// View vehicle carousel
			$('.viewVehicleCarousel').owlCarousel({
				loop: true,
				autoplay: true,
				autoplayTimeout: 2000,
				dotsEach: 3,
				dots: true,
				autoplayHoverPause: true,
				margin: 10,
				responsiveClass: true,
				// navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
				// 	'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"> <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
				responsive: {
					0: {
						items: 1, // Mobile: 1 item
						nav: false,
						loop: true,
						dots: true
					},
					600: {
						items: 2, // Tablet: 2 items
						nav: true,
						dots: true
					},
					1000: {
						items: 3, // Desktop: 3 items
						nav: true,
						loop: true,
						autoplay: true,
						margin: 20,
						dots: true
					}
				}
			});

			// View vehicle carousel
			$('.viewClientLogo').owlCarousel({
				loop: true,
				autoplay: true,
				autoplayTimeout: 2000,
				dotsEach: 3,
				dots: true,
				autoplayHoverPause: true,
				margin: 10,
				responsiveClass: true,
				// navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
				// 	'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"> <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
				responsive: {
					0: {
						items: 1, // Mobile: 1 item
						nav: false,
						loop: true,
						dots: true
					},
					600: {
						items: 2, // Tablet: 2 items
						nav: true,
						dots: true
					},
					1000: {
						items: 3, // Desktop: 3 items
						nav: true,
						loop: true,
						autoplay: true,
						margin: 20,
						dots: true
					},
					1199: {
						items: 4, // Desktop: 3 items
						nav: true,
						loop: true,
						autoplay: true,
						margin: 20,
						dots: true
					},
					1380: {
						items: 5, // Desktop: 3 items
						nav: true,
						loop: true,
						autoplay: true,
						margin: 20,
						dots: true
					}
				}
			});

			// client_logo carousel is now handled by Swiper in initClientCarousel() method
		}, 200);
	}
	// Initialize step rotation animation for "How Works" section
	initStepRotation() {
		this.startStepRotation();
	}
	startStepRotation() {
		// Clear any existing interval
		if (this.stepRotationInterval) {
			clearInterval(this.stepRotationInterval);
		}

		// Start with step 1
		this.currentActiveStep = 1;
		this.updateProgress(); // Set initial state

		// Rotate through steps every 2 seconds (faster animation)
		this.stepRotationInterval = setInterval(() => {
			this.currentActiveStep++;
			if (this.currentActiveStep > 4) {
				this.currentActiveStep = 1; // Loop back to start
			}
			this.updateProgress();
		}, 1000); // 2 seconds per step for faster flow
	}
	manualSelectStep(step: number) {
		// Stop auto-rotation if user interacts
		if (this.stepRotationInterval) {
			clearInterval(this.stepRotationInterval);
		}
		this.currentActiveStep = step;
		this.updateProgress();
	}
	updateProgress() {
		// Calculate width: 
		// Step 1 = 0%, Step 2 = 33%, Step 3 = 66%, Step 4 = 100% of the LINE width.
		// Since there are 3 segments connecting 4 points:
		const segments = 3;
		const stepIndex = this.currentActiveStep - 1;
		this.progressWidth = (stepIndex / segments) * 100;
	}
	fetchHomePageData() {
		this.spinner.show()

		this.websiteService.fetchHomePageData()
			.pipe(
				catchError(err => {
					this.spinner.hide()
					return throwError(err)
				})
			).subscribe(({ data }: any) => {
				this.spinner.hide()
				console.log(data, "gsducgjsdgcfugsdu")
				this.homePageData = data;
				this.clientImages = this.fetchPageData('SOME OF OUR CLIENTS')?.images || [];
				console.log(this.clientImages, "imagessss")
				// Initialize all carousels after data is loaded
				setTimeout(() => {
					this.initOtherCarousels();
					this.initStepRotation(); // Initialize step rotation animation
				}, 100);
			})

	}

	getVehicles() {
		this.websiteService.getOurVehicles().then((response: any) => {
			console.log("getVehicles response:", response);
			if (response && response.data) {
				this.vehicleImages = response.data;
			} else if (Array.isArray(response)) {
				this.vehicleImages = response;
			}
		});
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
	ngOnInit(): void {
		this.fetchHomePageData();
		this.getFleet();
		this.getVehicles();
	}
	ngOnDestroy(): void {
		// Clean up step rotation interval
		if (this.stepRotationInterval) {
			clearInterval(this.stepRotationInterval);
		}
		// Clean up resize timeout
		if ((this as any).resizeTimeout) {
			clearTimeout((this as any).resizeTimeout);
		}
		// Clean up Swiper instance
		if (this.clientLogoSwiper) {
			this.clientLogoSwiper.destroy(true, true);
			this.clientLogoSwiper = null;
		}
	}
	getFleet() {
		this.spinner.show()
		this.adminServices.getStepContentData('fleet').pipe(
			catchError(err => {
				this.spinner.hide()
				return throwError(err);
			})
		).subscribe(({ data }: any) => {
			this.spinner.hide()
			console.log(data);
			this.fleetContents = data;
		})
	}

	getVehicleImage(title: string): string {
		if (!title) return '';
		if (!this.vehicleImages || this.vehicleImages.length === 0) {
			// console.warn('Vehicle images not loaded yet');
			return '';
		}

		// Aggressive normalization: remove all non-alphanumeric chars, lower case
		const normalize = (s: string) => s ? s.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
		const target = normalize(title);

		if (!target) return '';

		// Find match
		const match = this.vehicleImages.find(v => {
			const vName = normalize(v.vehicle_name);
			// Check exact match of normalized strings, or if one contains the other
			return vName === target || vName.includes(target) || target.includes(vName);
		});

		if (match) {
			// console.log(`[MATCH] "${title}" (norm: ${target}) matched with "${match.vehicle_name}"`);
			return match.vehicle_image;
		} else {
			console.log(`[NO MATCH] "${title}" (norm: ${target}) - Available:`, this.vehicleImages.map(v => normalize(v.vehicle_name)).join(', '));
			return '';
		}
	}
}
