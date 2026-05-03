# Morpho Yield Agent — Dashboard

Live dashboard for the Morpho yield optimizer agent on Base.

Tracks: vault APYs, current position, rebalance log, cumulative yield. Reads agent JSON event log from `./logs/<agent-id>.log`; falls back to mock data when no log exists.

Companion to the working agent at [`../morpho-yield-agent/`](../morpho-yield-agent/) (recipe source: [waap-docs#90](https://github.com/holonym-foundation/waap-docs/pull/90)).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Stack

- Next.js 15 + React 19 + Recharts
- TypeScript
- Plain CSS using human.tech design tokens (`src/app/tokens.css`)

## Status

- ✅ Token-level visual alignment with the human.tech design system
- ⏸ Component-level alignment (`@holonym-foundation/ui`) — pending follow-up
- ⏸ Live data from the agent's JSON log — pending follow-up (uses mock data based on real position values)

## Origin

Skeleton lifted from `holonym-foundation/aex` `dashboards/cetus/` (Daniel's reference). LP-specific components (PositionCard, PoolComparison, VolatilityCard, CrossProtocol) replaced with lending-specific (CurrentPositionCard, VaultRatesTable). Universal components (StatCard, BalanceChart, EventList, AgentConfig, AgentExplainer, PerformanceCard, AgentNav) kept as-is or lightly adapted.

Tracked under [internal-docs#717](https://github.com/holonym-foundation/internal-docs/issues/717).
