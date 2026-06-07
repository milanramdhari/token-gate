# token-gate

A self-hostable AI API gateway. Issue scoped API keys, track credit consumption per key, and route requests to any upstream LLM provider through a single unified endpoint.

## About

token-gate sits between your application and AI providers. You issue API keys to your users, gate requests by credits, and forward calls to whichever provider and model you choose without touching your integration code.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Bun, Tailwind CSS v4, shadcn/ui |
| Backend | Elysia (Bun), Eden treaty for end-to-end type safety |
| Database | Prisma ORM |
| Monorepo | Turborepo, Bun workspaces |

## Structure

```
apps/
  dashboard-frontend   React dashboard for managing keys and credits
  primary-backend      Elysia API server (auth, API keys, payments, models)
  api-backend          Upstream LLM request proxy
packages/
  db                   Shared Prisma client
  ui                   Shared component library
  eslint-config        Shared ESLint config
  typescript-config    Shared TypeScript config
```

## Planned

- Rate limiting by requests per minute and token usage per key
- Webhook notifications on low credit balance
- Usage analytics with per-model and per-key breakdown
- Key expiry dates and IP allowlist support
