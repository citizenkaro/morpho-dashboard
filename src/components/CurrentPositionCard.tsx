import type { PositionData } from "@/lib/types";

export function CurrentPositionCard({ position }: { position: PositionData }) {
  const sharesDisplay = (Number(BigInt(position.shares)) / 1e18).toFixed(6);

  const openedAgo = position.positionOpenedAt
    ? formatRelativeTime(position.positionOpenedAt)
    : "—";

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Current Position</span>
      </div>
      <div>
        <div className="config-row">
          <span className="config-key">Vault</span>
          <span className="config-value">{position.vaultName}</span>
        </div>
        <div className="config-row">
          <span className="config-key">Value</span>
          <span className="config-value" style={{ fontWeight: "var(--font-weight-semi)" }}>
            ${position.underlyingValueUsd.toFixed(4)}
          </span>
        </div>
        <div className="config-row">
          <span className="config-key">Shares</span>
          <span className="config-value mono" style={{ fontSize: "var(--font-size-text-xs)" }}>
            {sharesDisplay}
          </span>
        </div>
        <div className="config-row">
          <span className="config-key">Opened</span>
          <span className="config-value">{openedAgo}</span>
        </div>
        <div className="config-row">
          <span className="config-key">Rebalances</span>
          <span className="config-value">{position.rebalanceCount}</span>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}
