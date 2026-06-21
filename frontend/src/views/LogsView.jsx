import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { Search, Radio, AlertTriangle, X, Download, Activity, Filter, ChevronLeft, Server } from "lucide-react";

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

function severityIcon(sev) {
  if (sev === "P0") return <AlertTriangle size={12} />;
  if (sev === "P1") return <AlertTriangle size={12} />;
  if (sev === "P2") return <AlertTriangle size={12} />;
  return null;
}

export default function LogsView() {
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceLogs, setServiceLogs] = useState({});
  const [overviewQuery, setOverviewQuery] = useState("");
  const [overviewSearchInput, setOverviewSearchInput] = useState("");

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
    if (showCustomTime) {
      return { from: customFrom, to: customTo };
    }
    const preset = TIME_PRESETS.find(p => p.label === timePreset);
    if (!preset) return {};
    return {
      from: new Date(Date.now() - preset.value).toISOString(),
      to: new Date().toISOString(),
    };
  }, [timePreset, showCustomTime, customFrom, customTo]);

  useEffect(() => {
    const socket = io({ transports: ["websocket"] });
    socketRef.current = socket;

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

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    fetch("/topology").then(r => r.json())
      .then(d => setServices(Object.keys(d.state || {}).sort()))
      .catch(() => {});
  }, []);

  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch("/logs/filters");
      const data = await res.json();
      setFilterOpts(data);
    } catch (e) {}
  }, []);

  useEffect(() => { fetchFilters(); }, [fetchFilters]);

  const fetchLogs = useCallback(async (p = 1) => {
    if (!selectedService) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (sources.length < 3) params.set("sources", sources.join(","));
      if (severityFilter) params.set("severity", severityFilter);
      params.set("component", selectedService);
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
  }, [selectedService, query, sources, severityFilter, getTimeRange]);

  useEffect(() => {
    if (selectedService) {
      fetchLogs(1);
    }
  }, [selectedService, query, sources, severityFilter, timePreset, showCustomTime, customFrom, customTo]);

  useEffect(() => {
    if (resultsRef.current) resultsRef.current.scrollTop = 0;
  }, [entries, selectedService]);

  function selectService(svc) {
    setSelectedService(svc);
    setQuery("");
    setSearchInput("");
    setPage(1);
    setLive(false);
    setEntries([]);
  }

  function backToOverview() {
    setSelectedService(null);
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

  const filteredServices = overviewQuery
    ? services.filter(s => s.toLowerCase().includes(overviewQuery.toLowerCase()))
    : services;

  if (!selectedService) {
    return (
      <div className="logs-view">
        <div className="logs-view-header">
          <Activity size={16} />
          <span>Service Logs</span>
          <span className="logs-count">{services.length} services</span>
        </div>

        <div className="logs-toolbar">
          <form className="logs-search-form" onSubmit={e => { e.preventDefault(); setOverviewQuery(overviewSearchInput); }}>
            <Search size={14} className="logs-search-icon" />
            <input className="logs-search-input" type="text"
              placeholder="Search services..."
              value={overviewSearchInput}
              onChange={e => setOverviewSearchInput(e.target.value)} />
            {overviewSearchInput && (
              <button type="button" className="logs-search-clear" onClick={() => { setOverviewSearchInput(""); setOverviewQuery(""); }}>
                <X size={14} />
              </button>
            )}
          </form>
        </div>

        <div className="logs-overview-sections">
          {filteredServices.map(svc => {
            const logData = serviceLogs[svc] || { entries: [], count: 0 };
            const p0Count = logData.entries.filter(e => e.severity === "P0").length;
            return (
              <div key={svc} className="logs-section" onClick={() => selectService(svc)}>
                <div className="logs-section-header">
                  <span className="logs-section-name">
                    <Server size={14} />
                    {svc}
                  </span>
                  <span className="logs-section-meta">
                    {p0Count > 0 && <span className="logs-section-alert">{p0Count} P0</span>}
                    <span className="logs-section-count">{logData.count} signals</span>
                  </span>
                </div>
                <div className="logs-section-entries">
                  {logData.entries.slice(0, 5).map(entry => (
                    <div key={entry.id} className="logs-section-entry">
                      {entry.severity && (
                        <span className="logs-entry-severity" style={{ color: SEVERITY_COLORS[entry.severity] || "#6b7280" }}>
                          {severityIcon(entry.severity)} {entry.severity}
                        </span>
                      )}
                      <span className="logs-entry-message">{entry.message}</span>
                      <span className="logs-entry-time">{timeAgo(entry.timestamp)}</span>
                    </div>
                  ))}
                  {logData.entries.length === 0 && (
                    <span className="logs-section-empty">No recent signals — waiting...</span>
                  )}
                </div>
              </div>
            );
          })}
          {filteredServices.length === 0 && (
            <div className="logs-empty">
              <Search size={24} />
              <p>No services found</p>
              <span>Start the backend to see service logs</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const liveEntries = live ? (serviceLogs[selectedService]?.entries || []) : [];

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
    <div className="logs-view">
      <div className="logs-view-header">
        <button className="logs-back-btn" onClick={backToOverview}>
          <ChevronLeft size={14} /> Services
        </button>
        <Activity size={16} />
        <span>{selectedService}</span>
        <span className="logs-count">{live ? liveEntries.length : total} results</span>
        <div className="logs-view-actions">
          <button className={`logs-live-btn ${live ? "logs-live-active" : ""}`}
            onClick={() => setLive(!live)}>
            <Radio size={14} />
            {live ? "LIVE" : "Live"}
          </button>
          <button className="logs-export-btn" onClick={exportLogs} disabled={entries.length === 0}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="logs-toolbar">
        <form className="logs-search-form" onSubmit={handleSearch}>
          <Search size={14} className="logs-search-icon" />
          <input className="logs-search-input" type="text"
            placeholder={`Search ${selectedService} logs...`}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)} />
          {searchInput && (
            <button type="button" className="logs-search-clear" onClick={() => { setSearchInput(""); setQuery(""); }}>
              <X size={14} />
            </button>
          )}
        </form>

        <div className="logs-filters">
          <div className="logs-filter-group">
            <Filter size={12} />
            {filterOpts.sources.map(s => (
              <button key={s}
                className={`logs-filter-chip ${sources.includes(s) ? "logs-chip-active" : ""}`}
                onClick={() => toggleSource(s)}
                style={sources.includes(s) ? { borderColor: SOURCE_CONFIG[s]?.color, color: SOURCE_CONFIG[s]?.color } : {}}>
                {SOURCE_CONFIG[s]?.label || s}
              </button>
            ))}
          </div>

          <select className="logs-select" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
            <option value="">All Severities</option>
            {filterOpts.severities.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="logs-time-group">
            {!showCustomTime ? TIME_PRESETS.map(p => (
              <button key={p.label}
                className={`logs-filter-chip ${timePreset === p.label ? "logs-chip-active" : ""}`}
                onClick={() => setTimePreset(p.label)}>
                {p.label}
              </button>
            )) : (
              <>
                <input type="datetime-local" className="logs-time-input" value={customFrom}
                  onChange={e => setCustomFrom(e.target.value)} />
                <span className="logs-time-sep">—</span>
                <input type="datetime-local" className="logs-time-input" value={customTo}
                  onChange={e => setCustomTo(e.target.value)} />
              </>
            )}
            <button className="logs-filter-chip" onClick={() => setShowCustomTime(!showCustomTime)}>
              {showCustomTime ? "Presets" : "Custom"}
            </button>
          </div>
        </div>
      </div>

      {live && (
        <div className="logs-live-indicator">
          <Radio size={12} className="logs-live-pulse" />
          Streaming live logs for {selectedService} — {displayEntries.length} entries
        </div>
      )}

      <div className="logs-results" ref={resultsRef}>
        {loading && !live ? (
          <div className="logs-empty">Searching logs...</div>
        ) : displayEntries.length === 0 ? (
          <div className="logs-empty">
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
              <div key={entry.id} className={`logs-entry ${isExpanded ? "logs-entry-expanded" : ""}`}
                onClick={() => toggleExpanded(entry.id)}>
                <div className="logs-entry-main">
                  <span className="logs-entry-time" title={formatTime(entry.timestamp)}>
                    {timeAgo(entry.timestamp)}
                  </span>
                  <span className="logs-entry-source" style={{ color: srcConfig.color }}>
                    {srcConfig.label}
                  </span>
                  {entry.severity && (
                    <span className="logs-entry-severity" style={{ color: sevColor }}>
                      {severityIcon(entry.severity)} {entry.severity}
                    </span>
                  )}
                  <span className="logs-entry-component">{entry.component || "—"}</span>
                  <span className="logs-entry-message">{entry.message}</span>
                </div>
                {isExpanded && (
                  <div className="logs-entry-detail">
                    <div className="logs-detail-row">
                      <span className="logs-detail-label">Timestamp</span>
                      <span className="logs-detail-value">{formatTime(entry.timestamp)}</span>
                    </div>
                    <div className="logs-detail-row">
                      <span className="logs-detail-label">Source</span>
                      <span className="logs-detail-value">{entry.source}</span>
                    </div>
                    <div className="logs-detail-row">
                      <span className="logs-detail-label">Component</span>
                      <span className="logs-detail-value">{entry.component || "—"}</span>
                    </div>
                    {entry.severity && (
                      <div className="logs-detail-row">
                        <span className="logs-detail-label">Severity</span>
                        <span className="logs-detail-value">{entry.severity}</span>
                      </div>
                    )}
                    <div className="logs-detail-row">
                      <span className="logs-detail-label">Type</span>
                      <span className="logs-detail-value">{entry.type || "—"}</span>
                    </div>
                    <div className="logs-detail-row">
                      <span className="logs-detail-label">Message</span>
                      <span className="logs-detail-value logs-detail-message">{entry.message}</span>
                    </div>
                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                      <div className="logs-detail-row">
                        <span className="logs-detail-label">Metadata</span>
                        <pre className="logs-detail-pre">{JSON.stringify(entry.metadata, null, 2)}</pre>
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
        <div className="logs-pagination">
          <button className="logs-page-btn" disabled={page <= 1} onClick={() => fetchLogs(page - 1)}>
            Previous
          </button>
          <span className="logs-page-info">
            Page {page} of {totalPages}
          </span>
          <button className="logs-page-btn" disabled={page >= totalPages} onClick={() => fetchLogs(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
