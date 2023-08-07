import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TravelAgentRoutingModule } from './travel-agent-routing.module';
import { TravelAgentComponent } from './travel-agent.component';
import { BookingComponent } from './booking/booking.component';
import { AgentTemplateComponent } from './agent-template/agent-template.component';


@NgModule({
  declarations: [TravelAgentComponent, BookingComponent, AgentTemplateComponent],
  imports: [
    CommonModule,
    TravelAgentRoutingModule
  ]
})
export class TravelAgentModule { }
