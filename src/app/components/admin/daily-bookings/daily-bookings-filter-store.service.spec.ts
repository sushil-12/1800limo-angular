import * as dayjs from 'dayjs';
import {
	ACTIVE_DAILY_BOOKING_STATUSES,
	DailyBookingsFilterStore,
	DEFAULT_DAILY_BOOKINGS_FILTERS,
} from './daily-bookings-filter-store.service';

describe('DailyBookingsFilterStore', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		localStorage.clear();
	});

	it('starts with meaningful default filters', () => {
		const store = new DailyBookingsFilterStore();

		expect(store.snapshot).toEqual(DEFAULT_DAILY_BOOKINGS_FILTERS);
		expect(store.getActiveChips()).toEqual([]);
	});

	it('serializes active filters for the daily bookings API', () => {
		const store = new DailyBookingsFilterStore();
		store.update({
			statusMode: 'active',
			search: 'smith',
			sortBy: 'created_at',
			sortDirection: 'desc',
			dateRange: {
				preset: 'custom',
				start: '2026-04-01',
				end: '2026-04-15',
			},
		});

		expect(store.toApiQuery()).toEqual({
			segment: 'upcoming',
			search: 'smith',
			status_mode: 'active',
			active_statuses: ACTIVE_DAILY_BOOKING_STATUSES.join(','),
			sort_by: 'created_at',
			sort_direction: 'desc',
			from: '2026-04-01',
			to: '2026-04-15',
		});
	});

	it('persists and hydrates the committed filter state', () => {
		const store = new DailyBookingsFilterStore();
		store.setSegment('past');
		store.update({ search: 'airport' });

		const hydratedStore = new DailyBookingsFilterStore();

		expect(hydratedStore.snapshot.segment).toBe('past');
		expect(hydratedStore.snapshot.sortDirection).toBe('desc');
		expect(hydratedStore.snapshot.search).toBe('airport');
	});

	it('removes active chips by resetting only that filter', () => {
		const store = new DailyBookingsFilterStore();
		store.update({
			search: 'limousine',
			statusMode: 'active',
			dateRange: {
				preset: 'today',
				start: dayjs().format('YYYY-MM-DD'),
				end: dayjs().format('YYYY-MM-DD'),
			},
		});

		store.removeChip('search');
		store.removeChip('dateRange');

		expect(store.snapshot.search).toBe('');
		expect(store.snapshot.statusMode).toBe('active');
		expect(store.snapshot.dateRange).toBeNull();
	});
});
