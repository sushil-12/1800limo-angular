import { ChatbotBookingDraft, ChatbotBookingService } from './chatbot-booking.service';

describe('ChatbotBookingService', () => {
	let service: ChatbotBookingService;

	beforeEach(() => {
		service = new ChatbotBookingService();
	});

	it('maps canonical transfer types', () => {
		expect(service.getTransferType('airport', 'city')).toBe('airport_to_city');
		expect(service.getTransferType('city', 'airport')).toBe('city_to_airport');
		expect(service.getTransferType('airport', 'cruise')).toBe('airport_to_cruise');
		expect(service.getTransferType('cruise', 'city')).toBe('cruise_to_city');
		expect(service.getTransferType('airport', 'airport')).toBe('airport_to_airport');
	});

	it('builds curated summary rows without internal objects', () => {
		const draft: ChatbotBookingDraft = {
			...service.createDraft(),
			service_type: 'one_way',
			pickup_location: {
				placeId: 'pickup-1',
				name: 'JFK Airport',
				formattedAddress: 'JFK Airport, Queens, NY',
				lat: 40.64,
				lng: -73.77,
				kind: 'airport',
				confidence: 1,
			},
			dropoff_location: {
				placeId: 'dropoff-1',
				name: 'Downtown Chicago',
				formattedAddress: 'Chicago, IL, USA',
				lat: 41.88,
				lng: -87.62,
				kind: 'city',
				confidence: 1,
			},
			pickup_date: '2026-04-10',
			pickup_time: '09:00',
			no_of_passenger: 2,
			no_of_luggage: 3,
			account_type: 'loose_customer',
			loose_customer: {
				first_name: 'Jane',
				last_name: 'Rider',
				phone: '3125551111',
				phone_isd: '+1',
				phone_country: 'us',
				email: 'jane@example.com',
			},
			location_info: [
				{
					distance: { text: '10 mi', value: 16093 },
					duration: { text: '30 mins', value: 1800 },
				},
			],
			rateArray: { all_inclusive_rates: { Base_Rate: { amount: 120 } } },
			grand_total: 120,
			currency: 'usd',
		};

		const rows = service.buildSummaryRows(draft, null);
		const labels = rows.map((row) => row.label);
		const values = rows.map((row) => row.value);

		expect(labels).toContain('Service');
		expect(labels).toContain('Route');
		expect(labels).not.toContain('location_info');
		expect(values).not.toContain('[object Object]');
	});

	it('includes return payload fields for round trips', () => {
		const draft: ChatbotBookingDraft = {
			...service.createDraft(),
			service_type: 'round_trip',
			pickup_location: {
				placeId: 'pickup-1',
				name: 'Downtown Chicago',
				formattedAddress: 'Chicago, IL, USA',
				lat: 41.88,
				lng: -87.62,
				kind: 'city',
				confidence: 1,
			},
			dropoff_location: {
				placeId: 'dropoff-1',
				name: 'JFK Airport',
				formattedAddress: 'JFK Airport, Queens, NY',
				lat: 40.64,
				lng: -73.77,
				kind: 'airport',
				confidence: 1,
			},
			pickup_date: '2026-04-10',
			pickup_time: '09:00',
			return_pickup_date: '2026-04-12',
			return_pickup_time: '17:00',
			account_type: 'individual',
			acc_id: 42,
			selected_vehicle: { id: 5 },
			affiliate_id: 99,
			rateArray: { all_inclusive_rates: { Base_Rate: { amount: 150 } } },
			returnRateArray: { all_inclusive_rates: { Base_Rate: { amount: 140 } } },
			grand_total: 150,
			sub_total: 150,
			return_grand_total: 140,
			return_sub_total: 140,
			shares_array: { baseRate: 100 },
			return_shares_array: { baseRate: 90 },
		};

		const payload = service.buildReservationPayload(draft, { account_id: 42, email: 'user@example.com' });

		expect(payload.transfer_type).toBe('city_to_airport');
		expect(payload.return_transfer_type).toBe('airport_to_city');
		expect(payload.pickup_date).toBe('2026-04-10');
		expect(payload.pickup_time).toBe('9:00 AM');
		expect(payload.return_pickup_date).toBe('2026-04-12');
		expect(payload.return_pickup_time).toBe('5:00 PM');
		expect(payload.returnRateArray).toEqual(draft.returnRateArray);
		expect(payload.return_shares_array).toEqual(draft.return_shares_array);
	});

	it('formats outbound quote and rate request times with am/pm', () => {
		const draft: ChatbotBookingDraft = {
			...service.createDraft(),
			service_type: 'one_way',
			pickup_time: '16:45',
			pickup_location: {
				placeId: 'pickup-1',
				name: 'Airport',
				formattedAddress: 'Airport',
				lat: 1,
				lng: 2,
				kind: 'airport',
				confidence: 1,
			},
			dropoff_location: {
				placeId: 'dropoff-1',
				name: 'City',
				formattedAddress: 'City',
				lat: 3,
				lng: 4,
				kind: 'city',
				confidence: 1,
			},
		};

		const quotePayload = service.buildVehicleSearchPayload(draft);
		const rateRequest = service.buildVehicleRateRequest(draft, { id: 9 });

		expect(quotePayload.pickup_time).toBe('4:45 PM');
		expect(rateRequest.pickup_time).toBe('4:45 PM');
	});

	it('normalizes charter hours to the minimum of two hours', () => {
		const draft: ChatbotBookingDraft = {
			...service.createDraft(),
			service_type: 'charter_tour',
			booking_hour: 1,
			pickup_location: {
				placeId: 'pickup-1',
				name: 'Midtown Manhattan',
				formattedAddress: 'New York, NY, USA',
				lat: 40.75,
				lng: -73.98,
				kind: 'city',
				confidence: 1,
			},
			dropoff_location: {
				placeId: 'dropoff-1',
				name: 'Brooklyn',
				formattedAddress: 'Brooklyn, NY, USA',
				lat: 40.68,
				lng: -73.94,
				kind: 'city',
				confidence: 1,
			},
		};

		const payload = service.buildReservationPayload(draft, null);
		const rateRequest = service.buildVehicleRateRequest(draft, { id: 10 });

		expect(payload.number_of_hours).toBe(2);
		expect(rateRequest.no_of_hours).toBe(2);
	});
});
