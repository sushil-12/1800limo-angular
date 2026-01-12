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
	homePageData: any;
	stepRotationInterval: any;
	currentActiveStep: number = 1;
	progressWidth: number = 25; // Progress line width percentage

	@ViewChild('clientLogoContainer') clientLogoContainer!: ElementRef;

  constructor(private adminServices: AdminService, private spinner: NgxSpinnerService,private websiteService: WebsiteService, ) { }
  initClientCarousel() {
		// Wait for DOM and data to be ready
		setTimeout(() => {
			if (this.clientLogoContainer && this.clientLogoContainer.nativeElement && this.clientImages && this.clientImages.length > 0) {
				// Destroy existing Swiper instance if it exists
				if (this.clientLogoSwiper) {
					this.clientLogoSwiper.destroy(true, true);
					this.clientLogoSwiper = null;
				}

				// Check if navigation should be enabled (desktop only)
				const isDesktop = window.innerWidth >= 768;
				const nextButton = this.clientLogoContainer.nativeElement.querySelector('.client-logo-swiper-button-next');
				const prevButton = this.clientLogoContainer.nativeElement.querySelector('.client-logo-swiper-button-prev');
				
				const navButtons = nextButton && prevButton ? {
					nextEl: nextButton,
					prevEl: prevButton,
					disabledClass: 'swiper-button-disabled',
				} : false;

				// Initialize Swiper
				this.clientLogoSwiper = new Swiper(this.clientLogoContainer.nativeElement, {
					modules: [Navigation, Autoplay],
					slidesPerView: 4,
					spaceBetween: 8,
					loop: this.clientImages.length > 2,
					autoplay: {
						delay: 2000,
						disableOnInteraction: false,
						pauseOnMouseEnter: true,
					},
					speed: 300,
					watchOverflow: true,
					watchSlidesProgress: true,
					centeredSlides: false,
					centeredSlidesBounds: false,
					preventClicks: true,
					preventClicksPropagation: true,
					slideToClickedSlide: false,
					navigation: navButtons,
					breakpoints: {
						0: {
							slidesPerView: 2,
							spaceBetween: 0,
							centeredSlides: false,
						},
						375: {
							slidesPerView: 2,
							spaceBetween: 0,
						},
						480: {
							slidesPerView: 2,
							spaceBetween: 0,
						},
						640: {
							slidesPerView: 2,
							spaceBetween: 0,
						},
						768: {
							slidesPerView: 4,
							spaceBetween: 20,
						},
						992: {
							slidesPerView: 4,
							spaceBetween: 20,
						},
						1200: {
							slidesPerView: 5,
							spaceBetween: 25,
						}
					},
					on: {
						init: () => {
							// Force update after initialization
							if (this.clientLogoSwiper) {
								setTimeout(() => {
									this.clientLogoSwiper?.update();
								}, 100);
							}
						}
					}
				});
			} else if (this.clientImages && this.clientImages.length > 0) {
				// Retry if container not ready yet
				setTimeout(() => this.initClientCarousel(), 200);
			}
		}, 100);
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
				console.log(this.clientImages,"imagessss")
				// Initialize all carousels after data is loaded
				setTimeout(() => {
					this.initClientCarousel();
					this.initStepRotation(); // Initialize step rotation animation
				}, 100);
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
  ngOnInit(): void {
  	this.fetchHomePageData();
    this.getFleet();

  

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
  getFleet(){
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
}
