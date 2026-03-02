import { Component, OnInit } from '@angular/core';
import { Title, Meta, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-cancellation-policy',
  templateUrl: './cancellation-policy.component.html',
  styleUrls: ['./cancellation-policy.component.scss']
})
export class CancellationPolicyComponent implements OnInit {

  cancellationData = {
    meta: {
      title: 'Cancellation Policies | 1-800-LIMO.COM',
      description: 'Vehicle Choice and Cancellation Policies for 1-800-LIMO.COM',
      keywords: 'cancellation policy, refund, limo cancellation, reservation'
    },
    badge: {
      iconClass: 'bi bi-x-circle',
      text: 'Cancellation Policies'
    },
    title: 'Cancellation Policies',
    lastUpdated: 'June 5, 2018',
    description: 'Guidelines and policies regarding vehicle cancellation, designed to respect everyone\'s time and set clear expectations.',
    sections: [
      {
        iconClass: 'bi bi-calendar-x',
        title: 'Vehicle Choice and Cancellation Policies',
        content: `
         <p>
            We prefer all prearranged bookings to be cancelled can vary from 2 hours to 30 days, depending on the
            operator, vehicle type, your unique instructions, or special events. Every independent driver blocks out a time just for
            your booking and rejects all other bookings to accommodate you. The advantage is that the driver is waiting
            for you and the benefit is that you are not waiting for the driver. Fleet/Coach operators are a little more
            forgiving since they have more vehicles that can be switched around with some time and effort to accommodate
            their other regular clients. This still takes time for the dispatcher to juggle bookings. Please be
            considerate to drivers and their set schedules. We will do our best to prevent you from paying a partial or
            full cancellation fee. There’s a 5% credit card cancellation fee.
         </p>
         <p>
            We do our best to accommodate you and our drivers. Without good affiliates, we are out of business and you
            will be unable to receive the best service that you expect. That’s why you chose us to transport you. Many
            of our drivers will not charge for a cancellation within 2 hours of pickup time or as long as the driver is
            not in route for pickup up, usually one hour for Fleet/Coach operators. If you fail to cancel with proper
            notice you will be obligated to pay the full rate less gratuity. We will do our best to keep any last minute
            cancellation fees to a minimum.
         </p>
         <p>
            There is no charge for any flight cancellations due to weather or mechanical problems. Waiting time may be
            charged if the flight departed on time but was delayed while in flight. Be proactive and notify the driver
            of any delays or cancellations. The driver tracks the flight as best they can but acts of God are out of our
            hands.
         </p>
         <p>
            Just to recap; when you make a booking, the driver and Fleet/Coach operator sets aside that driver and
            vehicle and time just for you and refuses or rejects other bookings that may come in after you book your ride for the
            same time. When you cancel a booking at the last minute, the driver cannot recover the loss with another
            booking in most cases. It is a good rule of thumb to put yourself in the drivers position and ask yourself
            what would be fair and equitable.
         </p>
        `
      }
    ],
    recommendedLink: {
      title: 'Recommended Cancellation Policy For Each Vehicle Type',
      urlReference: '/fleet'
    }
  };

  safeSections: any[] = [];

  constructor(private titleService: Title, private metaService: Meta, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.cancellationData.meta.title);
    this.metaService.updateTag({ name: 'description', content: this.cancellationData.meta.description });
    this.metaService.updateTag({ name: 'keywords', content: this.cancellationData.meta.keywords });

    // Sanitize the HTML content
    this.safeSections = this.cancellationData.sections.map((section: any) => ({
      ...section,
      safeContent: section.content ? this.sanitizer.bypassSecurityTrustHtml(section.content) : null
    }));
  }

}
