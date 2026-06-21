import { useState, useEffect } from "react";
import { ClipboardList, Clock, Radio, AlertTriangle, Search, Filter, X } from "lucide-react";

export default function AuditView() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterComponent, setFilterComponent] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/audit/logs?limit=200");
        if (res.ok) {
          const logs = await res.json();
          setEntries(logs);
        }
      } catch (err) { console.error("Failed to load audit logs:", err); } finally { setLoading(false); }
    }
    load();
  }, []);

  const components = [...new Set(entries.filter(e => e.component).map(e => e.component))].sort();
  const severities = [...new Set(entries.filter(e => e.severity).map(e => e.severity))].sort();

  const filtered = entries.filter(e => {
    if (filterComponent && e.component !== filterComponent) return false;
    if (filterSeverity && e.severity !== filterSeverity) return false;
    return true;
  });

  const typeIcon = (type) => {
    if (type === "incident") return <AlertTriangle size={14} color="#ef4444" />;
    return <Radio size={14} color="#60a5fa" />;
  };

  return (
    <div className="audit-view">
      <div className="audit-view-header">
        <ClipboardList size={16} />
        <span>Audit Logs</span>
        <span className="timeline-count">{filtered.length} events</span>
      </div>

      <div className="audit-filters">
        <Filter size={14} />
        <select className="audit-select" value={filterComponent} onChange={e => setFilterComponent(e.target.value)}>
          <option value="">All Services</option>
          {components.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="audit-select" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
          <option value="">All Severities</option>
          {severities.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filterComponent || filterSeverity) && (
          <button className="audit-clear-btn" onClick={() => { setFilterComponent(""); setFilterSeverity(""); }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <div className="audit-list">
        {loading ? <div className="audit-empty">Loading...</div>
          : filtered.length === 0 ? <div className="audit-empty">No matching events</div>
          : filtered.map((e, i) => (
            <div key={e.id || i} className="audit-entry">
              <div className="audit-entry-icon">{typeIcon(e.event_type)}</div>
              <div className="audit-entry-body">
                <div className="audit-entry-top">
                  <span className="audit-entry-time">
                    {new Date(e.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span className="audit-entry-component">{e.component}</span>
                  {e.severity && <span className="audit-entry-severity" style={{
                    color: e.severity === "P0" ? "#ef4444" : e.severity === "P1" ? "#f97316" : "#eab308",
                  }}>{e.severity}</span>}
                </div>
                <div className="audit-entry-message">{e.message}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
