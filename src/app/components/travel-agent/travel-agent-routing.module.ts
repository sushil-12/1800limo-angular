import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { ProfileComponent } from './profile/profile.component';
import { CheckProfileCompleteGuard } from 'src/app/guards/check-profile-complete.guard';
import { CreateBookingComponent } from './create-booking/create-booking.component';
import { CardsComponent } from './cards/cards.component';
import { AddCardComponent } from './add-card/add-card.component';
import { InvoiceDashComponent } from './invoice-dash/invoice-dash.component';
import { InvoiceDashSummaryComponent } from './invoice-dash-summary/invoice-dash-summary.component';
import { StripeFormComponent } from './stripe-form/stripe-form.component';
import { TravelAgentStepsTemplateComponent } from './travel-agent-steps-template/travel-agent-steps-template.component';
import { TravelClientAccountsComponent } from './travel-client-accounts/travel-client-accounts.component';
import { AddClientAccountComponent } from './add-client-account/add-client-account.component';
import { SubAgentAccountsComponent } from './sub-agent-accounts/sub-agent-accounts.component';
import { SubAgentAccountDetailsComponent } from './sub-agent-account-details/sub-agent-account-details.component';
const routes: Routes = [
  {
		path: '',
		redirectTo: 'bookings',
		pathMatch: 'full'
	},
  {
    path:'bookings',
    component:BookingComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
    path:'profile',
    component:ProfileComponent,
    canActivate: [CheckProfileCompleteGuard]
  },
  {
    path:'create-booking',
    component:CreateBookingComponent,
    canActivate: [CheckProfileCompleteGuard],
  },

  {
    path:'create-new-booking',
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
    path:'invoice-summary',
    component:InvoiceDashSummaryComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
    path:'add-card',
    component:AddCardComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
    path:'stripe-form',
    component:StripeFormComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
    path:'new-booking',
    component:CreateBookingComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
		path: 'profile',
		canActivate: [],
		component: TravelAgentStepsTemplateComponent,
		data: {
			title: 'TravelAgent'
		},
		children: [
			{
				path: 'step1',
				component: ProfileComponent
			},
			{
				path: 'step2',
				component: StripeFormComponent
			},
		]
	}, 
  {
    path:'staff-account-list',
    component:TravelClientAccountsComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
    path:'add-client-account',
    component:AddClientAccountComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
    path:'edit-client-account',
    component:AddClientAccountComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
    path:'sub-agent-accounts',
    component:SubAgentAccountsComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  {
    path:'sub-agent-account-details',
    component:SubAgentAccountDetailsComponent,
    canActivate: [CheckProfileCompleteGuard],
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TravelAgentRoutingModule { }
