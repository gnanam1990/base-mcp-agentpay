const baseUrl = process.env.AGENTPAY_BASE_URL || "http://127.0.0.1:3001";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, options = {}, expectedStatus = 200) {
  const response = await fetch(new URL(path, baseUrl), options);
  const json = await response.json();
  assert(
    response.status === expectedStatus,
    `${path} expected ${expectedStatus}, received ${response.status}: ${JSON.stringify(json)}`,
  );
  return { response, json };
}

const status = await request("/api/agentpay/status");
assert(status.json.data.name === "AgentPay", "project name should match");
assert(status.json.data.metrics.length === 3, "dashboard should expose three metrics");
assert(status.json.data.workflow.length === 4, "agent flow should expose four steps");
assert(status.json.data.tools.length >= 4, "MCP tool list should be present");

const serviceName = `Smoke Risk Oracle ${Date.now()}`;
const created = await request(
  "/api/agentpay/services",
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: serviceName,
      category: "Risk",
      description: "Scores an agent request before it spends USDC.",
      priceUsdc: 0.04,
      provider: "Smoke Provider",
      providerAddress: "0x4444444444444444444444444444444444444444",
    }),
  },
  201,
);

const service = created.json.data;
assert(service.slug, "created service should include a slug");
assert(service.priceUsdc === 0.04, "created service should preserve price");

const services = await request("/api/agentpay/services");
assert(
  services.json.data.some((item) => item.slug === service.slug),
  "service list should include created service",
);

const quote = await request(`/api/agentpay/services/${service.slug}/quote`);
assert(quote.json.data.payment.scheme === "exact", "quote should expose exact payment scheme");
assert(quote.json.data.payment.asset === "USDC", "quote should request USDC");

const unpaid = await request(
  `/api/agentpay/services/${service.slug}/call`,
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ input: "unpaid call should be blocked" }),
  },
  402,
);
assert(unpaid.json.error === "payment_required", "unpaid call should require payment");

const paid = await request(`/api/agentpay/services/${service.slug}/call`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-demo-payment": "accepted",
  },
  body: JSON.stringify({ input: "paid call should unlock" }),
});
assert(paid.json.receipt.serviceSlug === service.slug, "paid call should return a receipt");
assert(paid.response.headers.get("payment-response"), "paid call should emit payment-response");

const mcp = await request("/api/mcp/agentpay", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    tool: "get_service_quote",
    arguments: { slug: service.slug },
  }),
});
assert(mcp.json.data.slug === service.slug, "MCP quote tool should resolve created service");

console.log(`AgentPay smoke checks passed against ${baseUrl}`);
