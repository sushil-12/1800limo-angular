import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AdminService } from './admin.service';
import { ChatSummaryRow, ChatbotBookingDraft, ChatbotBookingService, ChatLocationKind, LooseCustomer } from './chatbot-booking.service';
import { IndividualService } from './individual.service';
import { PlaceIntelligenceService, ResolvedPlaceSelection } from './place-intelligence.service';
import { QuotebotService } from './quotebot.service';

export enum ChatbotState {
	WELCOME = 'WELCOME',
	SERVICE_TYPE = 'SERVICE_TYPE',
	PICKUP_LOCATION = 'PICKUP_LOCATION',
	PICKUP_KIND_CONFIRMATION = 'PICKUP_KIND_CONFIRMATION',
	PICKUP_CRUISE_NAME = 'PICKUP_CRUISE_NAME',
	DROPOFF_LOCATION = 'DROPOFF_LOCATION',
	DROPOFF_KIND_CONFIRMATION = 'DROPOFF_KIND_CONFIRMATION',
	DROPOFF_CRUISE_NAME = 'DROPOFF_CRUISE_NAME',
	OUTBOUND_DATETIME = 'OUTBOUND_DATETIME',
	RETURN_DATETIME = 'RETURN_DATETIME',
	CHARTER_HOURS = 'CHARTER_HOURS',
	PASSENGERS = 'PASSENGERS',
	USER_TYPE = 'USER_TYPE',
	CUSTOMER_DETAILS = 'CUSTOMER_DETAILS',
	VEHICLE_CATEGORIES = 'VEHICLE_CATEGORIES',
	VEHICLE_LIST = 'VEHICLE_LIST',
	BOOKING_SUMMARY = 'BOOKING_SUMMARY',
	SUBMITTING = 'SUBMITTING',
	SUCCESS = 'SUCCESS',
	ERROR = 'ERROR',
}

export interface ChatChip {
	label: string;
	value: string;
	icon?: string;
}

export interface ChatMessage {
	id: string;
	from: 'bot' | 'user';
	type:
		| 'text'
		| 'chips'
		| 'vehicle-categories'
		| 'vehicle-list'
		| 'place-input'
		| 'datetime-input'
		| 'passenger-input'
		| 'hours-input'
		| 'customer-form'
		| 'summary'
		| 'loading';
	text?: string;
	chips?: ChatChip[];
	vehicles?: any[];
	summaryRows?: ChatSummaryRow[];
	meta?: Record<string, any>;
	timestamp: Date;
}

export type BookingData = ChatbotBookingDraft;

@Injectable({ providedIn: 'root' })
export class ChatbotService {
	state$ = new BehaviorSubject<ChatbotState>(ChatbotState.WELCOME);
	messages$ = new BehaviorSubject<ChatMessage[]>([]);
	isOpen$ = new BehaviorSubject<boolean>(false);

	bookingData: ChatbotBookingDraft = this.chatbotBookingService.createDraft();
	private msgIdCounter = 0;
	private pendingLocationSelection?: { role: 'pickup' | 'dropoff'; selection: ResolvedPlaceSelection };

	constructor(
		private quotebotService: QuotebotService,
		private individualService: IndividualService,
		private adminService: AdminService,
		private chatbotBookingService: ChatbotBookingService,
		private placeIntelligenceService: PlaceIntelligenceService,
	) {}

	open() {
		this.isOpen$.next(true);
		if (this.messages$.value.length === 0) {
			this.startConversation();
		}
	}

	close() {
		this.isOpen$.next(false);
	}

	toggle() {
		this.isOpen$.value ? this.close() : this.open();
	}

	reset() {
		this.bookingData = this.chatbotBookingService.createDraft();
		this.messages$.next([]);
		this.state$.next(ChatbotState.WELCOME);
		this.msgIdCounter = 0;
		this.pendingLocationSelection = undefined;
		this.startConversation();
	}

	handleChip(value: string) {
		this.addUserMessage(this.chipLabelFor(value));
		this.processChipValue(value);
	}

