import { Component, OnInit } from '@angular/core';
import { Title, Meta, DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-insurance-licensing',
  templateUrl: './insurance-licensing.component.html',
  styleUrls: ['./insurance-licensing.component.scss']
})
export class InsuranceLicensingComponent implements OnInit {

  insuranceData = {
    meta: {
      title: 'Insurance & Licensing | 1-800-LIMO.COM',
      description: 'Insurance & Licensing information for Passenger Carriers in the U.S. and Canada.',
      keywords: 'insurance, licensing, passenger carriers, US, Canada'
    },
    badge: {
      iconClass: 'bi bi-shield-check',
      text: 'Insurance & Licensing'
    },
    title: 'Insurance & Licensing',
    lastUpdated: '',
    description: 'For Passenger Carriers in the U.S. and Canada',
    sections: [
      {
        iconClass: 'bi bi-info-circle',
        title: 'OVERVIEW',
        content: `
          <p>All charter bus operators that are 1-800-LIMO.COM affiliate will be able to provide appropriate licensing
          and insurance information upon request. The documents can be a .PDF or fax.</p>
        `
      },
      {
        iconClass: 'bi bi-exclamation-triangle',
        title: 'IMPORTANT',
        content: `
          <p>USA INTERSTATE operators can cross state lines; USA INTRASTATE operators cannot leave the state. Canadian
          operators have different guidelines.</p>
        `
      },
      {
        iconClass: 'bi bi-signpost-split',
        title: 'USA Interstate Operators',
        content: `
          <p>Passenger carrier operating authority and licensing and insurance requirements in the United States are
          authorized by the Federal Motor Carrier Safety Administration (FMCSA). Each operator must register a
          USDOT number and obtain a minimum of $5 million insurance. Limo, Taxi and Gig drivers are required to
          have a minimum $300,000 policy. 1-800-LIMO.COM will offer an additional $1 Million rider policy while
          the client is being transported by one or those drivers. The Operating Authority Guide includes an overview of licensing and insurance requirements, including safety
          results and other aspects of the FMCSA’s SAFER Company Snapshot.</p>
        `
      },
      {
        iconClass: 'bi bi-map',
        title: 'USA Intrastate Operators',
        content: `
          <p>Intrastate operators may not require a USDOT registration. The FMCSA provides information state which
          states are exempt from a USDOT registration.</p>
        `
      },
      {
        iconClass: 'bi bi-globe',
        title: 'Canada Passenger Operators',
        content: `
          <p>Each Canadian Province or Territory regulates licensing and insurance for each passenger carrier.
          Depending on provincial regulations, some Canadian operators are only permitted to pick up groups to and
          from specific areas where permits allow.</p>
          <p>A Carrier Abstract can be requested from the operator or governing department of operator regarding the
          safety record of that Canadian company. The below links will state each province and territories
          transportation departments statistics.</p>
        `
      },
      {
        iconClass: 'bi bi-link-45deg',
        title: 'Province and Territory Transportation Links',
        isLinksSection: true,
        links: [
          { title: 'Alberta Transportation', url: 'http://www.transportation.alberta.ca/' },
          { title: 'British Columbia Ministry of Transportation and Infrastructure', url: 'http://www.gov.bc.ca/tran/' },
          { title: 'Manitoba Infrastructure and Transportation', url: 'http://www.gov.mb.ca/mit/' },
          { title: 'New Brunswick Transportation and Infrastructure', url: 'http://www2.gnb.ca/content/gnb/en/departments/dti.html' },
          { title: 'Newfoundland Department of Transportation and Works', url: 'http://www.tw.gov.nl.ca/' },
          { title: 'Nova Scotia Transportation and Infrastructure', url: 'http://novascotia.ca/tran/' },
          { title: 'Nunavut Department of Economic Development and Transportation', url: 'http://www.edt.gov.nu.ca/' },
          { title: 'Ontario Ministry of Transportation', url: 'http://www.mto.gov.on.ca/' },
          { title: 'Prince Edward Island Transportation and Infrastructure', url: 'http://www.gov.pe.ca/tir/' },
          { title: 'Saskatchewan SGI', url: 'http://www.sgi.sk.ca/' },
          { title: 'Yukon Highways and Public Works', url: 'http://www.hpw.gov.yk.ca/trans/transportservices/index.html' }
        ]
      },
      {
        iconClass: 'bi bi-headset',
        title: 'Contact Us',
        content: `
          <p>Call or click If you have any other questions regarding licensing, insurance or operating authority.</p>
          <p>Contact 1-800-LIMO.COM at +1-800-546.266 or info&#64;1800limo.com</p>
        `
      }
    ]
  };

  safeSections: any[] = [];

  constructor(private titleService: Title, private metaService: Meta, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.insuranceData.meta.title);
    this.metaService.updateTag({ name: 'description', content: this.insuranceData.meta.description });
    this.metaService.updateTag({ name: 'keywords', content: this.insuranceData.meta.keywords });

    // Sanitize the HTML content
    this.safeSections = this.insuranceData.sections.map((section: any) => ({
      ...section,
      safeContent: section.content ? this.sanitizer.bypassSecurityTrustHtml(section.content) : null
    }));
  }
}
