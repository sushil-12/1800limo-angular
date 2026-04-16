import { Injectable } from '@angular/core';

export type ChatServiceType = 'one_way' | 'round_trip' | 'charter_tour';
export type ChatLocationKind = 'airport' | 'city' | 'cruise' | 'fbo' | 'unknown';
export type ChatTransferType =
	| 'airport_to_city'
	| 'airport_to_airport'
	| 'airport_to_cruise'
	| 'city_to_city'
	| 'city_to_airport'
	| 'city_to_cruise'
	| 'cruise_to_airport'
	| 'cruise_to_city';

export interface ChatSummaryRow {
	label: string;
	value: string;
}

export interface LooseCustomer {
	first_name: string;
	last_name: string;
	phone: string;
	phone_isd: string;
	phone_country: string;
	email: string;
}

export interface ChatbotLocation {
	placeId: string;
	name: string;
	formattedAddress: string;
	lat: number | null;
	lng: number | null;
	kind: ChatLocationKind;
	confidence: number;
	airportId?: number | string;
	airportName?: string;
	airportCity?: string;
	isTerminal?: boolean;
	cruiseName?: string;
	fboName?: string;
	fboAddress?: string;
	matchedAirport?: any;
}

export interface ChatbotBookingDraft {
	service_type?: ChatServiceType;
	transfer_type?: ChatTransferType;
	return_transfer_type?: ChatTransferType;
	pickup_location?: ChatbotLocation;
	dropoff_location?: ChatbotLocation;
	pickup_date?: string;
	pickup_time?: string;
	return_pickup_date?: string;
	return_pickup_time?: string;
	no_of_passenger?: number;
	no_of_luggage?: number;
	booking_hour?: number;
	account_type?: 'individual' | 'loose_customer';
	acc_id?: number;
	loose_customer?: LooseCustomer;
	passenger_name?: string;
	passenger_email?: string;
	passenger_cell?: string;
	passenger_cell_isd?: string;
	passenger_cell_country?: string;
	booking_instructions?: string;
	return_booking_instructions?: string;
	meet_greet_choices?: number;
	meet_greet_choices_name?: string;
	return_meet_greet_choices?: number;
	return_meet_greet_choices_name?: string;
	location_info?: Array<{ distance: { text: string; value: number }; duration: { text: string; value: number } }>;
	selected_vehicle?: any;
	affiliate_id?: number;
	affiliate_type?: string;
	currency?: string;
	booking_created_from?: string;
	rateArray?: any;
	returnRateArray?: any;
	sub_total?: number;
	grand_total?: number;
	return_sub_total?: number;
	return_grand_total?: number;
	min_rate_involved?: boolean;
	shares_array?: any;
	return_shares_array?: any;
	number_of_vehicles?: number;
	is_master_vehicle?: boolean;
}

@Injectable({
	providedIn: 'root',
})
export class ChatbotBookingService {
	private readonly defaultBookingInstructions =
		'1. Driver - Text on location. Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route';

	createDraft(): ChatbotBookingDraft {
		return {
			number_of_vehicles: 1,
			booking_instructions: this.defaultBookingInstructions,
			return_booking_instructions: this.defaultBookingInstructions,
		};
	}

	getTransferType(pickupKind?: ChatLocationKind, dropoffKind?: ChatLocationKind): ChatTransferType {
		const from = this.normalizeTransferKind(pickupKind);
		const to = this.normalizeTransferKind(dropoffKind);
		const key = `${from}_to_${to}` as ChatTransferType;
		const valid: ChatTransferType[] = [
			'airport_to_city',
			'airport_to_airport',
			'airport_to_cruise',
			'city_to_city',
			'city_to_airport',
			'city_to_cruise',
			'cruise_to_airport',
			'cruise_to_city',
		];

		return valid.includes(key) ? key : 'city_to_city';
	}

