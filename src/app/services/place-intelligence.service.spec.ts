import { PlaceIntelligenceService } from './place-intelligence.service';

describe('PlaceIntelligenceService', () => {
	let service: PlaceIntelligenceService;

	beforeEach(() => {
		service = new PlaceIntelligenceService({
			getAirportsAndBigData: () => ({
				airportsData: [
					{
						id: 1,
						code: 'JFK',
						name: 'John F Kennedy International Airport',
						formatted_name: 'JFK - John F Kennedy International Airport, New York, United States',
						city: 'New York',
						country: 'United States',
						lat: 40.6413,
						long: -73.7781,
					},
				],
			}),
		} as any);
	});

	it('routes airport-code-like input to airport suggestion queries', async () => {
		const analysis = await (service as any).analyzeQuery('JFK');

		expect(analysis.kind).toBe('airport');
		expect(analysis.queryVariants).toContain('JFK airport');
		expect(analysis.queryVariants).toContain('JFK airport terminal');
	});

	it('keeps terminal-like input on terminal-oriented queries', async () => {
		const analysis = await (service as any).analyzeQuery('JFK terminal 4');

		expect(analysis.kind).toBe('airport');
		expect(analysis.queryVariants.some((query: string) => query.toLowerCase().includes('terminal'))).toBeTrue();
	});

	it('does not append terminal to plain city queries', async () => {
		spyOn<any>(service, 'inferWithMistral').and.returnValue(Promise.resolve(null));

		const analysis = await (service as any).analyzeQuery('downtown chicago');

		expect(analysis.queryVariants).toContain('downtown chicago');
		expect(analysis.queryVariants.some((query: string) => query.toLowerCase().includes('terminal'))).toBeFalse();
	});

	it('marks ambiguous classifications for confirmation and leaves deterministic matches alone', () => {
		const ambiguous = {
			location: {
				placeId: '1',
				name: 'Midway terminal',
				formattedAddress: 'Chicago, IL',
				lat: 41,
				lng: -87,
				kind: 'airport' as const,
				confidence: 0.5,
			},
			ambiguousKinds: ['airport', 'cruise'] as const,
		};
		const deterministic = {
			location: {
				placeId: '2',
				name: 'JFK Airport',
				formattedAddress: 'Queens, NY',
				lat: 40.64,
				lng: -73.77,
				kind: 'airport' as const,
				confidence: 0.98,
			},
			ambiguousKinds: [] as const,
		};

		expect(service.needsKindConfirmation(ambiguous as any)).toBeTrue();
		expect(service.needsKindConfirmation(deterministic as any)).toBeFalse();
	});

	it('does not block if the mistral fallback is unavailable', async () => {
		spyOn<any>(service, 'inferWithMistral').and.returnValue(Promise.resolve(null));

		const analysis = await (service as any).analyzeQuery('the peninsula chicago');

		expect(analysis.normalizedQuery).toBe('the peninsula chicago');
		expect(analysis.queryVariants).toContain('the peninsula chicago');
	});

	it('does not classify a normal business address in the same city as an airport', () => {
		const matchedAirport = (service as any).resolveInternalAirportRecord(
			{
				name: 'InfoStride Technologies Pvt. Ltd.',
				formatted_address: 'Industrial Area, Chandigarh, India',
			},
			30.6735,
			76.7885,
			['establishment', 'point_of_interest'],
		);
		const classification = (service as any).classifyPlace(
			'InfoStride Technologies Pvt. Ltd.',
			'Industrial Area, Chandigarh, India',
			['establishment', 'point_of_interest'],
			matchedAirport,
		);

		expect(matchedAirport).toBeNull();
		expect(classification.kind).toBe('city');
	});
});
