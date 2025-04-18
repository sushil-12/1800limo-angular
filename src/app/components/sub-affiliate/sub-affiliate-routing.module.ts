import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SubAffiliateGuard } from '../../guards/sub-affiliate.guard'
import { MyBookingsComponent } from '../affiliate/my-bookings/my-bookings.component';
import { ProfileComponent } from './profile/profile.component';
import { CreateNewBookingComponent } from '../affiliate/create-new-booking/create-new-booking.component';

import { AffiliateFinalizeComponent } from '../affiliate/affiliate-finalize/affiliate-finalize.component';
import { FarmOutComponent } from '../affiliate/farm-out/farm-out.component';
import { InvoiceSummaryComponent } from '../affiliate/invoice-summary/invoice-summary.component';
import { NewBookingComponent } from '../affiliate/new-booking/new-booking.component';


const routes: Routes = [
	{
		path: '',
		redirectTo: '/home',
		pathMatch: 'full'
	},
	{
		path: 'profile',
		component: ProfileComponent,
		// canActivate: [SubTravelAgentGuardGuard],
	},
	{
		path: 'my-bookings',
		canActivate: [SubAffiliateGuard],
		component: MyBookingsComponent
	},
	{
		path: 'farm-out',
		component: FarmOutComponent
	},
	{
		path: 'create-new-booking',
		canActivate: [SubAffiliateGuard],
		component: CreateNewBookingComponent
	},
	{
		path: 'new-booking',
		canActivate: [SubAffiliateGuard],
		component: NewBookingComponent
	},
	{
		path: 'finalize-booking',
		canActivate: [SubAffiliateGuard],
		component: AffiliateFinalizeComponent
	},
	{
		path: 'invoice-summary',
		canActivate: [SubAffiliateGuard],
		component: InvoiceSummaryComponent
	},

];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SubAffiliateRoutingModule { }