	getReturnTransferType(transferType?: ChatTransferType): ChatTransferType {
		switch (transferType) {
			case 'airport_to_city':
				return 'city_to_airport';
			case 'airport_to_airport':
				return 'airport_to_airport';
			case 'airport_to_cruise':
				return 'cruise_to_airport';
			case 'city_to_airport':
				return 'airport_to_city';
			case 'city_to_cruise':
				return 'cruise_to_city';
			case 'cruise_to_airport':
				return 'airport_to_cruise';
			case 'cruise_to_city':
				return 'city_to_cruise';
			default:
				return 'city_to_city';
		}
	}

	getMeetAndGreetDefaults(transferType: ChatTransferType): {
		meet_greet_choices: number;
		meet_greet_choices_name: string;
		return_meet_greet_choices: number;
		return_meet_greet_choices_name: string;
	} {
		const outboundCityPickup = transferType.startsWith('city_');
		const returnCityPickup = transferType.endsWith('_city');

		return {
			meet_greet_choices: outboundCityPickup ? 1 : 2,
			meet_greet_choices_name: outboundCityPickup
				? 'Driver - Text/call when on location'
				: 'Driver -  Airport - Text/call after plane lands with curbside meet location',
			return_meet_greet_choices: returnCityPickup ? 1 : 2,
			return_meet_greet_choices_name: returnCityPickup
				? 'Driver - Text/call when on location'
				: 'Driver -  Airport - Text/call after plane lands with curbside meet location',
		};
	}

	buildVehicleSearchPayload(draft: ChatbotBookingDraft): any {
		const pickup = draft.pickup_location;
		const dropoff = draft.dropoff_location;
		const normalizedHours = this.getNormalizedHours(draft);
		const payload: any = {
			service_type: draft.service_type || 'one_way',
			pickup_type: this.isAirportLike(pickup?.kind) ? 'airport' : 'address',
			dropoff_type: this.isAirportLike(dropoff?.kind) ? 'airport' : 'address',
			pickup_date: draft.pickup_date,
			pickup_time: this.formatTimeForPayload(draft.pickup_time),
			no_of_passenger: draft.no_of_passenger || 1,
			no_of_luggage: draft.no_of_luggage || 0,
			booking_hour: draft.service_type === 'charter_tour' ? normalizedHours : Number(draft.booking_hour || 0),
			location_info: draft.location_info || [],
		};

		this.applyQuoteLocationFields(payload, 'pickup', pickup);
		this.applyQuoteLocationFields(payload, 'dropoff', dropoff);

		if (draft.service_type === 'round_trip') {
			payload.return_pickup_date = draft.return_pickup_date || draft.pickup_date;
			payload.return_pickup_time = this.formatTimeForPayload(draft.return_pickup_time || draft.pickup_time);
			payload.return_pickup_type = this.isAirportLike(dropoff?.kind) ? 'airport' : 'address';
			payload.return_dropoff_type = this.isAirportLike(pickup?.kind) ? 'airport' : 'address';
			this.applyQuoteLocationFields(payload, 'return_pickup', dropoff);
			this.applyQuoteLocationFields(payload, 'return_dropoff', pickup);
		}

		return payload;
	}

	buildVehicleRateRequest(draft: ChatbotBookingDraft, vehicle: any): any {
		const transferType = draft.transfer_type || this.getTransferType(draft.pickup_location?.kind, draft.dropoff_location?.kind);
		const normalizedHours = this.getNormalizedHours(draft);
		const request: any = {
			vehicle_id: vehicle?.id,
			return_vehicle_id: vehicle?.id,
			transfer_type: transferType,
			service_type: draft.service_type || 'one_way',
			numberOfVehicles: draft.number_of_vehicles || 1,
			distance: draft.location_info?.[0]?.distance?.value || 0,
			return_distance: draft.location_info?.[1]?.distance?.value || 0,
			no_of_hours: draft.service_type === 'charter_tour' ? normalizedHours : Number(draft.booking_hour || 0),
			is_master_vehicle: !!vehicle?.is_master_vehicle,
			extra_stops: [],
			return_extra_stops: [],
			pickup_time: this.formatTimeForPayload(draft.pickup_time),
			return_pickup_time: this.formatTimeForPayload(draft.return_pickup_time || draft.pickup_time),
		};

		return request;
	}

