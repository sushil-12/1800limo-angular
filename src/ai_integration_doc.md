# Angular Integration — 1800LIMO AI Backend

How to consume the AI API (`/api/ai/*`) from an Angular frontend.

> **Security:** the OpenAI key lives only on the Laravel backend and is never
> exposed to Angular. The frontend only sends the user's Passport bearer token.

---

## Endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/ai/generate` | user (`auth:api`) | Generate or reuse AI content |
| `GET` | `/api/admin/ai/requests` | admin | Audit log (paginated/filterable) |
| `POST` | `/api/admin/ai/requests/{id}/approve` | admin | Approve content for shared reuse |
| `DELETE` | `/api/admin/ai/cache` | admin | Clear cached AI results |

### Request body for `/api/ai/generate`

```json
{ "feature_type": "vehicle_profile", "input": { "make": "Mercedes", "model": "S-Class" }, "async": false }
```

### Response envelope

```json
{
  "success": true,
  "message": "AI response generated.",
  "data": {
    "feature": "vehicle_profile",
    "source": "openai",
    "cached": false,
    "output": { "title": "...", "description": "...", "highlights": ["..."] },
    "text": "{...raw json...}",
    "tokens": { "input": 42, "output": 30, "total": 72 },
    "estimated_cost": 0.0001,
    "request_id": 12
  }
}
```

---

## Feature catalogue

| `feature_type` | Required input | Optional input | `output` shape |
|---|---|---|---|
| `trip_rate` | `pickup`, `dropoff`, `distance_miles`, `vehicle_type` | `duration_minutes`, `city` | `{ suggested_rate, low, high, currency, reasoning }` |
| `vehicle_profile` | `make`, `model` | `year`, `type`, `features[]` | `{ title, description, highlights[] }` |
| `driver_profile` | — | `years_experience`, `languages[]`, `specialties[]` | `{ headline, bio, highlights[] }` |
| `rewrite_message` | `message` | `tone` | `{ rewritten }` |
| `service_description` | `service_name` | `key_points[]` | `{ description }` |
| `review_reply` | `review_text` | `rating` | `{ reply }` |
| `marketing_copy` | `topic` | `channel`, `audience` | `{ headline, body }` |

---

## 1. Models — `ai.models.ts`

```typescript
// Supported features — must match config/ai.php on the backend.
export type AiFeature =
  | 'trip_rate'
  | 'vehicle_profile'
  | 'driver_profile'
  | 'rewrite_message'
  | 'service_description'
  | 'review_reply'
  | 'marketing_copy';

// ---- Per-feature input payloads ----
export interface TripRateInput {
  pickup: string;
  dropoff: string;
  distance_miles: number;
  vehicle_type: string;
  duration_minutes?: number;
  city?: string;
}
export interface VehicleProfileInput {
  make: string;
  model: string;
  year?: number;
  type?: string;
  features?: string[];
}
export interface DriverProfileInput {
  years_experience?: number;
  languages?: string[];
  specialties?: string[];
}
export interface RewriteMessageInput { message: string; tone?: string; }
export interface ServiceDescriptionInput { service_name: string; key_points?: string[]; }
export interface ReviewReplyInput { review_text: string; rating?: number; }
export interface MarketingCopyInput { topic: string; channel?: string; audience?: string; }

// ---- Per-feature structured outputs (the `output` field) ----
export interface TripRateOutput { suggested_rate: number; low: number; high: number; currency: string; reasoning: string; }
export interface VehicleProfileOutput { title: string; description: string; highlights: string[]; }
export interface DriverProfileOutput { headline: string; bio: string; highlights: string[]; }
export interface RewriteMessageOutput { rewritten: string; }
export interface ServiceDescriptionOutput { description: string; }
export interface ReviewReplyOutput { reply: string; }
export interface MarketingCopyOutput { headline: string; body: string; }

// ---- Generic envelope ----
export interface AiResult<T = unknown> {
  feature: AiFeature;
  source: 'cache' | 'db' | 'openai';
  cached: boolean;
  output: T;
  text: string;
  tokens: { input: number; output: number; total: number };
  estimated_cost: number;
  request_id: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

// Async dispatch response (HTTP 202)
export interface AiQueued { queued: boolean; feature: AiFeature; }
```

---

