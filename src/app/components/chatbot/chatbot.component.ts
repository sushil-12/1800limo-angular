import { Component, ElementRef, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { ChatbotService, ChatbotState, ChatMessage } from '../../services/chatbot.service';

@Component({
	selector: 'app-chatbot',
	templateUrl: './chatbot.component.html',
	styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {

	@ViewChild('messagesContainer') private messagesContainer!: ElementRef;

	isOpen = false;
	messages: ChatMessage[] = [];
	currentState = ChatbotState.WELCOME;
	userInput = '';
	private shouldScroll = false;

	constructor(public chatbotService: ChatbotService) {}

	ngOnInit(): void {
		this.chatbotService.isOpen$.subscribe(open => this.isOpen = open);
		this.chatbotService.messages$.subscribe(msgs => {
			this.messages = msgs;
			this.shouldScroll = true;
		});
		this.chatbotService.state$.subscribe(state => this.currentState = state);
	}

	ngAfterViewChecked(): void {
		if (this.shouldScroll) {
			this.scrollToBottom();
			this.shouldScroll = false;
		}
	}

	togglePanel() {
		this.chatbotService.toggle();
	}

	send() {
		const text = this.userInput.trim();
		if (!text) return;
		this.chatbotService.handleTextInput(text);
		this.userInput = '';
	}

	onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			this.send();
		}
	}

	private scrollToBottom() {
		try {
			if (this.messagesContainer) {
				this.messagesContainer.nativeElement.scrollTop =
					this.messagesContainer.nativeElement.scrollHeight;
			}
		} catch {}
	}

	isInputDisabled(): boolean {
		const noTextStates = [
			ChatbotState.SERVICE_TYPE,
			ChatbotState.PICKUP_LOCATION,
			ChatbotState.PICKUP_KIND_CONFIRMATION,
			ChatbotState.DROPOFF_LOCATION,
			ChatbotState.DROPOFF_KIND_CONFIRMATION,
			ChatbotState.OUTBOUND_DATETIME,
			ChatbotState.RETURN_DATETIME,
			ChatbotState.CHARTER_HOURS,
			ChatbotState.PASSENGERS,
			ChatbotState.USER_TYPE,
			ChatbotState.CUSTOMER_DETAILS,
			ChatbotState.VEHICLE_CATEGORIES,
			ChatbotState.VEHICLE_LIST,
			ChatbotState.BOOKING_SUMMARY,
			ChatbotState.SUBMITTING,
			ChatbotState.SUCCESS,
			ChatbotState.ERROR,
		];
		return noTextStates.includes(this.currentState);
	}

	getInputPlaceholder(): string {
		if (this.currentState === ChatbotState.PICKUP_CRUISE_NAME || this.currentState === ChatbotState.DROPOFF_CRUISE_NAME) {
			return 'Type the cruise ship name...';
		}
		return 'Type a message...';
	}
}
