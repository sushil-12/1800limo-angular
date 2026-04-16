import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AdminService } from './admin.service';
import { ChatLocationKind, ChatbotLocation } from './chatbot-booking.service';

declare const google: any;

export interface PlaceSearchOption {
	placeId: string;
	name: string;
	secondaryText: string;
	types: string[];
	isTerminal: boolean;
	predictedKind: ChatLocationKind;
	confidence: number;
	matchedAirport?: any;
}

export interface ResolvedPlaceSelection {
	location: ChatbotLocation;
	ambiguousKinds: ChatLocationKind[];
}

interface QueryAnalysis {
	normalizedQuery: string;
	airportCodeHint?: string;
	terminalHint?: string;
	kind?: ChatLocationKind;
	confidence: number;
	queryVariants: string[];
}

interface MistralIntent {
	kind?: ChatLocationKind;
	normalized_query?: string;
	airport_code_hint?: string;
	terminal_hint?: string;
	confidence?: number;
}

@Injectable({
	providedIn: 'root',
})
export class PlaceIntelligenceService {
	private placesService: any;
	private mistralCache = new Map<string, Promise<MistralIntent | null>>();

	constructor(private adminService: AdminService) {}

	async searchLocations(input: string): Promise<PlaceSearchOption[]> {
		const trimmed = String(input || '').trim();
		if (!trimmed) {
			return [];
		}

		const analysis = await this.analyzeQuery(trimmed);
		const variants = analysis.queryVariants.slice(0, 3);
		const responses = await Promise.all(
			variants.map((query) => this.fetchAutocompleteSuggestions(query)),
		);

		const merged = new Map<string, PlaceSearchOption>();

		responses.forEach((suggestionGroup: any[]) => {
			suggestionGroup.forEach((suggestion: any) => {
				const mapped = this.mapPrediction(suggestion);
				if (!mapped?.placeId) {
					return;
				}

				const existing = merged.get(mapped.placeId);
				const ranked = this.rankSuggestion(mapped, analysis);
				if (!existing || ranked.confidence > existing.confidence) {
					merged.set(mapped.placeId, ranked);
				}
			});
		});

		return Array.from(merged.values())
			.sort((left, right) => right.confidence - left.confidence)
			.slice(0, 8);
	}

	async resolveSelection(option: PlaceSearchOption): Promise<ResolvedPlaceSelection | null> {
		const place = await this.fetchPlaceDetails(option?.placeId);
		if (!place?.geometry?.location) {
			return null;
		}

		const latitude = place.geometry.location.lat();
		const longitude = place.geometry.location.lng();
		const placeTypes = Array.isArray(place?.types) ? place.types : option?.types || [];
		const matchedAirport = this.resolveInternalAirportRecord(place, latitude, longitude, placeTypes) || option?.matchedAirport;
		const classification = this.classifyPlace(
			place?.name || option?.name,
			place?.formatted_address || option?.secondaryText,
			placeTypes,
			matchedAirport,
		);

		const resolvedKind = classification.kind === 'unknown' ? 'city' : classification.kind;
		const airportMetadata = resolvedKind === 'airport' || resolvedKind === 'fbo' ? matchedAirport : null;
		const location: ChatbotLocation = {
			placeId: place.place_id || option.placeId,
			name: place.name || option.name,
			formattedAddress: place.formatted_address || option.secondaryText || option.name,
			lat: latitude,
			lng: longitude,
			kind: resolvedKind,
			confidence: classification.confidence,
			airportId: airportMetadata?.id,
			airportName: airportMetadata?.formatted_name || airportMetadata?.name || option.name,
			airportCity: airportMetadata?.city,
			isTerminal: option?.isTerminal,
			cruiseName: resolvedKind === 'cruise' ? (place.name || option.name) : undefined,
			fboName: resolvedKind === 'fbo' ? (place.name || option.name) : undefined,
			fboAddress: resolvedKind === 'fbo' ? (place.formatted_address || option.secondaryText || option.name) : undefined,
			matchedAirport: airportMetadata || undefined,
		};

		return {
			location,
			ambiguousKinds: classification.ambiguousKinds,
		};
	}

