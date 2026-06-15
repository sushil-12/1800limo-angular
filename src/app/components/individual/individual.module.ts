import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IndividualRoutingModule } from './individual-routing.module';
import { IndividualTemplateComponent } from './individual-template/individual-template.component';
import { IndividualComponent } from './individual.component';

import { NgxSpinnerModule } from 'ngx-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatRadioModule } from '@angular/material/radio';
import { SharedModule } from '../shared/shared.module';
import { BookingPreviewModule } from '../affiliate/booking-preview/booking-preview.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { BookingsComponent } from './bookings/bookings.component';
import { ProfileComponent } from './profile/profile.component';
import { CreateNewBookingComponent } from './create-new-booking/create-new-booking.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { AddCardComponent } from './add-card/add-card.component';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary.component';
import { FamilyMembersComponent } from './family-members/family-members.component';
import { FamilyMemberAccountComponent } from './family-member-account/family-member-account.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { QuillModule } from 'ngx-quill';

@NgModule({
	declarations: [IndividualTemplateComponent, IndividualComponent, BookingsComponent, ProfileComponent, CreateNewBookingComponent, InvoiceComponent, AddCardComponent, InvoiceSummaryComponent, FamilyMembersComponent, FamilyMemberAccountComponent],
	imports: [
		CommonModule,
		IndividualRoutingModule,
		NgxSpinnerModule,
		MatProgressBarModule,
		FormsModule,
		ReactiveFormsModule,
		MatSlideToggleModule,
		GoogleMapsModule,
		MatNativeDateModule,
		MatDatepickerModule,
		MatMomentDateModule,
		MatInputModule,
		MatSelectModule,
		NgSelectModule,
		MatRadioModule,
		SharedModule,
		BookingPreviewModule,
		MatDialogModule,
		MatFormFieldModule,
		MatTabsModule,
		MatTableModule,
		MatExpansionModule,
		MatIconModule,
		ClipboardModule,
		NgxDaterangepickerMd.forRoot({
			separator: ' - ',
			applyLabel: 'Okay',
		}),
		QuillModule
	]
})
export class IndividualModule { }
