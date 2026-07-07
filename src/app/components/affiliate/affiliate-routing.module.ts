import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AffiliateStepsGuard } from '../../guards/affiliate-steps.guard';
import { AffiliateOtherRouteGuard } from '../../guards/affiliate-other-route.guard';
import { AccountStatusComponent } from './account-status/account-status.component';
import { AddCardComponent } from './add-card/add-card.component';
import { AddDriverFromAffiliateComponent } from './add-driver-from-affiliate/add-driver-from-affiliate.component';
import { AddVehicleFromAffiliateComponent } from './add-vehicle-from-affiliate/add-vehicle-from-affiliate.component';
import { AddVehicleRatesFromAffiliateComponent } from './add-vehicle-rates-from-affiliate/add-vehicle-rates-from-affiliate.component';

import { AffiliateComponent } from './affiliate.component';
import { CreateNewBookingComponent } from './create-new-booking/create-new-booking.component';
import { DuplicateVehicleRatesComponent } from './duplicate-vehicle-rates/duplicate-vehicle-rates.component';
import { DuplicateVehicleComponent } from './duplicate-vehicle/duplicate-vehicle.component';
import { EditVehicleRatesFromAffiliateComponent } from './edit-vehicle-rates-from-affiliate/edit-vehicle-rates-from-affiliate.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { ProfileComponent } from './profile/profile.component';
import { Step0Component } from './step0/step0.component';
import { Step1Component } from './step1/step1.component';
import { Step2Component } from './step2/step2.component';
import { Step3Component } from './step3/step3.component';
import { Step4Component } from './step4/step4.component';
import { Step5Component } from './step5/step5.component';
import { Step6Component } from './step6/step6.component';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary.component';
import { FarmOutComponent } from './farm-out/farm-out.component';
import { VehicleRateSettingsComponent } from './vehicle-rate-settings/vehicle-rate-settings.component';
import { AffiliateFinalizeComponent } from './affiliate-finalize/affiliate-finalize.component';
import { NewBookingComponent } from './new-booking/new-booking.component';
import { AddSubAffiliateComponent } from './add-sub-affiliate/add-sub-affiliate.component';
import { SubAffiliateAccountsComponent } from './sub-affiliate-accounts/sub-affiliate-accounts.component';
import { AffiliateBookingHostComponent } from './create-new-booking-v2/affiliate-booking-host.component';

const routes: Routes = [
	{
		path: 'profile',
		canActivate: [AffiliateOtherRouteGuard],
		component: ProfileComponent
	},
	{
		path: '',
		redirectTo: 'step0',
		pathMatch: 'full'
	},
	{
		path: 'step0',
		canActivate: [AffiliateStepsGuard],
		component: Step0Component
	},
	{
		path: 'step1',
		canActivate: [AffiliateStepsGuard],
		component: Step1Component
	},
	{
		path: 'step2',
		canActivate: [AffiliateStepsGuard],
		component: Step2Component
	},
	{
		path: 'step2/add-card',
		component: AddCardComponent
	},
	{
		path: 'step3',
		canActivate: [AffiliateStepsGuard],
		component: Step3Component
	},
	{
		path: 'step4',
		canActivate: [AffiliateStepsGuard],
		component: Step4Component
	},
	{
		path: 'step4/add-driver',
		canActivate: [AffiliateStepsGuard],
		component: AddDriverFromAffiliateComponent
	},
	{
		path: 'step5',
		canActivate: [AffiliateStepsGuard],
		component: Step5Component
	},
	{
		path: 'step5/add-vehicle',
		canActivate: [AffiliateStepsGuard],
		component: AddVehicleFromAffiliateComponent
	},
	{
		path: 'step5/add-vehicle-rates',
		canActivate: [AffiliateStepsGuard],
		component: VehicleRateSettingsComponent
	},
	{
		path: 'step5/edit-vehicle',
		canActivate: [AffiliateStepsGuard],
		component: AddVehicleFromAffiliateComponent
	},
	{
		path: 'step5/edit-vehicle-rates',
		canActivate: [AffiliateStepsGuard],
		component: VehicleRateSettingsComponent
	},
	{
		path: 'step5/duplicate-vehicle',
		canActivate: [AffiliateStepsGuard],
		component: AddVehicleFromAffiliateComponent
	},
	{
		path: 'step5/duplicate-vehicle-rates',
		canActivate: [AffiliateStepsGuard],
		component: VehicleRateSettingsComponent
	},
	{
		path: 'step6',
		canActivate: [AffiliateStepsGuard],
		component: Step6Component
	},
	{
		path: 'my-bookings',
		canActivate: [AffiliateOtherRouteGuard],
		component: MyBookingsComponent
	},
	{
		path: 'farm-out',
		component: FarmOutComponent
	},
	{
		path: 'create-new-booking',
		canActivate: [AffiliateOtherRouteGuard],
		component: CreateNewBookingComponent
	},
	{
		path: 'new-booking',
		canActivate: [AffiliateOtherRouteGuard],
		component: NewBookingComponent
	},
	{
		path: 'create-new-booking-v2',
		canActivate: [AffiliateOtherRouteGuard],
		component: AffiliateBookingHostComponent,
	},
	{
		path: 'invoice-summary',
		canActivate: [AffiliateOtherRouteGuard],
		component: InvoiceSummaryComponent
	},
	{
		path: 'account-status',
		canActivate: [AffiliateOtherRouteGuard],
		component: AccountStatusComponent
	},
	{
		path: 'finalize-booking',
		canActivate: [AffiliateOtherRouteGuard],
		component: AffiliateFinalizeComponent
	},
	{
		path: 'add-sub-affiliate',
		canActivate: [AffiliateOtherRouteGuard],
		component: AddSubAffiliateComponent
	},
	{
		path: 'edit-sub-affiliate',
		canActivate: [AffiliateOtherRouteGuard],
		component: AddSubAffiliateComponent
	},
	{
		path: 'sub-affiliate-accounts',
		canActivate: [AffiliateOtherRouteGuard],
		component: SubAffiliateAccountsComponent
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AffiliateRoutingModule { }
