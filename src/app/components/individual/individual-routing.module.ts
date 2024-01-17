import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndividualGuardGuard } from '../../guards/individual-guard.guard'
import { BookingsComponent } from './bookings/bookings.component';
import { ProfileComponent } from './profile/profile.component';
import { CreateNewBookingComponent } from './create-new-booking/create-new-booking.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { AddCardComponent } from './add-card/add-card.component';

const routes: Routes = [
  {
		path: '',
		redirectTo: 'home',
		pathMatch: 'full'
	},
  {
    path:'bookings',
    component:BookingsComponent,
    canActivate: [IndividualGuardGuard],
  },
  {
    path:'profile',
    component:ProfileComponent,
    // canActivate: [IndividualGuardGuard],
  },
  {
    path:'create-new-booking',
    component:CreateNewBookingComponent,
    canActivate: [IndividualGuardGuard],
  },
  {
    path:'invoice',
    component:InvoiceComponent,
    canActivate: [IndividualGuardGuard],
  },
  {
    path:'add-card',
    component:AddCardComponent,
    canActivate: [IndividualGuardGuard],
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndividualRoutingModule { }
