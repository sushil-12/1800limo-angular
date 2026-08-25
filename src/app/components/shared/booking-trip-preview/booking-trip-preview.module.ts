import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { QuillModule } from 'ngx-quill';
import { BookingTripPreviewComponent } from './booking-trip-preview.component';

/**
 * Receipt preview used by the shared booking form. Same layout as the affiliate
 * booking-preview, but a round trip is split across one tab per leg instead of
 * stacking the return sections underneath the outbound ones.
 */
@NgModule({
  declarations: [
    BookingTripPreviewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    GoogleMapsModule,
    QuillModule
  ],
  exports: [
    BookingTripPreviewComponent
  ]
})
export class BookingTripPreviewModule { }
