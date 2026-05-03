import { NextResponse } from "next/server";
import { getBalanceHistory, getAgentEvents, getAgentStatus, getVaultRates, getPositionData, getPerformanceData } from "@/lib/read-logs";
import { agents } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("id") || "base-morpho-yield";

  const agent = agents.find((a) => a.id === agentId);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const balanceHistory = getBalanceHistory(agentId);
  const events = getAgentEvents(agentId);
  const liveStatus = getAgentStatus(agentId);
  const rates = getVaultRates(agentId);
  const position = getPositionData(agentId);
  const performance = getPerformanceData(agentId);

  return NextResponse.json({
    agent: {
      ...agent,
      status: liveStatus.status,
      uptime: liveStatus.uptime,
      lastActivity: liveStatus.lastActivity,
    },
    balanceHistory,
    events,
    rates,
    position,
    performance,
  });
}
