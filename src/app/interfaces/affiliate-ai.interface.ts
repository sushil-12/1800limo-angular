/**
 * Affiliate onboarding AI — type definitions.
 *
 * These mirror the JSON schemas pinned in the Laravel prompt templates
 * (`AIPromptBuilder::build()` for the `affiliate_type_recommend`,
 * `affiliate_explain`, `onboarding_coach` and `document_extract` features).
 * The model is told to return ONLY that JSON, but it is still an LLM — the
 * service normalizes/clamps everything before it reaches the UI.
 */

/** The four affiliate types step 1 can register. */
export type AffiliateTypeKey =
	| 'black_limo_operator'
	| 'fleet_operator'
	| 'taxi_operator'
	| 'gig_operator';

/** Result of `affiliate_type_recommend` — which type suits this operator. */
export interface AffiliateTypeRecommendation {
	/** Null when the model returned a type we do not offer. */
	type: AffiliateTypeKey | null;
	/** 0–1. */
	confidence: number;
	reasons: string[];
	warnings: string[];
}

/** Result of `affiliate_explain` — a short plain-language explainer. */
export interface AffiliateExplanation {
	title: string;
	body: string;
}

/** Fields `document_extract` can read off a business card. */
export interface BusinessCardFields {
	company_name?: string;
	dba?: string;
	first_name?: string;
	last_name?: string;
	email?: string;
	phone?: string;
}

/** Result of `document_extract` with doc_type = business_card. */
export interface BusinessCardExtraction {
	fields: BusinessCardFields;
	/** 0–1. */
	confidence: number;
	notes: string;
}

/**
 * One extracted value offered back to the user, bound to the form control it
 * would populate. `apply` drives the checkbox in the review panel.
 */
export interface ExtractedFieldSuggestion {
	/** Form control name on `addAffiliateAccountForm`. */
	control: string;
	/** Human label shown in the review panel. */
	label: string;
	value: string;
	apply: boolean;
}
