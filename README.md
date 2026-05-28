# AgentPay

Agent-native API discovery, comparison, and x402 payment on Base.

**Status:** Marketplace MVP foundation

Give AI agents a clean catalog of paid APIs they can discover, price-check, and call through x402 without custom billing accounts.

## Current MVP
- Base industrial-neon UI theme from the shared suite prompt.
- Responsive dashboard with wallet/action controls, metrics, workflow, MCP tools, and live record surface.
- Product status API at `/api/agentpay/status`.
- Smoke checks for required dashboard data.

## Local Development
```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Checks
```bash
npm run typecheck
npm run build
npm run test:smoke
```

## Next Build Slice
Wire the mocked dashboard data into real Base Sepolia reads, x402 payment verification, or contract prepare endpoints depending on this product's launch path.

## License
MIT
