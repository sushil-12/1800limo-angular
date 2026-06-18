import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
	AiRateScoreRequest,
	AiRateScoreResponse,
} from '../interfaces/ai-rate-score.interface';

/** Result envelope returned by the backend AI API (POST /api/ai/generate). */
interface AiResult<O> {
	feature: string;
	source: 'cache' | 'db' | 'openai';
	cached: boolean;
	output: O;
	text: string;
	tokens: { input: number; output: number; total: number };
	estimated_cost: number;
	request_id: number | null;
}

/** Standard API response wrapper. */
interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
	errors?: Record<string, string[]>;
}

/**
 * Service for AI-powered vehicle rate scoring.
 * Calls the Laravel AI backend (`/api/ai/generate`) instead of a third-party API
 * directly — the OpenAI key stays on the server and the Passport bearer token is
 * attached automatically by AuthInterceptor. Prompting/parsing live server-side;
 * the frontend just sends the rates and reads the structured `output`.
 */
@Injectable({
	providedIn: 'root',
})
export class AiRateScoreService {
	private readonly url = `${environment.serverUrl}ai/generate`;

	constructor(private http: HttpClient) {}

	/**
	 * Calculate AI rate score for the given rates and vehicle context.
	 * Sends the `rate_score` feature to the backend and returns the structured
	 * score + breakdown + suggestions.
	 */
	calculateScore(payload: AiRateScoreRequest): Observable<AiRateScoreResponse> {
		const body = {
			feature_type: 'rate_score',
			input: {
				rates: payload.rates,
				vehicle_type: payload.vehicleType,
				currency: payload.currency,
				unit: payload.unit === 'mile' ? 'mile' : 'km',
			},
			async: false,
		};

		return this.http
			.post<ApiResponse<AiResult<Record<string, unknown>>>>(this.url, body)
			.pipe(
				map((res) => {
					const output = res?.data?.output;
					if (!output) {
						throw new Error('Empty response from AI');
					}
					return this.normalizeResponse(output);
				}),
				catchError((err) => throwError(() => new Error(this.toErrorMessage(err))))
			);
	}

	/**
	 * Reduce a raw form value to the numeric/text rate fields worth analyzing —
	 * drops ids, empty values and nested groups. Keys are preserved so the backend
	 * can echo them back in `suggested_rates`.
	 */
	sanitizeRates(data: Record<string, unknown>): Record<string, number | string> {
		const out: Record<string, number | string> = {};
		const skip = ['id', 'vehicle_id', 'acc_id', 'affiliate_type', 'amenites_rates', 'stepCompleted'];
		for (const [key, val] of Object.entries(data ?? {})) {
			if (skip.includes(key) || val === null || val === undefined || val === '') continue;
			if (typeof val === 'object') continue;
			const n = Number(val);
			out[key] = Number.isFinite(n) && String(val).trim() !== '' ? n : String(val);
		}
		return out;
	}

	/** Map known HTTP statuses to friendly messages, falling back to the API message. */
	private toErrorMessage(err: { status?: number; error?: { message?: string }; message?: string }): string {
		if (err?.status === 429) {
			return 'Too many requests — please wait a moment and try again.';
		}
		if (err?.status === 503) {
			return 'AI service is temporarily unavailable. Please try again later.';
		}
		if (err?.status === 401) {
			return 'Your session has expired. Please sign in again.';
		}
		return err?.error?.message || err?.message || 'AI rate score service unavailable';
	}

	/** Clamp/normalize the backend output so the UI always gets well-formed values. */
	private normalizeResponse(raw: Record<string, unknown>): AiRateScoreResponse {
		const data = raw ?? {};
		const score = Math.min(100, Math.max(0, Number(data['score']) || 0));
		const breakdown = Array.isArray(data['breakdown']) ? data['breakdown'] : [];
		const suggestions = Array.isArray(data['suggestions']) ? data['suggestions'] : [];
		const summary = typeof data['summary'] === 'string' ? (data['summary'] as string) : '';

		return {
			score,
			summary,
			breakdown: breakdown.map((b) => {
				const item = (b && typeof b === 'object' ? b : {}) as Record<string, unknown>;
				return {
					category: String(item['category'] ?? 'Category'),
					score: Math.min(100, Math.max(0, Number(item['score']) || 0)),
					yourRate: typeof item['yourRate'] === 'string' ? (item['yourRate'] as string) : undefined,
					marketRange: typeof item['marketRange'] === 'string' ? (item['marketRange'] as string) : undefined,
					assessment: String(item['assessment'] ?? ''),
					rationale: typeof item['rationale'] === 'string' ? (item['rationale'] as string) : undefined,
				};
			}),
			suggestions: (suggestions as unknown[]).map((s) => String(s)),
			suggestedRates: this.toNumberMap(data['suggested_rates']),
			rateNotes: this.toStringMap(data['rate_notes']),
		};
	}

	/** Coerce an object of {field: value} into a clean {field: number} map. */
	private toNumberMap(value: unknown): Record<string, number> {
		const out: Record<string, number> = {};
		if (value && typeof value === 'object') {
			for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
				const n = Number(val);
				if (Number.isFinite(n)) {
					out[key] = n;
				}
			}
		}
		return out;
	}

	/** Coerce an object of {field: note} into a clean {field: string} map. */
	private toStringMap(value: unknown): Record<string, string> {
		const out: Record<string, string> = {};
		if (value && typeof value === 'object') {
			for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
				if (typeof val === 'string' && val.trim()) {
					out[key] = val;
				}
			}
		}
		return out;
	}
}
