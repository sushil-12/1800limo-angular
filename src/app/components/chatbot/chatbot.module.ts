import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ChatbotComponent } from './chatbot.component';
import { MessageBubbleComponent } from './components/message-bubble/message-bubble.component';
import { VehicleCardComponent } from './components/vehicle-card/vehicle-card.component';

@NgModule({
	declarations: [
		ChatbotComponent,
		MessageBubbleComponent,
		VehicleCardComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		HttpClientModule,
	],
	exports: [
		ChatbotComponent,
	],
})
export class ChatbotModule {}
