import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubTravelAgentRoutingModule } from './sub-travel-agent-routing.module';
import { SubTravelAgentComponent } from './sub-travel-agent.component';


@NgModule({
  declarations: [SubTravelAgentComponent],
  imports: [
    CommonModule,
    SubTravelAgentRoutingModule
  ]
})
export class SubTravelAgentModule { }
