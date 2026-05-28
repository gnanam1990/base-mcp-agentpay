import { NextResponse } from "next/server";
import { paymentRequiredBody, verifyAgentPayPayment } from "@/lib/agentpay-payment";
import { findService, recordPaidCall } from "@/lib/agentpay-store";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const service = findService(slug);
  if (!service) {
    return NextResponse.json({ error: "service_not_found" }, { status: 404 });
  }

  const resource = new URL(`/api/agentpay/services/${service.slug}/call`, request.url).toString();
  const verification = await verifyAgentPayPayment(request, service, resource);
  if (!verification.ok) {
    const body = paymentRequiredBody(service, resource);
    return NextResponse.json({ ...body, reason: verification.reason }, { status: 402 });
  }

  const receipt = recordPaidCall(service.slug, {
    network: verification.network,
    paymentMode: verification.mode,
    paymentPayloadHash: verification.paymentPayloadHash,
    facilitatorReference: verification.facilitatorReference,
  });

  const response = NextResponse.json({
    data: service.sampleResponse,
    receipt,
  });

  if (verification.paymentResponse) {
    response.headers.set("payment-response", verification.paymentResponse);
  }

  return response;
}
