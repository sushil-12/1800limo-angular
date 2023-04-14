import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AffiliateStepsGuard } from 'src/app/guards/affiliate-steps.guard';
import { AffiliateOtherRouteGuard } from 'src/app/guards/affiliate-other-route.guard';
import { AccountStatusComponent } from './account-status/account-status.component';
import { AddCardComponent } from './add-card/add-card.component';
import { AddDriverFromAffiliateComponent } from './add-driver-from-affiliate/add-driver-from-affiliate.component';
import { AddVehicleFromAffiliateComponent } from './add-vehicle-from-affiliate/add-vehicle-from-affiliate.component';
import { AddVehicleRatesFromAffiliateComponent } from './add-vehicle-rates-from-affiliate/add-vehicle-rates-from-affiliate.component';

import { AffiliateComponent } from './affiliate.component';
import { CreateNewBookingDetailComponent } from './create-new-booking-detail/create-new-booking-detail.component';
import { CreateNewBookingComponent } from './create-new-booking/create-new-booking.component';
import { DuplicateVehicleRatesComponent } from './duplicate-vehicle-rates/duplicate-vehicle-rates.component';
import { DuplicateVehicleComponent } from './duplicate-vehicle/duplicate-vehicle.component';
import { EditVehicleFromAffiliateComponent } from './edit-vehicle-from-affiliate/edit-vehicle-from-affiliate.component';
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
		component: EditVehicleFromAffiliateComponent
	},
	{
		path: 'step5/edit-vehicle-rates',
		canActivate: [AffiliateStepsGuard],
		component: VehicleRateSettingsComponent
	},
	{
		path: 'step5/duplicate-vehicle',
		canActivate: [AffiliateStepsGuard],
		component: DuplicateVehicleComponent
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
		path: 'create-new-booking-detail',
		canActivate: [AffiliateOtherRouteGuard],
		component: CreateNewBookingDetailComponent
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
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AffiliateRoutingModule { }
