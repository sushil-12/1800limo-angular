import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AirportRecord {
	id: number;
	code: string;
	name: string;
	city: string;
	country: string;
	lat: number | null;
	long: number | null;
}

export interface LocalAirportOption {
	/** Unique key — IATA code so it never collides with Google placeIds */
	placeId: null;
	name: string;
	secondaryText: string;
	description: string;
	searchText: string;
	resultType: 'airport';
	isTerminal: false;
	isLocalResult: true;
	localAirport: AirportRecord;
}

@Injectable({ providedIn: 'root' })
export class AirportIndexService {
	private byCode = new Map<string, AirportRecord>();
	private airports: AirportRecord[] = [];
	/** token → set of airport indices in this.airports */
	private invertedIndex = new Map<string, Set<number>>();
	private loaded = false;

	constructor(private http: HttpClient) {
		this.load();
	}

	private load(): void {
		this.http.get<AirportRecord[]>('/assets/json/airports.json').subscribe({
			next: (data) => {
				this.airports = Array.isArray(data) ? data : [];
				this.airports.forEach((airport, idx) => {
					if (airport.code) {
						this.byCode.set(airport.code.toUpperCase(), airport);
					}
					this.indexTokens(airport, idx);
				});
				this.loaded = true;
			},
			error: () => {
				// silently fail — falls back to Google-only path
			}
		});
	}

	private tokenize(value: string): string[] {
		return String(value || '')
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, ' ')
			.split(/\s+/)
			.filter((t) => t.length >= 2);
	}

	private indexTokens(airport: AirportRecord, idx: number): void {
		const fields = [airport.code, airport.name, airport.city, airport.country];
		for (const field of fields) {
			for (const token of this.tokenize(field)) {
				if (!this.invertedIndex.has(token)) {
					this.invertedIndex.set(token, new Set());
				}
				this.invertedIndex.get(token)!.add(idx);
			}
		}
	}

	isIataCode(input: string): boolean {
		return /^[A-Za-z]{3}$/.test(input.trim());
	}

	isReady(): boolean {
		return this.loaded;
	}

	/** O(1) lookup by IATA code */
	findByCode(code: string): AirportRecord | null {
		return this.byCode.get(code.toUpperCase()) ?? null;
	}

	/** Token-scored fuzzy search. Returns up to `limit` results. */
	search(query: string, limit = 8): AirportRecord[] {
		const tokens = this.tokenize(query);
		if (!tokens.length) return [];

		// score = number of query tokens that hit this airport
		const scores = new Map<number, number>();
		for (const token of tokens) {
			// exact token match
			const exact = this.invertedIndex.get(token);
			if (exact) {
				exact.forEach((idx) => scores.set(idx, (scores.get(idx) ?? 0) + 2));
			}
			// prefix match for tokens >= 3 chars
			if (token.length >= 3) {
				this.invertedIndex.forEach((idxSet, key) => {
					if (key !== token && key.startsWith(token)) {
						idxSet.forEach((idx) => scores.set(idx, (scores.get(idx) ?? 0) + 1));
					}
				});
			}
		}

		return Array.from(scores.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, limit)
			.map(([idx]) => this.airports[idx])
			.filter(Boolean);
	}

	/** Convert an AirportRecord to the shape the airport dropdown expects */
	toDropdownOption(airport: AirportRecord, searchText: string): LocalAirportOption {
		const label = `${airport.name} (${airport.code})`;
		const secondary = [airport.city, airport.country].filter(Boolean).join(', ');
		return {
			placeId: null,
			name: label,
			secondaryText: secondary,
			description: `${label}, ${secondary}`,
			searchText,
			resultType: 'airport',
			isTerminal: false,
			isLocalResult: true,
			localAirport: airport,
		};
	}
}
