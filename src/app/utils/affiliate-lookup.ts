import { HttpParams } from '@angular/common/http';

/**
 * Query params accepted by `GET get-account-by-type/driver`.
 *
 * Every field is optional and additive. Sending none of them returns the same
 * flat array the endpoint has always returned, so callers that do not opt in
 * keep their existing behaviour.
 */
export interface AffiliateLookupParams {
	/** Free-text match across company / subscriber / person name and phone. */
	search?: string;
	/** Pickup latitude. Paired with `lng`, switches the list to distance ranking. */
	lat?: number | string | null;
	/** Pickup longitude. */
	lng?: number | string | null;
	/**
	 * Optional hard cutoff in miles. Ranking alone never hides anyone, so only
	 * pass this when the user explicitly asks to restrict the list.
	 */
	radius?: number | null;
	/** Affiliate ids to keep in the result even if they fall off the page. */
	ids?: Array<number | string>;
	/**
	 * Restrict the result to `ids` instead of merely including them. Used to
	 * rehydrate the affiliate already saved on a booking being edited.
	 */
	only_ids?: boolean;
	/** 1-based page number. Only meaningful alongside `per_page`. */
	page?: number;
	/** Passing this opts the response into `{ rows, meta }` instead of a flat array. */
	per_page?: number;
}

/** A ranked affiliate row as returned by the driver lookup. */
export interface RankedAffiliate {
	id: number;
	name: string;
	driver_name: string | null;
	phone: string | null;
	distance_miles: number | null;
	rank_band: number | null;
	rank_label: string;
	/** Built client-side for `bindLabel`. */
	bindNameAffiliate?: string;
}

/** Pagination envelope returned when `per_page` is supplied. */
export interface AffiliateLookupMeta {
	total: number;
	per_page: number;
	current_page: number;
	last_page: number;
	has_more: boolean;
}

/**
 * Everything one affiliate dropdown needs to drive a server-side list:
 * the rows loaded so far, where the paging is up to, and what is in flight.
 */
export interface AffiliateLookupState {
	/** Rows currently rendered, accumulated across loaded pages. */
	items: RankedAffiliate[];
	/** Current search term, echoed back so late responses can be discarded. */
	term: string;
	/** Last page fetched. */
	page: number;
	/** Whether another page exists after `page`. */
	hasMore: boolean;
	/** A request is in flight. */
	loading: boolean;
	/** Monotonic id of the newest request, used to ignore out-of-order responses. */
	requestId: number;
	/** Total matches reported by the API, for the "showing x of y" hint. */
	total: number;
	/**
	 * Whether the loaded rows were ranked against a pickup.
	 *
	 * Without a pickup the API reports every row as unranked, which is a fact
	 * about the request rather than about the affiliate - badging every row
	 * "Location not set" in that state would be actively misleading, so the
	 * badges are hidden instead.
	 */
	ranked: boolean;
}

export function createAffiliateLookupState(): AffiliateLookupState {
	return {
		items: [],
		term: '',
		page: 1,
		hasMore: false,
		loading: false,
		requestId: 0,
		total: 0,
		ranked: false
	};
}

/**
 * Turn the params object into HttpParams, dropping anything empty so an
 * unset field never reaches the API as `?search=undefined`.
 */
export function buildAffiliateLookupParams(params?: AffiliateLookupParams): HttpParams {
	let httpParams = new HttpParams();

	if (!params) {
		return httpParams;
	}

	const setIfPresent = (key: string, value: any) => {
		if (value === null || value === undefined || value === '') {
			return;
		}
		httpParams = httpParams.set(key, String(value));
	};

	setIfPresent('search', (params.search || '').trim());
	setIfPresent('lat', params.lat);
	setIfPresent('lng', params.lng);
	setIfPresent('radius', params.radius);
	setIfPresent('page', params.page);
	setIfPresent('per_page', params.per_page);

	if (params.only_ids) {
		httpParams = httpParams.set('only_ids', '1');
	}

	if (params.ids && params.ids.length) {
		const ids = params.ids
			.map((id) => Number(id))
			.filter((id) => Number.isFinite(id) && id > 0);

		if (ids.length) {
			httpParams = httpParams.set('ids', Array.from(new Set(ids)).join(','));
		}
	}

	return httpParams;
}

/**
 * Normalize the two possible payload shapes into one.
 *
 * `data` is a flat array when the caller did not request pagination, and
 * `{ rows, meta }` when it did.
 */
export function readAffiliateLookupResponse(
	response: any
): { rows: RankedAffiliate[]; meta: AffiliateLookupMeta | null } {
	const data = response?.data;

	if (Array.isArray(data)) {
		return { rows: data, meta: null };
	}

	if (data && Array.isArray(data.rows)) {
		return { rows: data.rows, meta: data.meta ?? null };
	}

	return { rows: [], meta: null };
}

/**
 * Label shown in the dropdown: name, then the driver's own name, then the
 * distance band so the ranked ordering reads as deliberate rather than random.
 */
export function buildRankedAffiliateLabel(item: RankedAffiliate): string {
	const base = [item?.name, item?.driver_name]
		.map((value) => (value ?? '').toString().trim())
		.filter((value) => !!value)
		.join(' / ');

	const suffix = formatAffiliateDistance(item);

	return suffix ? `${base} — ${suffix}` : base;
}

/**
 * "Local · 3.2 mi", or just the label when there is no distance to show.
 * Returns '' when the list is not ranked at all (no pickup supplied).
 */
export function formatAffiliateDistance(item: RankedAffiliate): string {
	if (!item?.rank_label) {
		return '';
	}

	if (item.distance_miles === null || item.distance_miles === undefined) {
		return item.rank_label;
	}

	return `${item.rank_label} · ${item.distance_miles} mi`;
}

/**
 * Modifier class for a rank badge, keyed by band so the colour survives a
 * relabelling of the bands in `config/limo.php`.
 *
 * Bands 1-4 come from that config; 5 is "has coordinates but outside every
 * band" and 99 is "no coordinates on file".
 */
export function affiliateRankModifier(item: RankedAffiliate): string {
	const band = item?.rank_band;

	if (band === null || band === undefined) {
		return 'is-unranked';
	}

	switch (Number(band)) {
		case 1: return 'is-local';
		case 2: return 'is-nearby';
		case 3: return 'is-regional';
		case 4: return 'is-extended';
		case 5: return 'is-far';
		default: return 'is-unranked';
	}
}

/**
 * Short badge text: the distance carries the meaning once a pickup is known,
 * so the band name alone is enough beside it.
 */
export function affiliateRankBadge(item: RankedAffiliate): string {
	if (!item?.rank_label) {
		return '';
	}

	if (item.distance_miles === null || item.distance_miles === undefined) {
		return item.rank_label;
	}

	return `${item.distance_miles} miles`;
}
