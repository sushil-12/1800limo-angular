import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubAffiliateRoutingModule } from './sub-affiliate-routing.module';
import { SubAffiliateTemplateComponent } from './sub-affiliate-template/sub-affiliate-template.component';
import { SubAffiliateComponentComponent } from './sub-affiliate-component.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatRadioModule } from '@angular/material/radio';
import { SharedModule } from '../shared/shared.module';
import { NgxPrintModule } from 'ngx-print';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { ProfileComponent } from './profile/profile.component';
import { GoogleMapsModule } from '@angular/google-maps';



@NgModule({
  declarations: [SubAffiliateComponentComponent, SubAffiliateTemplateComponent, ProfileComponent],
  imports: [
    CommonModule,
    SubAffiliateRoutingModule,
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
export class SubAffiliateModule { }
