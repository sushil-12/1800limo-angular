import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserComponent } from './user.component';
import { AccountComponent } from './account/account.component';
import { MyBookingComponent } from './my-booking/my-booking.component';
import { CreateBookingComponent } from './create-booking/create-booking.component';
import { ReportsComponent } from './reports/reports.component';
import { UserManualComponent } from './user-manual/user-manual.component';
import { TermsComponent } from './terms/terms.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'account',
    pathMatch: 'full'
  },
  {
    path: 'account',
    component:AccountComponent
  },
  {
    path: 'my-bookings',
    component:MyBookingComponent
  },
  {
    path: 'create-booking',
    component:CreateBookingComponent
  },
  {
    path: 'reports',
    component:ReportsComponent
  },
  {
    path: 'user-manual',
    component:UserManualComponent
  },
  {
    path: 'terms',
    component:TermsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