	confirmResolvedKind(selection: ResolvedPlaceSelection, kind: ChatLocationKind): ResolvedPlaceSelection {
		const location = {
			...selection.location,
			kind,
			confidence: 1,
			cruiseName: kind === 'cruise' ? (selection.location.cruiseName || selection.location.name) : undefined,
			fboName: kind === 'fbo' ? (selection.location.fboName || selection.location.name) : undefined,
			fboAddress: kind === 'fbo'
				? (selection.location.fboAddress || selection.location.formattedAddress || selection.location.name)
				: undefined,
		};

		return {
			location,
			ambiguousKinds: [],
		};
	}

	needsKindConfirmation(selection: ResolvedPlaceSelection | null | undefined): boolean {
		if (!selection) {
			return false;
		}

		return selection.location.confidence < 0.85 && selection.ambiguousKinds.length > 0;
	}

	private async analyzeQuery(input: string): Promise<QueryAnalysis> {
		const normalized = String(input || '').trim();
		const uppercaseCodeMatch = normalized.toUpperCase().match(/\b([A-Z]{3})\b/);
		const terminalMatch = normalized.match(/\b(terminal\s*[a-z0-9]+|concourse\s*[a-z0-9]+|gate\s*[a-z0-9]+)\b/i);
		const lower = normalized.toLowerCase();
		const cruiseHint = /\b(cruise|pier|port|dock|harbor|harbour|terminal)\b/i.test(normalized)
			&& /\b(cruise|pier|port|dock|harbor|harbour)\b/i.test(normalized);
		const fboHint = /\b(fbo|signature aviation|atlantic aviation|jet center|jetcentre|executive aviation|private terminal)\b/i.test(normalized);
		const airportHint = /\b(airport|airfield|aerodrome)\b/i.test(normalized);

		const variants = new Set<string>();
		let inferredKind: ChatLocationKind | undefined;
		let confidence = 0.55;

		if (uppercaseCodeMatch) {
			const code = uppercaseCodeMatch[1];
			variants.add(`${code} airport`);
			variants.add(`${code} airport terminal`);
			variants.add(code);
			inferredKind = 'airport';
			confidence = 0.95;
			return {
				normalizedQuery: normalized,
				airportCodeHint: code,
				kind: inferredKind,
				confidence,
				queryVariants: Array.from(variants),
			};
		}

		if (terminalMatch) {
			variants.add(normalized);
			variants.add(`${normalized} airport`);
			variants.add(`${normalized} terminal`);
			inferredKind = 'airport';
			confidence = 0.88;
			return {
				normalizedQuery: normalized,
				terminalHint: terminalMatch[1],
				kind: inferredKind,
				confidence,
				queryVariants: Array.from(variants),
			};
		}

		if (fboHint) {
			variants.add(normalized);
			variants.add(`${normalized} airport`);
			inferredKind = 'fbo';
			confidence = 0.86;
		} else if (airportHint) {
			variants.add(normalized);
			variants.add(`${normalized} terminal`);
			inferredKind = 'airport';
			confidence = 0.82;
		} else if (cruiseHint) {
			variants.add(normalized);
			variants.add(`${normalized} cruise port`);
			inferredKind = 'cruise';
			confidence = 0.78;
		}

		if (variants.size === 0) {
			variants.add(normalized);
		}

		if (confidence >= 0.72 || normalized.length < 4) {
			return {
				normalizedQuery: normalized,
				kind: inferredKind,
				confidence,
				queryVariants: Array.from(variants),
			};
		}

		const mistralIntent = await this.inferWithMistral(normalized);
		const mistralQuery = String(mistralIntent?.normalized_query || '').trim();
		const finalQuery = mistralQuery || normalized;
		const finalKind = mistralIntent?.confidence && mistralIntent.confidence > confidence
			? mistralIntent.kind
			: inferredKind;
		const finalConfidence = Math.max(confidence, Number(mistralIntent?.confidence || 0));

		if (mistralIntent?.airport_code_hint) {
			variants.add(`${mistralIntent.airport_code_hint} airport`);
			variants.add(`${mistralIntent.airport_code_hint} airport terminal`);
		}
		if (mistralIntent?.terminal_hint) {
			variants.add(`${finalQuery} ${mistralIntent.terminal_hint}`.trim());
		}
		variants.add(finalQuery);

		return {
			normalizedQuery: finalQuery,
			airportCodeHint: mistralIntent?.airport_code_hint,
			terminalHint: mistralIntent?.terminal_hint,
			kind: finalKind,
			confidence: finalConfidence || confidence,
			queryVariants: Array.from(variants),
		};
	}

