import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from '../../../services/admin.service';
import { WebsiteService } from 'src/app/services/website.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { tutorialsData } from './tutorials-data';
declare var $: any;

@Component({
  selector: 'app-tutorials',
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.scss']
})
export class TutorialsComponent implements OnInit {
  isLoading: boolean = true;
  searchText: string = '';
  selectedCategory: string = 'All Tutorials';
  filteredTutorials: any[] = [];
  featuredTutorial: any;
  categories: any[] = [];
  showCopyMessage: boolean = false;

  suggestions: string[] = [];
  searchChips: string[] = [];
  showSuggestions: boolean = false;

  fleetContents: any[] = [];

  // Video playback
  selectedVideo: any = null;
  safeVideoUrl: SafeResourceUrl | null = null;

  constructor(
    private adminServices: AdminService,
    private spinner: NgxSpinnerService,
    private websiteService: WebsiteService,
    private sanitizer: DomSanitizer,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    // Set SEO Metadata
    this.titleService.setTitle(tutorialsData.meta.title);
    this.metaService.updateTag({ name: 'description', content: tutorialsData.meta.description });
    this.metaService.updateTag({ name: 'keywords', content: tutorialsData.meta.keywords });

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: tutorialsData.meta.title });
    this.metaService.updateTag({ property: 'og:description', content: tutorialsData.meta.description });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: '1-800-LIMO.COM' });

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: tutorialsData.meta.title });
    this.metaService.updateTag({ name: 'twitter:description', content: tutorialsData.meta.description });

    this.initTutorialData();

    // Simulate initial loading for skeleton demo
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }


  initTutorialData() {
    this.fleetContents = [
      {
        "type": "fleet_tutorials",
        "version": "1.0",
        "contents": [
          {
            "type": "user_tutorials",
            "title": "How to Book Your First Ride",
            "category": "Manage Bookings",
            "duration": "1:06",
            "image": "assets/images/images_tutorial/updated-images/searchrnigne.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+use+the+search+for+vehicles%2C+and+rates+in+the+search+engine%2C+Quote-bot+screen+and+filters).mp4",
            "content": "Learn the step-by-step process of booking your first limousine service with our easy-to-use platform."
          },
          {
            "type": "user_tutorials",
            "title": "How to edit a booking",
            "category": "Manage Bookings",
            "duration": "3:22",
            "image": "assets/images/images_tutorial/updated-images/editrepeatretrun.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+edit+a+booking+from+one-way+to+round+trip+or+charter+Tour+from+the+booking+dashboard..mp4",
            "content": "A guide on how to edit a booking from one-way to round trip or charter tour from the booking dashboard."
          },
          {
            "type": "user_tutorials",
            "title": "How to create a repeat booking",
            "category": "Manage Bookings",
            "duration": "00:56",
            "image": "assets/images/images_tutorial/updated-images/editrepeatretrun.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Repeat+a+booking.mp4",
            "content": "A guide on how to create a repeat booking."
          },
          {
            "type": "user_tutorials",
            "title": "How to create a return booking",
            "category": "Manage Bookings",
            "duration": "1:04",
            "image": "assets/images/images_tutorial/updated-images/editrepeatretrun.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Return+a+booking.mp4",
            "content": "A guide on how to create a return booking."
          },
          {
            "type": "driver_tutorials",
            "title": "How to register as an affiliate Operator",
            "category": "Registration",
            "duration": "2:37",
            "image": "assets/images/images_tutorial/updated-images/loginasaffiliate.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+Register+Affiliate+and+step+0.mp4",
            "content": "A step-by-step guide on how to sign up and register for an affiliate program."
          },
          {
            "type": "driver_tutorials",
            "title": "How to complete step 1 as an affiliate",
            "category": "Registration",
            "duration": "1:27",
            "image": "assets/images/images_tutorial/updated-images/step-1.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+1+to+register+as+affiliate.mp4",
            "content": "A guide on how to complete step 1 for registering as an affiliate."
          },
          {
            "type": "driver_tutorials",
            "title": "How to complete step 2 as an affiliate",
            "category": "Registration",
            "duration": "1:50",
            "image": "assets/images/images_tutorial/updated-images/step-2.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+2+to+register+as+affiliate.mp4",
            "content": "A guide on how to complete step 2 for registering as an affiliate."
          },
          {
            "type": "driver_tutorials",
            "title": "How to complete step 3 as an affiliate",
            "category": "Registration",
            "duration": "00:56",
            "image": "assets/images/images_tutorial/updated-images/step-3.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+3+to+register+as+affiliate.mp4",
            "content": "A guide on how to complete step 3 for registering as an affiliate."
          },
          {
            "type": "driver_tutorials",
            "title": "How to complete step 4 as an affiliate",
            "category": "Registration",
            "duration": "1:15",
            "image": "assets/images/images_tutorial/updated-images/step-4.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+4+to+register+as+affiliate.mp4",
            "content": "A guide on how to complete step 4 for registering as an affiliate."
          },
          {
            "type": "driver_tutorials",
            "title": "How to complete step 5 as an affiliate",
            "category": "Registration",
            "duration": "4:06",
            "image": "assets/images/images_tutorial/updated-images/step-5.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+5+to+register+as+affiliate.mp4",
            "content": "A guide on how to complete step 5 for registering as an affiliate."
          },
          {
            "type": "driver_tutorials",
            "title": "How to create a farmout booking",
            "category": "Manage Bookings",
            "duration": "2:59",
            "image": "assets/images/images_tutorial/updated-images/searchrnigne.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+Create+Farmout+booking.mp4",
            "content": "A guide on how to create a farmout booking and earn 10% commission."
          },
          {
            "type": "travel_agent_tutorials",
            "title": "How to register as a Travel Advisor",
            "category": "Registration",
            "duration": "2:02",
            "image": "assets/images/images_tutorial/updated-images/registerasagent.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+register+as+Travel+Agent+-+Step+1+and+2.mp4",
            "content": "A step-by-step guide on how to sign up and register for a Travel Advisor."
          },
          {
            "type": "travel_agent_tutorials",
            "title": "How to create a booking as a Travel Advisor",
            "category": "Manage Bookings",
            "duration": "2:35",
            "image": "assets/images/images_tutorial/updated-images/searchrnigne.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+Create+Booking+on+Travel+Agent+Account.mp4",
            "content": "A guide on how to create a booking as a travel advisor and earn 10% commission."
          },

          {
            "type": "user_tutorials",
            "title": "How to register as Individual/Customer",
            "category": "Registration",
            "duration": "2:00",
            "image": "assets/images/images_tutorial/updated-images/registerasindv.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Individual+Signup.mp4",
            "content": "A step-by-step guide on how to sign up and register for an Individual account."
          },
          {
            "type": "user_tutorials",
            "title": "How to add a family member in Individual account",
            "category": "Registration",
            "duration": "1:13",
            "image": "assets/images/images_tutorial/updated-images/familymember.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Adding+family+members+other+members+to+the+Individual+account.mp4",
            "content": "A guide on how to add a family member to your individual account."
          },
          {
            "type": "common_tutorials",
            "title": "How to choose correct account to Register",
            "category": "Registration",
            "duration": "1:22",
            "image": "assets/images/images_tutorial/updated-images/searchrnigne.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+choose+correct+account+to+register.mp4",
            "content": "A guide on how to choose correct account to register on the platform."
          },
          {
            "type": "driver_tutorials",
            "title": "How to advertise your fleet for free",
            "category": "Subscription",
            "duration": "1:18",
            "image": "assets/images/images_tutorial/updated-images/freeplan.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Subscribe+to+the+Free+subscription+Plan.mp4",
            "content": "A step-by-step guide on how to subscribe to the free Chauffer Select software plan."
          },
          {
            "type": "subscriber_tutorials",
            "title": "How to buy basic plan with Chauffer Select software",
            "category": "Subscription",
            "duration": "1:37",
            "image": "assets/images/images_tutorial/updated-images/basic.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Subscribe+to+the+Basic+Subscription+Plan.mp4",
            "content": "A step-by-step guide on how to buy the basic plan of the Chauffer Select software."
          },
          {
            "type": "subscriber_tutorials",
            "title": "How to buy fleet plan with Chauffer Select software",
            "category": "Subscription",
            "duration": "1:42",
            "image": "assets/images/images_tutorial/updated-images/fleet.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Subscribe+to+the+Fleet+Subscription+Plan.mp4",
            "content": "A step-by-step guide on how to buy the fleet operator plan of the Chauffer Select software."
          },
          {
            "type": "subscriber_tutorials",
            "title": "How to add bank details as new customer",
            "category": "Subscription",
            "duration": "00:36",
            "image": "assets/images/images_tutorial/updated-images/addbank.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Bank+Details.mp4",
            "content": "A guide on how to add bank details for Stripe as a new customer."
          },
          {
            "type": "subscriber_tutorials",
            "title": "How to invite drivers to your account",
            "category": "Subscription",
            "duration": "00:18",
            "image": "assets/images/images_tutorial/updated-images/invitedriver.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Invite+Driver.mp4",
            "content": "A guide on how to invite drivers under your company."
          },
          {
            "type": "common_tutorials",
            "title": "How to do search on daily booking frame",
            "category": "All Tutorials",
            "duration": "1:13",
            "image": "assets/images/images_tutorial/updated-images/searchondailybooking.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Search+bookings+on+daily+booking+frame.mp4",
            "content": "A guide on how to search bookings using booking number, phone number, or name."
          },
          {
            "type": "driver_tutorials",
            "title": "How to add sub admin",
            "category": "Registration",
            "duration": "00:28",
            "image": "assets/images/images_tutorial/updated-images/addsubadmin.png",
            "link": "https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Add+Sub+Admin.mp4",
            "content": "A guide on how to add a sub admin."
          }
        ]
      }

    ];

    this.fleetContents = this.fleetContents[0]?.contents || [];

    const iconMap: any = {
      'All Tutorials': 'bi bi-book',
      'Manage Bookings': 'bi bi-calendar4',
      'Registration': 'bi bi-person-badge',
      'Subscription': 'bi bi-cart-check',
    };

    const uniqueCats = Array.from(new Set(this.fleetContents.map(t => t.category)))
      .filter(cat => cat !== 'All Tutorials');
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

  formatTutorialType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'user_tutorials': 'Individual',
      'driver_tutorials': 'Affiliate',
      'travel_agent_tutorials': 'Advisor',
      'subscriber_tutorials': 'Subscriber',
      'common_tutorials': 'General'
    };
    return typeMap[type] || 'Tutorial';
  }

  isFilterActive(category: string): boolean {
    return this.selectedCategory === category;
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilter();
  }

  onSearch() {
    this.onSearchInput();
  }

  onSearchInput() {
    if (!this.searchText.trim()) {
      this.suggestions = [];
      this.showSuggestions = false;
      this.applyFilter();
      return;
    }

    const query = this.searchText.toLowerCase().trim();
    const matchingTitles = this.fleetContents
      .filter(t => t.title.toLowerCase().includes(query) || t.content.toLowerCase().includes(query))
      .map(t => t.title);

    this.suggestions = Array.from(new Set(matchingTitles)).slice(0, 5);
    this.showSuggestions = this.suggestions.length > 0;
    this.applyFilter();
  }

  selectSuggestion(suggestion: string) {
    this.searchText = suggestion;
    this.showSuggestions = false;
    this.executeSearch();
  }

  executeSearch() {
    const trimmedStr = this.searchText.trim();
    if (trimmedStr && !this.searchChips.includes(trimmedStr)) {
      this.searchChips.push(trimmedStr);
    }
    this.searchText = '';
    this.showSuggestions = false;
    this.applyFilter();
  }

  removeChip(chip: string) {
    this.searchChips = this.searchChips.filter(c => c !== chip);
    this.applyFilter();
  }

  applyFilter() {
    this.filteredTutorials = this.fleetContents.filter(tutorial => {
      let matchesSearch = true;
      const currentSearch = this.searchText.trim().toLowerCase();
      const chips = this.searchChips.map(c => c.toLowerCase());

      const searchTerms = [...chips];
      if (currentSearch) {
        searchTerms.push(currentSearch);
      }

      if (searchTerms.length > 0) {
        matchesSearch = searchTerms.some(term =>
          tutorial.title.toLowerCase().includes(term) ||
          tutorial.content.toLowerCase().includes(term)
        );
      }

      const matchesCategory = this.selectedCategory === 'All Tutorials' || tutorial.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  openVideo(tutorial: any) {
    this.selectedVideo = tutorial;
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(tutorial.link);
    // Prevent scrolling when video is open
    document.body.style.overflow = 'hidden';
  }

  closeVideo() {
    this.selectedVideo = null;
    this.safeVideoUrl = null;
    document.body.style.overflow = 'auto';
  }

  getFilteredTutorials() {
    return this.filteredTutorials;
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

  copyLink(url: string) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        this.showCopyMessage = true;
        setTimeout(() => {
          this.showCopyMessage = false;
        }, 3000);
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        this.showCopyMessage = true;
        setTimeout(() => {
          this.showCopyMessage = false;
        }, 3000);
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
      document.body.removeChild(textArea);
    }
  }
}