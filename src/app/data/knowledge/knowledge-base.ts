import { KnowledgeEntry } from './knowledge.types';

/**
 * ============================================================================
 *  AI KNOWLEDGE REPOSITORY  ("train the AI" here)
 * ============================================================================
 *
 *  This array IS the knowledge the in-app assistant answers from. To "train"
 *  the assistant, add / edit / remove entries below — no model retraining,
 *  no backend, no deploy pipeline beyond a normal app build.
 *
 *  HOW RETRIEVAL WORKS (see knowledge.service.ts):
 *    user question -> tokenized -> scored against every entry's
 *    title (x3) + tags (x2) + content (x1) -> top matches are injected into
 *    the Mistral prompt as the ONLY allowed source of facts.
 *
 *  RULES FOR GOOD ENTRIES:
 *    1. One topic per entry. Keep `content` self-contained (don't rely on
 *       another entry to make sense).
 *    2. Put synonyms a customer might type into `tags`
 *       (e.g. 'price', 'cost', 'how much', 'rate').
 *    3. Be factual. The assistant is instructed to never invent details not
 *       present here, so anything missing simply won't be answered.
 *    4. Add a `url` when there's a canonical page to link to.
 *
 *  ⚠️ The entries below are STARTER content. Verify every fact (especially
 *  pricing, coverage, and policy specifics) against the real business before
 *  relying on them in production. Placeholders are marked with TODO.
 * ============================================================================
 */
