import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
declare var $: any;

@Component({
  selector: 'app-tutorials',
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.scss']
})
export class TutorialsComponent implements OnInit {

  public fleetContents: any;

  constructor(private adminServices: AdminService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
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
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+use+the+search+for+vehicles%2C+and+rates+in+the+search+engine%2C+Quote-bot+screen+and+filters).mp4',
        "content": "A guide on how to use the search for vehicles, rates, and filters in the search engine and Quote-bot screen.",
      },
      {
        "title": "How to register as affiliate",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+Register+Affiliate+and+step+0.mp4',
        "content": "A step-by-step guide on how to sign up and register for an affiliate program.",
      },
      {
        "title": "How to complete step 1 as affiliate",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+1+to+register+as+affiliate.mp4',
        "content": "A guide on how to complete step 1 for registering as an affiliate.",
      },
      {
        "title": "How to complete step 2 as affiliate",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+2+to+register+as+affiliate.mp4',
        "content": "A guide on how to complete step 2 for registering as an affiliate.",
      },
      {
        "title": "How to complete step 3 as affiliate",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+3+to+register+as+affiliate.mp4',
        "content": "A guide on how to complete step 3 for registering as an affiliate.",
      },
      {
        "title": "How to complete step 4 as affiliate",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+4+to+register+as+affiliate.mp4',
        "content": "A guide on how to complete step 4 for registering as an affiliate.",
      },
      {
        "title": "How to complete step 5 as affiliate",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+complete+step+5+to+register+as+affiliate.mp4',
        "content": "A guide on how to complete step 5 for registering as an affiliate.",
      },
      {
        "title": "How to create a farmout booking",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+Create+Farmout+booking.mp4',
        "content": "A guide on how to create a farmout booking and earn 10% commission.",
      },
      {
        "title": "How to register as an Travel Agent",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Travel+Agent+Registration+(3).mp4',
        "content": "A step-by-step guide on how to sign up and register for an Travel Agent.",
      },
      {
        "title": "How to create a booking as an Travel Agent",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+Create+Booking+on+Travel+Agent+Account.mp4',
        "content": "A guide on how to create a booking as an travel agent and earn 10% commission.",
      },
      {
        "title": "How to register as an Individual",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Individual+Signup.mp4',
        "content": "A step-by-step guide on how to sign up and register for an Individual account.",
      },
      {
        "title": "How to add a family member in individual account",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Adding+family+members+other+members+to+the+Individual+account.mp4',
        "content": "A guide on how to add a family member to your individual account.",
      },
      {
        "title": "How to edit a booking",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/How+to+edit+a+booking+from+one-way+to+round+trip+or+charter+Tour+from+the+booking+dashboard..mp4',
        "content": "A guide on how to edit a booking from one-way to round trip or charter tour from the booking dashboard.",
      },
      {
        "title": "How to repeat a booking",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Repeat+a+booking.mp4',
        "content": "A guide on how to create a repeat booking.",
      },
      {
        "title": "How to return a booking",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Return+a+booking.mp4',
        "content": "A guide on how to create a return booking.",
      },
      {
        "title": "How to do search on daily booking frame",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Daily+booking+frame+Search.mp4',
        "content": "A guide on how to do search using booking number, cell phone, name etc. on daily booking frame.",
      },
      {
        "title": "How to add sub admin",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Add+Sub+Admin.mp4',
        "content": "A guide on how to add a sub admin.",
      },
      {
        "title": "How to buy free plan",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Subscribe+to+the+Free+subscription+Plan.mp4',
        "content": "A step-by-step guide on how to buy the free plan of the chauffer select software.",
      },
      {
        "title": "How to buy basic plan from our software",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Subscribe+to+the+Basic+Subscription+Plan.mp4',
        "content": "A step-by-step guide on how to buy the basic plan of the chauffer select software.",
      },
      {
        "title": "How to buy fleet plan with chauffer select software",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Subscribe+to+the+Fleet+Subscription+Plan.mp4',
        "content": "A step-by-step guide on how to buy the fleet operator plan of the chauffer select software.",
      },
      {
        "title": "How to add bank details as new subscriber",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Bank+Details.mp4',
        "content": "A guide on how to add bank details for stripe as new cutomer for chauffer select software.",
      },
      {
        "title": "How to add invite drivers to your account",
        "image": "assets/images/mobile1.jpg",
        "link": 'https://1800limo.s3.us-east-2.amazonaws.com/tutorials/Invite+Driver.mp4',
        "content": "A guide on how to invite drivers under your company.",
      },

    ];


  }

}