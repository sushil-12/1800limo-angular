import { QuotebotComponent } from './quotebot.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelectVehicleComponent } from './select-vehicle/select-vehicle.component';
import { FailedQuoteRequestComponent } from './failed-quote-request/failed-quote-request.component';
import { VehicleDetailsComponent } from './vehicle-details/vehicle-details.component';
import { MasterVehicleComponent } from './master-vehicle/master-vehicle.component';
import { NewBookingComponent } from './new-booking/new-booking.component';
import { GuestBookingHostComponent } from './new-booking-v2/guest-booking-host.component';
import { BookingConfirmationComponent } from './booking-confirmation/booking-confirmation.component';

const routes: Routes = [
	{
		path: 'select-vehicle',
		component: SelectVehicleComponent
	},
	{
		path: 'master-vehicle',
		component: MasterVehicleComponent
	},
	{
		path: 'vehicle-details',
		component: VehicleDetailsComponent
	},
	{
		path: 'failed-quote-request',
		component: FailedQuoteRequestComponent
	},
	{
		// legacy standalone guest form — superseded by new-booking-v2, retire once verified
		path: 'new-booking',
		component: NewBookingComponent
	},
	{
		path: 'new-booking-v2',
		component: GuestBookingHostComponent
	},
	{
		path: 'booking-confirmation',
		component: BookingConfirmationComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class QuotebotRoutingModule { }
