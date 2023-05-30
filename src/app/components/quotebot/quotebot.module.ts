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


@NgModule({
	declarations: [
		QuotebotComponent,
		SelectVehicleComponent,
		FailedQuoteRequestComponent,
		FailedQuoteRequestConfirmationComponent,
		ReplacePipe,
		VehicleDetailsComponent,

	],

	imports: [
		CommonModule,
		SharedModule,
		QuotebotRoutingModule,
		NgxSpinnerModule
	]
})
export class QuotebotModule { }
