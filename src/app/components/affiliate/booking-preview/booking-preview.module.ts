import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { BookingPreviewComponent } from './booking-preview.component';

@NgModule({
  declarations: [
    BookingPreviewComponent
  ],
  imports: [
    CommonModule,
    GoogleMapsModule
  ],
  exports: [
    BookingPreviewComponent
  ]
})
export class BookingPreviewModule { }
