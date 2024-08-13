import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SubAffiliateGuard } from '../../guards/sub-affiliate.guard'
import { MyBookingsComponent } from '../affiliate/my-bookings/my-bookings.component';
import { ProfileComponent } from './profile/profile.component';


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
		path: 'my-bookings',
		canActivate: [SubAffiliateGuard],
		component: MyBookingsComponent
	},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubAffiliateRoutingModule { }
