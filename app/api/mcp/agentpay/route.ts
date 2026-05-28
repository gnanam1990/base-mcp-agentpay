import { NextResponse } from "next/server";
import { findService, listServices, marketplaceStats } from "@/lib/agentpay-store";

const tools = [
  "search_agentpay_services",
  "get_service_quote",
  "prepare_x402_call",
  "get_provider_stats",
];

export function GET() {
  return NextResponse.json({
    server: "agentpay-mcp",
    version: "0.1.0",
    tools,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    tool?: string;
    arguments?: {
      query?: string;
      slug?: string;
    };
  };

  switch (body.tool) {
    case "search_agentpay_services": {
      const query = body.arguments?.query?.toLowerCase() ?? "";
      const results = listServices().filter((service) =>
        [service.name, service.category, service.description, service.provider].some((value) =>
          value.toLowerCase().includes(query),
        ),
      );
      return NextResponse.json({ data: results });
    }
    case "get_service_quote": {
      const service = body.arguments?.slug ? findService(body.arguments.slug) : undefined;
      if (!service) {
        return NextResponse.json({ error: "service_not_found" }, { status: 404 });
      }
      return NextResponse.json({
        data: {
          slug: service.slug,
          priceUsdc: service.priceUsdc,
          resource: `/api/agentpay/services/${service.slug}/call`,
          network: process.env.AGENTPAY_X402_NETWORK || "eip155:84532",
        },
      });
    }
    case "prepare_x402_call": {
      const service = body.arguments?.slug ? findService(body.arguments.slug) : undefined;
      if (!service) {
        return NextResponse.json({ error: "service_not_found" }, { status: 404 });
      }
      return NextResponse.json({
        data: {
          method: "POST",
          resource: `/api/agentpay/services/${service.slug}/call`,
          maxPayment: `${service.priceUsdc.toFixed(2)} USDC`,
        },
      });
    }
    case "get_provider_stats":
      return NextResponse.json({ data: marketplaceStats() });
    default:
      return NextResponse.json({ error: "unknown_tool" }, { status: 400 });
  }
}
