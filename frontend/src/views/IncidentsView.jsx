import { useState } from "react";
import { useIncidents } from "../hooks/useIncidents";
import { useIncidentDetail } from "../hooks/useIncidentDetail";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Clock, Radio, User, Zap, Search,
  CheckCircle, GitBranch, Activity, X
} from "lucide-react";

const SEVERITY_CONFIG = {
  P0: { color: "#ef4444", glow: "rgba(239,68,68,0.3)" },
  P1: { color: "#f97316", glow: "rgba(249,115,22,0.3)" },
  P2: { color: "#eab308", glow: "rgba(234,179,8,0.3)" },
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

function IncidentWorkspace({ id, onClose }) {
  const { incident, logs, loading, updateStatus } = useIncidentDetail(id);
  const [transitioning, setTransitioning] = useState(false);
  const [notes, setNotes] = useState("");
  const [rcaInput, setRcaInput] = useState({ root_cause: "", fix: "", prevention: "" });

  if (!id) return null;
  const nextStatus = incident?.status === "OPEN" ? "INVESTIGATING"
    : incident?.status === "INVESTIGATING" ? "RESOLVED"
    : incident?.status === "RESOLVED" ? "CLOSED" : null;
  const showRcaForm = incident?.status === "INVESTIGATING";
  const sev = incident ? SEVERITY_CONFIG[incident.severity] : null;

  const handleTransition = async (status) => {
    setTransitioning(true);
    await updateStatus(status, status === "RESOLVED" ? rcaInput : undefined);
    setTransitioning(false);
  };

  return (
    <motion.div className="incident-workspace"
      initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ duration: 0.25 }}>
      <div className="workspace-header">
        <span>Incident #{id}</span>
        <button className="workspace-close" onClick={onClose}><X size={16} /></button>
      </div>
      {loading ? <div className="workspace-loading">Loading...</div> : !incident ? null : (
        <div className="workspace-body">
          <div className="workspace-summary">
            <span className="severity-badge" style={{ background: `${sev.color}22`, color: sev.color, border: `1px solid ${sev.color}` }}>
              {incident.severity}
            </span>
            <span className={`badge badge-${incident.status.toLowerCase()}`}>{incident.status}</span>
          </div>

          <div className="workspace-section">
            <h4><Radio size={13} /> Affected Service</h4>
            <p className="workspace-service-name">{incident.component_id}</p>
          </div>

          <div className="workspace-meta-grid">
            <div><Clock size={13} /> <span className="muted">Started</span> {new Date(incident.start_time).toLocaleString()}</div>
            <div><Zap size={13} /> <span className="muted">Signals</span> {incident.signal_count}</div>
            <div><User size={13} /> <span className="muted">Assignee</span> auto</div>
          </div>

          {incident.rca && (
            <div className="workspace-section">
              <h4><GitBranch size={13} /> Root Cause Analysis</h4>
              <div className="rca-block">
                <p><strong>Root Cause:</strong> {incident.rca.root_cause}</p>
                <p><strong>Fix:</strong> {incident.rca.fix}</p>
                <p><strong>Prevention:</strong> {incident.rca.prevention}</p>
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div className="workspace-section">
              <h4><Activity size={13} /> Incident Timeline</h4>
              <div className="workspace-timeline">
                {logs.map((log, i) => (
                  <div key={i} className="workspace-timeline-entry">
                    <div className="workspace-timeline-dot" />
                    {i < logs.length - 1 && <div className="workspace-timeline-line" />}
                    <div className="workspace-timeline-content">
                      <span className="workspace-timeline-time">
                        {new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                      <span className="workspace-timeline-component">{log.component_id}</span>
                      <p className="workspace-timeline-message">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="workspace-section">
            <h4><Search size={13} /> Operational Notes</h4>
            <textarea
              className="workspace-notes-input"
              placeholder="Add investigation notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {showRcaForm && (
            <div className="workspace-section">
              <h4 style={{ color: "#f97316" }}>RCA Required</h4>
              <input className="rca-input" placeholder="Root cause" value={rcaInput.root_cause}
                onChange={(e) => setRcaInput({ ...rcaInput, root_cause: e.target.value })} />
              <input className="rca-input" placeholder="Fix applied" value={rcaInput.fix}
                onChange={(e) => setRcaInput({ ...rcaInput, fix: e.target.value })} />
              <input className="rca-input" placeholder="Prevention" value={rcaInput.prevention}
                onChange={(e) => setRcaInput({ ...rcaInput, prevention: e.target.value })} />
            </div>
          )}

          {nextStatus && (
            <button className="button workspace-action-btn"
              onClick={() => handleTransition(nextStatus)}
              disabled={transitioning || (showRcaForm && (!rcaInput.root_cause || !rcaInput.fix))}>
              {nextStatus === "INVESTIGATING" && <Search size={14} />}
              {nextStatus === "RESOLVED" && <CheckCircle size={14} />}
              {nextStatus === "CLOSED" && <CheckCircle size={14} />}
              Mark as {nextStatus}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function IncidentsView() {
  const { incidents, loading } = useIncidents();
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? incidents : incidents.filter(i => i.severity === filter);

  return (
    <div className="incidents-view">
      <div className="incidents-view-list">
        <div className="incidents-view-header">
          <AlertTriangle size={16} />
          <span>Incident Queue</span>
          <div className="incidents-view-controls">
            {["ALL", "P0", "P1", "P2"].map(f => (
              <button key={f} className={`topology-filter-btn ${filter === f ? "topology-filter-active" : ""}`}
                onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <span className="incident-panel-count">{filtered.length}</span>
        </div>
        <div className="incidents-view-scroll">
          {loading ? <div className="incident-panel-empty">Loading...</div>
            : filtered.length === 0 ? <div className="incident-panel-empty">No incidents</div>
            : filtered.map(inc => {
              const sev = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.P2;
              return (
                <motion.div key={inc.id} className={`incident-card ${selectedId === inc.id ? "incident-card-selected" : ""}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => setSelectedId(inc.id)}
                  style={{ borderLeftColor: sev.color, boxShadow: `inset 0 0 0 1px ${sev.glow}` }}>
                  <div className="incident-card-header">
                    <span className="severity-badge" style={{ background: sev.glow, color: sev.color, border: `1px solid ${sev.color}` }}>
                      {inc.severity}</span>
                    <span className="incident-status">{inc.status}</span>
                    <span className="incident-time">{timeAgo(inc.start_time)}</span>
                  </div>
                  <div className="incident-card-body">
                    <div className="incident-component"><Radio size={13} /><span>{inc.component_id || "unknown"}</span></div>
                  </div>
                  <div className="incident-card-footer">
                    <div className="incident-meta"><Clock size={12} /><span>{new Date(inc.start_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span></div>
                    <div className="incident-meta"><Zap size={12} /><span>{inc.signal_count ?? 0} signals</span></div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
      <AnimatePresence>
        {selectedId && <IncidentWorkspace id={selectedId} onClose={() => setSelectedId(null)} />}
      </AnimatePresence>
    </div>
  );
}
