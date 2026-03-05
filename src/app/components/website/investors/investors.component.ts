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
      image: 'assets/images/new-founder.jpg', // Using an existing image asset
      text: [
        'Experienced Marketing Officer and Brand Strategist with over four decades as a small business owner, specializing in brand strategy, growth planning, and long-term business success.',
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

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: this.investorsData.meta.title });
    this.metaService.updateTag({ property: 'og:description', content: this.investorsData.meta.description });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: '1-800-LIMO.COM' });

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: this.investorsData.meta.title });
    this.metaService.updateTag({ name: 'twitter:description', content: this.investorsData.meta.description });

    // Sanitize the YouTube URL
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.investorsData.videoUrl);
  }
}