	handleTextInput(text: string) {
		const trimmed = text.trim();
		if (!trimmed) {
			return;
		}

		if (this.state$.value === ChatbotState.PICKUP_CRUISE_NAME) {
			this.addUserMessage(trimmed);
			this.setCruiseName('pickup', trimmed);
			return;
		}

		if (this.state$.value === ChatbotState.DROPOFF_CRUISE_NAME) {
			this.addUserMessage(trimmed);
			this.setCruiseName('dropoff', trimmed);
			return;
		}

		this.addUserMessage(trimmed);
		this.addBotMessage('text', 'Please use the options or forms above so I can keep the booking details structured.');
	}

	async handleFormSubmit(data: any) {
		const state = this.state$.value;

		if ((state === ChatbotState.PICKUP_LOCATION || state === ChatbotState.DROPOFF_LOCATION) && data?.selection) {
			const role = state === ChatbotState.PICKUP_LOCATION ? 'pickup' : 'dropoff';
			const selection = data.selection as ResolvedPlaceSelection;
			this.addUserMessage(this.getLocationLabel(selection.location));
			this.handleResolvedLocationSelection(role, selection);
			return;
		}

		if (state === ChatbotState.OUTBOUND_DATETIME) {
			this.bookingData.pickup_date = data.date;
			this.bookingData.pickup_time = data.time;
			this.addUserMessage(`${data.date} at ${data.time}`);
			if (this.bookingData.service_type === 'round_trip') {
				this.askReturnDatetime();
				return;
			}
			if (this.bookingData.service_type === 'charter_tour') {
				this.askCharterHours();
				return;
			}
			this.askPassengers();
			return;
		}

		if (state === ChatbotState.RETURN_DATETIME) {
			this.bookingData.return_pickup_date = data.date;
			this.bookingData.return_pickup_time = data.time;
			this.addUserMessage(`${data.date} at ${data.time}`);
			this.askPassengers();
			return;
		}

		if (state === ChatbotState.CHARTER_HOURS) {
			const hours = Math.max(2, Number(data.hours || 2));
			this.bookingData.booking_hour = hours;
			this.addUserMessage(`${hours} hour${hours === 1 ? '' : 's'}`);
			this.askPassengers();
			return;
		}

		if (state === ChatbotState.PASSENGERS) {
			this.bookingData.no_of_passenger = Math.max(1, Number(data.passengers || 1));
			this.bookingData.no_of_luggage = Math.max(0, Number(data.luggage || 0));
			this.addUserMessage(`${this.bookingData.no_of_passenger} passenger(s), ${this.bookingData.no_of_luggage} bag(s)`);
			this.askUserType();
			return;
		}

		if (state === ChatbotState.CUSTOMER_DETAILS) {
			const looseCustomer: LooseCustomer = {
				first_name: data.first_name,
				last_name: data.last_name,
				phone: data.phone,
				phone_isd: data.phone_isd || '+1',
				phone_country: data.phone_country || 'us',
				email: data.email,
			};
			this.bookingData.loose_customer = looseCustomer;
			this.bookingData.passenger_name = `${looseCustomer.first_name} ${looseCustomer.last_name}`.trim();
			this.bookingData.passenger_email = looseCustomer.email;
			this.bookingData.passenger_cell = looseCustomer.phone;
			this.bookingData.passenger_cell_isd = looseCustomer.phone_isd;
			this.bookingData.passenger_cell_country = looseCustomer.phone_country;
			this.addUserMessage(`${looseCustomer.first_name} ${looseCustomer.last_name} — ${looseCustomer.email}`);
			this.loadVehicleCategories();
		}
	}

	handleCategorySelect(category: any) {
		this.addUserMessage(category?.name || category?.vehicle_type || 'Selected category');
		this.loadVehicles(category);
	}

	handleVehicleSelect(vehicle: any) {
		this.bookingData.selected_vehicle = vehicle;
		this.bookingData.affiliate_id = vehicle?.affiliate_id;
		this.bookingData.affiliate_type = vehicle?.affiliate_type;
		this.bookingData.currency = vehicle?.currency || 'usd';
		this.bookingData.number_of_vehicles = 1;
		this.bookingData.is_master_vehicle = !!vehicle?.is_master_vehicle;
		this.addUserMessage(vehicle?.vehicle_type || vehicle?.make || 'Selected vehicle');
		this.loadVehiclePricingAndSummary(vehicle);
	}

