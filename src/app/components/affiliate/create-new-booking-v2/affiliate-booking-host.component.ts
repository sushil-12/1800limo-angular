import { Component } from '@angular/core';

console.log('AffiliateBookingHostComponent loaded');
/** Hosts the shared booking form in admin mode (route: admin/new-booking-v2). */
@Component({
    selector: 'app-affiliate-booking-host',
    template: `<app-booking mode="affiliate"></app-booking>`,
})
export class AffiliateBookingHostComponent { }
