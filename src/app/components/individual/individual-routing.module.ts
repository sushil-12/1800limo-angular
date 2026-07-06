import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndividualGuardGuard } from '../../guards/individual-guard.guard'
import { IndvOtherGuardGuard } from '../../guards/indv-other-guard.guard'
import { BookingsComponent } from './bookings/bookings.component';
import { ProfileComponent } from './profile/profile.component';
import { CreateNewBookingComponent } from './create-new-booking/create-new-booking.component';
import { IndividualBookingHostComponent } from './create-new-booking-v2/individual-booking-host.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { AddCardComponent } from './add-card/add-card.component';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary.component';
import { FamilyMembersComponent } from './family-members/family-members.component';
import { FamilyMemberAccountComponent } from './family-member-account/family-member-account.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'bookings',
    pathMatch: 'full'
  },
  {
    path: 'bookings',
    component: BookingsComponent,
    canActivate: [IndividualGuardGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [IndvOtherGuardGuard],
  },
  {
    path: 'create-new-booking',
    component: CreateNewBookingComponent,
    canActivate: [IndividualGuardGuard],
  },
  {
    path: 'create-new-booking-v2',
    component: IndividualBookingHostComponent,
    canActivate: [IndividualGuardGuard],
  },
  {
    path: 'invoice',
    component: InvoiceComponent,
    canActivate: [IndividualGuardGuard],
  },
  {
    path: 'invoice-summary',
    component: InvoiceSummaryComponent,
    canActivate: [IndividualGuardGuard],
  },
  {
    path: 'add-card',
    component: AddCardComponent,
    canActivate: [IndividualGuardGuard],
  },
  {
    path: 'family-members',
    component: FamilyMembersComponent,
    canActivate: [IndividualGuardGuard],
  },
  {
    path: 'add-family-member',
    component: FamilyMemberAccountComponent,
    canActivate: [IndividualGuardGuard],
  }, {
    path: 'edit-family-member',
    component: FamilyMemberAccountComponent,
    canActivate: [IndividualGuardGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndividualRoutingModule { }
