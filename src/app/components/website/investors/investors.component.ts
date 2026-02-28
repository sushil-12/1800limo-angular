import { Component, OnInit } from '@angular/core';
import { Title, Meta, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-investors',
  templateUrl: './investors.component.html',
  styleUrls: ['./investors.component.scss']
})
export class InvestorsComponent implements OnInit {

  investorsData = {
    meta: {
      title: 'Investors | 1-800-LIMO.COM',
      description: 'Discover our growth story, financial performance, and investment opportunities in the luxury ground transportation industry.',
      keywords: 'investors, investment, 1800 limo, corporate'
    },
    badge: {
      iconClass: 'bi bi-graph-up-arrow',
      text: 'Investor Relations'
    },
    title: 'Investors',
    lastUpdated: 'February 27, 2026',
    description: 'Building value through excellence in luxury ground transportation. Discover our growth story, financial performance, and investment opportunities.',
    videoUrl: 'https://www.youtube.com/embed/mSLOtFhp1ks',
    founder: {
      image: 'assets/images/founder.jpg', // Using an existing image asset
      text: [
        'Joseph Anselmo, our Founder, knows the livery industry well. He has personally driven over 1 million customer miles in his 28 years in the livery industry. Starting with one vehicle in 1988, he has grown to more than 1000 affiliates on several continents today.',
        'Since beginning in the livery business, he recognized that the average traveler could not easily find or book a safe ride when they wanted or at the lowest price. Unless the customer did a lot of comparison shopping, they would never know if they were receiving the best prices and service. Joe\'s solution was to have an online, one-stop-shop to search, compare and book with ease. And from that vision years ago, 1-800-LIMO.COM was born.'
      ]
    },
    proposalLink: {
      title: '1995 Motorola / Apple Proposal Letter',
      url: '#'
    }
  };

  safeVideoUrl: any;

  constructor(private titleService: Title, private metaService: Meta, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.investorsData.meta.title);
    this.metaService.updateTag({ name: 'description', content: this.investorsData.meta.description });
    this.metaService.updateTag({ name: 'keywords', content: this.investorsData.meta.keywords });

    // Sanitize the YouTube URL
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.investorsData.videoUrl);
  }
}
