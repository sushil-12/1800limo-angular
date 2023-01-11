import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MasterVehicleTypesComponent } from './master-vehicle-types/master-vehicle-types.component';
import { DailyBookingsComponent } from './daily-bookings/daily-bookings.component';
import { CreateNewBookingComponent } from './create-new-booking/create-new-booking.component';
import { CreateNewBooking2Component } from './create-new-booking2/create-new-booking2.component';
import { QuoteComponent } from './quote/quote.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { IndividualComponent } from './individual/individual.component';
import { CorporateComponent } from './corporate/corporate.component';
import { TravelPlannerComponent } from './travel-planner/travel-planner.component';
import { TourGuideComponent } from './tour-guide/tour-guide.component';
import { AffiliateAccountsComponent } from './affiliate-accounts/affiliate-accounts.component';
import { TravelPlannerReportComponent } from './travel-planner-report/travel-planner-report.component';
import { DriverCommissionReportComponent } from './driver-commission-report/driver-commission-report.component';
import { AmenitiesComponent } from './amenities/amenities.component';
import { AddVehicleComponent } from './add-vehicle/add-vehicle.component';
import { AddVehicleRatesComponent } from './add-vehicle-rates/add-vehicle-rates.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { VehicleYearsComponent } from './vehicle-years/vehicle-years.component';
import { VehicleColorComponent } from './vehicle-color/vehicle-color.component';
import { VehicleMakeComponent } from './vehicle-make/vehicle-make.component';
import { VehicleModelComponent } from './vehicle-model/vehicle-model.component';
import { AffiliatePreferenceComponent } from './affiliate-preference/affiliate-preference.component';
import { DriverLanguageComponent } from './driver-language/driver-language.component';
import { DriverDressComponent } from './driver-dress/driver-dress.component';
import { EditVehicleComponent } from './edit-vehicle/edit-vehicle.component';
import { EditVehicleRatesComponent } from './edit-vehicle-rates/edit-vehicle-rates.component';
import { AddIndividualAccountComponent } from './add-individual-account/add-individual-account.component';
import { EditIndividualAccountComponent } from './edit-individual-account/edit-individual-account.component';
import { CardsComponent } from './cards/cards.component';
import { AddCardComponent } from './add-card/add-card.component';
import { EditCardComponent } from './edit-card/edit-card.component';
import { AddCorporateAccountComponent } from './add-corporate-account/add-corporate-account.component';
import { EditCorporateAccountComponent } from './edit-corporate-account/edit-corporate-account.component';
import { StaffComponent } from './staff/staff.component';
import { AddStaffComponent } from './add-staff/add-staff.component';
import { EditStaffComponent } from './edit-staff/edit-staff.component';
import { AddTravelPlannerAccountComponent } from './add-travel-planner-account/add-travel-planner-account.component';
import { EditTravelPlannerAccountComponent } from './edit-travel-planner-account/edit-travel-planner-account.component';
import { AffiliateStepsTemplateComponent } from './affiliate-steps-template/affiliate-steps-template.component';
import { AffiliateStep0Component } from './affiliate-step0/affiliate-step0.component';
import { AffiliateStep1Component } from './affiliate-step1/affiliate-step1.component';
import { AffiliateStep2Component } from './affiliate-step2/affiliate-step2.component';
import { AffiliateStep3Component } from './affiliate-step3/affiliate-step3.component';
import { AffiliateStep4Component } from './affiliate-step4/affiliate-step4.component';
import { AffiliateStep5Component } from './affiliate-step5/affiliate-step5.component';
import { AffiliateStep6Component } from './affiliate-step6/affiliate-step6.component';
import { AddDriverComponent } from './add-driver/add-driver.component';
import { MeetAndGreetComponent } from './meet-and-greet/meet-and-greet.component';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary.component';
import { SubAdminComponent } from './sub-admin/sub-admin.component';
import { AddSubAdminComponent } from './add-sub-admin/add-sub-admin.component';
import { AdminGuardGuard } from 'src/app/guards/admin-guard.guard';
import { SubAdminGuard } from 'src/app/guards/sub-admin.guard';
import { CreateDebitCcCardComponent } from './create-debit-cc-card/create-debit-cc-card.component';
import { HomePageComponent } from './cms/home-page/home-page.component';
import { HomePageEditComponent } from './cms/home-page-edit/home-page-edit.component';
import { Step0Component } from './cms/step0/step0.component';
import { EditStep0Component } from './cms/edit-step0/edit-step0.component';
import { AboutUsComponent } from './cms/about-us/about-us.component';
import { AboutUsEditComponent } from './cms/about-us-edit/about-us-edit.component';
import { Step6Component } from './cms/step6/step6.component';
import { EditStep6Component } from './cms/edit-step6/edit-step6.component';
import { EditMasterVehicleComponent } from './edit-master-vehicle/edit-master-vehicle.component';
import { MasterVehiclesComponent } from './master-vehicles/master-vehicles.component';
import { AddMasterVehicleComponent } from './add-master-vehicle/add-master-vehicle.component';
import { AddMasterVehicleRatesComponent } from './add-master-vehicle-rates/add-master-vehicle-rates.component';
import { EditMasterVehicleRatesComponent } from './edit-master-vehicle-rates/edit-master-vehicle-rates.component';
import { AmenitiesSpecialComponent } from './amenities-special/amenities-special.component';
import { AmenitiesInteriorComponent } from './amenities-interior/amenities-interior.component';
import { MasterVehicleFareComponent } from './master-vehicle-fare/master-vehicle-fare.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { NewBookingComponent } from './new-booking/new-booking.component';