	applyPricingResponse(draft: ChatbotBookingDraft, response: any): Partial<ChatbotBookingDraft> {
		const rateArray = this.stripRateArrayMeta(response?.data?.rateArray);
		const returnRateArray = this.stripRateArrayMeta(response?.data?.retrunRateArray);
		const subTotal = this.sumRateAmounts(rateArray);
		const returnSubTotal = this.sumRateAmounts(returnRateArray);
		const grandTotal = subTotal;
		const returnGrandTotal = returnSubTotal;

		return {
			rateArray,
			returnRateArray: draft.service_type === 'round_trip' ? returnRateArray : undefined,
			sub_total: subTotal,
			grand_total: grandTotal,
			return_sub_total: draft.service_type === 'round_trip' ? returnSubTotal : undefined,
			return_grand_total: draft.service_type === 'round_trip' ? returnGrandTotal : undefined,
			min_rate_involved: !!response?.data?.min_rate_involved,
			shares_array: this.createShareArray(draft, rateArray, grandTotal),
			return_shares_array: draft.service_type === 'round_trip'
				? this.createShareArray(draft, returnRateArray, returnGrandTotal)
				: undefined,
		};
	}

	applyVehicleFallbackPricing(draft: ChatbotBookingDraft, vehicle: any): Partial<ChatbotBookingDraft> {
		const serviceType = draft.service_type || 'one_way';
		const rateKey = serviceType === 'round_trip'
			? 'rate_breakdown_round_trip'
			: serviceType === 'charter_tour'
				? 'rate_breakdown_charter_tour'
				: 'rate_breakdown_one_way';
		const fallback = this.stripRateArrayMeta(vehicle?.[rateKey]);
		const total = Number(
			fallback?.grand_total
			?? fallback?.sub_total
			?? this.sumRateAmounts(fallback)
			?? 0
		);

		return {
			rateArray: fallback,
			returnRateArray: serviceType === 'round_trip' ? fallback : undefined,
			sub_total: total,
			grand_total: total,
			return_sub_total: serviceType === 'round_trip' ? total : undefined,
			return_grand_total: serviceType === 'round_trip' ? total : undefined,
			shares_array: this.createShareArray(draft, fallback, total),
			return_shares_array: serviceType === 'round_trip'
				? this.createShareArray(draft, fallback, total)
				: undefined,
		};
	}