export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
	// ---------------------------------------------------------------- company
	{
		id: 'about-company',
		title: 'About 1-800-LIMO',
		category: 'company',
		tags: ['who', 'about', 'company', 'what is', '1800limo', 'limo service'],
		content:
			'1-800-LIMO is a chauffeured ground-transportation booking platform that ' +
			'connects customers with professional limousine and car-service operators. ' +
			'You can get an instant quote and book a ride online for airport transfers, ' +
			'hourly charters, point-to-point trips, special events, and more.',
		url: 'https://www.1800limo.com',
	},

	// --------------------------------------------------------------- services
	{
		id: 'service-airport-transfer',
		title: 'Airport transfers',
		category: 'services',
		tags: ['airport', 'flight', 'pickup', 'terminal', 'meet and greet', 'arrival', 'departure'],
		content:
			'We offer airport pickups and drop-offs with professional chauffeurs. ' +
			'When booking, search your airport (and terminal if known) as the pickup or ' +
			'drop-off location. Chauffeurs track your trip; meet-and-greet options may be ' +
			'available depending on the operator.',
	},
	{
		id: 'service-hourly-charter',
		title: 'Hourly & charter service',
		category: 'services',
		tags: ['hourly', 'charter', 'by the hour', 'as directed', 'wedding', 'prom', 'event', 'night out'],
		content:
			'Hourly (charter) service reserves a vehicle and chauffeur for a block of time ' +
			'so you can make multiple stops — ideal for weddings, proms, corporate events, ' +
			'and nights out. A minimum number of hours typically applies; the exact minimum ' +
			'depends on the vehicle and operator.',
	},
	{
		id: 'service-point-to-point',
		title: 'Point-to-point rides',
		category: 'services',
		tags: ['point to point', 'one way', 'transfer', 'a to b', 'direct'],
		content:
			'Point-to-point service takes you directly from one location to another for a ' +
			'flat quoted price — for example hotel to venue, or home to airport.',
	},
	{
		id: 'service-cruise-fbo',
		title: 'Cruise port & private jet (FBO) transfers',
		category: 'services',
		tags: ['cruise', 'cruise port', 'seaport', 'fbo', 'private jet', 'private aviation'],
		content:
			'We support transfers to and from cruise ports and FBOs (private-jet terminals). ' +
			'When booking, search the cruise line/port or FBO name as your location and the ' +
			'assistant will help resolve it.',
	},

	// ------------------------------------------------------------------ fleet
	{
		id: 'fleet-overview',
		title: 'Vehicle types in the fleet',
		category: 'fleet',
		tags: ['fleet', 'vehicles', 'cars', 'types', 'sedan', 'suv', 'limo', 'van', 'bus', 'options'],
		content:
			'Available vehicle categories typically include luxury sedans, SUVs, stretch ' +
			'limousines, sprinter/passenger vans, and larger party buses or motor coaches. ' +
			'Exact availability and capacity are shown when you select a vehicle for your ' +
			'specific date, time, and location.',
	},
	{
		id: 'fleet-capacity',
		title: 'How many passengers fit',
		category: 'fleet',
		tags: ['passengers', 'capacity', 'how many people', 'seats', 'group size', 'luggage'],
		content:
			'Passenger capacity varies by vehicle: sedans usually seat up to 3, SUVs up to ' +
			'6, stretch limos and vans 8–14, and party buses/coaches more. During booking ' +
			'you enter your passenger count and only vehicles that fit your group are shown. ' +
			'TODO: confirm exact seat counts per category with operations.',
	},

	// ---------------------------------------------------------------- booking
	{
		id: 'booking-how-to',
		title: 'How to book a ride',
		category: 'booking',
		tags: ['book', 'reserve', 'how to book', 'reservation', 'quote', 'get a quote', 'steps'],
		content:
			'To book: (1) choose your service type, (2) enter pickup and drop-off locations, ' +
			'(3) pick date, time, and passenger count, (4) review vehicle categories and ' +
			'select a vehicle, then (5) enter your details and confirm. You can do this on ' +
			'the website or right here in the chat assistant.',
	},
	{
		id: 'booking-quote',
		title: 'Getting a price quote',
		category: 'booking',
		tags: ['price', 'cost', 'how much', 'rate', 'quote', 'fare', 'estimate', 'pricing'],
		content:
			'Pricing is quote-based: the fare is calculated from your route, vehicle type, ' +
			'service type, date/time, and any extras. Enter your trip details to see an exact ' +
			'quote before you pay — there is no flat published price because every trip differs. ' +
			'TODO: confirm whether gratuity, tolls, and taxes are included in the displayed quote.',
	},
	{
		id: 'booking-account',
		title: 'Do I need an account to book',
		category: 'booking',
		tags: ['account', 'sign up', 'login', 'guest', 'register', 'without account'],
		content:
			'You can book as a guest by providing your contact details, or sign in to an ' +
			'account to save trips and book faster. Both options reach the same confirmation step.',
	},

	// --------------------------------------------------------------- policies
	{
		id: 'policy-cancellation',
		title: 'Cancellation policy',
		category: 'policies',
		tags: ['cancel', 'cancellation', 'refund', 'change booking', 'reschedule'],
		content:
			'Cancellation and refund terms depend on the operator and how far in advance you ' +
			'cancel. TODO: insert the exact cancellation windows and any fees here before ' +
			'launch. Until then, the assistant should direct customers to contact support to ' +
			'cancel or change a booking.',
	},
	{
		id: 'policy-payment',
		title: 'Payment methods',
		category: 'policies',
		tags: ['pay', 'payment', 'credit card', 'cash', 'how to pay', 'billing'],
		content:
			'Bookings are paid online during checkout. TODO: confirm accepted payment methods ' +
			'(card brands, digital wallets) and whether a deposit or full payment is taken at ' +
			'booking time.',
	},

	// -------------------------------------------------------------------- faq
	{
		id: 'faq-areas-served',
		title: 'Where do you operate',
		category: 'faq',
		tags: ['areas', 'cities', 'where', 'coverage', 'locations', 'service area', 'nationwide'],
		content:
			'1-800-LIMO works with a network of operators across many cities. The simplest ' +
			'way to check availability for your trip is to enter your pickup and drop-off ' +
			'locations — if we can serve the route, vehicles and a quote will appear. ' +
			'TODO: list headline coverage regions if marketing wants them stated explicitly.',
	},
	{
		id: 'faq-contact-support',
		title: 'Contact & support',
		category: 'faq',
		tags: ['contact', 'support', 'phone', 'help', 'customer service', 'call', 'email'],
		content:
			'For help with an existing booking, changes, or questions not answered here, ' +
			'contact customer support. TODO: add the official support phone number, email, ' +
			'and hours of operation.',
	},
];
