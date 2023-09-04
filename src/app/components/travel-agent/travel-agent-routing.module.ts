import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { ProfileComponent } from './profile/profile.component';
import { CheckProfileCompleteGuard } from 'src/app/guards/check-profile-complete.guard';
import { CreateBookingComponent } from './create-booking/create-booking.component';
import { CardsComponent } from './cards/cards.component';
import { AddCardComponent } from './add-card/add-card.component';
import { InvoiceDashComponent } from './invoice-dash/invoice-dash.component';
const routes: Routes = [
  {
    path:'bookings',
    component:BookingComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
    path:'profile',
    component:ProfileComponent
  },
  {
    path:'create-booking',
    component:CreateBookingComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
    path:'debit-cc-card',
    component:CardsComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
    path:'invoices',
    component:InvoiceDashComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
    path:'add-card',
    component:AddCardComponent,
    canActivate: [CheckProfileCompleteGuard],
  }
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TravelAgentRoutingModule { }
