import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from '../../../services/admin.service';
import { WebsiteService } from 'src/app/services/website.service';
declare var $: any;

@Component({
  selector: 'app-tutorials',
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.scss']
})
export class TutorialsComponent implements OnInit {

  public fleetContents: any;
  groupedTutorials: any;
  clientImages: any[] = [];
  homePageData: any;
  stepRotationInterval: any;
	currentActiveStep: number = 1;
	progressWidth: number = 25; // Progress line width percentage
  constructor(private adminServices: AdminService, private spinner: NgxSpinnerService, private websiteService: WebsiteService,) { }
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
					this.initOtherCarousels();
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
            dots:true
          }
        }
      });
  
      // View vehicle carousel
      $('.viewVehicleCarousel').owlCarousel({
        loop: true,
        autoplay: true,
        autoplayTimeout: 2000,
        dotsEach: 3,
        dots:true,
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
        dots:true,
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
  updateProgress() {
		// Calculate width: 
		// Step 1 = 0%, Step 2 = 33%, Step 3 = 66%, Step 4 = 100% of the LINE width.
		// Since there are 3 segments connecting 4 points:
		const segments = 3;
		const stepIndex = this.currentActiveStep - 1;
		this.progressWidth = (stepIndex / segments) * 100;
	}
  ngOnInit(): void {
    this.fetchHomePageData();
    $(document).ready(function () {
      $('.client_logo').owlCarousel({
        loop: true,
        margin: 10,
        autoplay: true,
        autoplayTimeout: 1000,
        autoplayHoverPause: true,
        responsiveClass: true,
        navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
          '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff">  <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
        responsive: {
          0: {
            items: 1,
            nav: false,
            loop: true,
            dots: false
          }
        }
      });
    });



    this.fleetContents = [
      {
        "title": "How to use the search engine",
        "category": "Create and Manage Bookings",
        "image": "assets/images/images_tutorial/updated-images/searchrnigne.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+use+the+search+for+vehicles%2C+and+rates+in+the+search+engine%2C+Quote-bot+screen+and+filters).mp4',
        "content": "A guide on how to use the search for vehicles, rates, and filters in the search engine and Quote-bot screen.",
      },
      {
        "title": "How to edit a booking",
        "category": "Create and Manage Bookings",
        "image": "assets/images/images_tutorial/updated-images/editrepeatretrun.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+edit+a+booking+from+one-way+to+round+trip+or+charter+Tour+from+the+booking+dashboard..mp4',
        "content": "A guide on how to edit a booking from one-way to round trip or charter tour from the booking dashboard.",
      },
      {
        "title": "How to create a repeat booking",
        "category": "Create and Manage Bookings",
        "image": "assets/images/images_tutorial/updated-images/editrepeatretrun.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Repeat+a+booking.mp4',
        "content": "A guide on how to create a repeat booking.",
      },
      {
        "title": "How to create a return booking",
        "category": "Create and Manage Bookings",
        "image": "assets/images/images_tutorial/updated-images/editrepeatretrun.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Return+a+booking.mp4',
        "content": "A guide on how to create a return booking.",
      },
      {
        "title": "How to register as an affiliate Operator",
        "category": "Register as an Affiliate Operator",
        "image": "assets/images/images_tutorial/updated-images/loginasaffiliate.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+Register+Affiliate+and+step+0.mp4',
        "content": "A step-by-step guide on how to sign up and register for an affiliate program.",
      },
      {
        "title": "How to complete step 1 as an affiliate",
        "category": "Register as an Affiliate Operator",
        "image": "assets/images/images_tutorial/updated-images/step-1.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+1+to+register+as+affiliate.mp4',
        "content": "A guide on how to complete step 1 for registering as an affiliate.",
      },
      {
        "title": "How to complete step 2 as an affiliate",
        "category": "Register as an Affiliate Operator",
        "image": "assets/images/images_tutorial/updated-images/step-2.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+2+to+register+as+affiliate.mp4',
        "content": "A guide on how to complete step 2 for registering as an affiliate.",
      },
      {
        "title": "How to complete step 3 as an affiliate",
        "category": "Register as an Affiliate Operator",
        "image": "assets/images/images_tutorial/updated-images/step-3.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+3+to+register+as+affiliate.mp4',
        "content": "A guide on how to complete step 3 for registering as an affiliate.",
      },
      {
        "title": "How to complete step 4 as an affiliate",
        "category": "Register as an Affiliate Operator",
        "image": "assets/images/images_tutorial/updated-images/step-4.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+4+to+register+as+affiliate.mp4',
        "content": "A guide on how to complete step 4 for registering as an affiliate.",
      },
      {
        "title": "How to complete step 5 as an affiliate",
        "category": "Register as an Affiliate Operator",
        "image": "assets/images/images_tutorial/updated-images/step-5.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+5+to+register+as+affiliate.mp4',
        "content": "A guide on how to complete step 5 for registering as an affiliate.",
      },
      {
        "title": "How to create a farmout booking",
        "category": "Register as an Affiliate Operator",
        "image": "assets/images/images_tutorial/updated-images/searchrnigne.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+Create+Farmout+booking.mp4',
        "content": "A guide on how to create a farmout booking and earn 10% commission.",
      },
      {
        "title": "How to register as a Travel Advisor",
        "category": "Register as a Travel Advisor",
        "image": "assets/images/images_tutorial/updated-images/registerasagent.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+register+as+Travel+Agent+-+Step+1+and+2.mp4',
        "content": "A step-by-step guide on how to sign up and register for a Travel Advisor.",
      },
      {
        "title": "How to create a booking as a Travel Advisor",
        "category": "Register as a Travel Advisor",
        "image": "assets/images/images_tutorial/updated-images/searchrnigne.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+Create+Booking+on+Travel+Agent+Account.mp4',
        "content": "A guide on how to create a booking as an travel advisor and earn 10% commission.",
      },
      {
        "title": "How to register as Individual/Customer",
        "category": "Register as Individual/Customer",
        "image": "assets/images/images_tutorial/updated-images/registerasindv.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Individual+Signup.mp4',
        "content": "A step-by-step guide on how to sign up and register for an Individual account.",
      },
      {
        "title": "How to add a family member in Individual account",
        "category": "Register as Individual/Customer",
        "image": "assets/images/images_tutorial/updated-images/familymember.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Adding+family+members+other+members+to+the+Individual+account.mp4',
        "content": "A guide on how to add a family member to your individual account.",
      },
      {
        "title": "How to choose correct account to Register",
        "category": "How to choose correct account",
        "image": "assets/images/images_tutorial/updated-images/searchrnigne.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+choose+correct+account+to+register.mp4',
        "content": "A guide on how to choose correct account to register on the platform.",
      },
      {
        "title": "How to choose correct account to Register",
        "category": "How to choose correct account",
        "image": "assets/images/images_tutorial/updated-images/searchrnigne.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+choose+correct+account+to+register.mp4',
        "content": "A guide on how to choose correct account to register on the platform.",
      },
      {
        "title": "How to advertise you fleet for free",
        "category": "Buy Chauffer Select Software",
        "image": "assets/images/images_tutorial/updated-images/freeplan.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Subscribe+to+the+Free+subscription+Plan.mp4',
        "content": "A step-by-step guide on how to buy the free plan of the Chauffer Select software.",
      },
      {
        "title": "How to buy basic plan with Chauffer Select software",
        "category": "Buy Chauffer Select Software",
        "image": "assets/images/images_tutorial/updated-images/basic.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Subscribe+to+the+Basic+Subscription+Plan.mp4',
        "content": "A step-by-step guide on how to buy the basic plan of the Chauffer Select software.",
      },
      {
        "title": "How to buy fleet plan with Chauffer Select software",
        "category": "Buy Chauffer Select Software",
        "image": "assets/images/images_tutorial/updated-images/fleet.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Subscribe+to+the+Fleet+Subscription+Plan.mp4',
        "content": "A step-by-step guide on how to buy the fleet operator plan of the Chauffer Select software.",
      },
      {
        "title": "How to add bank details as new customer",
        "category": "Buy Chauffer Select Software",
        "image": "assets/images/images_tutorial/updated-images/addbank.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Bank+Details.mp4',
        "content": "A guide on how to add bank details for STRIPE as new cutomer for Chauffer Select software.",
      },
      {
        "title": "How to invite drivers to your account",
        "category": "Buy Chauffer Select Software",
        "image": "assets/images/images_tutorial/updated-images/invitedriver.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Invite+Driver.mp4',
        "content": "A guide on how to invite drivers under your company.",
      },
      {
        "title": "How to do search on daily booking frame",
        "category": "Tutorials for Admin and Chauffer Select Subscribers",
        "image": "assets/images/images_tutorial/updated-images/searchondailybooking.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Search+bookings+on+daily+booking+frame.mp4',
        "content": "A guide on how to do search using booking number, cell phone, name etc. on daily booking frame.",
      },
      {
        "title": "How to add sub admin",
        "category": "Tutorials for Admin and Chauffer Select Subscribers",
        "image": "assets/images/images_tutorial/updated-images/addsubadmin.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Add+Sub+Admin.mp4',
        "content": "A guide on how to add a sub admin.",
      },

    ];

    this.groupedTutorials = this.fleetContents.reduce((acc, tutorial) => {
      // Check if the category already exists in the accumulator
      if (!acc[tutorial.category]) {
        acc[tutorial.category] = [];
      }
      acc[tutorial.category].push(tutorial);
      return acc;
    }, {});

  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}