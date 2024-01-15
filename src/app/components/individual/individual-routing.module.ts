import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndividualGuardGuard } from '../../guards/individual-guard.guard'
import { BookingsComponent } from './bookings/bookings.component';

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
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndividualRoutingModule { }
