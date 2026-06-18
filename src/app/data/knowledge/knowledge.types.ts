/**
 * Types for the AI knowledge repository.
 *
 * The knowledge base is the "training data" for the in-app assistant. It is NOT
 * model fine-tuning — entries here are retrieved at query time and injected into
 * the Mistral prompt (Retrieval-Augmented Generation). Edit the content in
 * `knowledge-base.ts`; no rebuild of any model is required.
 */

/** A single, self-contained fact/topic the assistant can answer from. */
export interface KnowledgeEntry {
	/** Stable unique id (kebab-case). Used for citations/debugging. */
	id: string;
	/** Short human title. Weighted heavily in retrieval. */
	title: string;
	/** Grouping bucket, e.g. 'services', 'fleet', 'booking', 'policies', 'faq'. */
	category: string;
	/** Search keywords / synonyms a user might type. Weighted in retrieval. */
	tags: string[];
	/** The actual answer content. Keep it factual, concise, and self-contained. */
	content: string;
	/** Optional canonical URL to cite or link the user to. */
	url?: string;
}

/** A retrieved entry plus its relevance score for a given query. */
export interface ScoredEntry {
	entry: KnowledgeEntry;
	score: number;
}

/** Result of asking the assistant a free-form question. */
export interface KnowledgeAnswer {
	/** Natural-language answer grounded in the retrieved entries. */
	answer: string;
	/** Entries that were used as context (for citations / "learn more" links). */
	sources: KnowledgeEntry[];
	/** True when no entry cleared the relevance threshold. */
	lowConfidence: boolean;
}
