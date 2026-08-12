import { Component } from '@angular/core';

/** Hosts the shared booking form for unregistered visitors (route: quotebot/new-booking-v2). */
@Component({
	selector: 'app-guest-booking-host',
	template: `<app-booking mode="guest"></app-booking>`,
})
export class GuestBookingHostComponent { }
