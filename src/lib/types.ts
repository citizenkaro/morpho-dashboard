export interface Agent {
  id: string;
  name: string;
  description: string;
  email: string;
  chain: string;
  network: string;
  protocol: string;
  walletAddress: string;
  status: "running" | "stopped" | "error";
  uptime: string;
  lastActivity: string;
  config: Record<string, string>;
  tools: string[];
}

export interface BalanceSnapshot {
  ts: string;
  balance: number;
  usdcBalance?: number;
}

export interface AgentEvent {
  ts: string;
  type: string;
  level: "info" | "event" | "error" | "warn";
  message: string;
  data?: Record<string, unknown>;
  txHash?: string;
}

export interface VaultRate {
  address: string;
  name: string;
  netApy: number;
  tvlUsd: number;
  isCurrent: boolean;
}

export interface PositionData {
  vaultAddress: string;
  vaultName: string;
  shares: string;
  underlyingValueUsd: number;
  positionOpenedAt: string | null;
  rebalanceCount: number;
}

export interface VaultRatesHistoryPoint {
  ts: string;
  [vaultName: string]: string | number;
}

export interface PerformanceData {
  initialBalance: number;
  currentBalance: number;
  pnl: number;
  pnlPct: number;
  totalGasSpent: number;
  rebalanceCount: number;
  uptimeHours: number;
  estimatedApy: number;
}
