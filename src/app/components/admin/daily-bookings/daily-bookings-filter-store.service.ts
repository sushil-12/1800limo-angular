import { Injectable } from '@angular/core';
import * as dayjs from 'dayjs';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';

export type DailyBookingsSegment = 'upcoming' | 'past';
export type DailyBookingsStatusMode = 'all' | 'active';
export type DailyBookingsSortBy = 'pickup_datetime' | 'created_at';
export type DailyBookingsSortDirection = 'asc' | 'desc';
export type DailyBookingsDatePreset = 'today' | 'next_7_days' | 'last_7_days' | 'last_30_days' | 'custom';
export type DailyBookingsFilterChipKey = 'segment' | 'search' | 'statusMode' | 'sort' | 'dateRange';

export interface DailyBookingsDateRange {
	preset: DailyBookingsDatePreset;
	start: string;
	end: string;
}

export interface DailyBookingsFilterState {
	segment: DailyBookingsSegment;
	search: string;
	statusMode: DailyBookingsStatusMode;
	sortBy: DailyBookingsSortBy;
	sortDirection: DailyBookingsSortDirection;
	dateRange: DailyBookingsDateRange | null;
}

export interface DailyBookingsFilterChip {
	key: DailyBookingsFilterChipKey;
	label: string;
}

export interface DailyBookingsApiQuery {
	segment: DailyBookingsSegment;
	search: string;
	status_mode: DailyBookingsStatusMode;
	active_statuses?: string;
	sort_by: DailyBookingsSortBy;
	sort_direction: DailyBookingsSortDirection;
	from?: string;
	to?: string;
}

const STORAGE_KEY = 'dailyBookingsFilters:v1';

export const ACTIVE_DAILY_BOOKING_STATUSES = [
	'pending',
	'driver_unassigned',
	'assigned',
	'en_route_pu',
	'on_location',
	'en_route_do',
	'ended',
	'finalized',
];

export const DEFAULT_DAILY_BOOKINGS_FILTERS: DailyBookingsFilterState = {
	segment: 'upcoming',
	search: '',
	statusMode: 'all',
	sortBy: 'pickup_datetime',
	sortDirection: 'asc',
	dateRange: null,
};

@Injectable({
	providedIn: 'root',
})
export class DailyBookingsFilterStore {
	private readonly stateSubject = new BehaviorSubject<DailyBookingsFilterState>(this.hydrateState());

	readonly state$ = this.stateSubject.asObservable().pipe(
		distinctUntilChanged((prev, next) => this.serializeState(prev) === this.serializeState(next)),
		shareReplay({ bufferSize: 1, refCount: true })
	);

	get snapshot(): DailyBookingsFilterState {
		return this.stateSubject.value;
	}

	update(patch: Partial<DailyBookingsFilterState>): void {
		this.commit({ ...this.snapshot, ...patch });
	}

	setSegment(segment: DailyBookingsSegment): void {
		this.commit({
			...this.snapshot,
			segment,
			sortDirection: this.defaultSortDirectionForSegment(segment),
		});
	}

	clearAll(): void {
		this.commit({ ...DEFAULT_DAILY_BOOKINGS_FILTERS });
	}

	removeChip(key: DailyBookingsFilterChipKey): void {
		const state = this.snapshot;

		if (key === 'segment') {
			this.setSegment(DEFAULT_DAILY_BOOKINGS_FILTERS.segment);
			return;
		}

		if (key === 'search') {
			this.update({ search: DEFAULT_DAILY_BOOKINGS_FILTERS.search });
			return;
		}

		if (key === 'statusMode') {
			this.update({ statusMode: DEFAULT_DAILY_BOOKINGS_FILTERS.statusMode });
			return;
		}

		if (key === 'sort') {
			this.update({
				sortBy: DEFAULT_DAILY_BOOKINGS_FILTERS.sortBy,
				sortDirection: this.defaultSortDirectionForSegment(state.segment),
			});
			return;
		}

		if (key === 'dateRange') {
			this.update({ dateRange: null });
		}
	}

	toApiQuery(state: DailyBookingsFilterState = this.snapshot): DailyBookingsApiQuery {
		const query: DailyBookingsApiQuery = {
			segment: state.segment,
			search: state.search.trim(),
			status_mode: state.statusMode,
			sort_by: state.sortBy,
			sort_direction: state.sortDirection,
		};

		if (state.statusMode === 'active') {
			query.active_statuses = ACTIVE_DAILY_BOOKING_STATUSES.join(',');
		}

		if (state.dateRange) {
			query.from = state.dateRange.start;
			query.to = state.dateRange.end;
		}

		return query;
	}

	getActiveChips(state: DailyBookingsFilterState = this.snapshot): DailyBookingsFilterChip[] {
		const chips: DailyBookingsFilterChip[] = [];
		const defaultSortDirection = this.defaultSortDirectionForSegment(state.segment);

		if (state.segment !== DEFAULT_DAILY_BOOKINGS_FILTERS.segment) {
			chips.push({ key: 'segment', label: 'Past bookings' });
		}

		if (state.search.trim()) {
			chips.push({ key: 'search', label: `Search: ${state.search.trim()}` });
		}

		if (state.statusMode !== DEFAULT_DAILY_BOOKINGS_FILTERS.statusMode) {
			chips.push({ key: 'statusMode', label: 'Status: Active' });
		}

		if (state.sortBy !== DEFAULT_DAILY_BOOKINGS_FILTERS.sortBy || state.sortDirection !== defaultSortDirection) {
			chips.push({ key: 'sort', label: `Sort: ${this.getSortLabel(state)}` });
		}

		if (state.dateRange) {
			chips.push({ key: 'dateRange', label: `Date: ${this.getDateRangeLabel(state.dateRange)}` });
		}

		return chips;
	}