	buildReservationPayload(draft: ChatbotBookingDraft, currentUser: any): any {
		const transferType = draft.transfer_type || this.getTransferType(draft.pickup_location?.kind, draft.dropoff_location?.kind);
		const returnTransferType = this.getReturnTransferType(transferType);
		const defaults = this.getMeetAndGreetDefaults(transferType);
		const looseCustomerName = `${draft.loose_customer?.first_name || ''} ${draft.loose_customer?.last_name || ''}`.trim();
		const normalizedHours = this.getNormalizedHours(draft);
		const payload: any = {
			service_type: draft.service_type,
			transfer_type: transferType,
			return_transfer_type: draft.service_type === 'round_trip' ? returnTransferType : undefined,
			number_of_hours: draft.service_type === 'charter_tour' ? normalizedHours : Number(draft.booking_hour || 2),
			account_type: draft.account_type,
			total_passengers: draft.no_of_passenger || 1,
			luggage_count: draft.no_of_luggage || 0,
			pickup_date: draft.pickup_date,
			pickup_time: this.formatTimeForPayload(draft.pickup_time),
			passenger_name: draft.passenger_name || looseCustomerName || this.getCurrentUserName(currentUser),
			passenger_email: draft.passenger_email || draft.loose_customer?.email || currentUser?.email || '',
			passenger_cell: draft.passenger_cell || draft.loose_customer?.phone || currentUser?.phone || currentUser?.mobile || '',
			passenger_cell_isd: draft.passenger_cell_isd || draft.loose_customer?.phone_isd || currentUser?.isd || '+1',
			passenger_cell_country: draft.passenger_cell_country || draft.loose_customer?.phone_country || currentUser?.phoneCountry || currentUser?.country || 'us',
			booking_instructions: draft.booking_instructions || this.defaultBookingInstructions,
			return_booking_instructions: draft.return_booking_instructions || this.defaultBookingInstructions,
			meet_greet_choices: draft.meet_greet_choices || defaults.meet_greet_choices,
			meet_greet_choices_name: draft.meet_greet_choices_name || defaults.meet_greet_choices_name,
			return_meet_greet_choices: draft.return_meet_greet_choices || defaults.return_meet_greet_choices,
			return_meet_greet_choices_name: draft.return_meet_greet_choices_name || defaults.return_meet_greet_choices_name,
			affiliate_type: draft.affiliate_type || 'affiliate',
			affiliate_id: draft.affiliate_id,
			vehicle_id: draft.selected_vehicle?.id,
			driver_id: draft.selected_vehicle?.driver_id,
			is_master_vehicle: !!draft.selected_vehicle?.is_master_vehicle,
			number_of_vehicles: draft.number_of_vehicles || 1,
			platform_type: 'web',
			currency: draft.currency || 'usd',
			booking_created_from: draft.booking_created_from || (currentUser?.created_by_role === 'subscriber' ? 'subscriber' : undefined),
			proceed: true,
			location_info: draft.location_info || [],
			rateArray: this.stripRateArrayMeta(draft.rateArray),
			grand_total: draft.grand_total || 0,
			sub_total: draft.sub_total || 0,
			min_rate_involved: !!draft.min_rate_involved,
			shares_array: draft.shares_array,
		};

		if (draft.account_type === 'individual') {
			payload.acc_id = Number(draft.acc_id || currentUser?.account_id || currentUser?.id || 0) || undefined;
		}

		if (draft.account_type === 'loose_customer' && draft.loose_customer) {
			payload.loose_customer = draft.loose_customer;
		}

		this.applyReservationLocationFields(payload, 'pickup', draft.pickup_location);
		this.applyReservationLocationFields(payload, 'dropoff', draft.dropoff_location);
		this.applyOutboundSpecialLocationFields(payload, draft.pickup_location, draft.dropoff_location);

		if (draft.service_type === 'round_trip') {
			payload.return_pickup_date = draft.return_pickup_date || draft.pickup_date;
			payload.return_pickup_time = this.formatTimeForPayload(draft.return_pickup_time || draft.pickup_time);
			payload.returnRateArray = this.stripRateArrayMeta(draft.returnRateArray);
			payload.return_grand_total = draft.return_grand_total || 0;
			payload.return_sub_total = draft.return_sub_total || 0;
			payload.return_shares_array = draft.return_shares_array;
			this.applyReservationLocationFields(payload, 'return_pickup', draft.dropoff_location);
			this.applyReservationLocationFields(payload, 'return_dropoff', draft.pickup_location);
			this.applyReturnSpecialLocationFields(payload, draft.pickup_location, draft.dropoff_location);
		}

		return this.compactPayload(payload);
	}

	buildSummaryRows(draft: ChatbotBookingDraft, currentUser: any): ChatSummaryRow[] {
		const rows: ChatSummaryRow[] = [];

		rows.push({ label: 'Service', value: this.formatServiceType(draft.service_type) });
		rows.push({
			label: 'Route',
			value: this.formatRoute(draft.pickup_location, draft.dropoff_location),
		});

		if (draft.pickup_location) {
			rows.push({
				label: 'Pickup',
				value: this.buildLocationLabel(draft.pickup_location),
			});
		}

		if (draft.dropoff_location) {
			rows.push({
				label: 'Dropoff',
				value: this.buildLocationLabel(draft.dropoff_location),
			});
		}

		if (draft.pickup_date || draft.pickup_time) {
			rows.push({
				label: 'Pickup Time',
				value: [draft.pickup_date, this.formatTimeForPayload(draft.pickup_time)].filter(Boolean).join(' at '),
			});
		}

		if (draft.service_type === 'round_trip' && (draft.return_pickup_date || draft.return_pickup_time)) {
			rows.push({
				label: 'Return Time',
				value: [draft.return_pickup_date, this.formatTimeForPayload(draft.return_pickup_time)].filter(Boolean).join(' at '),
			});
		}

		if (draft.service_type === 'charter_tour') {
			rows.push({
				label: 'Hours',
				value: `${this.getNormalizedHours(draft)}`,
			});
		}

		rows.push({
			label: 'Passengers',
			value: `${draft.no_of_passenger || 1}`,
		});
		rows.push({
			label: 'Bags',
			value: `${draft.no_of_luggage || 0}`,
		});

		rows.push({
			label: 'Customer',
			value: draft.account_type === 'individual'
				? this.getCurrentUserName(currentUser) || `Account #${draft.acc_id || currentUser?.account_id || ''}`
				: `${draft.loose_customer?.first_name || ''} ${draft.loose_customer?.last_name || ''}`.trim(),
		});

		if (draft.selected_vehicle) {
			rows.push({
				label: 'Vehicle',
				value: this.getVehicleLabel(draft.selected_vehicle),
			});
		}

		rows.push({
			label: 'Meet & Greet',
			value: draft.meet_greet_choices_name || this.getMeetAndGreetDefaults(
				draft.transfer_type || this.getTransferType(draft.pickup_location?.kind, draft.dropoff_location?.kind),
			).meet_greet_choices_name,
		});

		if (draft.service_type === 'round_trip' && draft.return_meet_greet_choices_name) {
			rows.push({
				label: 'Return Meet & Greet',
				value: draft.return_meet_greet_choices_name,
			});
		}

		rows.push({
			label: 'Estimated Total',
			value: this.formatMoney(
				Number(draft.grand_total || 0) + Number(draft.service_type === 'round_trip' ? draft.return_grand_total || 0 : 0),
				draft.currency,
			),
		});

		return rows.filter((row) => row.value && row.value !== '0.00');
	}

	formatMoney(amount: number, currency?: string): string {
		const safeAmount = Number(amount || 0);
		const normalizedCurrency = (currency || 'usd').toUpperCase();
		return `${normalizedCurrency} ${safeAmount.toFixed(2)}`;
	}

	private applyQuoteLocationFields(payload: any, prefix: 'pickup' | 'dropoff' | 'return_pickup' | 'return_dropoff', location?: ChatbotLocation) {
		if (!location) {
			return;
		}

		if (this.isAirportLike(location.kind)) {
			payload[`${prefix}_airport`] = location.airportId || location.placeId;
			payload[`${prefix}_airport_name`] = location.airportName || location.name;
			payload[`${prefix}_airport_lat`] = location.lat;
			payload[`${prefix}_airport_long`] = location.lng;
			return;
		}

		payload[`${prefix}_address`] = location.formattedAddress || location.name;
		payload[`${prefix}_address_lat`] = location.lat;
		payload[`${prefix}_address_long`] = location.lng;
	}

	private applyReservationLocationFields(payload: any, prefix: 'pickup' | 'dropoff' | 'return_pickup' | 'return_dropoff', location?: ChatbotLocation) {
		if (!location) {
			return;
		}

		if (this.isAirportLike(location.kind)) {
			payload[`${prefix}_airport`] = location.airportId || location.placeId;
			payload[`${prefix}_airport_name`] = location.airportName || location.name;
			payload[`${prefix}_airport_latitude`] = location.lat;
			payload[`${prefix}_airport_longitude`] = location.lng;
			payload[`${prefix}_airport_lat`] = location.lat;
			payload[`${prefix}_airport_long`] = location.lng;
			return;
		}

		payload[prefix] = location.formattedAddress || location.name;
		payload[`${prefix}_latitude`] = location.lat;
		payload[`${prefix}_longitude`] = location.lng;
		if (prefix === 'pickup') {
			payload.pickup_address = location.formattedAddress || location.name;
			payload.pickup_address_lat = location.lat;
			payload.pickup_address_long = location.lng;
		}
		if (prefix === 'dropoff') {
			payload.dropoff_address = location.formattedAddress || location.name;
			payload.dropoff_address_lat = location.lat;
			payload.dropoff_address_long = location.lng;
		}
		if (prefix === 'return_pickup') {
			payload.return_pickup_address = location.formattedAddress || location.name;
			payload.return_pickup_address_lat = location.lat;
			payload.return_pickup_address_long = location.lng;
		}
		if (prefix === 'return_dropoff') {
			payload.return_dropoff_address = location.formattedAddress || location.name;
			payload.return_dropoff_address_lat = location.lat;
			payload.return_dropoff_address_long = location.lng;
		}
	}

