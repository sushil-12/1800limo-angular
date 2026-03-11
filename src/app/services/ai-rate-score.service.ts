import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
	AiRateScoreRequest,
	AiRateScoreResponse,
} from '../interfaces/ai-rate-score.interface';

/** Mistral chat completion response shape */
interface MistralChatResponse {
	choices?: Array<{
		message?: { content?: string };
	}>;
	error?: { message?: string };
}

/**
 * Service for AI-powered vehicle rate scoring via Mistral API.
 * Calls Mistral directly from the frontend (no backend proxy).
 * Note: API key is in environment - for production, consider rate limits and key exposure.
 */
@Injectable({
	providedIn: 'root',
})
export class AiRateScoreService {
	private readonly mistralUrl = 'https://api.mistral.ai/v1/chat/completions';
	private readonly model = 'mistral-small-latest';

	constructor(private http: HttpClient) {}

	/**
	 * Calculate AI rate score for the given rates and vehicle context.
	 * Calls Mistral API directly and returns structured score + suggestions.
	 */
	calculateScore(payload: AiRateScoreRequest): Observable<AiRateScoreResponse> {
		const apiKey = (environment as { mistralSecretKey?: string }).mistralSecretKey;
		if (!apiKey) {
			return throwError(() => new Error('Mistral API key not configured. Add mistralSecretKey to environment.'));
		}

		const headers = new HttpHeaders({
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		});

		const { systemPrompt, userMessage } = this.buildPrompts(payload);

		const body = {
			model: this.model,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userMessage },
			],
			response_format: { type: 'json_object' },
			max_tokens: 1500,
			temperature: 0.3,
		};

		return this.http.post<MistralChatResponse>(this.mistralUrl, body, { headers }).pipe(
			map((res) => {
				if (res.error) {
					throw new Error(res.error.message || 'Mistral API error');
				}
				const content = res?.choices?.[0]?.message?.content;
				if (!content) {
					throw new Error('Empty response from AI');
				}
				return this.parseAndValidateResponse(content);
			}),
			catchError((err) => {
				const msg =
					err?.error?.message ||
					err?.error?.error?.message ||
					err?.message ||
					'AI rate score service unavailable';
				return throwError(() => new Error(msg));
			})
		);
	}

	private buildPrompts(payload: AiRateScoreRequest): { systemPrompt: string; userMessage: string } {
		const unit = payload.unit === 'mile' ? 'mile' : 'km';
	
		const systemPrompt = `You are a domain expert: a limousine & chauffeur rate analyst. Given the user's vehicle rates and context, return EXACTLY one JSON object that conforms to the schema and rules below. Do NOT add any explanation, markdown, or text outside the JSON. Do NOT change field names or types.
	
	JSON SCHEMA & RULES (STRICT)
	1) Root object MUST contain:
	  - "score" (integer 0-100)             -- overall competitiveness; round to nearest integer
	  - "summary" (string)                 -- one sentence, <=140 characters
	  - "breakdown" (array of objects)     -- see breakdown item schema
	  - "suggestions" (array of strings)   -- 2 to 5 actionable tips, each <=120 characters
	  - "meta" (object) with:
		  - "model" (string)               -- name of your model (e.g. "mistral-small-latest")
		  - "generated_at" (string)        -- ISO8601 UTC datetime, e.g. "2026-03-11T12:00:00Z"
	
	2) Breakdown item schema (each object MUST include):
	  - "category" (string)                -- e.g. "Mileage", "Airport Minimum", "Hourly", "Extras"
	  - "score" (integer 0-100)            -- category competitiveness; round to nearest integer
	  - "yourRate" (string)                -- exact rate text pulled from input, preserve currency symbol if present
	  - "marketRange" (string)             -- typical market range string (e.g. "$3.50–5 per ${unit}" or "Min $65–95"); if you cannot determine, use "unknown"
	  - "assessment" (string)              -- brief comparison (<=140 chars)
	  - "confidence" (number 0-1)          -- your confidence in this category estimate; 0 = no confidence, 1 = high
	  - "rationale" (string)               -- one short sentence why you assigned this score (<=140 chars)
	
	3) Formatting and behavior:
	  - OUTPUT only valid JSON. No markdown, fences, or commentary.
	  - Do NOT add extra/unexpected top-level keys.
	  - Round numeric scores to whole integers. Confidence may be decimal (0-1) with up to two decimal places.
	  - If input lacks enough data to estimate a market range, set "marketRange": "unknown", "confidence": 0, and give a short "assessment" explaining missing data.
	  - Base any marketRange numbers on reasonable, typical limo/chauffeur pricing for the given vehicle type and currency. If currency looks regional (e.g., "USD" -> United States), prefer that market; otherwise reason from the currency symbol. Do NOT invent precise source citations.
	  - Limit suggestions to practical, actionable items (price changes, packaging, minimum adjustments, or marketing actions). Each suggestion must be actionable (e.g., "Reduce per-mile by 10% to $3.50 to match local range").
	
	4) Preserve input "yourRate" fidelity:
	  - Extract and reformat rates from the provided rates object but preserve currency and unit notation when present (e.g., "$4/mile", "Min $75", "Hourly $95/hr").
	
	5) Example output (follow this exact structure):
	{
	  "score": 72,
	  "summary": "Overall competitive but slightly high on per-mile rates compared to local market.",
	  "breakdown": [
		{
		  "category": "Mileage",
		  "score": 65,
		  "yourRate": "$4.25/mile for first 10 mi, then $3.50/mile",
		  "marketRange": "$3.00–3.75 per mile",
		  "assessment": "Per-mile is ~15–30% above typical local rates.",
		  "confidence": 0.85,
		  "rationale": "Local per-mile rates commonly fall in $3–3.75 for similar vehicles."
		}
	  ],
	  "suggestions": [
		"Lower per-mile base to $3.50 for first 12 miles to increase competitiveness.",
		"Offer flat airport pickup rate to simplify pricing for customers."
	  ],
	  "meta": {
		"model": "mistral-small-latest",
		"generated_at": "2026-03-11T12:00:00Z"
	  }
	}
	
	Adhere exactly to the schema and rules above. If you follow these rules, return the single JSON object ONLY.`;
	
		const userMessage = `Vehicle: ${payload.vehicleType}
	Currency: ${payload.currency}
	Unit: ${unit}
	
	Vehicle's rates (raw):
	${JSON.stringify(payload.rates, null, 2)}
	
	Instructions for you:
	- Evaluate these common categories when present in the input: "Mileage", "Airport Minimum", "City Minimum", "Hourly / Charter", "Extras" (e.g., tolls, gratuity, wait-time). If a category is missing in the input, you may omit it from "breakdown" or include it with "marketRange": "unknown" and "confidence": 0.
	- For each category you include, set "yourRate" as the clearest textual representation found in the input.
	- Provide a concise, actionable "assessment" and a single-line "rationale".
	- Set "confidence" to reflect how much the input supports your estimate (0 to 1).
	
	Return EXACTLY one JSON object that follows the schema in the system prompt. No additional text.`;
	
		return { systemPrompt, userMessage };
	}

	private parseAndValidateResponse(content: string): AiRateScoreResponse {
		const trimmed = content.trim();
		let jsonStr = trimmed;
		// Handle markdown-wrapped JSON (e.g. ```json\n{...}\n```)
		const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
		if (codeBlockMatch) {
			jsonStr = codeBlockMatch[1].trim();
		}
		let data: Record<string, unknown>;
		try {
			data = JSON.parse(jsonStr);
		} catch {
			throw new Error('Invalid AI response format');
		}

		const score = Math.min(100, Math.max(0, Number(data.score) ?? 0));
		const breakdown = Array.isArray(data.breakdown) ? data.breakdown : [];
		const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
		const summary = typeof data.summary === 'string' ? data.summary : '';

		return {
			score,
			summary,
			breakdown: breakdown.map((b: unknown) => {
				const item = b && typeof b === 'object' ? b as Record<string, unknown> : {};
				return {
					category: String(item.category ?? 'Category'),
					score: Math.min(100, Math.max(0, Number(item.score) ?? 0)),
					yourRate: typeof item.yourRate === 'string' ? item.yourRate : undefined,
					marketRange: typeof item.marketRange === 'string' ? item.marketRange : undefined,
					assessment: String(item.assessment ?? ''),
					rationale: typeof item.rationale === 'string' ? item.rationale : undefined,
				};
			}),
			suggestions: suggestions.map((s) => String(s)),
		};
	}
}
