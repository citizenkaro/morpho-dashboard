import type { Agent } from "@/lib/types";

interface AgentExplainerProps {
  agent: Agent;
  currentStatus: "earning" | "rebalancing" | "idle" | "stopped";
  bestApy?: number;
  currentApy?: number;
}

const statusConfig = {
  earning: {
    label: "Earning yield",
    color: "var(--color-green-50)",
    bg: "var(--color-green-5)",
    description: "Funds are deposited in the highest-yielding vault. The agent checks rates every cycle and only moves them if a meaningfully better vault appears.",
  },
  rebalancing: {
    label: "Rebalancing",
    color: "var(--color-yellow-50)",
    bg: "var(--color-yellow-5)",
    description: "A better vault was found. The agent is redeeming shares and depositing into the new vault. Approval may be needed if the move exceeds the daily spend limit.",
  },
  idle: {
    label: "Holding",
    color: "var(--color-text-40)",
    bg: "var(--color-bg-10)",
    description: "The agent has no position yet, or rates haven't shifted enough to trigger a rebalance.",
  },
  stopped: {
    label: "Stopped",
    color: "var(--color-text-40)",
    bg: "var(--color-background-10)",
    description: "The agent is not running.",
  },
};

export function AgentExplainer({ agent, currentStatus, bestApy, currentApy }: AgentExplainerProps) {
  const status = statusConfig[currentStatus];

  return (
    <div className="card" style={{ marginBottom: "var(--space-4xl)" }}>
      <div style={{ display: "flex", alignItems: "stretch", gap: "var(--space-3xl)" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, justifyContent: "space-between" }}>
          <div>
            <div style={{
              fontSize: "var(--font-size-text-xs)",
              fontWeight: "var(--font-weight-med)",
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
              color: "var(--color-text-40)",
              marginBottom: "var(--space-md)",
            }}>
              What is this agent doing?
            </div>
            <p style={{
              fontSize: "var(--font-size-text-sm)",
              color: "var(--color-text-60)",
              lineHeight: "var(--line-height-text-sm)",
            }}>
              This agent monitors {agent.protocol} vault APYs on {agent.chain} and keeps your
              stablecoins in the highest-yielding vault. When a better vault opens up by more than
              the configured threshold, it redeems and redeposits automatically. Anything over the
              daily spend cap pauses for human approval.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--space-2xl)",
            fontSize: "var(--font-size-text-xs)",
            marginTop: "var(--space-2xl)",
            paddingTop: "var(--space-2xl)",
            borderTop: "1px solid var(--color-border-20)",
          }}>
            <div>
              <div style={{ color: "var(--color-text-40)", marginBottom: "2px" }}>How it earns</div>
              <div style={{ color: "var(--color-text-80)" }}>Yield from the vault you&apos;re deposited in</div>
            </div>
            <div>
              <div style={{ color: "var(--color-text-40)", marginBottom: "2px" }}>Risk</div>
              <div style={{ color: "var(--color-text-80)" }}>Vault curator + smart contract risk</div>
            </div>
            <div>
              <div style={{ color: "var(--color-text-40)", marginBottom: "2px" }}>Security</div>
              <div style={{ color: "var(--color-text-80)" }}>Transactions require two-party signing (WaaP)</div>
            </div>
          </div>
        </div>

        <div style={{
          background: status.bg,
          border: `1px solid ${status.color}20`,
          borderRadius: "var(--radi-lg)",
          padding: "var(--space-3xl)",
          width: "200px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center" as const,
        }}>
          <div style={{
            width: "10px",
            height: "10px",
            borderRadius: "var(--radi-full)",
            background: status.color,
            boxShadow: `0 0 6px ${status.color}`,
            marginBottom: "var(--space-md)",
          }} />
          <div style={{
            fontSize: "var(--font-size-text-sm)",
            fontWeight: "var(--font-weight-semi)",
            color: status.color,
            marginBottom: "var(--space-xs)",
          }}>
            {status.label}
          </div>
          <div style={{
            fontSize: "var(--font-size-text-xs)",
            color: "var(--color-text-40)",
            lineHeight: "var(--line-height-text-xs)",
          }}>
            {status.description}
          </div>
          {currentApy !== undefined && bestApy !== undefined && (
            <div style={{
              marginTop: "var(--space-md)",
              fontSize: "var(--font-size-text-xs)",
              color: "var(--color-text-40)",
              fontFamily: "var(--font-family-code), monospace",
            }}>
              {currentApy.toFixed(2)}% / best {bestApy.toFixed(2)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
