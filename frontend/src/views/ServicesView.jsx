import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { Server, CheckCircle, XCircle, Search, Radio, AlertTriangle, X, Download, Activity, Filter, ChevronLeft } from "lucide-react";

const TIME_PRESETS = [
  { label: "15m", value: 15 * 60 * 1000 },
  { label: "1h", value: 60 * 60 * 1000 },
  { label: "6h", value: 6 * 60 * 60 * 1000 },
  { label: "24h", value: 24 * 60 * 60 * 1000 },
  { label: "7d", value: 7 * 24 * 60 * 60 * 1000 },
];

const SEVERITY_COLORS = {
  P0: "#ef4444",
  P1: "#f97316",
  P2: "#eab308",
};

const SOURCE_CONFIG = {
  audit: { label: "Audit", color: "#60a5fa" },
  signal: { label: "Signal", color: "#22c55e" },
  work_item: { label: "Status", color: "#a855f7" },
};

function formatTime(iso) {
  if (!iso) return "--";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

function sevIcon(sev) {
  if (sev === "P0") return <AlertTriangle size={12} />;
  if (sev === "P1") return <AlertTriangle size={12} />;
  if (sev === "P2") return <AlertTriangle size={12} />;
  return null;
}

export default function ServicesView() {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [serviceLogs, setServiceLogs] = useState({});

  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [live, setLive] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sources, setSources] = useState(["audit", "signal", "work_item"]);
  const [severityFilter, setSeverityFilter] = useState("");
  const [timePreset, setTimePreset] = useState("1h");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [filterOpts, setFilterOpts] = useState({ sources: [], severities: [], components: [] });

  const socketRef = useRef(null);
  const resultsRef = useRef(null);

  const getTimeRange = useCallback(() => {
    if (showCustomTime) return { from: customFrom, to: customTo };
    const preset = TIME_PRESETS.find(p => p.label === timePreset);
    if (!preset) return {};
    return {
      from: new Date(Date.now() - preset.value).toISOString(),
      to: new Date().toISOString(),
    };
  }, [timePreset, showCustomTime, customFrom, customTo]);

  useEffect(() => {
    fetch("/topology").then(r => r.json()).then(data => {
      const list = Object.entries(data.state).map(([name, info]) => ({
        name, status: info.status, incidents: info.incidents || [],
        lastUpdated: info.lastUpdated,
        dependencies: data.graph[name] || [],
        dependents: Object.entries(data.graph).filter(([, deps]) => deps.includes(name)).map(([s]) => s),
      }));
      setServices(list);
    }).catch(() => {});
  }, []);

  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const socket = io();

    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("connect_error", (err) => {
      setSocketConnected(false);
    });

    socket.on("log:new", (log) => {
      setServiceLogs(prev => {
        const comp = log.component || "unknown";
        const curr = prev[comp] || { entries: [], count: 0 };
        const entry = { ...log, id: log.id || `live-${Date.now()}-${Math.random()}` };
        return {
          ...prev,
          [comp]: {
            entries: [entry, ...curr.entries].slice(0, 50),
            count: curr.count + 1,
          },
        };
      });
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch("/logs/filters");
      const data = await res.json();
      setFilterOpts(data);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (selected) fetchFilters();
  }, [selected, fetchFilters]);

  const fetchLogs = useCallback(async (p = 1) => {
    if (!selected) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (sources.length < 3) params.set("sources", sources.join(","));
      if (severityFilter) params.set("severity", severityFilter);
      params.set("component", selected);
      const tr = getTimeRange();
      if (tr.from) params.set("from", tr.from);
      if (tr.to) params.set("to", tr.to);
      params.set("page", p);
      params.set("limit", 50);

      const res = await fetch(`/logs/search?${params}`);
      const data = await res.json();
      setEntries(data.entries || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
      setPage(data.page || 1);
    } catch (e) { console.error("Log search failed:", e); }
    setLoading(false);
  }, [selected, query, sources, severityFilter, getTimeRange]);

  useEffect(() => {
    if (selected) fetchLogs(1);
  }, [selected, query, sources, severityFilter, timePreset, showCustomTime, customFrom, customTo]);

  useEffect(() => {
    if (resultsRef.current) resultsRef.current.scrollTop = 0;
  }, [entries, selected]);

  function selectService(svc) {
    setSelected(svc);
    setQuery("");
    setSearchInput("");
    setPage(1);
    setLive(false);
    setEntries([]);
  }

  function backToGrid() {
    setSelected(null);
    setEntries([]);
  }

  function handleSearch(e) {
    e.preventDefault();
    setQuery(searchInput);
    setPage(1);
  }

  function toggleSource(s) {
    setSources(prev => {
      if (prev.includes(s)) {
        const next = prev.filter(x => x !== s);
        return next.length === 0 ? [s] : next;
      }
      return [...prev, s];
    });
  }

  function toggleExpanded(id) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exportLogs() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const healthy = services.filter(s => s.status === "healthy").length;
  const degraded = services.filter(s => s.status !== "healthy").length;

  if (selected) {
    const liveEntries = live ? (serviceLogs[selected]?.entries || []) : [];

    function matchesFilters(e) {
      if (query && !e.message?.toLowerCase().includes(query.toLowerCase())) return false;
      if (sources.length < 3 && !sources.includes(e.source)) return false;
      if (severityFilter && e.severity !== severityFilter) return false;
      return true;
    }

    const displayEntries = live
      ? liveEntries.filter(matchesFilters).slice(0, 200)
      : entries;

    return (
      <div className="services-view">
        <div className="services-detail-header">
          <button className="services-back-btn" onClick={backToGrid}>
            <ChevronLeft size={14} /> Inventory
          </button>
          <Server size={16} />
          <span>{selected}</span>
          <span className="services-detail-count">{live ? liveEntries.length : total} results</span>
          <div className="services-detail-actions">
            <button className={`services-live-btn ${live ? "services-live-active" : ""}`}
              onClick={() => setLive(!live)}>
              <Radio size={14} />
              {live ? "LIVE" : "Live"}
            </button>
            <button className="services-export-btn" onClick={exportLogs} disabled={entries.length === 0}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="services-detail-toolbar">
          <form className="services-search-form" onSubmit={handleSearch}>
            <Search size={14} className="services-search-icon" />
            <input className="services-search-input" type="text"
              placeholder={`Search ${selected} logs...`}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)} />
            {searchInput && (
              <button type="button" className="services-search-clear" onClick={() => { setSearchInput(""); setQuery(""); }}>
                <X size={14} />
              </button>
            )}
          </form>

          <div className="services-detail-filters">
            <div className="services-filter-group">
              <Filter size={12} />
              {filterOpts.sources.map(s => (
                <button key={s}
                  className={`services-filter-chip ${sources.includes(s) ? "services-chip-active" : ""}`}
                  onClick={() => toggleSource(s)}
                  style={sources.includes(s) ? { borderColor: SOURCE_CONFIG[s]?.color, color: SOURCE_CONFIG[s]?.color } : {}}>
                  {SOURCE_CONFIG[s]?.label || s}
                </button>
              ))}
            </div>

            <select className="services-select" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
              <option value="">All Severities</option>
              {filterOpts.severities.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <div className="services-time-group">
              {!showCustomTime ? TIME_PRESETS.map(p => (
                <button key={p.label}
                  className={`services-filter-chip ${timePreset === p.label ? "services-chip-active" : ""}`}
                  onClick={() => setTimePreset(p.label)}>
                  {p.label}
                </button>
              )) : (
                <>
                  <input type="datetime-local" className="services-time-input" value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)} />
                  <span className="services-time-sep">—</span>
                  <input type="datetime-local" className="services-time-input" value={customTo}
                    onChange={e => setCustomTo(e.target.value)} />
                </>
              )}
              <button className="services-filter-chip" onClick={() => setShowCustomTime(!showCustomTime)}>
                {showCustomTime ? "Presets" : "Custom"}
              </button>
            </div>
          </div>
        </div>

        {live && (
          <div className="services-live-indicator">
            <Radio size={12} className={`services-live-pulse ${!socketConnected ? "services-live-disconnected" : ""}`} />
            {socketConnected ? <>Streaming live logs for {selected} — {displayEntries.length} entries</> : <>Connecting to real-time stream...</>}
          </div>
        )}

        <div className="services-results" ref={resultsRef}>
          {loading && !live ? (
            <div className="services-empty">Searching logs...</div>
          ) : displayEntries.length === 0 ? (
            <div className="services-empty">
              <Search size={24} />
              <p>No matching logs found</p>
              <span>Try adjusting your filters or time range</span>
            </div>
          ) : (
            displayEntries.map((entry) => {
              const isExpanded = expanded.has(entry.id);
              const sevColor = SEVERITY_COLORS[entry.severity];
              const srcConfig = SOURCE_CONFIG[entry.source] || { label: entry.source, color: "#6b7280" };
              return (
                <div key={entry.id} className={`services-entry ${isExpanded ? "services-entry-expanded" : ""}`}
                  onClick={() => toggleExpanded(entry.id)}>
                  <div className="services-entry-main">
                    <span className="services-entry-time" title={formatTime(entry.timestamp)}>
                      {timeAgo(entry.timestamp)}
                    </span>
                    <span className="services-entry-source" style={{ color: srcConfig.color }}>
                      {srcConfig.label}
                    </span>
                    {entry.severity && (
                      <span className="services-entry-severity" style={{ color: sevColor }}>
                        {sevIcon(entry.severity)} {entry.severity}
                      </span>
                    )}
                    <span className="services-entry-component">{entry.component || "—"}</span>
                    <span className="services-entry-message">{entry.message}</span>
                  </div>
                  {isExpanded && (
                    <div className="services-entry-detail">
                      <div className="services-detail-row">
                        <span className="services-detail-label">Timestamp</span>
                        <span className="services-detail-value">{formatTime(entry.timestamp)}</span>
                      </div>
                      <div className="services-detail-row">
                        <span className="services-detail-label">Source</span>
                        <span className="services-detail-value">{entry.source}</span>
                      </div>
                      <div className="services-detail-row">
                        <span className="services-detail-label">Component</span>
                        <span className="services-detail-value">{entry.component || "—"}</span>
                      </div>
                      {entry.severity && (
                        <div className="services-detail-row">
                          <span className="services-detail-label">Severity</span>
                          <span className="services-detail-value">{entry.severity}</span>
                        </div>
                      )}
                      <div className="services-detail-row">
                        <span className="services-detail-label">Type</span>
                        <span className="services-detail-value">{entry.type || "—"}</span>
                      </div>
                      <div className="services-detail-row">
                        <span className="services-detail-label">Message</span>
                        <span className="services-detail-value services-detail-message">{entry.message}</span>
                      </div>
                      {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                        <div className="services-detail-row">
                          <span className="services-detail-label">Metadata</span>
                          <pre className="services-detail-pre">{JSON.stringify(entry.metadata, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && !live && (
          <div className="services-pagination">
            <button className="services-page-btn" disabled={page <= 1} onClick={() => fetchLogs(page - 1)}>
              Previous
            </button>
            <span className="services-page-info">
              Page {page} of {totalPages}
            </span>
            <button className="services-page-btn" disabled={page >= totalPages} onClick={() => fetchLogs(page + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="services-view">
      <div className="services-view-header">
        <Server size={16} />
        <span>Service Inventory</span>
        <span className="services-summary">
          <span style={{ color: "#22c55e" }}>{healthy} healthy</span>
          <span style={{ color: "#6b7280" }}> / </span>
          <span style={{ color: "#ef4444" }}>{degraded} degraded</span>
        </span>
      </div>
      <div className="services-grid">
        {services.map((svc, i) => (
          <motion.div key={svc.name} className="service-card"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => selectService(svc.name)}>
            <div className="service-card-top">
              <span className="service-card-name">{svc.name}</span>
              <span className={`service-card-status-badge ${svc.status}`}>
                {svc.status === "healthy" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {svc.status}
              </span>
            </div>
            <div className="service-card-metrics">
              <div className="service-card-metric">
                <span className="service-card-metric-value">{svc.incidents.length}</span>
                <span className="service-card-metric-label">Incidents</span>
              </div>
              <div className="service-card-metric">
                <span className="service-card-metric-value">{svc.dependencies.length}</span>
                <span className="service-card-metric-label">Dependencies</span>
              </div>
              <div className="service-card-metric">
                <span className="service-card-metric-value">{svc.dependents.length}</span>
                <span className="service-card-metric-label">Dependents</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
