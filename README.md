# token-gate

A self-hostable AI API gateway. Issue scoped API keys, gate requests by credits, and route calls to any upstream LLM provider through a single unified endpoint.

## About

token-gate sits between your application and AI providers. You issue API keys to your users, charge credits per request, and forward calls to whichever provider and model you choose without changing your integration code.

## Features

- API key management: create, disable, and delete scoped keys per user.
- Credit gating: every request decrements the user's credit balance, requests are blocked at zero.
- Multi-provider routing: one OpenAI-compatible endpoint routes to OpenAI, Anthropic (Claude), or Google (Gemini) based on the model slug.
- Stripe top-ups: buy credit packages through Stripe Checkout, fulfilled by webhook.
- Rate limiting: per-key limit of 10 requests per minute with a sliding window.
- Conversation logging: every request stores input, output, token counts, and timestamp.
- Analytics dashboard: charts for requests per day, input vs output tokens per day, and credits consumed per key.

## Tech Stack

| Layer    | Technology                                                     |
| -------- | -------------------------------------------------------------- |
| Frontend | React 19, Bun, Tailwind CSS v4, shadcn/ui, Recharts            |
| Backend  | Elysia (Bun), Eden treaty for end-to-end type safety, JWT auth |
| Database | Prisma ORM, PostgreSQL                                         |
| Payments | Stripe Checkout and webhooks                                   |
| Monorepo | Turborepo, Bun workspaces                                      |

## Structure

```
apps/
  dashboard-frontend   React dashboard for keys, credits, models, and analytics
  primary-backend      Elysia API server (auth, API keys, payments, models, analytics)
  api-backend          OpenAI-compatible LLM proxy with credit gating and rate limiting
packages/
  db                   Shared Prisma client and schema
  ui                   Shared component library
  eslint-config        Shared ESLint config
  typescript-config    Shared TypeScript config
```

## API

### Primary backend (default port 3001)

Cookie-based JWT auth. Used by the dashboard.

| Method                    | Route               | Description                                    |
| ------------------------- | ------------------- | ---------------------------------------------- |
| POST                      | `/auth/signup`      | Create an account, sets the auth cookie        |
| POST                      | `/auth/signin`      | Sign in, sets the auth cookie                  |
| GET / POST / PUT / DELETE | `/api-keys`         | Manage API keys                                |
| GET                       | `/models`           | List available models and providers            |
| GET                       | `/payments/balance` | Get the current credit balance                 |
| POST                      | `/payments/onramp`  | Start a Stripe Checkout session                |
| POST                      | `/payments/webhook` | Stripe webhook, credits the account on payment |
| GET                       | `/analytics`        | Usage data for the dashboard charts            |

### API backend (default port 3002)

Bearer-token auth using an issued API key. Used by your application.

| Method | Route                      | Description                                        |
| ------ | -------------------------- | -------------------------------------------------- |
| POST   | `/api/v1/chat/completions` | Send a chat request, routed to the chosen provider |

Example request:

```bash
curl -X POST http://localhost:3002/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"model":"MODEL_SLUG","messages":[{"role":"user","content":"say hello"}]}'
```

## Getting Started

This repo uses Bun. Install Bun first, then:

```bash
bun install
```

Set the database URL in `packages/db/.env`:

```
DATABASE_URL="postgresql://..."
```

Push the schema and generate the client:

```bash
cd packages/db
bunx --bun prisma db push
```

Set the backend environment variables in `apps/primary-backend/.env` (`JWT_SECRET`, `DATABASE_URL`, Stripe keys) and `apps/api-backend/.env` (provider API keys, `DATABASE_URL`).

Run everything in dev mode from the repo root:

```bash
bun run dev
```

## Planned

- Webhook notifications on low credit balance.
- Key expiry dates and IP allowlist support.
- Per-model cost breakdown in analytics.
