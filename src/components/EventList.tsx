import type { AgentEvent } from "@/lib/types";

interface EventListProps {
  events: AgentEvent[];
}

function levelToClass(level: string): string {
  if (level === "error" || level === "warn") return "error";
  if (level === "event") return "success";
  return "info";
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EventList({ events }: EventListProps) {
  return (
    <ul className="event-list" style={{ maxHeight: 300, overflowY: "auto" }}>
      {events.map((event, i) => (
        <li key={i} className="event-item">
          <span className={`event-icon ${levelToClass(event.level)}`} />
          <span className="event-time">{formatTime(event.ts)}</span>
          <div>
            <span className="event-message">{event.message}</span>
            {event.txHash && event.txHash !== "0x..." && (
              <div style={{ marginTop: "2px" }}>
                <a
                  href={`https://basescan.org/tx/${event.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mono"
                  style={{ color: "var(--color-emerald-50)", fontSize: "var(--font-size-text-xs)" }}
                >
                  tx: {event.txHash.slice(0, 10)}...
                </a>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
