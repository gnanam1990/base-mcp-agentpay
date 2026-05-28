import fs from "node:fs";
import path from "node:path";
import projectData from "./project-data.json";

export type AgentPayService = {
  slug: string;
  name: string;
  category: string;
  description: string;
  priceUsdc: number;
  provider: string;
  providerAddress: string;
  health: string;
  latencyMs: number;
  calls: number;
  revenueUsdc: number;
  status: "Active" | "Draft";
  sampleResponse: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type AgentPayReceipt = {
  id: string;
  serviceSlug: string;
  serviceName: string;
  amountUsdc: number;
  asset: "USDC";
  network: string;
  providerAddress: string;
  paymentMode: "demo" | "facilitator";
  paymentPayloadHash?: string;
  facilitatorReference?: string;
  createdAt: string;
};

type AgentPayDb = {
  services: AgentPayService[];
  receipts: AgentPayReceipt[];
};

type ServiceInput = {
  name: string;
  category: string;
  description: string;
  priceUsdc: number;
  provider: string;
  providerAddress: string;
};

const seedServices: AgentPayService[] = [
  {
    slug: "sentiment-api",
    name: "Sentiment API",
    category: "NLP",
    description: "Scores market, creator, or community text for sentiment and confidence.",
    priceUsdc: 0.02,
    provider: "AgentPay Labs",
    providerAddress: "0x1111111111111111111111111111111111111111",
    health: "99.2%",
    latencyMs: 210,
    calls: 284,
    revenueUsdc: 5.68,
    status: "Active",
    sampleResponse: { sentiment: "positive", confidence: 0.91 },
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z",
  },
  {
    slug: "market-pulse",
    name: "Market Pulse",
    category: "Markets",
    description: "Returns a compact Base ecosystem pulse for agents deciding what to read or trade.",
    priceUsdc: 0.05,
    provider: "Base Data Desk",
    providerAddress: "0x2222222222222222222222222222222222222222",
    health: "98.7%",
    latencyMs: 340,
    calls: 187,
    revenueUsdc: 9.35,
    status: "Active",
    sampleResponse: { trend: "risk-on", baseVolume: "up", confidence: 0.84 },
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z",
  },
  {
    slug: "image-prompt-score",
    name: "Image Prompt Score",
    category: "Media",
    description: "Reviews an image prompt for specificity, risk, and generation readiness.",
    priceUsdc: 0.03,
    provider: "PromptOps",
    providerAddress: "0x3333333333333333333333333333333333333333",
    health: "99.0%",
    latencyMs: 180,
    calls: 42,
    revenueUsdc: 1.26,
    status: "Active",
    sampleResponse: { score: 87, risks: [], recommendation: "ship" },
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z",
  },
];

function dbPath() {
  if (process.env.AGENTPAY_DATA_FILE) {
    return process.env.AGENTPAY_DATA_FILE;
  }
  return process.env.VERCEL
    ? path.join("/tmp", "agentpay-db.json")
    : path.join(/*turbopackIgnore: true*/ process.cwd(), ".data", "agentpay-db.json");
}

function readDb(): AgentPayDb {
  const file = dbPath();
  if (!fs.existsSync(file)) {
    const initial = { services: seedServices, receipts: [] };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as AgentPayDb;
}

function writeDb(db: AgentPayDb) {
  const file = dbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `agentpay-service-${Date.now()}`;
}

function uniqueSlug(name: string, services: AgentPayService[]) {
  const base = slugify(name);
  let slug = base;
  let index = 2;
  while (services.some((service) => service.slug === slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
}

export function listServices() {
  return readDb().services;
}

export function findService(slug: string) {
  return readDb().services.find((service) => service.slug === slug && service.status === "Active");
}

export function createService(input: ServiceInput) {
  const db = readDb();
  const now = new Date().toISOString();
  const service: AgentPayService = {
    slug: uniqueSlug(input.name, db.services),
    name: input.name,
    category: input.category,
    description: input.description,
    priceUsdc: input.priceUsdc,
    provider: input.provider,
    providerAddress: input.providerAddress,
    health: "Pending",
    latencyMs: 0,
    calls: 0,
    revenueUsdc: 0,
    status: "Active",
    sampleResponse: { status: "registered", service: input.name },
    createdAt: now,
    updatedAt: now,
  };
  db.services.unshift(service);
  writeDb(db);
  return service;
}

export function marketplaceStats() {
  const db = readDb();
  return {
    listedApis: db.services.filter((service) => service.status === "Active").length,
    paidCalls: db.services.reduce((sum, service) => sum + service.calls, 0),
    providerRevenue: db.services.reduce((sum, service) => sum + service.revenueUsdc, 0),
  };
}

export function dashboardData() {
  const stats = marketplaceStats();
  const services = listServices();
  return {
    ...projectData,
    metrics: [
      { label: "Listed APIs", value: String(stats.listedApis), tone: "blue" },
      { label: "Paid calls", value: String(stats.paidCalls), tone: "green" },
      { label: "Provider revenue", value: `$${stats.providerRevenue.toFixed(2)}`, tone: "amber" },
    ],
    records: services.slice(0, 3).map((service) => [
      service.name,
      `${service.priceUsdc.toFixed(2)} USDC`,
      service.health === "Pending" ? "Pending onboarding" : `${service.health} healthy`,
    ]),
  };
}

export function recordPaidCall(
  serviceSlug: string,
  payment: Omit<
    AgentPayReceipt,
    "id" | "serviceSlug" | "serviceName" | "amountUsdc" | "asset" | "providerAddress" | "createdAt"
  >,
) {
  const db = readDb();
  const service = db.services.find((item) => item.slug === serviceSlug);
  if (!service) {
    return undefined;
  }

  const receipt: AgentPayReceipt = {
    id: `agentpay-${serviceSlug}-${Date.now()}`,
    serviceSlug,
    serviceName: service.name,
    amountUsdc: service.priceUsdc,
    asset: "USDC",
    network: payment.network,
    providerAddress: service.providerAddress,
    paymentMode: payment.paymentMode,
    paymentPayloadHash: payment.paymentPayloadHash,
    facilitatorReference: payment.facilitatorReference,
    createdAt: new Date().toISOString(),
  };

  service.calls += 1;
  service.revenueUsdc = Number((service.revenueUsdc + service.priceUsdc).toFixed(6));
  service.updatedAt = receipt.createdAt;
  db.receipts.unshift(receipt);
  writeDb(db);
  return receipt;
}
