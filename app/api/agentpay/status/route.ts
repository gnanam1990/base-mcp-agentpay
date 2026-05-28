import { NextResponse } from "next/server";
import { dashboardData, marketplaceStats } from "@/lib/agentpay-store";

export function GET() {
  return NextResponse.json({
    data: dashboardData(),
    stats: marketplaceStats(),
    status: "mvp_foundation_ready",
  });
}
