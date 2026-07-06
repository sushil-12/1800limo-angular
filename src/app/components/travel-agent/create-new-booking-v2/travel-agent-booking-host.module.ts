import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingSharedModule } from '../../shared/booking/booking-shared.module';
import { TravelAgentBookingHostComponent } from './travel-agent-booking-host.component';

/**
 * Isolates the host in its own scope so `app-booking` resolves to the shared
 * booking form. TravelAgentModule declares its own component with the same
 * `app-booking` selector (the bookings list), so importing BookingSharedModule
 * there directly would make the selector ambiguous (NG0300).
 */
@NgModule({
	declarations: [TravelAgentBookingHostComponent],
	imports: [CommonModule, BookingSharedModule],
	exports: [TravelAgentBookingHostComponent],
})
export class TravelAgentBookingHostModule { }
