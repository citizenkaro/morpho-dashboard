"use client";

import { useEffect, useState } from "react";
import { agents } from "@/lib/mock-data";
import type { Agent, BalanceSnapshot, AgentEvent, VaultRate, PositionData, PerformanceData } from "@/lib/types";
import { BalanceChart } from "@/components/BalanceChart";
import { EventList } from "@/components/EventList";
import { AgentConfig } from "@/components/AgentConfig";
import { StatCard } from "@/components/StatCard";
import { AgentNav } from "@/components/AgentNav";
import { AgentExplainer } from "@/components/AgentExplainer";
import { CurrentPositionCard } from "@/components/CurrentPositionCard";
import { PerformanceCard } from "@/components/PerformanceCard";
import { VaultRatesTable } from "@/components/VaultRatesTable";

interface DashboardData {
  agent: Agent;
  balanceHistory: BalanceSnapshot[];
  events: AgentEvent[];
  rates: VaultRate[];
  position: PositionData | null;
  performance: PerformanceData | null;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [currentId, setCurrentId] = useState("base-morpho-yield");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/agent?id=${currentId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.balanceHistory.length > 0 || json.events.length > 0) {
            setData(json);
            return;
          }
        }
      } catch {}
      const { generateBalanceHistory, generateEvents, generateVaultRates, generatePosition, generatePerformance } = await import("@/lib/mock-data");
      setData({
        agent: agents.find((a) => a.id === currentId) || agents[0],
        balanceHistory: generateBalanceHistory(),
        events: generateEvents(),
        rates: generateVaultRates(),
        position: generatePosition(),
        performance: generatePerformance(),
      });
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [currentId]);

  if (!data) {
    return (
      <div className="container" style={{ textAlign: "center", paddingTop: "var(--space-10xl)" }}>
        <p style={{ color: "var(--color-text-40)" }}>Loading agent data...</p>
      </div>
    );
  }

  const { agent, balanceHistory, events, rates, position, performance } = data;
  const lastSnapshot = balanceHistory.length > 0 ? balanceHistory[balanceHistory.length - 1] : null;
  const positionValueUsd = position?.underlyingValueUsd ?? lastSnapshot?.balance ?? 0;
  const txCount = events.filter((e) => e.txHash).length;

  const pnl = performance?.pnl ?? 0;
  const currentRate = rates.find((r) => r.isCurrent);
  const bestRate = rates[0];

  function getAgentHealthStatus(): "earning" | "rebalancing" | "idle" | "stopped" {
    if (agent.status === "stopped") return "stopped";
    for (const e of events) {
      if (e.type === "rebalance_start" || e.type === "vault_redeem") return "rebalancing";
      if (e.type === "vault_deposit" || e.type === "rates_check") {
        return position ? "earning" : "idle";
      }
    }
    return position ? "earning" : "idle";
  }

  const healthStatus = getAgentHealthStatus();

  return (
    <div className="container">
      <AgentNav agents={agents} currentId={currentId} onSelect={setCurrentId} />

      <header style={{ marginBottom: "var(--space-5xl)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-lg)", marginBottom: "var(--space-sm)" }}>
          <h1 style={{ fontSize: "var(--font-size-h5)", fontWeight: "var(--font-weight-semi)" }}>
            {agent.name}
          </h1>
          <span className={`status-dot ${agent.status}`} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
          <span className="mono" style={{ color: "var(--color-text-40)" }}>{agent.id}</span>
          <span className="tag tag-chain">{agent.chain}</span>
          <span className="tag tag-protocol">{agent.protocol}</span>
        </div>
      </header>

      <AgentExplainer
        agent={agent}
        currentStatus={healthStatus}
        currentApy={currentRate?.netApy}
        bestApy={bestRate?.netApy}
      />

      {/* 1. Quick numbers */}
      <div className="grid grid-4" style={{ marginBottom: "var(--space-4xl)" }}>
        <StatCard
          label="Status"
          value={agent.status}
          indicator={agent.status}
        />
        <StatCard
          label="Position value"
          value={`$${positionValueUsd.toFixed(4)}`}
        />
        <StatCard
          label="Yield earned"
          value={`${pnl >= 0 ? "+" : ""}$${pnl.toFixed(4)}`}
          color={pnl >= 0 ? "var(--color-green-50)" : "var(--color-red-60)"}
        />
        <StatCard label="Transactions" value={txCount.toString()} />
      </div>

      {/* 2. Trend + live activity */}
      <div className="grid grid-2" style={{ marginBottom: "var(--space-4xl)" }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Position Value Over Time</span>
            <span style={{ fontSize: "var(--font-size-text-xs)", color: "var(--color-text-40)" }}>
              Live
            </span>
          </div>
          <BalanceChart data={balanceHistory} events={events} />
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
          </div>
          <EventList events={events} />
        </div>
      </div>

      {/* 3. Current position + performance */}
      {(position || performance) && (
        <div className="grid grid-2" style={{ marginBottom: "var(--space-4xl)" }}>
          {position && <CurrentPositionCard position={position} />}
          {performance && <PerformanceCard performance={performance} />}
        </div>
      )}

      {/* 4. Vault rates landscape */}
      {rates.length > 0 && (
        <div style={{ marginBottom: "var(--space-4xl)" }}>
          <VaultRatesTable rates={rates} />
        </div>
      )}

      {/* 5. Reference: identity + config */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Identity</span>
          </div>
          <div>
            <div className="config-row">
              <span className="config-key">Agent ID</span>
              <span className="config-value">{agent.id}</span>
            </div>
            <div className="config-row">
              <span className="config-key">Wallet</span>
              <span className="config-value" style={{ fontSize: "var(--font-size-text-xs)" }}>
                {agent.walletAddress.slice(0, 10)}...{agent.walletAddress.slice(-8)}
              </span>
            </div>
            <div className="config-row">
              <span className="config-key">Network</span>
              <span className="config-value">{agent.network}</span>
            </div>
            <div className="config-row">
              <span className="config-key">Uptime</span>
              <span className="config-value">{agent.uptime}</span>
            </div>
            <div className="config-row">
              <span className="config-key">Last Activity</span>
              <span className="config-value">{agent.lastActivity}</span>
            </div>
            <div style={{ marginTop: "var(--space-2xl)" }}>
              <span className="card-title">Developer Tools</span>
              <div style={{ marginTop: "var(--space-md)", display: "flex", flexWrap: "wrap", gap: "var(--space-md)" }}>
                {agent.tools.map((tool) => (
                  <span key={tool} className="tag tag-protocol">{tool}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Agent Configuration</span>
          </div>
          <AgentConfig agent={agent} />
        </div>
      </div>
    </div>
  );
}
