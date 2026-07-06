import { Component } from '@angular/core';

/** Hosts the shared booking form in travel agent mode (route: {role}/create-new-booking-v2). */
@Component({
    selector: 'app-travel-agent-booking-host',
    template: `<app-booking mode="travel-agent"></app-booking>`,
})
export class TravelAgentBookingHostComponent { }