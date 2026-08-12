import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingSharedModule } from '../../shared/booking/booking-shared.module';
import { GuestBookingHostComponent } from './guest-booking-host.component';

/**
 * Isolates the host in its own scope so `app-booking` resolves to the shared
 * booking form, matching the affiliate/travel-agent host modules.
 */
@NgModule({
	declarations: [GuestBookingHostComponent],
	imports: [CommonModule, BookingSharedModule],
	exports: [GuestBookingHostComponent],
})
export class GuestBookingHostModule { }
