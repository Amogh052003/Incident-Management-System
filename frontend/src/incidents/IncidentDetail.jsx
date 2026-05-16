import { motion } from "framer-motion";
import { X, Clock, Radio, Zap, User, GitBranch, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { useIncidentDetail } from "../hooks/useIncidentDetail";
import { useState } from "react";

const SEVERITY_CONFIG = {
  P0: { color: "#ef4444", label: "P0" },
  P1: { color: "#f97316", label: "P1" },
  P2: { color: "#eab308", label: "P2" },
};

export default function IncidentDetail({ id, onClose }) {
  const { incident, logs, loading, updateStatus } = useIncidentDetail(id);
  const [transitioning, setTransitioning] = useState(false);
  const [rcaInput, setRcaInput] = useState({ root_cause: "", fix: "", prevention: "" });

  if (!id) return null;

  const sev = incident ? SEVERITY_CONFIG[incident.severity] : null;

  const handleTransition = async (status) => {
    setTransitioning(true);
    const rca = status === "RESOLVED" ? rcaInput : undefined;
    await updateStatus(status, rca);
    setTransitioning(false);
  };

  const nextStatus = incident?.status === "OPEN" ? "INVESTIGATING"
    : incident?.status === "INVESTIGATING" ? "RESOLVED"
    : incident?.status === "RESOLVED" ? "CLOSED"
    : null;

  const showRcaForm = incident?.status === "INVESTIGATING";

  return (
    <motion.aside
      className="incident-detail"
      initial={{ x: 360 }}
      animate={{ x: 0 }}
      exit={{ x: 360 }}
      transition={{ duration: 0.25 }}
    >
      <div className="incident-detail-header">
        <span className="incident-detail-title">Incident #{id}</span>
        <button className="incident-detail-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {loading ? (
        <div className="incident-detail-loading">Loading...</div>
      ) : incident ? (
        <div className="incident-detail-body">
          <div className="detail-summary">
            <span className="severity-badge" style={{
              background: `${sev.color}22`,
              color: sev.color,
              border: `1px solid ${sev.color}`,
            }}>{sev.label}</span>
            <span className={`badge badge-${incident.status.toLowerCase()}`}>
              {incident.status}
            </span>
          </div>

          <div className="detail-field">
            <Radio size={13} /> <span className="detail-field-label">Component</span>
            <span className="detail-field-value">{incident.component_id}</span>
          </div>
          <div className="detail-field">
            <Clock size={13} /> <span className="detail-field-label">Started</span>
            <span className="detail-field-value">
              {new Date(incident.start_time).toLocaleString()}
            </span>
          </div>
          <div className="detail-field">
            <Zap size={13} /> <span className="detail-field-label">Signals</span>
            <span className="detail-field-value">{incident.signal_count}</span>
          </div>
          <div className="detail-field">
            <User size={13} /> <span className="detail-field-label">Assignee</span>
            <span className="detail-field-value">auto-assigned</span>
          </div>

          {incident.rca && (
            <div className="detail-rca">
              <h4><GitBranch size={13} /> RCA</h4>
              <div className="rca-block">
                <p><strong>Root Cause:</strong> {incident.rca.root_cause}</p>
                <p><strong>Fix:</strong> {incident.rca.fix}</p>
                <p><strong>Prevention:</strong> {incident.rca.prevention}</p>
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div className="detail-logs">
              <h4><Search size={13} /> Event Log</h4>
              <div className="logs-container">
                {logs.map((log, i) => (
                  <div key={i} className="log-entry">
                    <div className="log-header">
                      <span className="log-component">{log.component_id}</span>
                      <span className="log-timestamp">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="log-message">{log.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nextStatus && (
            <div className="detail-actions">
              {showRcaForm && (
                <div className="rca-form">
                  <h4>RCA Required</h4>
                  <input
                    className="rca-input"
                    placeholder="Root cause"
                    value={rcaInput.root_cause}
                    onChange={(e) => setRcaInput({ ...rcaInput, root_cause: e.target.value })}
                  />
                  <input
                    className="rca-input"
                    placeholder="Fix applied"
                    value={rcaInput.fix}
                    onChange={(e) => setRcaInput({ ...rcaInput, fix: e.target.value })}
                  />
                  <input
                    className="rca-input"
                    placeholder="Prevention"
                    value={rcaInput.prevention}
                    onChange={(e) => setRcaInput({ ...rcaInput, prevention: e.target.value })}
                  />
                </div>
              )}
              <button
                className="button detail-action-btn"
                onClick={() => handleTransition(nextStatus)}
                disabled={transitioning || (showRcaForm && (!rcaInput.root_cause || !rcaInput.fix))}
              >
                {nextStatus === "INVESTIGATING" && <Search size={14} />}
                {nextStatus === "RESOLVED" && <CheckCircle size={14} />}
                {nextStatus === "CLOSED" && <CheckCircle size={14} />}
                Mark as {nextStatus}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="incident-detail-loading">Incident not found</div>
      )}
    </motion.aside>
  );
}
