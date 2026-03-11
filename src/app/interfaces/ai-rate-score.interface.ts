/**
 * AI Rate Score Calculator - Type definitions for Mistral-powered rate analysis
 */

/** Input for the AI rate score (sent to Mistral) */
export interface AiRateScoreRequest {
	/** Raw rate values from the form */
	rates: Record<string, number | string | null>;
	/** Vehicle type (e.g. Sedan, SUV) for context */
	vehicleType: string;
	/** Currency code (e.g. USD, EUR) */
	currency: string;
	/** Distance unit: mile | kilometer */
	unit: 'mile' | 'kilometer';
}

/** Single category breakdown from AI analysis */
export interface AiRateScoreBreakdown {
	/** Human-readable category name */
	category: string;
	/** Score 0-100 for this category */
	score: number;
	/** User's entered rate(s) for this category (e.g. "$4/mile" or "$75") */
	yourRate?: string;
	/** Typical market range for same vehicle type (e.g. "$3.50–5/mile") */
	marketRange?: string;
	/** Short assessment */
	assessment: string;
	/** AI's rationale for the score (expandable detail) */
	rationale?: string;
}

/** Structured response from the AI rate score (Mistral) */
export interface AiRateScoreResponse {
	/** Overall competitiveness score 0-100 */
	score: number;
	/** Per-category breakdown */
	breakdown: AiRateScoreBreakdown[];
	/** Actionable suggestions (2-5 items) */
	suggestions: string[];
	/** Optional brief summary */
	summary?: string;
}
