import { QuotebotComponent } from './quotebot.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelectVehicleComponent } from './select-vehicle/select-vehicle.component';
import { FailedQuoteRequestComponent } from './failed-quote-request/failed-quote-request.component';
import { VehicleDetailsComponent } from './vehicle-details/vehicle-details.component';

const routes: Routes = [
	{
		path: 'select-vehicle',
		component: SelectVehicleComponent
	},
	{
		path: 'vehicle-details',
		component: VehicleDetailsComponent
	},
	{
		path: 'failed-quote-request',
		component: FailedQuoteRequestComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class QuotebotRoutingModule { }