	confirmBooking() {
		this.advanceTo(ChatbotState.SUBMITTING);
		this.addBotMessage('text', 'Creating your booking, please wait...');
		this.submitBooking();
	}

	editBooking() {
		this.reset();
	}

	private startConversation() {
		this.advanceTo(ChatbotState.SERVICE_TYPE);
		this.addBotMessage('text', 'Hi! I can help book your ride. What type of service do you need?');
		this.addBotMessage('chips', undefined, [
			{ label: 'One Way', value: 'one_way', icon: '→' },
			{ label: 'Round Trip', value: 'round_trip', icon: '⇄' },
			{ label: 'Charter', value: 'charter_tour', icon: '🕐' },
		]);
	}

	private askPickupLocation() {
		this.advanceTo(ChatbotState.PICKUP_LOCATION);
		this.addBotMessage('text', 'Where should we pick you up?');
		this.addBotMessage('place-input', 'Search pickup location', undefined, undefined, undefined, { role: 'pickup' });
	}

	private askDropoffLocation() {
		this.advanceTo(ChatbotState.DROPOFF_LOCATION);
		this.addBotMessage('text', 'Where are you headed?');
		this.addBotMessage('place-input', 'Search dropoff location', undefined, undefined, undefined, { role: 'dropoff' });
	}

	private askLocationKindConfirmation(role: 'pickup' | 'dropoff', selection: ResolvedPlaceSelection) {
		const state = role === 'pickup'
			? ChatbotState.PICKUP_KIND_CONFIRMATION
			: ChatbotState.DROPOFF_KIND_CONFIRMATION;
		this.pendingLocationSelection = { role, selection };
		this.advanceTo(state);

		const kinds = selection.ambiguousKinds.length
			? selection.ambiguousKinds
			: ['airport', 'city', 'cruise', 'fbo'].filter((kind) => kind !== 'unknown') as ChatLocationKind[];

		this.addBotMessage(
			'text',
			`I found "${selection.location.name}". Should I treat it as an airport, city stop, cruise port, or FBO?`,
		);
		this.addBotMessage(
			'chips',
			undefined,
			kinds.map((kind) => ({
				label: this.kindLabel(kind),
				value: `confirm_kind_${role}_${kind}`,
			})),
		);
	}

	private askCruiseName(role: 'pickup' | 'dropoff') {
		this.advanceTo(role === 'pickup' ? ChatbotState.PICKUP_CRUISE_NAME : ChatbotState.DROPOFF_CRUISE_NAME);
		this.addBotMessage('text', `What is the cruise ship name for this ${role} stop?`);
	}

	private askOutboundDatetime() {
		this.advanceTo(ChatbotState.OUTBOUND_DATETIME);
		this.addBotMessage('text', 'What date and time should the ride start?');
		this.addBotMessage('datetime-input', 'Select pickup date & time', undefined, undefined, undefined, { kind: 'pickup' });
	}

	private askReturnDatetime() {
		this.advanceTo(ChatbotState.RETURN_DATETIME);
		this.addBotMessage('text', 'When should the return ride begin?');
		this.addBotMessage('datetime-input', 'Select return pickup date & time', undefined, undefined, undefined, { kind: 'return' });
	}

	private askCharterHours() {
		this.advanceTo(ChatbotState.CHARTER_HOURS);
		if (!this.bookingData.booking_hour || this.bookingData.booking_hour < 2) {
			this.bookingData.booking_hour = 2;
		}
		this.addBotMessage('text', 'How many hours do you need the charter for?');
		this.addBotMessage('hours-input', 'Minimum 2 hours', undefined, undefined, undefined, {
			min: 2,
			value: this.bookingData.booking_hour,
		});
	}

	private askPassengers() {
		this.advanceTo(ChatbotState.PASSENGERS);
		this.addBotMessage('text', 'How many passengers and bags should I plan for?');
		this.addBotMessage('passenger-input');
	}

