import { NextResponse } from "next/server";
import { createService, listServices } from "@/lib/agentpay-store";

export function GET() {
  return NextResponse.json({ data: listServices() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    category?: string;
    description?: string;
    priceUsdc?: number;
    provider?: string;
    providerAddress?: string;
  };

  const service = createService({
    name: body.name?.trim() || "Untitled AgentPay API",
    category: body.category?.trim() || "Utility",
    description: body.description?.trim() || "AgentPay service awaiting description.",
    priceUsdc: Number.isFinite(body.priceUsdc) ? Number(body.priceUsdc) : 0.01,
    provider: body.provider?.trim() || "AgentPay Provider",
    providerAddress:
      body.providerAddress?.trim() || "0x1111111111111111111111111111111111111111",
  });

  return NextResponse.json({ data: service }, { status: 201 });
}
