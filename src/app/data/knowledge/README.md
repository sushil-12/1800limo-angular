# AI Knowledge Repository

This folder is the **"training data" for the in-app assistant**. It is *not*
model fine-tuning — entries are retrieved at question time and injected into the
Mistral prompt (Retrieval-Augmented Generation, "RAG"). Editing content here
changes what the assistant knows **immediately on the next app build** — no
model retraining, no backend.

## Files

| File | Purpose |
|------|---------|
| `knowledge-base.ts` | The content you edit — an array of `KnowledgeEntry`. |
| `knowledge.types.ts` | TypeScript shapes for entries / answers. |
| `../../services/knowledge.service.ts` | Retrieval + grounded answering. |

## How it works

```
user question
   → tokenize (lowercase, strip stopwords)
   → score every entry: title ×3, tags ×2, content ×1
   → take top 4 entries above the relevance threshold
   → inject them into Mistral as the ONLY allowed source of facts
   → return a grounded answer + the source entries
```

The model is explicitly instructed to **never invent** facts that aren't in the
retrieved entries, and to treat any `TODO:` text as "not yet available."

## Adding / editing knowledge

Add an object to `KNOWLEDGE_BASE` in `knowledge-base.ts`:

```ts
{
  id: 'policy-child-seats',          // unique, kebab-case
  title: 'Child seats & car seats',  // weighted highest in search
  category: 'policies',
  tags: ['child seat', 'car seat', 'baby', 'infant', 'booster'], // synonyms users type
  content: 'We can arrange child seats on request when you book. ...',
  url: 'https://www.1800limo.com/...', // optional
}
```

**Tips for good entries**
1. One topic per entry; keep `content` self-contained.
2. Put every synonym a customer might type into `tags`
   (`price`, `cost`, `how much`, `rate`, `fare`).
3. State only verified facts. Anything missing simply won't be answered —
   which is safer than a wrong answer.
4. Mark unverified specifics with `TODO:` so the assistant withholds them.

## Before production

- Replace every `TODO:` placeholder with verified facts (pricing, coverage,
  cancellation, payment, support contact).
- **Rotate the Mistral API key** — it currently ships in the browser bundle.
  Long term, move the Mistral call behind a small server proxy.

## Upgrade path (when the KB grows large)

Keyword scoring is great for a few dozen entries. If this grows into hundreds,
switch `retrieve()` to **embeddings**: precompute a vector per entry (Mistral
embeddings API), embed the query, and rank by cosine similarity. The public
API of `KnowledgeService` stays the same.
