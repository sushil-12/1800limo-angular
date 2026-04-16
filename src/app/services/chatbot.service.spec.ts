import { of } from 'rxjs';
import { ChatbotBookingService } from './chatbot-booking.service';
import { ChatbotService } from './chatbot.service';

describe('ChatbotService', () => {
	let service: ChatbotService;

	beforeEach(() => {
		localStorage.removeItem('currentUser');

		service = new ChatbotService(
			{
				getMasterVehicleTypes: jasmine.createSpy('getMasterVehicleTypes').and.returnValue(of({ data: [] })),
				getVehicleDetails: jasmine.createSpy('getVehicleDetails').and.returnValue(of({ data: [] })),
				createBooking: jasmine.createSpy('createBooking').and.returnValue(of({ data: { reservation_id: 123 } })),
			} as any,
			{
				createBooking: jasmine.createSpy('createBooking').and.returnValue(of({ data: { reservation_id: 123 } })),
			} as any,
			{
				fetchRatesByAffiliateVeh: jasmine.createSpy('fetchRatesByAffiliateVeh').and.returnValue(of({ data: {} })),
			} as any,
			new ChatbotBookingService(),
			{
				needsKindConfirmation: jasmine.createSpy('needsKindConfirmation').and.returnValue(false),
				confirmResolvedKind: jasmine.createSpy('confirmResolvedKind'),
			} as any,
		);
	});

	afterEach(() => {
		localStorage.removeItem('currentUser');
	});

	it('treats zero coordinates as valid route points', () => {
		const point = (service as any).getLocationPoint({
			lat: 0,
			lng: 0,
		});

		expect(point).toEqual({ lat: 0, lng: 0 });
	});

	it('keeps the logged-out existing-account path from dead-ending', () => {
		(service as any).askUserType();
		service.handleChip('existing_account');

		const chipMessages = service.messages$.value.filter((message) => message.type === 'chips');
		const latestOptions = chipMessages[chipMessages.length - 1]?.chips?.map((chip) => chip.value) || [];

		expect(latestOptions).toContain('loose_customer');
		expect(latestOptions).toContain('SIGN_IN');
	});

	it('auto-uses the logged-in individual account id', () => {
		localStorage.setItem('currentUser', JSON.stringify({
			account_id: 456,
			first_name: 'Jamie',
			last_name: 'Traveler',
		}));
		spyOn<any>(service, 'loadVehicleCategories');

		(service as any).askUserType();

		expect(service.bookingData.account_type).toBe('individual');
		expect(service.bookingData.acc_id).toBe(456);
		expect((service as any).loadVehicleCategories).toHaveBeenCalled();
	});
});
