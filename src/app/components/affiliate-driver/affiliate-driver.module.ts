import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AffiliateDriverRoutingModule } from './affiliate-driver-routing.module';
import { AffiliateDriverComponent } from './affiliate-driver.component';
import { AffiliateDriverTemplateComponent } from './affiliate-driver-template/affiliate-driver-template.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatRadioModule } from '@angular/material/radio';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { SharedModule } from '../shared/shared.module';
import { NgxPrintModule } from 'ngx-print';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GoogleMapsModule } from '@angular/google-maps';


@NgModule({
  declarations: [AffiliateDriverComponent, AffiliateDriverTemplateComponent, MyBookingsComponent],
  imports: [
    CommonModule,
    AffiliateDriverRoutingModule,
    NgxSpinnerModule,
		MatProgressBarModule,
		FormsModule,
		ReactiveFormsModule,
		MatSlideToggleModule,
		Ng2TelInputModule,
		GoogleMapsModule,
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
export class AffiliateDriverModule { }