	private askUserType() {
		const currentUser = this.getCurrentUser();
		const accountId = currentUser?.account_id || currentUser?.id;
		if (accountId) {
			this.bookingData.account_type = 'individual';
			this.bookingData.acc_id = Number(accountId);
			this.bookingData.booking_created_from = currentUser?.created_by_role === 'subscriber' ? 'subscriber' : undefined;
			this.addBotMessage(
				'text',
				`Booking as ${this.getCurrentUserName(currentUser) || 'your account'} (Account #${accountId}).`,
			);
			this.loadVehicleCategories();
			return;
		}

		this.advanceTo(ChatbotState.USER_TYPE);
		this.addBotMessage('text', 'Are you booking as a new customer or using an existing account?');
		this.addBotMessage('chips', undefined, [
			{ label: 'New Customer', value: 'loose_customer', icon: '👤' },
			{ label: 'Existing Account', value: 'existing_account', icon: '✅' },
		]);
	}

	private askCustomerDetails() {
		this.advanceTo(ChatbotState.CUSTOMER_DETAILS);
		this.addBotMessage('text', 'Please enter your contact details for the booking.');
		this.addBotMessage('customer-form');
	}

	private loadVehicleCategories() {
		this.advanceTo(ChatbotState.VEHICLE_CATEGORIES);
		this.addBotMessage('loading', 'Calculating the route and searching vehicle categories...');

		this.calculateLocationInfo().then(() => {
			const quoteData = this.chatbotBookingService.buildVehicleSearchPayload(this.bookingData);
			this.quotebotService.getMasterVehicleTypes(quoteData).subscribe({
				next: (response: any) => {
					this.removeLoadingMessage();
					const categories = response?.data || response?.vehicle_types || response || [];
					if (!categories.length) {
						this.handleError('No vehicle categories were found for this trip. Please try adjusting the locations or timing.');
						return;
					}

					this.addBotMessage('text', 'Here are the vehicle categories available for your trip.');
					this.addBotMessage('vehicle-categories', undefined, undefined, categories);
				},
				error: () => {
					this.removeLoadingMessage();
					this.handleError('I could not load vehicle categories right now. Please try again.');
				},
			});
		});
	}

	private loadVehicles(category: any) {
		this.advanceTo(ChatbotState.VEHICLE_LIST);
		this.addBotMessage('loading', 'Loading available vehicles...');

		const filters: any = {
			...this.chatbotBookingService.buildVehicleSearchPayload(this.bookingData),
		};
		if (category?.id) {
			filters.filters = { 'vehicle-type': [category.id] };
		}

		this.quotebotService.getVehicleDetails(filters).subscribe({
			next: (response: any) => {
				this.removeLoadingMessage();
				const vehicles = response?.data || response?.vehicles || response || [];
				if (!vehicles.length) {
					this.addBotMessage('text', 'No vehicles were found in that category. Please choose another one.');
					this.loadVehicleCategories();
					return;
				}

				this.addBotMessage('text', 'Here are the vehicles available right now.');
				this.addBotMessage('vehicle-list', undefined, undefined, vehicles, undefined, {
					serviceType: this.bookingData.service_type,
				});
			},
			error: () => {
				this.removeLoadingMessage();
				this.handleError('I could not load the vehicles right now. Please try again.');
			},
		});
	}

	private loadVehiclePricingAndSummary(vehicle: any) {
		this.addBotMessage('loading', 'Calculating the final booking rate...');
		const rateRequest = this.chatbotBookingService.buildVehicleRateRequest(this.bookingData, vehicle);

		this.adminService.fetchRatesByAffiliateVeh(vehicle?.id, rateRequest).subscribe({
			next: (response: any) => {
				this.removeLoadingMessage();
				this.bookingData = {
					...this.bookingData,
					...this.chatbotBookingService.applyPricingResponse(this.bookingData, response),
				};
				this.showSummary();
			},
			error: () => {
				this.removeLoadingMessage();
				this.bookingData = {
					...this.bookingData,
					...this.chatbotBookingService.applyVehicleFallbackPricing(this.bookingData, vehicle),
				};
				this.showSummary();
			},
		});
	}

