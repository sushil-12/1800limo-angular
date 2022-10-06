import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentByEmailRoutingModule } from './payment-by-email-routing.module';
import { PaymentByEmailComponent } from './payment-by-email.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [PaymentByEmailComponent],
  imports: [
    CommonModule,
    PaymentByEmailRoutingModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PaymentByEmailModule { }