## 2. Service — `ai.service.ts`

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  AiFeature, AiResult, ApiResponse, AiQueued,
  TripRateInput, TripRateOutput,
  VehicleProfileInput, VehicleProfileOutput,
  DriverProfileInput, DriverProfileOutput,
  RewriteMessageInput, RewriteMessageOutput,
  ServiceDescriptionInput, ServiceDescriptionOutput,
  ReviewReplyInput, ReviewReplyOutput,
  MarketingCopyInput, MarketingCopyOutput,
} from './ai.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly base = `${environment.apiUrl}/api/ai`;

  constructor(private http: HttpClient) {}

  /** Low-level generic call. Returns the unwrapped AiResult. */
  private generate<I extends object, O>(
    feature: AiFeature,
    input: I,
    async = false,
  ): Observable<AiResult<O>> {
    return this.http
      .post<ApiResponse<AiResult<O>>>(`${this.base}/generate`, { feature_type: feature, input, async })
      .pipe(map(res => res.data));
  }

  // ---- Typed helpers per feature ----
  suggestTripRate(input: TripRateInput)              { return this.generate<TripRateInput, TripRateOutput>('trip_rate', input); }
  improveVehicle(input: VehicleProfileInput)         { return this.generate<VehicleProfileInput, VehicleProfileOutput>('vehicle_profile', input); }
  improveDriver(input: DriverProfileInput)           { return this.generate<DriverProfileInput, DriverProfileOutput>('driver_profile', input); }
  rewriteMessage(input: RewriteMessageInput)         { return this.generate<RewriteMessageInput, RewriteMessageOutput>('rewrite_message', input); }
  serviceDescription(input: ServiceDescriptionInput) { return this.generate<ServiceDescriptionInput, ServiceDescriptionOutput>('service_description', input); }
  reviewReply(input: ReviewReplyInput)               { return this.generate<ReviewReplyInput, ReviewReplyOutput>('review_reply', input); }
  marketingCopy(input: MarketingCopyInput)           { return this.generate<MarketingCopyInput, MarketingCopyOutput>('marketing_copy', input); }

  /** Queue heavy/bulk work — returns 202 with { queued: true }. */
  generateAsync<I extends object>(feature: AiFeature, input: I): Observable<AiQueued> {
    return this.http
      .post<ApiResponse<AiQueued>>(`${this.base}/generate`, { feature_type: feature, input, async: true })
      .pipe(map(res => res.data));
  }
}
```

---

## 3. Auth interceptor — `auth.interceptor.ts`

The frontend only sends the user's Passport bearer token. The OpenAI key stays
on the backend.

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
    : req;
  return next(authReq);
};
```

Register it (standalone bootstrap):

```typescript
provideHttpClient(withInterceptors([authInterceptor]))
```

---

## 4. Component usage

```typescript
export class VehicleEditComponent {
  loading = false;
  error: string | null = null;
  description = '';
  highlights: string[] = [];

  constructor(private ai: AiService) {}

  improve() {
    this.loading = true;
    this.error = null;
    this.ai.improveVehicle({ make: 'Mercedes', model: 'S-Class', year: 2024, features: ['wifi', 'leather'] })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.description = res.output.description;   // typed: VehicleProfileOutput
          this.highlights  = res.output.highlights;
          // res.source -> 'openai' | 'cache' | 'db' (for a "reused" badge)
        },
        error: (err) => {
          this.loading = false;
          this.error = err.status === 429
            ? 'Too many requests — please wait a moment.'
            : err.error?.message ?? 'AI service is unavailable.';
        },
      });
  }
}
```

---

## 5. HTTP status handling

| Status | Meaning | Suggested UI |
|---|---|---|
| `200` | Success (check `data.source`) | render `data.output` |
| `202` | Queued (async) | show "processing" state |
| `422` | Invalid input / unsupported feature | show `error.errors` field messages |
| `429` | Rate limited | back off; uses `data.retry_after_seconds` |
| `401` | Token missing/expired | re-auth |
| `403` | Not allowed (admin endpoints) | hide admin UI |
| `503` | AI temporarily unavailable/disabled | retry later |

---

## 6. Behavioral notes

- **Inputs are normalized server-side** — `"  Mercedes "` and `"mercedes"` map to
  the same cache key. No need to pre-normalize casing/whitespace on the frontend.
- **`source: 'cache' | 'db'`** means no tokens were spent; use `data.cached` to
  show a subtle "reused" vs "freshly generated" indicator.
- **`marketing_copy`** is only reused after an admin approves it
  (`POST /api/admin/ai/requests/{id}/approve`); the first generation is always fresh.
- **Admin endpoints** (`/api/admin/ai/*`) require the backend `admin` middleware;
  regular users receive `403`.
- **Bulk regeneration** (e.g. many vehicle profiles) should use `async: true` so
  work runs on the queue instead of blocking the request.
```
