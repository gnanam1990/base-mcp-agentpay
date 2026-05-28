# AgentPay Architecture

## Product Role
Give AI agents a clean catalog of paid APIs they can discover, price-check, and call through x402 without custom billing accounts.

## Current Foundation
- Next.js App Router dashboard with the shared Base industrial-neon UI system.
- File-backed marketplace state in `.data/agentpay-db.json`, seeded from the MVP service catalog.
- Product status endpoint: `GET /api/agentpay/status`.
- Service endpoints for listing, registering, quoting, and executing paid APIs.
- MCP JSON endpoint backed by live marketplace state.

## Modules
- `lib/agentpay-store.ts` owns service records, stats, local persistence, and payment receipts.
- `lib/agentpay-payment.ts` prepares x402 payment requirements and verifies demo or facilitator-backed payments.
- `app/api/agentpay/services` exposes marketplace registration and listing.
- `app/api/agentpay/services/[slug]/quote` returns a service-specific payment requirement.
- `app/api/agentpay/services/[slug]/call` blocks unpaid calls with `402 Payment Required`, records paid calls, and emits `payment-response`.
- `app/api/mcp/agentpay` maps agent tools to marketplace reads and prepared call metadata.

## Base Pattern
- Base Account is the primary wallet and approval surface.
- Read actions should stay free where possible.
- Paid or premium calls should use x402 with explicit max-payment controls.
- Write actions should return prepared calls and wait for user approval.

## Payment Modes
- `demo` mode accepts `x-demo-payment: accepted` so the local demo can show the full x402-shaped loop without live funds.
- `strict` mode requires `x-payment` plus `X402_FACILITATOR_URL`; the app calls `/verify` and `/settle` before releasing the service response.
- Receipts store service, amount, network, payment hash, facilitator reference, and timestamp for auditability.

## Safety Defaults
- Base mainnet by default; use Base mainnet only for rehearsals.
- No private keys in committed files.
- No hidden approvals or automatic writes.
- Keep public demo values small and auditable.
