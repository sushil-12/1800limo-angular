import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { QuillModule } from 'ngx-quill';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { GoogleMapsModule } from '@angular/google-maps';

import { SharedModule } from '../shared.module';
import { BookingComponent } from './booking.component';
import { RatesFormComponent } from '../../admin/rates-form/rates-form.component';

/**
 * Shared booking form used by both the admin portal (admin/new-booking-v2)
 * and the individual portal (individual/create-new-booking-v2).
 * The BookingComponent is a verbatim clone of admin/new-booking with a
 * `mode` input gating accounts/affiliate sections and API selection.
 */
@NgModule({
	declarations: [
		BookingComponent,
		RatesFormComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		NgxSpinnerModule,
		NgSelectModule,
		QuillModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatRadioModule,
		MatDialogModule,
		GoogleMapsModule,
		SharedModule,
	],
	exports: [
		BookingComponent,
		RatesFormComponent,
	],
})
export class BookingSharedModule { }