	private rankSuggestion(option: PlaceSearchOption, analysis: QueryAnalysis): PlaceSearchOption {
		const text = `${option.name} ${option.secondaryText}`.toLowerCase();
		let confidence = option.confidence;

		if (analysis.kind && option.predictedKind === analysis.kind) {
			confidence += 0.12;
		}
		if (analysis.airportCodeHint && text.includes(analysis.airportCodeHint.toLowerCase())) {
			confidence += 0.2;
		}
		if (analysis.terminalHint && text.includes(analysis.terminalHint.toLowerCase())) {
			confidence += 0.1;
		}

		return {
			...option,
			confidence,
		};
	}

	private mapPrediction(suggestion: any): PlaceSearchOption | null {
		const prediction = suggestion?.placePrediction;
		if (!prediction?.placeId) {
			return null;
		}

		const name = prediction?.structuredFormat?.mainText?.text
			|| prediction?.text?.text?.split(',')[0]?.trim()
			|| '';
		const secondaryText = prediction?.structuredFormat?.secondaryText?.text || '';
		const types = Array.isArray(prediction?.types) ? prediction.types : [];
		const matchedAirport = this.resolveInternalAirportRecord({
			name,
			formatted_address: secondaryText,
		}, undefined, undefined, types);
		const classification = this.classifyPlace(name, secondaryText, types, matchedAirport);

		return {
			placeId: prediction.placeId,
			name,
			secondaryText,
			types,
			isTerminal: /\bterminal|concourse|gate\b/i.test(`${name} ${secondaryText}`),
			predictedKind: classification.kind === 'unknown' ? 'city' : classification.kind,
			confidence: classification.confidence,
			matchedAirport,
		};
	}

	private classifyPlace(
		name: string,
		address: string,
		types: string[],
		matchedAirport?: any,
	): { kind: ChatLocationKind; confidence: number; ambiguousKinds: ChatLocationKind[] } {
		const blob = `${name || ''} ${address || ''}`.toLowerCase();
		const scores: Record<ChatLocationKind, number> = {
			airport: 0,
			city: 0,
			cruise: 0,
			fbo: 0,
			unknown: 0,
		};

		if (matchedAirport) {
			scores.airport += 0.28;
		}
		if (types.includes('airport')) {
			scores.airport += 0.95;
		}
		if (types.includes('locality') || types.includes('administrative_area_level_3') || types.includes('postal_town')) {
			scores.city += 0.82;
		}
		if (/\b(airport|airfield|aerodrome)\b/i.test(blob)) {
			scores.airport += 0.45;
		}
		if (/\b(fbo|signature aviation|atlantic aviation|jet center|jetcentre|executive aviation|private terminal)\b/i.test(blob)) {
			scores.fbo += 0.92;
		}
		if (/\b(cruise|pier|dock|harbor|harbour|port)\b/i.test(blob)) {
			scores.cruise += 0.76;
		}
		if (!scores.airport && !scores.cruise && !scores.fbo) {
			scores.city += 0.56;
		}
		if (/\bterminal\b/i.test(blob)) {
			scores.airport += 0.18;
			scores.cruise += 0.12;
		}

		const ranked = (Object.keys(scores) as ChatLocationKind[])
			.map((kind) => ({ kind, score: scores[kind] }))
			.sort((left, right) => right.score - left.score);
		const primary = ranked[0];
		const secondary = ranked[1];
		const ambiguousKinds = secondary && secondary.score > 0 && primary.score - secondary.score < 0.18
			? [primary.kind, secondary.kind].filter((kind) => kind !== 'unknown')
			: [];

		return {
			kind: primary.score > 0 ? primary.kind : 'unknown',
			confidence: Math.max(0.4, Math.min(0.99, primary.score)),
			ambiguousKinds,
		};
	}