	private applyOutboundSpecialLocationFields(payload: any, pickup?: ChatbotLocation, dropoff?: ChatbotLocation) {
		if (this.isAirportLike(pickup?.kind)) {
			payload.origin_airport_city = pickup?.airportCity || pickup?.airportName || pickup?.name;
		}
		if (this.isAirportLike(dropoff?.kind)) {
			payload.departing_airport_city = dropoff?.airportCity || dropoff?.airportName || dropoff?.name;
		}

		const cruiseLocation = pickup?.kind === 'cruise' ? pickup : dropoff?.kind === 'cruise' ? dropoff : undefined;
		if (cruiseLocation) {
			payload.cruise_port = cruiseLocation.formattedAddress || cruiseLocation.name;
			payload.cruise_name = cruiseLocation.cruiseName || '';
		}

		const fboLocation = pickup?.kind === 'fbo' ? pickup : dropoff?.kind === 'fbo' ? dropoff : undefined;
		if (fboLocation) {
			payload.fbo_name = fboLocation.fboName || fboLocation.name;
			payload.fbo_address = fboLocation.fboAddress || fboLocation.formattedAddress || fboLocation.name;
		}
	}

	private applyReturnSpecialLocationFields(payload: any, pickup?: ChatbotLocation, dropoff?: ChatbotLocation) {
		if (this.isAirportLike(dropoff?.kind)) {
			payload.origin_airport_city = payload.origin_airport_city || dropoff?.airportCity || dropoff?.airportName || dropoff?.name;
		}
		if (this.isAirportLike(pickup?.kind)) {
			payload.departing_airport_city = payload.departing_airport_city || pickup?.airportCity || pickup?.airportName || pickup?.name;
		}

		const cruiseLocation = pickup?.kind === 'cruise' ? pickup : dropoff?.kind === 'cruise' ? dropoff : undefined;
		if (cruiseLocation) {
			payload.return_cruise_port = cruiseLocation.formattedAddress || cruiseLocation.name;
			payload.return_cruise_name = cruiseLocation.cruiseName || '';
		}

		const fboLocation = pickup?.kind === 'fbo' ? pickup : dropoff?.kind === 'fbo' ? dropoff : undefined;
		if (fboLocation) {
			payload.return_fbo_name = fboLocation.fboName || fboLocation.name;
			payload.return_fbo_address = fboLocation.fboAddress || fboLocation.formattedAddress || fboLocation.name;
		}
	}

	private createShareArray(draft: ChatbotBookingDraft, rateArray: any, grandTotal: number): any {
		if (!rateArray) {
			return undefined;
		}

		const safeGrandTotal = Number(grandTotal || 0);
		const numberOfVehicles = Number(draft.number_of_vehicles || 1);
		let baseRate = 0;
		const baseRateEntry = rateArray?.all_inclusive_rates?.Base_Rate;

		if (baseRateEntry?.baserate) {
			baseRate += Number(baseRateEntry.baserate) * (
				draft.service_type === 'charter_tour' && draft.booking_hour
					? Number(draft.booking_hour)
					: 1
			);
		}

		['ELH_Charges', 'Stops', 'Wait'].forEach((key) => {
			baseRate += Number(rateArray?.all_inclusive_rates?.[key]?.baserate || 0);
		});

		Object.keys(rateArray?.amenities || {}).forEach((key) => {
			baseRate += Number(rateArray?.amenities?.[key]?.baserate || 0);
		});

		baseRate *= numberOfVehicles;

		const stripeFee = safeGrandTotal * 0.05 + 0.30;
		const adminShare = (baseRate * 0.25) + (Number(rateArray?.misc?.Extra_Gratuity?.amount || 0) * 0.25);

		return {
			baseRate,
			grandTotal: safeGrandTotal,
			stripeFee,
			adminShare,
			deducted_admin_share: adminShare - stripeFee,
			affiliateShare: safeGrandTotal - (baseRate * 0.25),
		};
	}

