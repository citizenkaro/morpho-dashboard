import fs from "fs";
import type { BalanceSnapshot, AgentEvent, VaultRate, PositionData, PerformanceData } from "./types";

const LOG_DIR = process.env.LOG_DIR || "./logs";
const IS_VERCEL = process.env.VERCEL === "1";

interface LogEntry {
  ts: string;
  agent: string;
  level: string;
  message: string;
  [key: string]: unknown;
}

function parseLogFile(agentId: string): LogEntry[] {
  if (IS_VERCEL) return [];
  const logPath = `${LOG_DIR}/${agentId}.log`;
  try {
    const content = fs.readFileSync(logPath, "utf-8");
    return content
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as LogEntry;
        } catch {
          return null;
        }
      })
      .filter((e): e is LogEntry => e !== null);
  } catch {
    return [];
  }
}

export function getBalanceHistory(agentId: string): BalanceSnapshot[] {
  const entries = parseLogFile(agentId);
  return entries
    .filter((e) => e.message === "balance_snapshot")
    .map((e) => ({
      ts: e.ts,
      balance: Number(e.usdcValue) || 0,
      usdcBalance: Number(e.usdcBalance) || undefined,
    }));
}

export function getAgentEvents(agentId: string): AgentEvent[] {
  const entries = parseLogFile(agentId);
  return entries
    .filter((e) => e.level === "event" || e.level === "error" || e.level === "warn" || e.message === "agent_start" || e.message === "rates_check")
    .slice(-50)
    .reverse()
    .map((e) => ({
      ts: e.ts,
      type: String(e.message),
      level: e.level as AgentEvent["level"],
      message: formatMessage(e),
      data: e as Record<string, unknown>,
      txHash: e.txHash as string | undefined,
    }));
}

function formatMessage(e: LogEntry): string {
  if (e.message === "agent_start") return "Agent started";
  if (e.message === "rates_check") {
    const best = e.bestVaultName as string | undefined;
    const apy = e.bestApy as number | undefined;
    if (best && apy !== undefined) return `Best vault: ${best} (${apy.toFixed(2)}%)`;
    return "Checked vault rates";
  }
  if (e.message === "approve") return `Approved vault to spend ${e.amount} USDC`;
  if (e.message === "vault_deposit") return `Deposited ${e.amount} USDC into ${e.vaultName}`;
  if (e.message === "vault_redeem") return `Redeemed ${e.shares} shares from ${e.vaultName}`;
  if (e.message === "rebalance_start") return `Moving from ${e.fromVaultName} to ${e.toVaultName} (+${e.apyDelta}%)`;
  if (e.message === "rebalance_complete") return `Rebalance complete`;
  return String(e.message);
}

export function getVaultRates(agentId: string): VaultRate[] {
  const entries = parseLogFile(agentId);
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e.message === "rates_check" && Array.isArray(e.vaults)) {
      return (e.vaults as VaultRate[]).slice().sort((a, b) => b.netApy - a.netApy);
    }
  }
  return [];
}

export function getPositionData(agentId: string): PositionData | null {
  const entries = parseLogFile(agentId);
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e.message === "position_status") {
      return {
        vaultAddress: String(e.vaultAddress),
        vaultName: String(e.vaultName),
        shares: String(e.shares),
        underlyingValueUsd: Number(e.underlyingValueUsd) || 0,
        positionOpenedAt: (e.positionOpenedAt as string) || null,
        rebalanceCount: Number(e.rebalanceCount) || 0,
      };
    }
  }
  return null;
}

export function getPerformanceData(agentId: string): PerformanceData | null {
  const entries = parseLogFile(agentId);
  const balanceSnapshots = entries.filter((e) => e.message === "balance_snapshot");
  if (balanceSnapshots.length === 0) return null;

  const initialBalance = Number(balanceSnapshots[0].usdcValue) || 0;
  const currentBalance = Number(balanceSnapshots[balanceSnapshots.length - 1].usdcValue) || 0;
  const pnl = currentBalance - initialBalance;
  const pnlPct = initialBalance > 0 ? (pnl / initialBalance) * 100 : 0;
  const rebalanceCount = entries.filter((e) => e.message === "rebalance_complete").length;

  const startEntries = entries.filter((e) => e.message === "agent_start");
  let uptimeHours = 0;
  if (startEntries.length > 0) {
    const firstStart = new Date(startEntries[0].ts).getTime();
    uptimeHours = (Date.now() - firstStart) / 3600000;
  }

  let estimatedApy = 0;
  if (uptimeHours > 1 && initialBalance > 0) {
    const hourlyReturn = pnl / uptimeHours;
    const annualReturn = hourlyReturn * 8760;
    estimatedApy = (annualReturn / initialBalance) * 100;
  }

  let totalGasSpent = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].message === "position_status" && entries[i].totalGasSpent) {
      totalGasSpent = Number(entries[i].totalGasSpent);
      break;
    }
  }

  return {
    initialBalance,
    currentBalance,
    pnl,
    pnlPct,
    totalGasSpent,
    rebalanceCount,
    uptimeHours,
    estimatedApy,
  };
}

export function getAgentStatus(agentId: string): {
  status: "running" | "stopped" | "error";
  uptime: string;
  lastActivity: string;
} {
  const entries = parseLogFile(agentId);
  if (entries.length === 0) {
    return { status: "stopped", uptime: "--", lastActivity: "never" };
  }

  const last = entries[entries.length - 1];
  const lastTime = new Date(last.ts).getTime();
  const now = Date.now();
  const ageSec = (now - lastTime) / 1000;

  const checkInterval = parseInt(process.env.CHECK_INTERVAL_MS || "300000") / 1000;
  const status = ageSec > checkInterval * 2 ? "stopped" : last.level === "error" ? "error" : "running";

  const startEntry = entries.find((e) => e.message === "agent_start");
  let uptime = "--";
  if (startEntry) {
    const startTime = new Date(startEntry.ts).getTime();
    const uptimeMs = now - startTime;
    const hours = Math.floor(uptimeMs / 3600000);
    const mins = Math.floor((uptimeMs % 3600000) / 60000);
    uptime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  let lastActivity: string;
  if (ageSec < 60) lastActivity = "just now";
  else if (ageSec < 3600) lastActivity = `${Math.floor(ageSec / 60)} min ago`;
  else lastActivity = `${Math.floor(ageSec / 3600)}h ago`;

  return { status, uptime, lastActivity };
}
