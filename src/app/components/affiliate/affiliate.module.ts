import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//material
import { NgxSpinnerModule } from "ngx-spinner";
import { MatProgressBarModule } from '@angular/material/progress-bar';
//
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule, MomentDateAdapter } from "@angular/material-moment-adapter";
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
// import { InvalidControlScrollDirective } from '../../directives/scroll-to-invalid.directive';
// import { PinchZoomModule } from 'ngx-pinch-zoom';
import { SharedModule } from '../shared/shared.module';

import { AffiliateRoutingModule } from './affiliate-routing.module';
import { AffiliateComponent } from './affiliate.component';
import { AffiliateTemplateComponent } from './affiliate-template/affiliate-template.component';
import { Step0Component } from './step0/step0.component';
import { Step1Component } from './step1/step1.component';
import { Step2Component } from './step2/step2.component';
import { Step3Component } from './step3/step3.component';
import { Step4Component } from './step4/step4.component';
import { Step5Component } from './step5/step5.component';
import { Step6Component } from './step6/step6.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddDriverFromAffiliateComponent } from './add-driver-from-affiliate/add-driver-from-affiliate.component';
import { AddVehicleFromAffiliateComponent } from './add-vehicle-from-affiliate/add-vehicle-from-affiliate.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { AdminModule } from '../admin/admin.module';
import { CreateNewBookingComponent } from './create-new-booking/create-new-booking.component';
import { CreateNewBookingDetailComponent } from './create-new-booking-detail/create-new-booking-detail.component';
import { EditVehicleFromAffiliateComponent } from './edit-vehicle-from-affiliate/edit-vehicle-from-affiliate.component';
import { EditVehicleRatesFromAffiliateComponent } from './edit-vehicle-rates-from-affiliate/edit-vehicle-rates-from-affiliate.component';
import { AddVehicleRatesFromAffiliateComponent } from './add-vehicle-rates-from-affiliate/add-vehicle-rates-from-affiliate.component';
import { DuplicateVehicleComponent } from './duplicate-vehicle/duplicate-vehicle.component';
import { DuplicateVehicleRatesComponent } from './duplicate-vehicle-rates/duplicate-vehicle-rates.component';
import { AccountStatusComponent } from './account-status/account-status.component';
import { AddCardComponent } from './add-card/add-card.component';
import { ProfileComponent } from './profile/profile.component';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary.component';
import { FarmOutComponent } from './farm-out/farm-out.component';
import { VehicleRateSettingsComponent } from './vehicle-rate-settings/vehicle-rate-settings.component';
import { VehicleSettingsComponent } from './vehicle-settings/vehicle-settings.component';

@NgModule({
	declarations: [
		AffiliateComponent,
		AffiliateTemplateComponent,
		Step0Component,
		Step1Component,
		Step2Component,
		Step3Component,
		Step4Component,
		Step5Component,
		Step6Component,
		AddDriverFromAffiliateComponent,
		AddVehicleFromAffiliateComponent,
		MyBookingsComponent,
		CreateNewBookingComponent,
		CreateNewBookingDetailComponent,
		EditVehicleFromAffiliateComponent,
		EditVehicleRatesFromAffiliateComponent,
		AddVehicleRatesFromAffiliateComponent,
		DuplicateVehicleComponent,
		DuplicateVehicleRatesComponent,
		AccountStatusComponent,
		AddCardComponent,
		ProfileComponent,
		InvoiceSummaryComponent,
		FarmOutComponent,
		VehicleRateSettingsComponent,
		VehicleSettingsComponent
	],
	imports: [
		CommonModule,
		AffiliateRoutingModule,
		NgxSpinnerModule,
		MatProgressBarModule,
		FormsModule,
		ReactiveFormsModule,
		MatSlideToggleModule,
		Ng2TelInputModule,
		AdminModule,
		AgmCoreModule,
		AgmDirectionModule,
		MatNativeDateModule,
		MatMomentDateModule,
		MatInputModule,
		MatSelectModule,
		// PinchZoomModule,
		SharedModule
	]
})
export class AffiliateModule { }
