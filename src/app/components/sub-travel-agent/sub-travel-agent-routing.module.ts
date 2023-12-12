import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
    // canActivate: [CheckProfileCompleteGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubTravelAgentRoutingModule { }
