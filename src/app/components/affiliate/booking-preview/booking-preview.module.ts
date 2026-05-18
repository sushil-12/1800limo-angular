import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { QuillModule } from 'ngx-quill';
import { BookingPreviewComponent } from './booking-preview.component';

@NgModule({
  declarations: [
    BookingPreviewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    GoogleMapsModule,
    QuillModule
  ],
  exports: [
    BookingPreviewComponent
  ]
})
export class BookingPreviewModule { }
