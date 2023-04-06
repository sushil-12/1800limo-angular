import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Ng2TelInputModule } from 'ng2-tel-input';//for country code list
import { HttpConfigInterceptor } from './interceptors/http-config.interceptor';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/website/includes--website/header/header.component';
import { FooterComponent } from './components/website/includes--website/footer/footer.component';
import { HomeComponent } from './components/website/home/home.component';
import { ContactUsComponent } from './components/website/contact-us/contact-us.component';
import { AboutUsComponent } from './components/website/about-us/about-us.component';
import { FleetComponent } from './components/website/fleet/fleet.component';
import { SafetyComponent } from './components/website/safety/safety.component';
import { CustomerFaqComponent } from './components/website/customer-faq/customer-faq.component';
import { DriverFaqComponent } from './components/website/driver-faq/driver-faq.component';
import { CancellationPolicyComponent } from './components/website/cancellation-policy/cancellation-policy.component';
import { PageNotFoundComponent } from './components/website/includes--website/page-not-found/page-not-found.component';
// import { HeaderComponent as QuotebotHeaderComponent } from './components/quotebot/includes--quotebot/header/header.component';
// import { FooterComponent as QuotebotFooterComponent } from './components/quotebot/includes--quotebot/footer/footer.component';

//material components
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from './components/shared/shared.module';


//
//spinner
import { NgxSpinnerModule } from "ngx-spinner";
//

//maps
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';            // @agm/core
import { AgmDirectionModule } from 'agm-direction';   // agm-direction
import { QuotebotModule } from './components/quotebot/quotebot.module';
import { WebsiteTemplateComponent } from './components/website/website-template/website-template.component';
import { QuotebotTemplateComponent } from './components/quotebot/quotebot-template/quotebot-template.component';
import { UserTemplateComponent } from './components/user/user-template/user-template.component';
import { InsuranceLicensingComponent } from './components/website/insurance-licensing/insurance-licensing.component';
import { ClientEmailConfirmationComponent } from './components/email_templates/client-email-confirmation/client-email-confirmation.component';
import { DriverEmailConfirmationComponent } from './components/email_templates/driver-email-confirmation/driver-email-confirmation.component';
import { ReservationCancellationComponent } from './components/email_templates/reservation-cancellation/reservation-cancellation.component';
import { LoginComponent } from './components/website/login/login.component';
import { OtpComponent } from './components/website/otp/otp.component';
import { ErrorDialogService } from './services/error-dialog/errordialog.service';
import { GloabalErrorHandlerService } from './services/gloabal-error-handler.service'
//

//admin
import { AdminTemplateComponent } from './components/admin/admin-template/admin-template.component';
import { CustomUrlPipePipe } from './pipes/custom-url-pipe.pipe';
import { AffiliateEmailConfirmationComponent } from './components/email-pages/affiliate-email-confirmation/affiliate-email-confirmation.component';
import { DispatchEmailConfirmationComponent } from './components/email-pages/dispatch-email-confirmation/dispatch-email-confirmation.component';
import { ScrollToSectionDirective } from './directives/scroll-to-section.directive';
import { PageUnderConstructionComponent } from './components/page-under-construction/page-under-construction.component';
import { HtmlToTextPipe } from './pipes/html-to-text.pipe';
import { LocateMapComponent } from './components/locate-map/locate-map.component';
import { BookingStatusVerificationComponent } from './components/email-pages/booking-status-verification/booking-status-verification.component';
@NgModule({
	declarations: [
		AppComponent,
		HeaderComponent,
		FooterComponent,
		HomeComponent,
		ContactUsComponent,
		AboutUsComponent,
		FleetComponent,
		SafetyComponent,
		CustomerFaqComponent,
		DriverFaqComponent,
		CancellationPolicyComponent,
		PageNotFoundComponent,
		WebsiteTemplateComponent,
		QuotebotTemplateComponent,
		UserTemplateComponent,
		// QuotebotHeaderComponent,
		InsuranceLicensingComponent,
		// QuotebotFooterComponent,
		ClientEmailConfirmationComponent,
		DriverEmailConfirmationComponent,
		ReservationCancellationComponent,
		LoginComponent,
		OtpComponent,
		AdminTemplateComponent,
		CustomUrlPipePipe,
		AffiliateEmailConfirmationComponent,
		DispatchEmailConfirmationComponent,
		ScrollToSectionDirective,
		PageUnderConstructionComponent,
		HtmlToTextPipe,
		LocateMapComponent,
		BookingStatusVerificationComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		BrowserAnimationsModule,
		ReactiveFormsModule,
		MatSidenavModule,
		AgmCoreModule.forRoot({
			apiKey: 'AIzaSyCxj_Txh7lMTSVjCaeFZ76krKaWH_-XpPQ',
			libraries: ['places', 'geometry']
		}),
		AgmDirectionModule,
		QuotebotModule,
		HttpClientModule,
		Ng2TelInputModule,
		MatDialogModule,
		MatProgressBarModule,
		MatFormFieldModule,
		MatSelectModule,
		NgxSpinnerModule,
		SharedModule
	],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true },
		ErrorDialogService,
		{ provide: ErrorHandler, useClass: GloabalErrorHandlerService }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
