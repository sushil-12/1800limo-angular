import { QuotebotTemplateComponent } from './components/quotebot/quotebot-template/quotebot-template.component';
import { WebsiteTemplateComponent } from './components/website/website-template/website-template.component';
import { ClientTCComponent } from './components/website/client-t-c/client-t-c.component';
import { DeliveryMembershipTCComponent } from './components/website/delivery-membership-t-c/delivery-membership-t-c.component';
import { PrivacyPolicyComponent } from './components/website/privacy-policy/privacy-policy.component';
import { SuggestionsComplaintsComponent } from './components/website/suggestions-complaints/suggestions-complaints.component';
import { TestimonialsComponent } from './components/website/testimonials/testimonials.component';
import { ContactUsComponent } from './components/website/contact-us/contact-us.component';
import { BlogComponent } from './components/website/blog/blog.component';
import { InvestorsComponent } from './components/website/investors/investors.component';
import { GroupTravelPlannerComponent } from './components/website/group-travel-planner/group-travel-planner.component';
import { PageNotFoundComponent } from './components/website/includes--website/page-not-found/page-not-found.component';
import { CancellationPolicyComponent } from './components/website/cancellation-policy/cancellation-policy.component';
import { DriverFaqComponent } from './components/website/driver-faq/driver-faq.component';
import { CustomerFaqComponent } from './components/website/customer-faq/customer-faq.component';
import { SafetyComponent } from './components/website/safety/safety.component';
import { FleetComponent } from './components/website/fleet/fleet.component';
import { AboutUsComponent } from './components/website/about-us/about-us.component';
import { HomeComponent } from './components/website/home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InsuranceLicensingComponent } from './components/website/insurance-licensing/insurance-licensing.component';
import { FailedQuoteRequestConfirmationComponent } from './components/email_templates/failed-quote-request-confirmation/failed-quote-request-confirmation.component';
import { ClientEmailConfirmationComponent } from './components/email_templates/client-email-confirmation/client-email-confirmation.component';
import { DriverEmailConfirmationComponent } from './components/email_templates/driver-email-confirmation/driver-email-confirmation.component';
import { ReservationCancellationComponent } from './components/email_templates/reservation-cancellation/reservation-cancellation.component';
import { UserTemplateComponent } from './components/user/user-template/user-template.component';
import { LoginComponent } from './components/website/login/login.component';
import { OtpComponent } from './components/website/otp/otp.component';
import { AdminTemplateComponent } from './components/admin/admin-template/admin-template.component';
import { AffiliateGuard } from 'src/app/guards/affiliate.guard';
import { AffiliateTemplateComponent } from './components/affiliate/affiliate-template/affiliate-template.component';
import { AffiliateEmailConfirmationComponent } from './components/email-pages/affiliate-email-confirmation/affiliate-email-confirmation.component';
import { DispatchEmailConfirmationComponent } from './components/email-pages/dispatch-email-confirmation/dispatch-email-confirmation.component';
import { LocateMapComponent } from './components/locate-map/locate-map.component';
import { BookingStatusVerificationComponent } from './components/email-pages/booking-status-verification/booking-status-verification.component';


const routes: Routes = [
	{
		path: '',
		redirectTo: '/home',
		pathMatch: 'full'
	},
	{
		path: '',
		component: WebsiteTemplateComponent,
		data: {
			title: 'Home'
		},
		children: [
			{
				path: 'home',
				component: HomeComponent
			},
			{
				path: 'services',
				component: HomeComponent
			},
			{
				path: 'quotebot_section',
				component: HomeComponent
			},
			{
				path: 'about-us',
				component: AboutUsComponent
			},
			{
				path: 'fleet',
				component: FleetComponent
			},
			{
				path: 'safety',
				component: SafetyComponent
			},
			{
				path: 'customer-faq',
				component: CustomerFaqComponent
			},
			{
				path: 'driver-faq',
				component: DriverFaqComponent
			},
			{
				path: 'cancellation-policy',
				component: CancellationPolicyComponent
			},
			{
				path: 'group-travel-planner',
				component: GroupTravelPlannerComponent
			},
			{
				path: 'investors',
				component: InvestorsComponent
			},
			{
				path: 'blog',
				component: BlogComponent
			},
			{
				path: 'contact-us',
				component: ContactUsComponent
			},
			{
				path: 'testimonials',
				component: TestimonialsComponent
			},
			{
				path: 'suggestions-complaints',
				component: SuggestionsComplaintsComponent
			},
			{
				path: 'insurance-licensing',
				component: InsuranceLicensingComponent
			},
			{
				path: 'privacy-policy',
				component: PrivacyPolicyComponent
			},
			{
				path: 'delivery-membership-terms-condition',
				component: DeliveryMembershipTCComponent
			},
			{
				path: 'client-terms-condition',
				component: ClientTCComponent
			},
			{
				path: 'email',
				children: [
					{
						path: 'affiliate-email-confirmation',
						component: AffiliateEmailConfirmationComponent
					},
					{
						path: 'dispatcher-email-confirmation',
						component: AffiliateEmailConfirmationComponent
					},
					{
						path: 'booking-email-confirmation',
						component: BookingStatusVerificationComponent
					}
				]
			}
		]
	},
	{
		path: 'admin-login',
		component: LoginComponent
	},
	{
		path: 'sub-admin-login',
		component: LoginComponent
	},
	{
		path: 'login/:role',
		component: LoginComponent,
	},
	{
		path: 'login',
		redirectTo: 'login/driver',
	},
	{
		path: 'otp',
		component: OtpComponent
	},
	{
		path: 'quotebot',
		component: QuotebotTemplateComponent,
		data: {
			title: 'Homeer'
		},
		children: [
			{
				path: '',
				// component:HomeComponent
				loadChildren: () => import('./components/quotebot/quotebot.module').then(m => m.QuotebotModule)
			}
		]
	},
	{
		path: 'email',
		data: {
			title: 'Emails'
		},
		children: [
			{
				path: 'failed-quote-request-confirmation',
				component: FailedQuoteRequestConfirmationComponent
			},
			{
				path: 'client-email-confirmation',
				component: ClientEmailConfirmationComponent
			},
			{
				path: 'driver-email-confirmation',
				component: DriverEmailConfirmationComponent
			},
			{
				path: 'reservation-cancellation',
				component: ReservationCancellationComponent
			}
		]
	},
	{
		path: 'user',
		component: UserTemplateComponent,
		data: {
			title: 'user'
		},
		children: [
			{
				path: '',
				loadChildren: () => import('./components/user/user.module').then(m => m.UserModule)
			}
		]
	},
	{
		path: 'admin',
		component: AdminTemplateComponent,
		// canActivate: [AdminGuardGuard],
		data: {
			title: 'admin'
		},
		children: [
			{
				path: '',
				loadChildren: () => import('./components/admin/admin.module').then(m => m.AdminModule)
			}
		]
	},
	{
		path: 'payment-by-email/:accId/:bookingId',
		loadChildren: () => import('./components/payment-by-email/payment-by-email.module').then(m => m.PaymentByEmailModule)
	},
	{
		path: 'affiliate',
		component: AffiliateTemplateComponent,
		canActivate: [AffiliateGuard],
		data: {
			title: 'affiliate'
		},
		children: [
			{
				path: '',
				loadChildren: () => import('./components/affiliate/affiliate.module').then(m => m.AffiliateModule)
			}
		]
	},
	{
		path: 'locate-map',
		component: LocateMapComponent
	},
	{
		path: '**',
		component: PageNotFoundComponent
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			scrollPositionRestoration: 'enabled',
			anchorScrolling: 'enabled',
		})
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
