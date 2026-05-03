"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import type { BalanceSnapshot, AgentEvent } from "@/lib/types";

interface BalanceChartProps {
  data: BalanceSnapshot[];
  events: AgentEvent[];
}

export function BalanceChart({ data, events }: BalanceChartProps) {
  const txEvents = events.filter((e) => e.txHash && e.txHash !== "0x...");

  const chartData = data.map((d) => ({
    time: new Date(d.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    value: d.balance,
    ts: d.ts,
  }));

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: "#737373" }}
            tickLine={false}
            axisLine={{ stroke: "#ebebeb" }}
            interval={Math.floor(chartData.length / 6)}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#737373" }}
            tickLine={false}
            axisLine={false}
            domain={["dataMin - 0.0001", "dataMax + 0.0001"]}
            tickFormatter={(v: number) => `$${v.toFixed(4)}`}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #ebebeb",
              borderRadius: 10,
              fontSize: 14,
              color: "#0a0a0a",
              boxShadow: "0 2px 5px 0 rgba(23, 35, 94, 0.25)",
            }}
            formatter={(value: number) => [`$${value.toFixed(6)}`, "Position value"]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#00b88a"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#00b88a" }}
            name="value"
          />
          {txEvents.map((event, i) => {
            const closest = chartData.reduce((prev, curr) =>
              Math.abs(new Date(curr.ts).getTime() - new Date(event.ts).getTime()) <
              Math.abs(new Date(prev.ts).getTime() - new Date(event.ts).getTime())
                ? curr
                : prev
            );
            return (
              <ReferenceDot
                key={i}
                x={closest.time}
                y={closest.value}
                r={5}
                fill={event.level === "error" ? "#eb302d" : "#62ab14"}
                stroke="none"
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
