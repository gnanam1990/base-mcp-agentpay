# AgentPay

Agent-native API discovery, comparison, and x402 payment on Base.

**Status:** Marketplace MVP foundation

Give AI agents a clean catalog of paid APIs they can discover, price-check, and call through x402 without custom billing accounts.

## Current MVP
- Base industrial-neon UI theme from the shared suite prompt.
- Responsive dashboard with wallet/action controls, live marketplace metrics, workflow, MCP tools, and record surface.
- File-backed API marketplace with service registration, quote lookup, paid service execution, and receipt recording.
- Demo x402 flow that returns `402 Payment Required` until a payment header or demo payment approval is provided.
- Product status API at `/api/agentpay/status`.
- MCP-compatible JSON endpoint at `/api/mcp/agentpay` for search, quotes, prepared calls, and provider stats.
- Smoke checks for service creation, quote, unpaid lock, paid unlock, receipt, and MCP quote.

## API Surface
- `GET /api/agentpay/services` lists active paid services.
- `POST /api/agentpay/services` registers a paid API with name, category, provider, price, and payout address.
- `GET /api/agentpay/services/:slug/quote` returns the x402 payment requirement for a service call.
- `POST /api/agentpay/services/:slug/call` executes the service after payment verification and records a receipt.
- `GET /api/agentpay/status` returns dashboard data and marketplace stats.
- `GET /api/mcp/agentpay` lists MCP tools.
- `POST /api/mcp/agentpay` runs MVP tools: `search_agentpay_services`, `get_service_quote`, `prepare_x402_call`, and `get_provider_stats`.

## Local Development
```bash
npm install
npm run dev -- -p 3001
```

Open `http://127.0.0.1:3001`.

Local data is written to `.data/agentpay-db.json`. Override it with `AGENTPAY_DATA_FILE` for isolated runs.

## Environment
Copy `.env.example` to `.env.local` when you need custom payment behavior.

- `AGENTPAY_PAYMENT_MODE=demo` accepts the `x-demo-payment: accepted` header for local demos.
- `AGENTPAY_PAYMENT_MODE=strict` requires a real `x-payment` header and facilitator configuration.
- `X402_FACILITATOR_URL` points to a facilitator that can verify and settle x402 payments.
- `X402_RECEIVING_ADDRESS` overrides the provider payout address for demos.

## Checks
```bash
npm run typecheck
npm run build
npm run test:smoke
```

## Next Build Slice
Replace the file-backed store with hosted persistence, add signed provider onboarding, and wire a production facilitator for live Base payments.

## License
MIT