	private showSummary() {
		const transferType = this.chatbotBookingService.getTransferType(
			this.bookingData.pickup_location?.kind,
			this.bookingData.dropoff_location?.kind,
		);
		const defaults = this.chatbotBookingService.getMeetAndGreetDefaults(transferType);
		this.bookingData.transfer_type = transferType;
		this.bookingData.return_transfer_type = this.chatbotBookingService.getReturnTransferType(transferType);
		this.bookingData.booking_instructions = this.bookingData.booking_instructions || this.getBookingInstructions(transferType);
		this.bookingData.return_booking_instructions = this.bookingData.return_booking_instructions
			|| this.getReturnBookingInstructions(this.bookingData.return_transfer_type);
		this.bookingData.meet_greet_choices = this.bookingData.meet_greet_choices || defaults.meet_greet_choices;
		this.bookingData.meet_greet_choices_name = this.bookingData.meet_greet_choices_name || defaults.meet_greet_choices_name;
		this.bookingData.return_meet_greet_choices = this.bookingData.return_meet_greet_choices || defaults.return_meet_greet_choices;
		this.bookingData.return_meet_greet_choices_name = this.bookingData.return_meet_greet_choices_name || defaults.return_meet_greet_choices_name;

		const summaryRows = this.chatbotBookingService.buildSummaryRows(this.bookingData, this.getCurrentUser());
		const total = Number(this.bookingData.grand_total || 0)
			+ Number(this.bookingData.service_type === 'round_trip' ? this.bookingData.return_grand_total || 0 : 0);

		this.advanceTo(ChatbotState.BOOKING_SUMMARY);
		this.addBotMessage('text', 'Here is your booking summary.');
		this.addBotMessage('summary', undefined, undefined, undefined, summaryRows);
		this.addBotMessage('chips', `Estimated total: ${this.chatbotBookingService.formatMoney(total, this.bookingData.currency)}. Ready to confirm?`, [
			{ label: 'Confirm Booking', value: 'CONFIRM' },
			{ label: 'Start Over', value: 'EDIT' },
		]);
	}

	private submitBooking() {
		const currentUser = this.getCurrentUser();
		const payload = this.chatbotBookingService.buildReservationPayload(this.bookingData, currentUser);
		const request$ = this.bookingData.account_type === 'individual'
			? this.individualService.createBooking(payload, 'new')
			: this.quotebotService.createBooking(payload, 'new');

		request$.subscribe({
			next: (response: any) => {
				this.advanceTo(ChatbotState.SUCCESS);
				const reservationId = response?.data?.reservation_id || response?.reservation_id || '';
				this.addBotMessage(
					'text',
					`Booking confirmed${reservationId ? `! Reservation ID: #${reservationId}` : '!'} You will receive a confirmation email shortly.`,
				);
				this.addBotMessage('chips', undefined, [
					{ label: 'Book Another Ride', value: 'RESET' },
				]);
			},
			error: (error) => {
				this.advanceTo(ChatbotState.ERROR);
				const message = error?.error?.message || error?.message || 'Booking failed. Please try again.';
				this.addBotMessage('text', message);
				this.addBotMessage('chips', undefined, [
					{ label: 'Try Again', value: 'RETRY_SUBMIT' },
					{ label: 'Start Over', value: 'EDIT' },
				]);
			},
		});
	}

	private processChipValue(value: string) {
		if (value.startsWith('confirm_kind_')) {
			this.confirmLocationKind(value);
			return;
		}

		switch (value) {
			case 'one_way':
			case 'round_trip':
			case 'charter_tour':
				this.bookingData = {
					...this.chatbotBookingService.createDraft(),
					service_type: value,
				};
				this.askPickupLocation();
				return;

			case 'loose_customer':
				this.bookingData.account_type = 'loose_customer';
				this.askCustomerDetails();
				return;

			case 'existing_account':
				this.bookingData.account_type = undefined;
				this.addBotMessage(
					'text',
					'Account lookup by account number is still being wired to the backend. For now, please sign in first or continue as a new customer.',
				);
				this.addBotMessage('chips', undefined, [
					{ label: 'Continue as New Customer', value: 'loose_customer', icon: '👤' },
					{ label: 'Sign In', value: 'SIGN_IN', icon: '🔐' },
				]);
				return;

			case 'SIGN_IN':
				window.location.assign('/login');
				return;

			case 'CONFIRM':
				this.confirmBooking();
				return;

			case 'EDIT':
				this.editBooking();
				return;

			case 'RESET':
				this.reset();
				return;

			case 'RETRY_SUBMIT':
				this.confirmBooking();
				return;
		}
	}

