import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuotebotRoutingModule } from './quotebot-routing.module';
import { QuotebotComponent } from './quotebot.component';
import { SelectVehicleComponent } from './select-vehicle/select-vehicle.component';
import { FailedQuoteRequestComponent } from './failed-quote-request/failed-quote-request.component';
import { FailedQuoteRequestConfirmationComponent } from '../email_templates/failed-quote-request-confirmation/failed-quote-request-confirmation.component';
import { ReplacePipe } from '../../pipes/replace.pipe';
import { VehicleDetailsComponent } from './vehicle-details/vehicle-details.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from '../shared/shared.module';
import { MasterVehicleComponent } from './master-vehicle/master-vehicle.component';
import { NewBookingComponent } from './new-booking/new-booking.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { NgSelectModule } from '@ng-select/ng-select';
import { AdminRoutingModule } from '../admin/admin-routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GoogleMapsModule } from '@angular/google-maps';


@NgModule({
	declarations: [
		QuotebotComponent,
		SelectVehicleComponent,
		FailedQuoteRequestComponent,
		FailedQuoteRequestConfirmationComponent,
		ReplacePipe,
		VehicleDetailsComponent,
		MasterVehicleComponent,
		NewBookingComponent,

	],

	imports: [
		CommonModule,
		SharedModule,
		QuotebotRoutingModule,
		NgxSpinnerModule,
		FormsModule,
		ReactiveFormsModule,
		MatNativeDateModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatRadioModule,
		NgSelectModule,
		MatDialogModule,
		MatProgressBarModule,
		MatSlideToggleModule,
		GoogleMapsModule
	]
})
export class QuotebotModule { }
