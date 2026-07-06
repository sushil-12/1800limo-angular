import { Component } from '@angular/core';

/** Hosts the shared booking form in individual mode (route: {role}/create-new-booking-v2). */
@Component({
	selector: 'app-individual-booking-host',
	template: `<app-booking mode="individual"></app-booking>`,
})
export class IndividualBookingHostComponent { }
