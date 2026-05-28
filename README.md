# AgentPay

x402 API marketplace for AI agents.

**Status:** Planned second build after PayGate foundation.

AgentPay is a registry where developers list x402-enabled APIs and agents discover, compare, pay for, and call services with USDC on Base.

## Why It Exists
Base MCP gives AI assistants access to Base Account actions such as balances, sends, swaps, contract calls, and x402 payments, with user approval for writes. This project turns that capability into a focused product for API providers, AI-agent builders, and developers who want pay-per-call services without API keys.

## Core Capabilities
- Provider onboarding for API listings, pricing, docs, categories, and health checks.
- Agent-facing discovery API and MCP tools for search and paid invocation.
- Sample x402 APIs for weather, sentiment, market data, and summarization.
- Usage and earnings dashboards for API providers.
- Quality signals for uptime, latency, price, and successful paid calls.

## Roadmap Snapshot
1. Build marketplace shell and provider listing CRUD.
2. Implement service discovery API and public catalog.
3. Add x402 invocation proxy with max-payment enforcement.
4. Publish sample paid APIs and MCP discovery/pay tools.
5. Launch provider analytics, docs, demo video, and public Base mainnet flow.

## Repository Status
This repository is public from day one. It starts with product, architecture, roadmap, and demo documentation. Implementation commits should stay small and use conventional commit prefixes.

## License
MIT
