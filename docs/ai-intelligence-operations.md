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

### Groq (generation provider)

Set:

- `AI_PROVIDER=groq`
- `GROQ_API_KEY`
- Optionally `GROQ_MODEL` (defaults to `openai/gpt-oss-120b`)
- Optionally `GROQ_MODEL_FAST` (defaults to `openai/gpt-oss-20b`)
- Optionally `GROQ_MODEL_CHAT`, `GROQ_MODEL_REASONING` and `GROQ_MODEL_STRUCTURED`
- Optionally `GROQ_WAEC_MODEL` (defaults to the vision-capable `qwen/qwen3.8-27b`)

The server-side model factory sends generation requests to Groq's OpenAI-compatible Responses API at `https://api.groq.com/openai/v1`. Existing chat, tool-calling and structured-output route interfaces are retained. Groq's Responses API is documented as beta, so verify each document and tool workflow against the live account before enabling it for all users.

The application defaults to Groq even when an old `AI_PROVIDER=openai` value is still present. This prevents an old deployment variable from silently routing generation back to the exhausted OpenAI account.
### Vercel AI Gateway

Set:

- `AI_PROVIDER=vercel-gateway`
- `AI_GATEWAY_MODEL_CHAT`
- `AI_GATEWAY_MODEL_STRUCTURED`
- Optionally `AI_GATEWAY_MODEL_FAST`
- Optionally `AI_GATEWAY_MODEL_REASONING`
- `AI_GATEWAY_MODEL_EMBEDDING` for the 1536-dimensional query embeddings

Model IDs must use the Gateway's exact `provider/model` format. Vercel deployments can authenticate through Vercel OIDC; external/local environments should use a Gateway API key stored as a secret.

**Account prerequisite:** the Gateway account may require billing setup before it accepts model requests. When Gateway returns the "valid credit card on file" error, the application reports that setup is required by the project owner/administrator. This is not a code-build failure. Do not disable the error handler or present it as a user input error.

## Zero-spend degraded mode

The primary text-generation provider is now Groq. Free-tier use is subject to organisation-level request and token limits; hitting those limits can temporarily stop responses. The application must not treat a daily or account-level limit as a short transient failure or repeatedly ask users to retry.

When the provider explicitly reports exhausted credits:

- Ask GhanaPathFinder, Personal AI Tutor and AI Co-Founder cannot provide new open-domain model-generated responses. Existing conversation history remains saved. The UI explains the provider-quota problem and hides the futile retry control.
- Career Intelligence can return a clearly labelled deterministic profile match using the supplied profile, the local career catalogue and retrieved database evidence.
- Career Path can return a clearly labelled deterministic starter plan using the supplied profile and actual catalogue records.
- Deterministic results are rule-based guidance, not LLM-generated analysis, predictions, admissions advice or guarantees. They must not invent programmes, vacancies, salaries, fees, deadlines or outcomes.
- Users can continue to browse the structured university, programme, scholarship and opportunity catalogues. Only verified scholarship records and active, published, verified opportunities should be described with those statuses.

Full generative chat, source-grounded tutoring, AI Co-Founder reasoning and document analysis require an authorised AI provider with an available quota. A deterministic fallback is not a substitute for those model capabilities. No new paid provider is configured by this degraded mode.

## Career evidence array search

The scholarships table stores its fields column as PostgreSQL text[]. Do not include fields in a PostgREST ilike OR clause: ilike is a scalar text operator and produces PostgreSQL error 42883 for text[]. Career evidence retrieval searches scalar scholarship columns with ilike and performs bounded, case-insensitive matching against the selected fields array separately. The verified=true filter must remain in place for scholarship evidence.

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
- `GROQ_API_KEY` for text generation; `OPENAI_API_KEY` is separate and used only by the legacy 1536-dimensional knowledge-embedding pipeline, if enabled. as a Supabase Edge Function secret only if the separate OpenAI embedding pipeline is still enabled. Groq generation does not provide the 1536-dimensional embedding model used by the existing pgvector index, so do not point embedding requests at Groq's text-generation endpoint. Existing stored vectors can remain in place; without a working embedding provider, semantic query retrieval and new knowledge ingestion are unavailable.

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
- Provider rate limits, billing/setup errors, timeouts and generic provider failures are classified separately.
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