	private handleResolvedLocationSelection(role: 'pickup' | 'dropoff', selection: ResolvedPlaceSelection) {
		if (this.placeIntelligenceService.needsKindConfirmation(selection)) {
			this.askLocationKindConfirmation(role, selection);
			return;
		}

		this.finalizeLocationSelection(role, selection.location);
	}

	private finalizeLocationSelection(role: 'pickup' | 'dropoff', location: ChatbotBookingDraft['pickup_location']) {
		if (!location) {
			return;
		}

		if (role === 'pickup') {
			this.bookingData.pickup_location = location;
		} else {
			this.bookingData.dropoff_location = location;
		}

		if (this.bookingData.pickup_location && this.bookingData.dropoff_location) {
			this.bookingData.transfer_type = this.chatbotBookingService.getTransferType(
				this.bookingData.pickup_location.kind,
				this.bookingData.dropoff_location.kind,
			);
			this.bookingData.return_transfer_type = this.chatbotBookingService.getReturnTransferType(this.bookingData.transfer_type);
		}

		if (location.kind === 'cruise') {
			this.askCruiseName(role);
			return;
		}

		if (role === 'pickup') {
			this.askDropoffLocation();
			return;
		}

		this.askOutboundDatetime();
	}

	private setCruiseName(role: 'pickup' | 'dropoff', cruiseName: string) {
		if (role === 'pickup' && this.bookingData.pickup_location) {
			this.bookingData.pickup_location = {
				...this.bookingData.pickup_location,
				cruiseName,
			};
			this.askDropoffLocation();
			return;
		}

		if (role === 'dropoff' && this.bookingData.dropoff_location) {
			this.bookingData.dropoff_location = {
				...this.bookingData.dropoff_location,
				cruiseName,
			};
			this.askOutboundDatetime();
		}
	}

	private confirmLocationKind(value: string) {
		const match = value.match(/^confirm_kind_(pickup|dropoff)_(airport|city|cruise|fbo)$/);
		if (!match || !this.pendingLocationSelection) {
			return;
		}

		const role = match[1] as 'pickup' | 'dropoff';
		const kind = match[2] as ChatLocationKind;
		const confirmed = this.placeIntelligenceService.confirmResolvedKind(this.pendingLocationSelection.selection, kind);
		this.pendingLocationSelection = undefined;
		this.finalizeLocationSelection(role, confirmed.location);
	}

	private calculateLocationInfo(): Promise<void> {
		const maps = (window as any).google;
		if (!maps?.maps || !this.bookingData.pickup_location || !this.bookingData.dropoff_location) {
			this.bookingData.location_info = [];
			return Promise.resolve();
		}

		const pickupPoint = this.getLocationPoint(this.bookingData.pickup_location);
		const dropoffPoint = this.getLocationPoint(this.bookingData.dropoff_location);
		if (!pickupPoint || !dropoffPoint) {
			this.bookingData.location_info = [];
			return Promise.resolve();
		}

		const origins: any[] = [pickupPoint];
		const destinations: any[] = [dropoffPoint];
		if (this.bookingData.service_type === 'round_trip') {
			origins.push(dropoffPoint);
			destinations.push(pickupPoint);
		}

		return new Promise((resolve) => {
			new maps.maps.DistanceMatrixService().getDistanceMatrix(
				{
					origins,
					destinations,
					travelMode: maps.maps.TravelMode.DRIVING,
					unitSystem: maps.maps.UnitSystem.IMPERIAL,
				},
				(response: any, status: string) => {
					if (status !== 'OK' || !response?.rows?.length) {
						this.bookingData.location_info = [];
						resolve();
						return;
					}

					this.bookingData.location_info = response.rows
						.map((row: any, rowIndex: number) => row?.elements?.[rowIndex] || row?.elements?.[0])
						.filter((item: any) => item?.distance && item?.duration);
					resolve();
				},
			);
		});
	}

	private getLocationPoint(location: ChatbotBookingDraft['pickup_location']): { lat: number; lng: number } | null {
		const lat = location?.lat;
		const lng = location?.lng;
		if (lat === null || lat === undefined || lng === null || lng === undefined) {
			return null;
		}

		const numericLat = Number(lat);
		const numericLng = Number(lng);
		if (!Number.isFinite(numericLat) || !Number.isFinite(numericLng)) {
			return null;
		}

		return { lat: numericLat, lng: numericLng };
	}