	private getApiKey(): string {
		try {
			const script = Array.from(document.querySelectorAll('script[src]')).find(
				(element) => element.getAttribute('src')?.includes('maps.googleapis.com/maps/api/js'),
			);
			if (!script) {
				return '';
			}
			const url = new URL(script.getAttribute('src') || '', window.location.origin);
			return url.searchParams.get('key') || '';
		} catch {
			return '';
		}
	}

	private getPlacesService(): any {
		if (!this.placesService && typeof google !== 'undefined' && google?.maps?.places) {
			this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
		}
		return this.placesService;
	}

	private async fetchAutocompleteSuggestions(input: string): Promise<any[]> {
		const apiKey = this.getApiKey();
		if (!apiKey || !input.trim()) {
			return [];
		}

		try {
			const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Goog-Api-Key': apiKey,
					'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text,suggestions.placePrediction.types',
				},
				body: JSON.stringify({
					input,
					includeQueryPredictions: false,
					languageCode: 'en-US',
				}),
			});
			const data = response.ok ? await response.json() : {};
			return Array.isArray(data?.suggestions) ? data.suggestions : [];
		} catch {
			return [];
		}
	}

	private fetchPlaceDetails(placeId: string): Promise<any | null> {
		const service = this.getPlacesService();
		if (!service || !placeId) {
			return Promise.resolve(null);
		}

		return new Promise((resolve) => {
			service.getDetails(
				{
					placeId,
					fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types'],
				},
				(place: any, status: string) => {
					if (status !== 'OK') {
						resolve(null);
						return;
					}
					resolve(place);
				},
			);
		});
	}

	private resolveInternalAirportRecord(placeLike: any, latitude?: number | null, longitude?: number | null, types: string[] = []): any {
		const airports = this.adminService.getAirportsAndBigData()?.airportsData || [];
		if (!airports.length) {
			return null;
		}

		const hasAirportSignals = this.hasAirportSignals(placeLike, types);

		const normalizedLat = this.toNumericCoordinate(latitude);
		const normalizedLng = this.toNumericCoordinate(longitude);
		if (hasAirportSignals && normalizedLat !== null && normalizedLng !== null) {
			let nearestAirport: any = null;
			let nearestDistance = Number.POSITIVE_INFINITY;

			for (const airport of airports) {
				const coordinates = this.getAirportCoordinates(airport);
				if (!coordinates) {
					continue;
				}

				const distance = this.getDistanceInKm(normalizedLat, normalizedLng, coordinates.lat, coordinates.lng);
				if (distance < nearestDistance) {
					nearestDistance = distance;
					nearestAirport = airport;
				}
			}

			if (nearestAirport && nearestDistance <= 25) {
				return nearestAirport;
			}
		}

		const displayValue = this.getAirportDisplayValue(placeLike);
		const nameValue = placeLike?.name || placeLike?.displayName || '';
		const addressValue = placeLike?.formatted_address || placeLike?.formattedAddress || '';
		const searchBlob = this.normalizeAirportMatchText([displayValue, nameValue, addressValue].filter(Boolean).join(' '));

		if (!searchBlob) {
			return null;
		}

		const tokens = searchBlob.split(' ');
		let bestMatch: any = null;
		let bestScore = 0;

		for (const airport of airports) {
			const code = String(airport?.code || '').toLowerCase();
			const airportName = this.normalizeAirportMatchText(airport?.name);
			const formattedName = this.normalizeAirportMatchText(airport?.formatted_name);
			const city = this.normalizeAirportMatchText(airport?.city);
			let score = 0;

			if (code && tokens.includes(code)) {
				score += 300;
			}
			if (airportName && searchBlob.includes(airportName)) {
				score += 220;
			}
			if (formattedName && searchBlob.includes(formattedName)) {
				score += 180;
			}
			if (hasAirportSignals && city && searchBlob.includes(city)) {
				score += 50;
			}

			if (score > bestScore) {
				bestScore = score;
				bestMatch = airport;
			}
		}

		return bestScore >= 180 ? bestMatch : null;
	}

	private getAirportDisplayValue(airport: any): string {
		if (!airport) {
			return '';
		}

		return airport?.formatted_name
			|| [airport?.code, airport?.name, airport?.city].filter(Boolean).join(' - ')
			|| airport?.name
			|| '';
	}

	private normalizeAirportMatchText(value: any): string {
		return String(value || '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, ' ')
			.trim();
	}

	private hasAirportSignals(placeLike: any, types: string[] = []): boolean {
		const blob = this.normalizeAirportMatchText([
			placeLike?.name,
			placeLike?.displayName,
			placeLike?.formatted_address,
			placeLike?.formattedAddress,
		].filter(Boolean).join(' '));

		return types.includes('airport')
			|| /\b(airport|airfield|aerodrome|terminal|concourse|gate|fbo|signature aviation|atlantic aviation|jet center|jetcentre|private terminal)\b/i.test(blob);
	}

	private toNumericCoordinate(value: any): number | null {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}

	private getAirportCoordinates(airport: any): { lat: number; lng: number } | null {
		const lat = this.toNumericCoordinate(airport?.lat ?? airport?.latitude);
		const lng = this.toNumericCoordinate(airport?.long ?? airport?.lng ?? airport?.longitude);
		return lat !== null && lng !== null ? { lat, lng } : null;
	}

	private getDistanceInKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
		const toRadians = (value: number) => value * Math.PI / 180;
		const earthRadiusKm = 6371;
		const deltaLat = toRadians(lat2 - lat1);
		const deltaLng = toRadians(lng2 - lng1);
		const a =
			Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
			Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
			Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return earthRadiusKm * c;
	}

	private inferWithMistral(query: string): Promise<MistralIntent | null> {
		const cacheKey = query.trim().toLowerCase();
		if (!cacheKey) {
			return Promise.resolve(null);
		}

		if (!this.mistralCache.has(cacheKey)) {
			this.mistralCache.set(cacheKey, this.runMistralInference(query));
		}

		return this.mistralCache.get(cacheKey)!;
	}

	private async runMistralInference(query: string): Promise<MistralIntent | null> {
		const apiKey = environment.mistralSecretKey;
		if (!apiKey) {
			return null;
		}

		const controller = new AbortController();
		const timeout = window.setTimeout(() => controller.abort(), 1800);

		try {
			const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: 'mistral-small-latest',
					temperature: 0,
					response_format: { type: 'json_object' },
					messages: [
						{
							role: 'system',
							content: 'Classify travel place queries. Return JSON only with keys kind, normalized_query, airport_code_hint, terminal_hint, confidence. Valid kinds: airport, city, cruise, fbo.',
						},
						{
							role: 'user',
							content: query,
						},
					],
				}),
				signal: controller.signal,
			});

			if (!response.ok) {
				return null;
			}

			const data = await response.json();
			const content = data?.choices?.[0]?.message?.content;
			if (!content) {
				return null;
			}

			const parsed = JSON.parse(content);
			return {
				kind: parsed?.kind,
				normalized_query: parsed?.normalized_query,
				airport_code_hint: parsed?.airport_code_hint,
				terminal_hint: parsed?.terminal_hint,
				confidence: Number(parsed?.confidence || 0),
			};
		} catch {
			return null;
		} finally {
			window.clearTimeout(timeout);
		}
	}
}
