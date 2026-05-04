"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface VaultRatesPoint {
  ts: string;
  [vaultName: string]: string | number;
}

interface VaultRatesHistoryProps {
  data: VaultRatesPoint[];
  vaultNames: string[];
  currentVaultName: string | null;
}

const COLORS = ["#00b88a", "#6394fd", "#d88e03", "#fc6764"];

export function VaultRatesHistory({ data, vaultNames, currentVaultName }: VaultRatesHistoryProps) {
  if (data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <span className="card-title">Vault APY History</span>
        </div>
        <div style={{ padding: "var(--space-3xl)", textAlign: "center", color: "var(--color-text-40)" }}>
          Collecting data… one point per check cycle.
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    time: new Date(d.ts).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
  }));

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Vault APY History</span>
        <span style={{ fontSize: "var(--font-size-text-xs)", color: "var(--color-text-40)" }}>
          {data.length} cycles
        </span>
      </div>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "#737373" }}
              tickLine={false}
              axisLine={{ stroke: "#ebebeb" }}
              interval={Math.max(0, Math.floor(chartData.length / 8))}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#737373" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v.toFixed(2)}%`}
              domain={["dataMin - 0.1", "dataMax + 0.1"]}
            />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #ebebeb",
                borderRadius: 10,
                fontSize: 13,
                color: "#0a0a0a",
                boxShadow: "0 2px 5px 0 rgba(23, 35, 94, 0.25)",
              }}
              formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#737373", paddingTop: 8 }}
              formatter={(value: string) => value === currentVaultName ? `${value} (current)` : value}
            />
            {vaultNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={name === currentVaultName ? 2.5 : 1.5}
                strokeDasharray={name === currentVaultName ? undefined : "4 4"}
                dot={false}
                activeDot={{ r: 4, fill: COLORS[i % COLORS.length] }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
