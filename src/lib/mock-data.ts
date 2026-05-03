import type { Agent, BalanceSnapshot, AgentEvent, VaultRate, PositionData, PerformanceData } from "./types";

export const agents: Agent[] = [
  {
    id: "base-morpho-yield",
    name: "Morpho Yield Agent",
    description: "Monitors Morpho vault APYs on Base and rebalances stablecoins to the highest-yielding vault automatically. Approvals over the daily spend cap require human confirmation. All transactions go through WaaP two-party signing — the agent never holds the private key.",
    email: "felicja.modrzejewska+morpho-agent@gmail.com",
    chain: "Base",
    network: "mainnet",
    protocol: "Morpho",
    walletAddress: "0x4caE54595623676446CBb99F73B4D1c8EB66D766",
    status: "running",
    uptime: "1h 12m",
    lastActivity: "2 min ago",
    config: {
      "Watched vaults": "3 USDC vaults on Base",
      "Min APY delta": "0.5% before rebalance",
      "Daily spend limit": "$10",
      "Check interval": "Every 5 min",
      "Deposit amount": "1 USDC (test)",
    },
    tools: [
      "@human.tech/waap-cli",
      "Morpho GraphQL API",
      "Base RPC",
    ],
  },
];

const VAULTS = {
  steakhouseHigh: {
    address: "0xBEEFA7B88064FeEF0cEe02AAeBBd95D30df3878F",
    name: "Steakhouse High Yield USDC v1.1",
  },
  moonwell: {
    address: "0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca",
    name: "Moonwell Flagship USDC",
  },
  steakhousePrime: {
    address: "0xBEEFE94c8aD530842bfE7d8B397938fFc1cb83b2",
    name: "Steakhouse Prime USDC",
  },
};

export function generateBalanceHistory(): BalanceSnapshot[] {
  const now = Date.now();
  const points: BalanceSnapshot[] = [];
  let balance = 1.0;

  for (let i = 24; i >= 0; i--) {
    const ts = new Date(now - i * 5 * 60 * 1000).toISOString();
    balance += 0.000004 + (Math.random() - 0.5) * 0.000002;
    points.push({ ts, balance: parseFloat(balance.toFixed(6)), usdcBalance: 1.0 });
  }

  return points;
}

export function generateVaultRates(): VaultRate[] {
  return [
    {
      address: VAULTS.steakhouseHigh.address,
      name: VAULTS.steakhouseHigh.name,
      netApy: 5.01,
      tvlUsd: 3_900_000,
      isCurrent: true,
    },
    {
      address: VAULTS.moonwell.address,
      name: VAULTS.moonwell.name,
      netApy: 4.63,
      tvlUsd: 9_600_000,
      isCurrent: false,
    },
    {
      address: VAULTS.steakhousePrime.address,
      name: VAULTS.steakhousePrime.name,
      netApy: 4.34,
      tvlUsd: 468_200_000,
      isCurrent: false,
    },
  ];
}

export function generatePosition(): PositionData {
  return {
    vaultAddress: VAULTS.steakhouseHigh.address,
    vaultName: VAULTS.steakhouseHigh.name,
    shares: "958956250324255942",
    underlyingValueUsd: 1.0,
    positionOpenedAt: new Date(Date.now() - 72 * 60 * 1000).toISOString(),
    rebalanceCount: 0,
  };
}

export function generatePerformance(): PerformanceData {
  return {
    initialBalance: 1.0,
    currentBalance: 1.0001,
    pnl: 0.0001,
    pnlPct: 0.01,
    totalGasSpent: 0.001,
    rebalanceCount: 0,
    uptimeHours: 1.2,
    estimatedApy: 5.01,
  };
}

export function generateEvents(): AgentEvent[] {
  const now = Date.now();
  return [
    {
      ts: new Date(now - 2 * 60 * 1000).toISOString(),
      type: "rates_check",
      level: "info",
      message: `Best vault: ${VAULTS.steakhouseHigh.name} (5.01%). Already in best vault — holding.`,
    },
    {
      ts: new Date(now - 7 * 60 * 1000).toISOString(),
      type: "rates_check",
      level: "info",
      message: "Checked rates across 3 vaults",
    },
    {
      ts: new Date(now - 70 * 60 * 1000).toISOString(),
      type: "vault_deposit",
      level: "event",
      message: `Deposited 1 USDC into ${VAULTS.steakhouseHigh.name}`,
      txHash: "0x...",
    },
    {
      ts: new Date(now - 71 * 60 * 1000).toISOString(),
      type: "approve",
      level: "event",
      message: `Approved ${VAULTS.steakhouseHigh.name} to spend 1 USDC`,
      txHash: "0x...",
    },
    {
      ts: new Date(now - 72 * 60 * 1000).toISOString(),
      type: "agent_start",
      level: "event",
      message: "Agent started",
    },
  ];
}
