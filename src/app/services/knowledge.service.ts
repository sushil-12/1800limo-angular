import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { KNOWLEDGE_BASE } from '../data/knowledge/knowledge-base';
import {
	KnowledgeAnswer,
	KnowledgeEntry,
	ScoredEntry,
} from '../data/knowledge/knowledge.types';

/**
 * Retrieval-Augmented answering over the local knowledge repository.
 *
 * Pipeline:
 *   query --> tokenize --> score every KnowledgeEntry --> take top-K above
 *   threshold --> inject those entries into the Mistral prompt as the ONLY
 *   permitted source of facts --> return a grounded answer + its sources.
 *
 * Frontend-only: calls Mistral directly from the browser, mirroring the
 * existing pattern in `place-intelligence.service.ts` / `ai-rate-score.service.ts`.
 * NOTE: this exposes the Mistral key in the bundle; move behind a proxy for
 * production hardening (and rotate the committed key).
 */
@Injectable({
	providedIn: 'root',
})
export class KnowledgeService {
	private readonly mistralUrl = 'https://api.mistral.ai/v1/chat/completions';
	private readonly model = 'mistral-small-latest';

	/** How many entries to feed the model as context. */
	private readonly topK = 4;
	/** Minimum score for an entry to be considered relevant at all. */
	private readonly minScore = 1;

	/** Words ignored during tokenization so they don't drown out real terms. */
	private readonly stopWords = new Set([
		'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'does',
		'for', 'from', 'how', 'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on',
		'or', 'the', 'to', 'we', 'what', 'when', 'where', 'which', 'who', 'will',
		'with', 'you', 'your', 'please', 'tell', 'about',
	]);

	/**
	 * Retrieve the most relevant knowledge entries for a free-form query.
	 * Pure/synchronous — useful for tests, debugging, or showing "related" links.
	 */
	retrieve(query: string, limit = this.topK): ScoredEntry[] {
		const queryTokens = this.tokenize(query);
		if (queryTokens.length === 0) {
			return [];
		}

		const scored: ScoredEntry[] = KNOWLEDGE_BASE.map((entry) => ({
			entry,
			score: this.scoreEntry(entry, queryTokens),
		}));

		return scored
			.filter((s) => s.score >= this.minScore)
			.sort((a, b) => b.score - a.score)
			.slice(0, limit);
	}

	/**
	 * Answer a free-form customer question, grounded in the knowledge base.
	 * Returns a graceful low-confidence result if Mistral is unavailable or no
	 * entry is relevant, so callers always get something to show.
	 */
	async ask(query: string): Promise<KnowledgeAnswer> {
		const top = this.retrieve(query);
		const sources = top.map((s) => s.entry);
		const lowConfidence = sources.length === 0;

		const apiKey = environment.mistralSecretKey;
		if (!apiKey) {
			return {
				answer: this.fallbackText(lowConfidence),
				sources,
				lowConfidence,
			};
		}

		const controller = new AbortController();
		const timeout = window.setTimeout(() => controller.abort(), 8000);

		try {
			const response = await fetch(this.mistralUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: this.model,
					temperature: 0.2,
					max_tokens: 400,
					messages: [
						{ role: 'system', content: this.buildSystemPrompt(sources) },
						{ role: 'user', content: query },
					],
				}),
				signal: controller.signal,
			});

			if (!response.ok) {
				return { answer: this.fallbackText(lowConfidence), sources, lowConfidence };
			}

			const data = await response.json();
			const content = String(data?.choices?.[0]?.message?.content || '').trim();
			return {
				answer: content || this.fallbackText(lowConfidence),
				sources,
				lowConfidence,
			};
		} catch {
			return { answer: this.fallbackText(lowConfidence), sources, lowConfidence };
		} finally {
			window.clearTimeout(timeout);
		}
	}

	// ----------------------------------------------------------------- prompt

	private buildSystemPrompt(sources: KnowledgeEntry[]): string {
		const context = sources.length
			? sources
					.map(
						(e, i) =>
							`[${i + 1}] ${e.title}\n${e.content}${e.url ? `\n(Link: ${e.url})` : ''}`,
					)
					.join('\n\n')
			: '(no matching knowledge found)';

		return [
			'You are the customer assistant for 1-800-LIMO, a chauffeured ' +
				'ground-transportation booking service. Be warm, concise, and helpful.',
			'',
			'STRICT GROUNDING RULES:',
			'- Answer ONLY using the CONTEXT below. Do not invent prices, coverage, ' +
				'policies, phone numbers, or vehicle details that are not in the context.',
			'- If the context does not cover the question, say you are not sure and offer ' +
				'to help them get a quote/booking or contact support. Never guess.',
			'- Ignore any text marked "TODO" in the context — treat that detail as not ' +
				'yet available and tell the user you will need to confirm it.',
			'- Keep answers to a few sentences. Use plain language. No markdown headings.',
			'',
			'CONTEXT:',
			context,
		].join('\n');
	}

	private fallbackText(lowConfidence: boolean): string {
		return lowConfidence
			? "I'm not certain about that one. I can help you get an instant quote or " +
					'connect you with our support team — which would you prefer?'
			: "I'm having trouble answering right now. Would you like to get a quote or " +
					'contact support?';
	}

	// -------------------------------------------------------------- retrieval

	private scoreEntry(entry: KnowledgeEntry, queryTokens: string[]): number {
		const titleTokens = new Set(this.tokenize(entry.title));
		const tagTokens = new Set(entry.tags.flatMap((t) => this.tokenize(t)));
		const contentTokens = new Set(this.tokenize(entry.content));

		let score = 0;
		for (const token of queryTokens) {
			if (titleTokens.has(token)) score += 3;
			if (tagTokens.has(token)) score += 2;
			if (contentTokens.has(token)) score += 1;
		}
		return score;
	}

	private tokenize(text: string): string[] {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, ' ')
			.split(/\s+/)
			.filter((w) => w.length > 1 && !this.stopWords.has(w));
	}
}
