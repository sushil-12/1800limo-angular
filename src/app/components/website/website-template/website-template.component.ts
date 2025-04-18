import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-website-template',
  templateUrl: './website-template.component.html',
  styleUrls: ['./website-template.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class WebsiteTemplateComponent implements OnInit {
  currentRoute: string = '';
  excludedRoutes: string[] = ['/subscription', '/partner-registration', '/payment-details']

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url;
      }
    });
  }

  isExcludedRoute(): boolean {
    return this.excludedRoutes.includes(this.currentRoute);
  }

  ngOnInit(): void {
  }

}
