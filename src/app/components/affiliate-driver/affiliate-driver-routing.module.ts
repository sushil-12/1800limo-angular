import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AffiliateDriverGuard } from '../../guards/affiliate-driver.guard'
import { MyBookingsComponent} from '../affiliate-driver/my-bookings/my-bookings.component'

const routes: Routes = [
  {
		path: '',
		redirectTo: '/home',
		pathMatch: 'full'
	},
	{
		path: 'my-bookings',
		canActivate: [AffiliateDriverGuard],
		component: MyBookingsComponent
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AffiliateDriverRoutingModule { }
