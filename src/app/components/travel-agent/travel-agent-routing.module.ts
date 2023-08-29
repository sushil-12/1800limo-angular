import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { ProfileComponent } from './profile/profile.component';
import { CheckProfileCompleteGuard } from 'src/app/guards/check-profile-complete.guard';
const routes: Routes = [
  {
    path:'bookings',
    component:BookingComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
    path:'profile',
    component:ProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TravelAgentRoutingModule { }
