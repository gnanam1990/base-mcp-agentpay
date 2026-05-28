import { NextResponse } from "next/server";
import { paymentRequirement } from "@/lib/agentpay-payment";
import { findService } from "@/lib/agentpay-store";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const service = findService(slug);
  if (!service) {
    return NextResponse.json({ error: "service_not_found" }, { status: 404 });
  }

  const resource = new URL(`/api/agentpay/services/${service.slug}/call`, request.url).toString();
  return NextResponse.json({
    data: {
      service,
      payment: paymentRequirement(service, resource),
    },
  });
}