	getSortLabel(state: DailyBookingsFilterState = this.snapshot): string {
		const sortName = state.sortBy === 'pickup_datetime' ? 'Pickup Date & Time' : 'Created Date';
		const direction = state.sortDirection === 'asc' ? 'Oldest first' : 'Newest first';
		return `${sortName}, ${direction}`;
	}

	getDateRangeLabel(dateRange: DailyBookingsDateRange | null): string {
		if (!dateRange) {
			return 'Any date';
		}

		const presetLabel = this.getPresetLabel(dateRange.preset);
		if (dateRange.preset !== 'custom') {
			return presetLabel;
		}

		return `${dayjs(dateRange.start).format('MMM D')} - ${dayjs(dateRange.end).format('MMM D, YYYY')}`;
	}

	getPresetLabel(preset: DailyBookingsDatePreset): string {
		const labels: Record<DailyBookingsDatePreset, string> = {
			today: 'Today',
			next_7_days: 'Next 7 days',
			last_7_days: 'Last 7 days',
			last_30_days: 'Last 30 days',
			custom: 'Custom range',
		};

		return labels[preset];
	}

	getPresetRange(preset: DailyBookingsDatePreset): DailyBookingsDateRange {
		const today = dayjs().startOf('day');
		let start = today;
		let end = today;

		if (preset === 'next_7_days') {
			end = today.add(7, 'day');
		} else if (preset === 'last_7_days') {
			start = today.subtract(7, 'day');
		} else if (preset === 'last_30_days') {
			start = today.subtract(30, 'day');
		}

		return {
			preset,
			start: start.format('YYYY-MM-DD'),
			end: end.format('YYYY-MM-DD'),
		};
	}

	private commit(state: DailyBookingsFilterState): void {
		const normalized = this.normalizeState(state);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
		this.stateSubject.next(normalized);
	}

	private hydrateState(): DailyBookingsFilterState {
		const persisted = localStorage.getItem(STORAGE_KEY);
		if (persisted) {
			try {
				return this.normalizeState(JSON.parse(persisted));
			} catch {
				localStorage.removeItem(STORAGE_KEY);
			}
		}

		return this.hydrateLegacyState();
	}

	private hydrateLegacyState(): DailyBookingsFilterState {
		const legacyUseDateFilter = localStorage.getItem('useDateFilter') === 'true';
		const legacyStart = localStorage.getItem('admin_startDate');
		const legacyEnd = localStorage.getItem('admin_endDate');
		const legacyOrder = localStorage.getItem('orderByCreatedAt') || '';

		const state: DailyBookingsFilterState = {
			...DEFAULT_DAILY_BOOKINGS_FILTERS,
			search: localStorage.getItem('DBSearch') || '',
			statusMode: localStorage.getItem('DBS_Status') ? 'active' : 'all',
			sortBy: legacyOrder.startsWith('created_at') ? 'created_at' : DEFAULT_DAILY_BOOKINGS_FILTERS.sortBy,
			sortDirection: legacyOrder.endsWith('_asc') ? 'asc' : legacyOrder.endsWith('_desc') ? 'desc' : DEFAULT_DAILY_BOOKINGS_FILTERS.sortDirection,
			dateRange: null,
		};

		if (legacyUseDateFilter && legacyStart && legacyEnd) {
			state.dateRange = {
				preset: 'custom',
				start: dayjs(legacyStart).format('YYYY-MM-DD'),
				end: dayjs(legacyEnd).format('YYYY-MM-DD'),
			};
		}

		return this.normalizeState(state);
	}

	private normalizeState(state: DailyBookingsFilterState): DailyBookingsFilterState {
		const segment: DailyBookingsSegment = state?.segment === 'past' ? 'past' : 'upcoming';
		const sortBy: DailyBookingsSortBy = state?.sortBy === 'created_at' ? 'created_at' : 'pickup_datetime';
		const sortDirection: DailyBookingsSortDirection = state?.sortDirection === 'desc' ? 'desc' : 'asc';
		const statusMode: DailyBookingsStatusMode = state?.statusMode === 'active' ? 'active' : 'all';
		let dateRange: DailyBookingsDateRange | null = null;

		if (state?.dateRange?.start && state?.dateRange?.end) {
			const start = dayjs(state.dateRange.start).startOf('day');
			const end = dayjs(state.dateRange.end).startOf('day');
			dateRange = {
				preset: state.dateRange.preset || 'custom',
				start: start.format('YYYY-MM-DD'),
				end: end.isBefore(start, 'day') ? start.format('YYYY-MM-DD') : end.format('YYYY-MM-DD'),
			};
		}

		return {
			segment,
			search: state?.search || '',
			statusMode,
			sortBy,
			sortDirection,
			dateRange,
		};
	}

	private defaultSortDirectionForSegment(segment: DailyBookingsSegment): DailyBookingsSortDirection {
		return segment === 'past' ? 'desc' : 'asc';
	}

	private serializeState(state: DailyBookingsFilterState): string {
		return JSON.stringify(state);
	}
}
