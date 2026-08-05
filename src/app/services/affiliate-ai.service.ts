import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
	BusinessCardExtraction,
	BusinessCardFields,
} from '../interfaces/affiliate-ai.interface';

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
 * Affiliate onboarding AI.
 *
 * Calls the Laravel AI backend (`/api/ai/generate`) rather than OpenAI directly —
 * the API key stays server-side and the Passport bearer token is attached by
 * AuthInterceptor. Prompting and the vision call live in the backend
 * `document_extract` feature (OpenAIService::chatJsonVision); the frontend only
 * sends the image and reads the structured `output`.
 */
@Injectable({
	providedIn: 'root',
})
export class AffiliateAiService {
	private readonly url = `${environment.serverUrl}ai/generate`;

	constructor(private http: HttpClient) {}

	/**
	 * Read the fields off a business card photo.
	 * `imageDataUrl` is a `data:image/...;base64,...` URL produced by FileReader.
	 */
	extractBusinessCard(imageDataUrl: string): Observable<BusinessCardExtraction> {
		const body = {
			feature_type: 'document_extract',
			input: {
				doc_type: 'business_card',
				image: imageDataUrl,
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
					return this.normalizeCard(output);
				}),
				catchError((err) => throwError(() => new Error(this.toErrorMessage(err))))
			);
	}

	/** Map known HTTP statuses to friendly messages, falling back to the API message. */
	private toErrorMessage(err: {
		status?: number;
		error?: { message?: string };
		message?: string;
	}): string {
		if (err?.status === 429) {
			return 'Too many scans — please wait a moment and try again.';
		}
		if (err?.status === 503) {
			return 'Card scanning is temporarily unavailable. Please enter your details manually.';
		}
		if (err?.status === 401) {
			return 'Your session has expired. Please sign in again.';
		}
		if (err?.status === 422) {
			return "We couldn't read that image. Try a clearer, well-lit photo of the card.";
		}
		return err?.error?.message || err?.message || 'Card scanning is unavailable right now.';
	}

	/**
	 * The model is instructed to return a fixed schema, but it is still an LLM —
	 * coerce every field to a trimmed string and clamp confidence before the UI
	 * ever sees it.
	 */
	private normalizeCard(raw: Record<string, unknown>): BusinessCardExtraction {
		const data = raw ?? {};
		const rawFields = (data['fields'] && typeof data['fields'] === 'object'
			? data['fields']
			: {}) as Record<string, unknown>;

		const fields: BusinessCardFields = {
			company_name: this.toText(rawFields['company_name']),
			dba: this.toText(rawFields['dba']),
			first_name: this.toText(rawFields['first_name']),
			last_name: this.toText(rawFields['last_name']),
			email: this.toText(rawFields['email']),
			phone: this.toText(rawFields['phone']),
		};

		return {
			fields,
			confidence: Math.min(1, Math.max(0, Number(data['confidence']) || 0)),
			notes: this.toText(data['notes']),
		};
	}

	/** Coerce an unknown model value to a trimmed string ('' when unusable). */
	private toText(value: unknown): string {
		if (value === null || value === undefined) {
			return '';
		}
		if (typeof value === 'string') {
			return value.trim();
		}
		if (typeof value === 'number' || typeof value === 'boolean') {
			return String(value);
		}
		return '';
	}
}
