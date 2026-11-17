# GhanaPathFinder AI Operations

This document describes how to configure, verify and maintain the AI features introduced by the AI Intelligence and Reliability upgrade.

## Architecture

The application uses a central server-side model selector in `src/lib/openai.server.ts`.

- `/api/chat` powers Ask GhanaPathFinder and its database/navigation search tools.
- `/api/career-intelligence` combines deterministic profile ranking with live catalogue evidence.
- `/api/career-path` generates a staged path from a student's current position and live catalogue evidence.
- Admission, scholarship, company, life-game and WASSCE scanning endpoints use the same model selector.
- Supabase PostgreSQL/pgvector stores curated reference documents for hybrid keyword and semantic retrieval.
- The authenticated `/api/knowledge-ingest` Vercel route verifies administrator access, chunks approved material and generates embeddings. A separately deployed Supabase Edge Function remains available for controlled integrations.

The model is not fine-tuned by adding documents. The knowledge library is a retrieval system: source material is stored, embedded and retrieved at query time.

## Model provider configuration

Choose one provider per deployment environment.

### Direct OpenAI

Set:

- `AI_PROVIDER=openai` (or leave unset; this is the default)
- `OPENAI_API_KEY`
- Optionally `OPENAI_MODEL`
- Optionally `OPENAI_MODEL_FAST`, `OPENAI_MODEL_CHAT`, `OPENAI_MODEL_REASONING` and `OPENAI_MODEL_STRUCTURED`

Use model IDs enabled for the OpenAI project. The current AI reliability Preview branch is configured for `gpt-5.4-mini` on chat and structured tasks to reduce pressure on the larger model's token-per-minute quota. Confirm a model is enabled for the API organisation before changing it. Keep Preview deployments limited to trusted repository branches because server-side API credentials are available to that environment.

### DeepSeek

Set:

- `AI_PROVIDER=deepseek`
- `DEEPSEEK_API_KEY`
- Optionally `DEEPSEEK_MODEL`
- Optionally `DEEPSEEK_MODEL_FAST`, `DEEPSEEK_MODEL_CHAT`, `DEEPSEEK_MODEL_REASONING` and `DEEPSEEK_MODEL_STRUCTURED`

The default model is `deepseek-flash`, which uses DeepSeek's OpenAI-compatible Responses API at `https://api.deepseek.com`. Confirm the DeepSeek API account has an active balance; a configured key alone does not prove that inference is funded.

### Vercel AI Gateway

Set:

- `AI_PROVIDER=vercel-gateway`
- `AI_GATEWAY_MODEL_CHAT`
- `AI_GATEWAY_MODEL_STRUCTURED`
- Optionally `AI_GATEWAY_MODEL_FAST`
- Optionally `AI_GATEWAY_MODEL_REASONING`
- `AI_GATEWAY_MODEL_EMBEDDING` for the 1536-dimensional query embeddings

Model IDs must use the Gateway's exact `provider/model` format. Vercel deployments can authenticate through Vercel OIDC; external/local environments should use a Gateway API key stored as a secret.

**Provider-account prerequisite:** the configured model provider must have active API access and a remaining credit balance. An OpenAI response such as "You have no credits remaining" or a DeepSeek "Insufficient Balance" response is surfaced as a distinct `credits_exhausted` state, not mislabeled as a temporary rate limit. Vercel AI Gateway may separately require account setup before it accepts model requests; its "valid credit card on file" response is surfaced as `billing_setup_required`. These are provider-account conditions, not code-build failures. The project owner/administrator must resolve the relevant account status.

## Global knowledge ingestion

1. Open the admin data console with an authorised administrator account.
2. Use **Global AI knowledge library**.
3. Add the title, source organisation, official HTTPS URL, country code, category and publication/verification dates.
4. Paste a concise factual extract that the project is permitted to store.
5. Keep the status as Pending review until a human has checked the source and the extract.
6. Mark material Verified or Official only after review; only those statuses can be published to AI retrieval.
7. Confirm the document reports successful chunks and is available to retrieval.

The Edge Function requires:

- A valid Supabase Auth JWT.
- A matching `admin` record in `public.user_roles`.
- Supabase `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` Edge Function secrets.
- `OPENAI_API_KEY` as a Supabase Edge Function secret for the embedding request.

The ingestion function accepts 1–5 documents per call; each source text is 100–50,000 characters and each document is split into bounded overlapping chunks.

Use official government, university, regulator, scholarship-provider and recognised international datasets wherever possible. Respect each source's terms and licensing. Keep source URLs, publication dates and last-verification dates. Do not paste copyrighted books or large copyrighted pages into the library.

## Retrieval behaviour

- Structured catalogues are searched with read-only server-side database tools for exact institution/programme/opportunity facts.
- The knowledge library uses hybrid PostgreSQL full-text and pgvector search.
- Only published public records are returned by the RAG search function.
- Retrieved text is treated as untrusted reference material, not as instructions.
- A record's verification status and source link must be carried into the answer.
- A missing catalogue result is not proof that an institution, scholarship or opportunity does not exist.
- A provider directory record is not proof of an active vacancy.
- Missing admission, fee, deadline or cutoff information must be confirmed with the official institution.

The current RAG document/chunk tables are initially empty. The platform's existing structured records remain searchable through the live database tools; global semantic retrieval will only return matches after reviewed source material is ingested.

## Reliability and operations

- Chat history, uploaded attachments, input size, tool-step count and output tokens are bounded.
- Provider rate limits, exhausted API credits, billing/setup errors, rejected API credentials, timeouts and generic provider failures are classified separately.
- Failed requests preserve the conversation and return a retry/recovery message.
- The in-memory rate limiter is best-effort per serverless instance, not a distributed quota system. Add a shared limiter before scaling heavy public AI traffic.
- Do not promise 100% accuracy. Use source attribution, human-reviewed benchmark questions and regular data freshness checks.

## Verification

From the repository root:

```bash
bun run build
bun run test
```

The current automated suite covers deterministic career ranking, AI provider billing/rate-limit/timeout classification and Ask-panel context handling. It does not replace human review, provider-credit verification or live database integration tests.

## Production rollout checklist

- Confirm the production model provider and available provider budget with the project owner.
- Set production provider/model variables intentionally; do not assume Preview variables apply to Production.
- Confirm Supabase Edge Function secrets for knowledge ingestion.
- Ingest and review an initial international and GhanaPathFinder knowledge corpus.
- Test Ask GhanaPathFinder, Career Intelligence, Career Path, WASSCE/image/PDF workflows and navigation on the actual production data.
- Review Vercel runtime logs for 429s, timeouts and provider errors.
- Review answer quality against a human-approved benchmark before releasing to all users.
