# AgentPay

> An agent-native marketplace for paid APIs: discover services, fetch x402 quotes, and pay-per-call with USDC on Base.

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)

## Overview

AgentPay is a Next.js App Router application that lets AI agents discover paid APIs, price-check them, and call them through the [x402](https://www.x402.org/) payment-required flow without setting up per-provider billing. Providers register a service with a price and a Base payout address; agents search the catalog, request a payment quote, and unlock the response by presenting a valid payment. It ships with a dashboard UI, REST endpoints, and an MCP-style JSON endpoint that exposes the same operations as named tools.

This is an MVP foundation: marketplace state is kept in a local JSON file and payments default to a demo mode (no real settlement). See [Status](#status) for what is real versus stubbed.

## Features

- **API marketplace** — register paid services, list active services, and look up a single service.
- **x402 payment gating** — `quote` and `call` endpoints return `402 Payment Required` with an x402 `accepts` body until a payment is supplied.
- **Two payment modes** — `demo` accepts a header for local testing; `strict` requires a real payment header and verifies/settles it through an external x402 facilitator (fail-closed on any rejection signal).
- **Receipts** — successful calls record a receipt (amount, network, provider address, payload hash) and increment per-service call/revenue counters.
- **MCP-style endpoint** — `/api/mcp/agentpay` exposes `search_agentpay_services`, `get_service_quote`, `prepare_x402_call`, and `get_provider_stats`.
- **Dashboard UI** — a responsive single-page dashboard showing marketplace metrics, the agent workflow, available MCP tools, and recent service records.
- **Smoke test** — an end-to-end script exercising service creation, listing, quote, unpaid lock, paid unlock, receipt, and an MCP quote.

## Tech stack

- **Next.js 16** (App Router, Route Handlers)
- **React 19** / **React DOM 19**
- **TypeScript 5.9**
- **lucide-react** for icons
- Node.js built-ins (`fs`, `crypto`) for the file-backed store and payload hashing

## Architecture

| Path | Responsibility |
| --- | --- |
| `app/page.tsx`, `app/layout.tsx`, `app/globals.css` | Dashboard UI and theme |
| `app/api/agentpay/services/route.ts` | List (`GET`) and register (`POST`) services |
| `app/api/agentpay/services/[slug]/quote/route.ts` | Return the x402 payment requirement for a service |
| `app/api/agentpay/services/[slug]/call/route.ts` | Verify payment, run the service, record a receipt |
| `app/api/agentpay/status/route.ts` | Dashboard data and marketplace stats |
| `app/api/mcp/agentpay/route.ts` | MCP-style tool listing (`GET`) and dispatch (`POST`) |
| `lib/agentpay-store.ts` | File-backed JSON store: services, receipts, seed data, stats |
| `lib/agentpay-payment.ts` | x402 requirement builder, payment verification, facilitator client |
| `lib/types.ts`, `lib/project-data.json` | Shared types and dashboard seed content |
| `scripts/smoke-test.mjs` | End-to-end smoke test against a running server |
| `docs/` | Architecture, UI system, roadmap, and demo notes |

## Getting started

### Prerequisites

- Node.js 18.18+ (Next.js 16 requirement)
- npm

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env.local` and set values as needed. The application reads the following variables (names only; never commit secrets):

| Variable | Purpose |
| --- | --- |
| `AGENTPAY_PAYMENT_MODE` | `demo` (default) accepts the `x-demo-payment` header; `strict` requires a real `x-payment` header and a facilitator. |
| `AGENTPAY_X402_NETWORK` | x402 network identifier for quotes/requirements (default `eip155:8453`). |
| `X402_FACILITATOR_URL` | Base URL of an x402 facilitator with `/verify` and `/settle` endpoints (required in `strict` mode). |
| `X402_RECEIVING_ADDRESS` | Overrides the provider payout address in payment requirements. |
| `AGENTPAY_DATA_FILE` | Overrides the path of the JSON data file (useful for isolated runs). |

The following names also appear in `.env.example` as placeholders for future work but are **not** read by the current code: `NEXT_PUBLIC_BASE_CHAIN_ID`, `BASE_RPC_URL`, `BASE_ACCOUNT_CLIENT_ID`, `BASE_MCP_URL`, `X402_DEFAULT_NETWORK`, `DATABASE_URL`, `REDIS_URL`, `NEXT_PUBLIC_APP_URL`.

### Running

```bash
# Start the dev server (default port 3000)
npm run dev

# Or match the smoke-test default port
npm run dev -- -p 3001
```

Marketplace state is written to `.data/agentpay-db.json` (or `/tmp/agentpay-db.json` on Vercel), seeded with three sample services on first run. Set `AGENTPAY_DATA_FILE` to use a different path.

## Usage

### REST endpoints

- `GET /api/agentpay/services` — list services.
- `POST /api/agentpay/services` — register a service (`name`, `category`, `description`, `priceUsdc`, `provider`, `providerAddress`; all optional with defaults). Returns `201`.
- `GET /api/agentpay/services/:slug/quote` — return the service plus its x402 payment requirement.
- `POST /api/agentpay/services/:slug/call` — call the service. Returns `402` with an x402 `accepts` body until payment is verified; on success returns the service's sample response, a receipt, and a `payment-response` header.
- `GET /api/agentpay/status` — dashboard data and marketplace stats.

Demo paid call:

```bash
curl -X POST http://127.0.0.1:3001/api/agentpay/services/sentiment-api/call \
  -H "content-type: application/json" \
  -H "x-demo-payment: accepted" \
  -d '{"input":"hello"}'
```

### MCP-style endpoint

- `GET /api/mcp/agentpay` — return the server name, version, and tool list.
- `POST /api/mcp/agentpay` — dispatch a tool via `{ "tool": "...", "arguments": { ... } }`:
  - `search_agentpay_services` — `{ query }`
  - `get_service_quote` — `{ slug }`
  - `prepare_x402_call` — `{ slug }`
  - `get_provider_stats` — no arguments

```bash
curl -X POST http://127.0.0.1:3001/api/mcp/agentpay \
  -H "content-type: application/json" \
  -d '{"tool":"get_service_quote","arguments":{"slug":"sentiment-api"}}'
```

## Testing

```bash
npm run typecheck       # next typegen + tsc --noEmit
npm run build           # production build
npm run test:smoke      # end-to-end smoke test (needs a running server)
```

The smoke test targets `http://127.0.0.1:3001` by default; override with `AGENTPAY_BASE_URL`. Start the server (`npm run dev -- -p 3001`) before running it. It covers status, service creation/listing, quote, the unpaid `402` lock, a demo paid unlock with receipt, and an MCP quote.

## Status

MVP foundation — functional for local development and demos, not production-ready.

- **File-backed store:** marketplace data lives in a single local JSON file. It is not shared across instances and resets to seed data when removed; the `/tmp` path used on serverless platforms is ephemeral.
- **Payments — demo mode (default):** any request carrying an `x-demo-payment` header is accepted without real settlement.
- **Payments — strict mode:** requires `X402_FACILITATOR_URL` and a real `x-payment` header, then verifies and settles through the external facilitator. This path is implemented but has not been validated against a live facilitator in this repo.
- **No on-chain integration:** the Base chain/account/RPC environment variables are placeholders and are not yet wired up.
- **Service execution:** `call` returns each service's stored `sampleResponse`; there is no proxying to a real upstream API.

Planned next: hosted persistence, signed provider onboarding, and a production facilitator for live Base payments.

## License

MIT — see [LICENSE](LICENSE).
