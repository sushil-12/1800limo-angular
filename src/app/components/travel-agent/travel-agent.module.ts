import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TravelAgentRoutingModule } from './travel-agent-routing.module';
import { TravelAgentComponent } from './travel-agent.component';
import { BookingComponent } from './booking/booking.component';
import { AgentTemplateComponent } from './agent-template/agent-template.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatRadioModule } from '@angular/material/radio';
import { SharedModule } from '../shared/shared.module';
import { NgxPrintModule } from 'ngx-print';
import { ProfileComponent } from './profile/profile.component';
import { CreateBookingComponent } from './create-booking/create-booking.component';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { CardsComponent } from './cards/cards.component';
import { AddCardComponent } from './add-card/add-card.component';
import { InvoiceDashComponent } from './invoice-dash/invoice-dash.component';
import { InvoiceDashSummaryComponent } from './invoice-dash-summary/invoice-dash-summary.component';
import { StripeFormComponent } from './stripe-form/stripe-form.component';
import { TravelAgentStepsTemplateComponent } from './travel-agent-steps-template/travel-agent-steps-template.component';
import { RatesFormTaComponent } from './rates-form-ta/rates-form-ta.component';


@NgModule({
	declarations: [
		TravelAgentComponent,
		BookingComponent,
		AgentTemplateComponent,
		ProfileComponent,
		CreateBookingComponent,
		CardsComponent,
		AddCardComponent,
		InvoiceDashComponent,
		InvoiceDashSummaryComponent,
		StripeFormComponent,
		TravelAgentStepsTemplateComponent,
		RatesFormTaComponent],
	imports: [
		CommonModule,
		TravelAgentRoutingModule,
		NgxSpinnerModule,
		MatProgressBarModule,
		FormsModule,
		ReactiveFormsModule,
		MatSlideToggleModule,
		Ng2TelInputModule,
		AgmCoreModule,
		AgmDirectionModule,
		MatNativeDateModule,
		MatMomentDateModule,
		MatInputModule,
		MatSelectModule,
		NgSelectModule,
		MatRadioModule,
		PinchZoomModule,
		SharedModule,
		NgxPrintModule,
		MatDialogModule,
		MatFormFieldModule,
		MatTabsModule,
		MatTableModule,
		MatExpansionModule,
		MatIconModule
	]
})
export class TravelAgentModule { }