	private getBookingInstructions(transferType: string): string {
		if (transferType.startsWith('airport_')) {
			return '1. Pax - Text driver when landing. 2. Driver - Text the client a day before to confirm driver name, cell phone and booking details. Text client with ETA when en route. Text pax with pickup instructions when plane has arrived.';
		}
		if (transferType.startsWith('cruise_')) {
			return '1. Pax - Text driver when docked. 2. Driver - Text the client a day before to confirm driver name, cell phone and booking details. Text client with ETA when en route. Text pax with pickup instructions when ship has arrived.';
		}
		return '1. Driver - Text on location. Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route';
	}

	private getReturnBookingInstructions(transferType?: string): string {
		if ((transferType || '').startsWith('airport_')) {
			return '1. Pax - Text driver when landing. 2. Driver - Text the client a day before to confirm driver name, cell phone and booking details. Text client with ETA when en route. Text pax with pickup instructions when plane has arrived.';
		}
		if ((transferType || '').startsWith('cruise_')) {
			return '1. Pax - Text driver when docked. 2. Driver - Text the client a day before to confirm driver name, cell phone and booking details. Text client with ETA when en route. Text pax with pickup instructions when ship has arrived.';
		}
		return '1. Driver - Text on location. Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route';
	}

	private chipLabelFor(value: string): string {
		switch (value) {
			case 'one_way':
				return 'One Way';
			case 'round_trip':
				return 'Round Trip';
			case 'charter_tour':
				return 'Charter';
			case 'loose_customer':
				return 'New Customer';
			case 'existing_account':
				return 'Existing Account';
			case 'CONFIRM':
				return 'Confirm Booking';
			case 'EDIT':
				return 'Start Over';
			case 'RESET':
				return 'Book Another Ride';
			case 'RETRY_SUBMIT':
				return 'Try Again';
			case 'SIGN_IN':
				return 'Sign In';
		}

		if (value.startsWith('confirm_kind_')) {
			const kind = value.split('_').pop() as ChatLocationKind;
			return this.kindLabel(kind);
		}

		return value;
	}

	private kindLabel(kind: ChatLocationKind): string {
		switch (kind) {
			case 'airport':
				return 'Airport';
			case 'cruise':
				return 'Cruise Port';
			case 'fbo':
				return 'FBO';
			case 'city':
			default:
				return 'City';
		}
	}

	private getLocationLabel(location: NonNullable<ChatbotBookingDraft['pickup_location']>): string {
		return location.formattedAddress || location.name;
	}

	private getCurrentUser(): any {
		try {
			return JSON.parse(localStorage.getItem('currentUser') || 'null');
		} catch {
			return null;
		}
	}

	private getCurrentUserName(currentUser: any): string {
		return [
			currentUser?.name,
			[currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ').trim(),
		].find(Boolean) || '';
	}

	private addBotMessage(
		type: ChatMessage['type'],
		text?: string,
		chips?: ChatChip[],
		vehicles?: any[],
		summaryRows?: ChatSummaryRow[],
		meta?: Record<string, any>,
	) {
		const message: ChatMessage = {
			id: `m${++this.msgIdCounter}`,
			from: 'bot',
			type,
			text,
			chips,
			vehicles,
			summaryRows,
			meta,
			timestamp: new Date(),
		};
		this.messages$.next([...this.messages$.value, message]);
	}

	private addUserMessage(text: string) {
		const message: ChatMessage = {
			id: `m${++this.msgIdCounter}`,
			from: 'user',
			type: 'text',
			text,
			timestamp: new Date(),
		};
		this.messages$.next([...this.messages$.value, message]);
	}

	private removeLoadingMessage() {
		this.messages$.next(this.messages$.value.filter((message) => message.type !== 'loading'));
	}

	private advanceTo(state: ChatbotState) {
		this.state$.next(state);
	}

	private handleError(message: string) {
		this.advanceTo(ChatbotState.ERROR);
		this.addBotMessage('text', message);
		this.addBotMessage('chips', undefined, [
			{ label: 'Start Over', value: 'EDIT' },
		]);
	}
}
