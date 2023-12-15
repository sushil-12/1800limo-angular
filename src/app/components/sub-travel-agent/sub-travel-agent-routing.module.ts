import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { BookingComponent } from '../travel-agent/booking/booking.component';
import { CreateBookingComponent } from '../travel-agent/create-booking/create-booking.component';
import { InvoiceDashComponent } from '../travel-agent/invoice-dash/invoice-dash.component';
import { InvoiceDashSummaryComponent } from '../travel-agent/invoice-dash-summary/invoice-dash-summary.component';
import { TravelClientAccountsComponent } from '../travel-agent/travel-client-accounts/travel-client-accounts.component';
import { AddClientAccountComponent } from '../travel-agent/add-client-account/add-client-account.component';
import { SubTravelAgentGuardGuard } from '../../guards/sub-travel-agent-guard.guard'
import { CardsComponent } from '../travel-agent/cards/cards.component';
import { AddCardComponent } from '../travel-agent/add-card/add-card.component';

const routes: Routes = [
  {
		path: '',
		redirectTo: '/home',
		pathMatch: 'full'
	},
  {
    path:'profile',
    component:ProfileComponent,
    // canActivate: [SubTravelAgentGuardGuard],
  },
  {
    path:'bookings',
    component:BookingComponent,
    canActivate: [SubTravelAgentGuardGuard],
  },
  {
    path:'create-new-booking',
    component:CreateBookingComponent,
    canActivate: [SubTravelAgentGuardGuard],
  },
  {
    path:'new-booking',
    component:CreateBookingComponent,
    canActivate: [SubTravelAgentGuardGuard],
  },
  {
    path:'invoices',
    component:InvoiceDashComponent,
    canActivate: [SubTravelAgentGuardGuard],
  },
  {
    path:'invoice-summary',
    component:InvoiceDashSummaryComponent,
    canActivate: [SubTravelAgentGuardGuard],
  },
  {
    path:'staff-account-list',
    component:TravelClientAccountsComponent,
    canActivate: [SubTravelAgentGuardGuard],
  },
  {
    path:'add-client-account',
    component:AddClientAccountComponent,
    canActivate: [SubTravelAgentGuardGuard],
  },
  {
    path:'edit-client-account',
    component:AddClientAccountComponent,
    canActivate: [SubTravelAgentGuardGuard],
  },
  {
    path:'debit-cc-card',
    component:CardsComponent,
    canActivate: [SubTravelAgentGuardGuard],
  },
  {
    path:'add-card',
    component:AddCardComponent,
    canActivate: [SubTravelAgentGuardGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubTravelAgentRoutingModule { }
