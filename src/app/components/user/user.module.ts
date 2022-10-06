import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { AccountComponent } from './account/account.component';
import { MyBookingComponent } from './my-booking/my-booking.component';
import { CreateBookingComponent } from './create-booking/create-booking.component';
import { ReportsComponent } from './reports/reports.component';
import { UserManualComponent } from './user-manual/user-manual.component';
import { TermsComponent } from './terms/terms.component';


@NgModule({
  declarations: [UserComponent, AccountComponent, MyBookingComponent, CreateBookingComponent, ReportsComponent, UserManualComponent, TermsComponent],
  imports: [
    CommonModule,
    UserRoutingModule
  ]
})
export class UserModule { }
