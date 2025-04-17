import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubTravelAgentRoutingModule } from './sub-travel-agent-routing.module';
import { SubTravelAgentComponent } from './sub-travel-agent.component';
import { SubTravelAgentTemplateComponent } from './sub-travel-agent-template/sub-travel-agent-template.component';
import { ProfileComponent } from './profile/profile.component';
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
import { GoogleMapsModule } from '@angular/google-maps';


@NgModule({
  declarations: [SubTravelAgentComponent, SubTravelAgentTemplateComponent, ProfileComponent],
  imports: [
    CommonModule,
    SubTravelAgentRoutingModule,
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
export class SubTravelAgentModule { }
