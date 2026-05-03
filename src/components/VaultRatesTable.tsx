import type { VaultRate } from "@/lib/types";

export function VaultRatesTable({ rates }: { rates: VaultRate[] }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Vault Rates</span>
        <span style={{ fontSize: "var(--font-size-text-xs)", color: "var(--color-text-40)" }}>
          Live
        </span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--color-text-40)", fontSize: "var(--font-size-text-xs)" }}>
            <th style={{ padding: "var(--space-md) 0", fontWeight: "var(--font-weight-regular)" }}>Vault</th>
            <th style={{ padding: "var(--space-md) 0", fontWeight: "var(--font-weight-regular)", textAlign: "right" }}>Net APY</th>
            <th style={{ padding: "var(--space-md) 0", fontWeight: "var(--font-weight-regular)", textAlign: "right" }}>TVL</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((v) => (
            <tr
              key={v.address}
              style={{
                borderTop: "1px solid var(--color-border-10)",
                background: v.isCurrent ? "var(--color-bg-10)" : "transparent",
              }}
            >
              <td style={{ padding: "var(--space-lg) 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                  <span>{v.name}</span>
                  {v.isCurrent && (
                    <span className="tag tag-protocol" style={{ fontSize: "var(--font-size-text-xs)" }}>
                      current
                    </span>
                  )}
                </div>
              </td>
              <td style={{ padding: "var(--space-lg) 0", textAlign: "right", fontWeight: "var(--font-weight-semi)" }}>
                {v.netApy.toFixed(2)}%
              </td>
              <td style={{ padding: "var(--space-lg) 0", textAlign: "right", color: "var(--color-text-40)" }}>
                ${(v.tvlUsd / 1_000_000).toFixed(1)}M
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
