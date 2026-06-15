import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//material
import { NgxSpinnerModule } from "ngx-spinner";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';

//

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
// import { InvalidControlScrollDirective } from '../../directives/scroll-to-invalid.directive';
// import { PinchZoomModule } from 'ngx-pinch-zoom';
import { SharedModule } from '../shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
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
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { AdminModule } from '../admin/admin.module';
import { CreateNewBookingComponent } from './create-new-booking/create-new-booking.component';
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
import { AffiliateFinalizeComponent } from './affiliate-finalize/affiliate-finalize.component';
import { AffiliateFinalizeRatesComponent } from './affiliate-finalize-rates/affiliate-finalize-rates.component';
import { NewBookingComponent } from './new-booking/new-booking.component';
import { RatesFormsComponent } from './rates-forms/rates-forms.component';
import { AddSubAffiliateComponent } from './add-sub-affiliate/add-sub-affiliate.component';
import { SubAffiliateAccountsComponent } from './sub-affiliate-accounts/sub-affiliate-accounts.component';
import { BookingPreviewModule } from './booking-preview/booking-preview.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { QuillModule } from 'ngx-quill';
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
		AffiliateFinalizeComponent,
		AffiliateFinalizeRatesComponent,
		NewBookingComponent,
		RatesFormsComponent,
		AddSubAffiliateComponent,
		SubAffiliateAccountsComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatSlideToggleModule,
		GoogleMapsModule,
		MatNativeDateModule,
		MatMomentDateModule,
		MatInputModule,
		MatSelectModule,
		NgSelectModule,
		MatRadioModule,
		SharedModule,
		MatDialogModule,
		MatFormFieldModule,
		MatIconModule,
		MatButtonModule,
		MatDatepickerModule,
		MatCheckboxModule,
		MatProgressBarModule,
		AffiliateRoutingModule,
		NgxSpinnerModule,
		AdminModule,
		BookingPreviewModule,
		NgxDaterangepickerMd.forRoot({
			separator: ' - ',
			applyLabel: 'Okay',
		}),
		QuillModule
	],
	providers: [],
	exports: [
		MatDatepickerModule,
		MatFormFieldModule,
		MatInputModule,
		MatIconModule,
		MatButtonModule,
		MatCheckboxModule,
		MyBookingsComponent,
		FarmOutComponent,
		CreateNewBookingComponent,
		NewBookingComponent,
		AffiliateFinalizeComponent,
		InvoiceSummaryComponent,
		ProfileComponent
	]
})
export class AffiliateModule { }
