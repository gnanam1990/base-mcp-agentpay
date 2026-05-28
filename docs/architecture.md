# AgentPay Architecture

## Product Role
AgentPay is a registry where developers list x402-enabled APIs and agents discover, compare, pay for, and call services with USDC on Base.

## System Shape
- Frontend app: Next.js, TypeScript, Tailwind, shadcn-style components, responsive dashboards.
- API layer: Node/TypeScript endpoints for product reads, prepare flows, analytics, and x402-gated access.
- Base layer: Base Account for user approval and Base MCP for assistant-driven actions.
- Payment layer: x402 for paid API/content/service access using USDC on Base or Base Sepolia.
- Data layer: PostgreSQL for durable product state and Redis for cache/session/rate-limit workloads.
- Contracts: Solidity/Foundry only where the module needs onchain state or settlement logic.

## Main Modules
- Provider onboarding for API listings, pricing, docs, categories, and health checks.
- Agent-facing discovery API and MCP tools for search and paid invocation.
- Sample x402 APIs for weather, sentiment, market data, and summarization.
- Usage and earnings dashboards for API providers.
- Quality signals for uptime, latency, price, and successful paid calls.

## Data Model
- Provider profiles and service listings.
- Endpoint metadata, price, network, accepted token, schema, and discovery tags.
- Call receipts, health check history, usage totals, and provider earnings.
- Reviews or quality scores after real usage exists.

## MCP And x402 Pattern
Every write action should be exposed as a prepare endpoint that returns unsigned calldata or a payment request. MCP/plugin documentation must explain onboarding, read endpoints, prepare endpoints, and the mapping into Base MCP actions.

For paid resources, endpoints should return an x402 payment requirement before serving premium data. The app must enforce a user-defined max payment cap and record receipts for analytics and support.

## Safety Defaults
- Base Sepolia first, then Base mainnet.
- No private keys in app config.
- No hidden approvals or auto-execution.
- Clear user review before paid access or onchain writes.
- Placeholder env vars only in committed files.
