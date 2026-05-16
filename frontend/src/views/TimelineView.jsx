import { useState, useEffect } from "react";
import { Clock, Radio, AlertTriangle, CheckCircle, Search, GitBranch } from "lucide-react";

function groupBy(items, keyFn) {
  const map = {};
  for (const item of items) {
    const k = keyFn(item);
    if (!map[k]) map[k] = [];
    map[k].push(item);
  }
  return map;
}

function formatDate(iso) {
  if (!iso) return "--";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(iso) {
  if (!iso) return "--";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function TimelineView() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      try {
        const res = await fetch("/incidents?status=ALL");
        const incidents = await res.json();
        const allLogs = [];

        for (const inc of incidents.slice(0, 10)) {
          allLogs.push({
            id: `${inc.id}-created`,
            time: inc.start_time,
            type: "incident",
            component: inc.component_id,
            message: `${inc.severity} incident created — ${inc.status}`,
          });

          try {
            const logRes = await fetch(`/incidents/${inc.id}/logs?limit=5`);
            if (logRes.ok) {
              const logs = await logRes.json();
              logs.forEach((log) => {
                allLogs.push({
                  id: `${inc.id}-${log.timestamp}`,
                  time: log.timestamp,
                  type: "signal",
                  component: log.component_id,
                  message: log.message,
                });
              });
            }
          } catch { /* skip */ }
        }

        allLogs.sort((a, b) => new Date(b.time) - new Date(a.time));
        setEntries(allLogs.slice(0, 100));
      } catch (err) {
        console.error("Failed to load timeline", err);
      } finally {
        setLoading(false);
      }
    }
    loadTimeline();
  }, []);

  const grouped = groupBy(entries, (e) => formatDate(e.time));

  const typeIcon = (type) => {
    switch (type) {
      case "incident": return <AlertTriangle size={14} color="#ef4444" />;
      case "signal": return <Radio size={14} color="#60a5fa" />;
      default: return <Clock size={14} color="#6b7280" />;
    }
  };

  return (
    <div className="timeline-view">
      <div className="timeline-header">
        <Clock size={16} />
        <span>Event Timeline</span>
        <span className="timeline-count">{entries.length} events</span>
      </div>

      <div className="timeline-body">
        {loading ? (
          <div className="timeline-empty">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="timeline-empty">No events yet</div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="timeline-group">
              <div className="timeline-date">{date}</div>
              {items.map((entry) => (
                <div key={entry.id} className="timeline-entry">
                  <div className="timeline-dot">{typeIcon(entry.type)}</div>
                  <div className="timeline-line" />
                  <div className="timeline-content">
                    <div className="timeline-time">{formatTime(entry.time)}</div>
                    <div className="timeline-component">{entry.component}</div>
                    <div className="timeline-message">{entry.message}</div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
