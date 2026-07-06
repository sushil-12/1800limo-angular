import { Component } from '@angular/core';

/** Hosts the shared booking form in admin mode (route: admin/new-booking-v2). */
@Component({
	selector: 'app-admin-booking-host',
	template: `<app-booking mode="admin"></app-booking>`,
})
export class AdminBookingHostComponent { }