	private sumRateAmounts(rateArray: any): number {
		let total = 0;

		Object.keys(rateArray || {}).forEach((outerKey) => {
			const innerValue = rateArray?.[outerKey];
			if (!innerValue || typeof innerValue !== 'object') {
				return;
			}

			Object.keys(innerValue).forEach((innerKey) => {
				total += Number(innerValue?.[innerKey]?.amount || 0);
			});
		});

		return total;
	}

	private stripRateArrayMeta(rateArray: any): any {
		if (!rateArray || typeof rateArray !== 'object') {
			return rateArray;
		}

		const clone = JSON.parse(JSON.stringify(rateArray));
		delete clone.grand_total;
		delete clone.sub_total;
		delete clone.min_rate_involved;
		delete clone.r_grandtotal;
		delete clone.r_subtotal;
		return clone;
	}

	private buildLocationLabel(location: ChatbotLocation): string {
		const suffix = location.kind === 'airport'
			? 'Airport'
			: location.kind === 'cruise'
				? 'Cruise Port'
				: location.kind === 'fbo'
					? 'FBO'
					: 'City';
		return `${location.name} (${suffix})`;
	}

	private formatRoute(pickup?: ChatbotLocation, dropoff?: ChatbotLocation): string {
		if (!pickup || !dropoff) {
			return '';
		}

		return `${this.formatLocationKind(pickup.kind)} to ${this.formatLocationKind(dropoff.kind)}`;
	}

	private formatLocationKind(kind?: ChatLocationKind): string {
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

	private formatServiceType(serviceType?: ChatServiceType): string {
		switch (serviceType) {
			case 'round_trip':
				return 'Round Trip';
			case 'charter_tour':
				return 'Charter';
			default:
				return 'One Way';
		}
	}

	private getVehicleLabel(vehicle: any): string {
		const parts = [vehicle?.vehicle_type, vehicle?.make, vehicle?.model]
			.filter(Boolean)
			.join(' ');
		return parts || 'Vehicle';
	}

	private getCurrentUserName(currentUser: any): string {
		return [
			currentUser?.name,
			[currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ').trim(),
		].find((value) => !!value) || '';
	}

	private compactPayload(payload: any): any {
		return Object.keys(payload).reduce((acc: Record<string, any>, key: string) => {
			const value = payload[key];
			if (value !== undefined) {
				acc[key] = value;
			}
			return acc;
		}, {});
	}

	private isAirportLike(kind?: ChatLocationKind): boolean {
		return kind === 'airport' || kind === 'fbo';
	}

	private getNormalizedHours(draft: ChatbotBookingDraft): number {
		return Math.max(2, Number(draft.booking_hour || 2));
	}

	private formatTimeForPayload(time?: string): string | undefined {
		if (!time) {
			return time;
		}

		const trimmed = String(time).trim();
		if (!trimmed) {
			return trimmed;
		}

		const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])$/);
		if (amPmMatch) {
			const normalizedHour = Math.min(12, Math.max(1, Number(amPmMatch[1]) || 12));
			return `${normalizedHour}:${amPmMatch[2]} ${amPmMatch[3].toUpperCase()}`;
		}

		const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
		if (!twentyFourHourMatch) {
			return trimmed;
		}

		const hours = Number(twentyFourHourMatch[1]);
		const minutes = twentyFourHourMatch[2];
		if (!Number.isFinite(hours) || hours < 0 || hours > 23) {
			return trimmed;
		}

		const period = hours >= 12 ? 'PM' : 'AM';
		const twelveHour = hours % 12 || 12;
		return `${twelveHour}:${minutes} ${period}`;
	}

	private normalizeTransferKind(kind?: ChatLocationKind): 'airport' | 'city' | 'cruise' {
		switch (kind) {
			case 'airport':
			case 'fbo':
				return 'airport';
			case 'cruise':
				return 'cruise';
			default:
				return 'city';
		}
	}
}
