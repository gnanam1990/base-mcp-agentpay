# AgentPay Demo Script

## Goal
Show a complete Base-themed AgentPay marketplace loop: discover an API, quote its x402 price, block an unpaid call, unlock it after approval, and record the provider receipt.

## Flow
1. Open the dashboard.
2. Show marketplace metrics: listed APIs, paid calls, and provider revenue.
3. Register a demo provider API with `POST /api/agentpay/services`.
4. Fetch its quote with `GET /api/agentpay/services/:slug/quote`.
5. Attempt `POST /api/agentpay/services/:slug/call` without a payment header and show the `402 Payment Required` body.
6. Retry the same call with `x-demo-payment: accepted`, show the service response, receipt, and `payment-response` header.
7. Call `POST /api/mcp/agentpay` with `get_service_quote` to prove agents can retrieve the same payment metadata.
8. Refresh the dashboard and show paid call/revenue movement.

## Next Proof
Swap demo payment approval for a configured facilitator and Base payment sender, then publish provider onboarding rules.