const routes: Routes = [
	{
		path: 'cms/home-page',
		canActivate: [SubAdminGuard],
		component: HomePageComponent
	},
	{
		path: 'cms/home-page/edit/:id',
		canActivate: [SubAdminGuard],
		component: HomePageEditComponent
	},
	{
		path: 'cms/step0',
		canActivate: [SubAdminGuard],
		component: Step0Component
	},
	{
		path: 'cms/step0/edit/:id',
		canActivate: [SubAdminGuard],
		component: EditStep0Component
	},
	{
		path: 'cms/step6',
		canActivate: [SubAdminGuard],
		component: Step6Component
	},
	{
		path: 'cms/step6/edit/:id',
		canActivate: [SubAdminGuard],
		component: EditStep6Component
	},
	{
		path: 'cms/about-us',
		canActivate: [SubAdminGuard],
		component: AboutUsComponent
	},
	{
		path: 'cms/about-us/edit/:id',
		canActivate: [SubAdminGuard],
		component: AboutUsEditComponent
	},
	{
		path: '',
		redirectTo: 'daily-bookings-admin',
		pathMatch: 'full'
	},
	{
		path: 'master-vehicle-types',
		canActivate: [AdminGuardGuard],
		component: MasterVehicleTypesComponent
	},
	{
		path: 'master-vehicle-types/vehicles',
		component: MasterVehiclesComponent
	},
	{
		path: 'master-vehicle-types/edit-vehicle',
		component: EditMasterVehicleComponent
	},
	{
		path: 'master-vehicle-types/add-vehicle',
		component: AddMasterVehicleComponent
	},
	{
		path: 'master-vehicle-types/master-vehicle-fare',
		component: MasterVehicleFareComponent
	},
	{
		path: 'master-vehicle-types/add-vehicle-rate',
		component: AddMasterVehicleRatesComponent
	},
	{
		path: 'master-vehicle-types/edit-vehicle-rate',
		component: EditMasterVehicleRatesComponent
	},
	{
		path: 'add-vehicle',
		canActivate: [AdminGuardGuard],
		component: AddVehicleComponent
	},
	{
		path: 'add-vehicle/:vehicleTypeId',
		canActivate: [AdminGuardGuard],
		component: AddVehicleComponent
	},
	{
		path: 'vehicles',
		canActivate: [AdminGuardGuard],
		component: VehiclesComponent
	},
	{
		path: 'add-vehicle-rates',
		canActivate: [AdminGuardGuard],
		component: AddVehicleRatesComponent
	},
	{
		path: 'edit-vehicle',
		canActivate: [AdminGuardGuard],
		component: EditVehicleComponent
	},
	{
		path: 'edit-vehicle-rates',
		canActivate: [AdminGuardGuard],
		component: EditVehicleRatesComponent
	},
	{
		path: 'daily-bookings-admin',
		canActivate: [SubAdminGuard],
		component: DailyBookingsComponent
	},
	{
		path: 'create-new-booking',
		canActivate: [SubAdminGuard],
		redirectTo: 'new-booking',
		pathMatch: 'full',
		// component: CreateNewBookingComponent
	},
	{
		path: 'new-booking',
		canActivate: [SubAdminGuard],
		component: NewBookingComponent
	},
	{
		path: 'booking-details',
		canActivate: [SubAdminGuard],
		component: CreateNewBooking2Component
	},
	{
		path: 'booking-preview',
		canActivate: [SubAdminGuard],
		component: BookingDetailsComponent
	},
	{
		path: 'quote-admin',
		canActivate: [SubAdminGuard],
		component: QuoteComponent
	},
	{
		path: 'invoices-admin',
		canActivate: [SubAdminGuard],
		component: InvoiceComponent
	},
	{
		path: 'create-debit-cc-card-admin',
		canActivate: [SubAdminGuard],
		component: CreateDebitCcCardComponent
	},
	{
		path: 'individual-account-admin',
		canActivate: [SubAdminGuard],
		component: IndividualComponent
	},
	{
		path: 'corporate-account-admin',
		canActivate: [SubAdminGuard],
		component: CorporateComponent
	},
	{
		path: 'travel-planner-account-admin',
		canActivate: [SubAdminGuard],
		component: TravelPlannerComponent
	},
	{
		path: 'tour-guide-account-admin',
		canActivate: [SubAdminGuard],
		component: TourGuideComponent
	},
	{
		path: 'affiliates/:_affiliateType',
		canActivate: [SubAdminGuard],
		component: AffiliateAccountsComponent
	},
	{
		path: 'travel-planner-reports-admin',
		canActivate: [SubAdminGuard],
		component: TravelPlannerReportComponent
	},
	{
		path: 'driver-commission-reports-admin',
		canActivate: [SubAdminGuard],
		component: DriverCommissionReportComponent
	},
	{
		path: 'tour-guide-reports-admin',
		canActivate: [SubAdminGuard],
		component: TourGuideComponent
	},
	{
		path: 'amenities',
		canActivate: [AdminGuardGuard],
		component: AmenitiesComponent
	},
	{
		path: 'specialAmenity',
		canActivate: [AdminGuardGuard],
		component: AmenitiesSpecialComponent
	},
	{
		path: 'interiorAmenity',
		canActivate: [AdminGuardGuard],
		component: AmenitiesInteriorComponent
	},
	{
		path: 'vehicle-years',
		canActivate: [AdminGuardGuard],
		component: VehicleYearsComponent
	},
	{
		path: 'vehicle-colors',
		canActivate: [AdminGuardGuard],
		component: VehicleColorComponent
	},
	{
		path: 'vehicle-make',
		canActivate: [AdminGuardGuard],
		component: VehicleMakeComponent
	},
	{
		path: 'vehicle-model',
		canActivate: [AdminGuardGuard],
		component: VehicleModelComponent
	},
	{
		path: 'affiliate-preference',
		canActivate: [AdminGuardGuard],
		component: AffiliatePreferenceComponent
	},
	{
		path: 'driver-language',
		canActivate: [AdminGuardGuard],
		component: DriverLanguageComponent
	},
	{
		path: 'driver-dress',
		canActivate: [AdminGuardGuard],
		component: DriverDressComponent
	},
	{
		path: 'meet-and-greet',
		canActivate: [AdminGuardGuard],
		component: MeetAndGreetComponent
	},
	{
		path: 'add-individual-account',
		canActivate: [SubAdminGuard],
		component: AddIndividualAccountComponent
	},
	{
		path: 'edit-individual-account',
		canActivate: [SubAdminGuard],
		component: EditIndividualAccountComponent
	},
	{
		path: 'add-corporate-account',
		canActivate: [SubAdminGuard],
		component: AddCorporateAccountComponent
	},
	{
		path: 'edit-corporate-account',
		canActivate: [SubAdminGuard],
		component: EditCorporateAccountComponent
	},
	{
		path: 'add-travel-planner-account',
		canActivate: [SubAdminGuard],
		component: AddTravelPlannerAccountComponent
	},
	{
		path: 'edit-travel-planner-account',
		canActivate: [SubAdminGuard],
		component: EditTravelPlannerAccountComponent
	},
	{
		path: 'cards',
		canActivate: [SubAdminGuard],
		component: CardsComponent
	},
	{
		path: 'add-card',
		canActivate: [SubAdminGuard],
		component: AddCardComponent
	},
	{
		path: 'edit-card',
		canActivate: [SubAdminGuard],
		component: EditCardComponent
	},
	{
		path: 'staff',
		canActivate: [SubAdminGuard],
		component: StaffComponent
	},
	{
		path: 'add-staff',
		canActivate: [SubAdminGuard],
		component: AddStaffComponent
	},
	{
		path: 'edit-staff',
		canActivate: [SubAdminGuard],
		component: EditStaffComponent
	},
	{
		path: 'invoice-summary',
		canActivate: [SubAdminGuard],
		component: InvoiceSummaryComponent
	},
	{
		path: 'sub-admins',
		canActivate: [AdminGuardGuard],
		component: SubAdminComponent
	},
	{
		path: 'add-sub-admin',
		canActivate: [AdminGuardGuard],
		component: AddSubAdminComponent
	},
	{
		path: 'edit-sub-admin',
		canActivate: [AdminGuardGuard],
		component: AddSubAdminComponent
	},
	{
		path: 'affiliate',
		canActivate: [SubAdminGuard],
		component: AffiliateStepsTemplateComponent,
		data: {
			title: 'Affiliate'
		},
		children: [
			{
				path: 'step0',
				component: AffiliateStep0Component
			},
			{
				path: 'step1',
				component: AffiliateStep1Component
			},
			{
				path: 'step2',
				component: AffiliateStep2Component
			},
			{
				path: 'step3',
				component: AffiliateStep3Component
			},
			{
				path: 'step4',
				component: AffiliateStep4Component
			},
			{
				path: 'step4/add-driver',
				component: AddDriverComponent
			},
			{
				path: 'step5',
				component: AffiliateStep5Component
			},
			{
				path: 'step5/add-vehicle',
				component: AddVehicleComponent
			},
			{
				path: 'step5/add-vehicle-rates',
				component: AddVehicleRatesComponent
			},
			{
				path: 'step5/edit-vehicle',
				component: EditVehicleComponent
			},
			{
				path: 'step5/edit-vehicle-rates',
				component: EditVehicleRatesComponent
			},
			{
				path: 'step6',
				component: AffiliateStep6Component
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AdminRoutingModule { }
