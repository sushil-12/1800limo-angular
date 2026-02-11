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
  currentActiveStep: number = 1;
  progressWidth: number = 25; // Progress line width percentage

  isLoading: boolean = true;
  searchText: string = '';
  selectedCategory: string = 'All Tutorials';
  filteredTutorials: any[] = [];
  featuredTutorial: any;
  categories: any[] = [];

  homePageData: any;
  clientImages: any[] = [];
  fleetContents: any[] = [];
  stepRotationInterval: any;

  constructor(private adminServices: AdminService, private spinner: NgxSpinnerService, private websiteService: WebsiteService,) { }

  ngOnInit(): void {
    this.fetchHomePageData();
    this.initTutorialData();

    // Simulate initial loading for skeleton demo
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);

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
        this.homePageData = data;
        this.clientImages = this.fetchPageData('SOME OF OUR CLIENTS')?.images || [];
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
    }, 200);
  }

  initStepRotation() {
    this.startStepRotation();
  }

  startStepRotation() {
    if (this.stepRotationInterval) {
      clearInterval(this.stepRotationInterval);
    }
    this.currentActiveStep = 1;
    this.updateProgress();
    this.stepRotationInterval = setInterval(() => {
      this.currentActiveStep++;
      if (this.currentActiveStep > 4) {
        this.currentActiveStep = 1;
      }
      this.updateProgress();
    }, 2000);
  }

  updateProgress() {
    const segments = 3;
    const stepIndex = this.currentActiveStep - 1;
    this.progressWidth = (stepIndex / segments) * 100;
  }

  initTutorialData() {
    this.fleetContents = [
      {
        "title": "How to Book Your First Ride",
        "category": "Booking",
        "image": "assets/images/images_tutorial/updated-images/searchrnigne.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+use+the+search+for+vehicles%2C+and+rates+in+the+search+engine%2C+Quote-bot+screen+and+filters).mp4',
        "content": "Learn the step-by-step process of booking your first limousine service with our easy-to-use platform.",
        "duration": "5:30",
        "views": "12.5K",
        "rating": "4.8",
        "level": "Beginner",
        "isFeatured": true
      },
      {
        "title": "Advanced Booking: Scheduling Recurring Rides",
        "category": "Booking",
        "image": "assets/images/images_tutorial/updated-images/editrepeatretrun.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+edit+a+booking+from+one-way+to+round+trip+or+charter+Tour+from+the+booking+dashboard..mp4',
        "content": "Set up automated recurring bookings for your regular transportation needs.",
        "duration": "7:20",
        "views": "5.3K",
        "rating": "4.8",
        "level": "Advanced"
      },
      {
        "title": "Managing Your Reservations Efficiently",
        "category": "Booking",
        "image": "assets/images/images_tutorial/updated-images/editrepeatretrun.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+edit+a+booking+from+one-way+to+round+trip+or+charter+Tour+from+the+booking+dashboard..mp4',
        "content": "A comprehensive guide to managing, editing, and cancelling your rides with ease.",
        "duration": "7:20",
        "views": "5.3K",
        "rating": "4.8",
        "level": "Advanced"
      },
      {
        "title": "Payment Guide: Secure & Fast Transactions",
        "category": "Payments",
        "image": "assets/images/images_tutorial/updated-images/addbank.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Bank+Details.mp4',
        "content": "Everything you need to know about secure payment methods on 1800 LIMO.COM.",
        "duration": "4:15",
        "views": "3.2K",
        "rating": "4.9",
        "level": "Beginner"
      },
      {
        "title": "Mobile App: Features & Benefits",
        "category": "Mobile App",
        "image": "assets/images/images_tutorial/updated-images/searchrnigne.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+use+the+search+for+vehicles%2C+and+rates+in+the+search+engine%2C+Quote-bot+screen+and+filters).mp4',
        "content": "Maximize your travel experience with the 1800 LIMO.COM mobile application.",
        "duration": "6:45",
        "views": "8.1K",
        "rating": "4.7",
        "level": "Intermediate"
      },
      {
        "title": "Account Setup & Profile Management",
        "category": "Account Setup",
        "image": "assets/images/images_tutorial/updated-images/loginasaffiliate.png",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Individual+Signup.mp4',
        "content": "Set up your account and manage your preferences for a personalized service.",
        "duration": "3:50",
        "views": "15.2K",
        "rating": "4.6",
        "level": "Beginner"
      }
    ];

    const iconMap: any = {
      'All Tutorials': 'bi bi-book',
      'Booking': 'bi bi-calendar4',
      'Payments': 'bi-credit-card',
      'Mobile App': 'bi-phone',
      'Account Setup': 'bi bi-people'
    };

    const uniqueCats = Array.from(new Set(this.fleetContents.map(t => t.category)));
    this.categories = [
      { name: 'All Tutorials', icon: iconMap['All Tutorials'] },
      ...uniqueCats.map(cat => ({
        name: cat,
        icon: iconMap[cat] || 'bi-bookmark'
      }))
    ];

    this.featuredTutorial = this.fleetContents.find(t => t.isFeatured) || this.fleetContents[0];
    this.applyFilter();
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilter();
  }

  onSearch() {
    this.applyFilter();
  }

  applyFilter() {
    this.filteredTutorials = this.fleetContents.filter(tutorial => {
      const matchesSearch = tutorial.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        tutorial.content.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesCategory = this.selectedCategory === 'All Tutorials' || tutorial.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  getFilteredTutorials() {
    return this.filteredTutorials;
  }

  getTutorialsByCategory() {
    const grouped: any = {};
    if (this.selectedCategory !== 'All Tutorials') {
      grouped[this.selectedCategory] = this.filteredTutorials;
    } else {
      this.filteredTutorials.forEach(tutorial => {
        if (!grouped[tutorial.category]) {
          grouped[tutorial.category] = [];
        }
        grouped[tutorial.category].push(tutorial);
      });
    }
    return grouped;
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  downloadVideo(url: string, filename: string) {
    if (!url) return;

    // Use fetch to get the blob to handle S3 URLs properly for download
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename || 'tutorial-video.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
      })
      .catch(console.error);
  }
}