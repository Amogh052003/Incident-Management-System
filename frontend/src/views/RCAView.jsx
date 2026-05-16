import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GitBranch, AlertTriangle, Radio, Clock, ArrowDown, Search, Activity
} from "lucide-react";
import { useIncidentDetail } from "../hooks/useIncidentDetail";

function IncidentSelector({ incidents, selectedId, onSelect }) {
  return (
    <div className="rca-selector">
      <span className="rca-selector-label">Select Incident</span>
      <div className="rca-selector-list">
        {incidents.map(inc => (
          <button key={inc.id} className={`rca-selector-item ${selectedId === inc.id ? "rca-selector-active" : ""}`}
            onClick={() => onSelect(inc.id)}>
            <span className={`rca-severity-dot`} style={{
              background: inc.severity === "P0" ? "#ef4444" : inc.severity === "P1" ? "#f97316" : "#eab308"
            }} />
            <span>#{inc.id}</span>
            <span className="muted">{inc.component_id}</span>
            <span className="muted">{inc.severity}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CausalChain({ logs }) {
  if (!logs || logs.length === 0) return <div className="rca-empty">No event data for analysis</div>;

  return (
    <div className="rca-chain">
      <div className="rca-chain-header"><Activity size={14} /> Causal Chain</div>
      <div className="rca-chain-list">
        {logs.map((log, i) => (
          <div key={i} className="rca-chain-entry">
            <div className="rca-chain-dot" />
            {i < logs.length - 1 && <div className="rca-chain-line" />}
            <div className="rca-chain-content">
              <span className="rca-chain-time">
                {new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span className="rca-chain-component">{log.component_id}</span>
              <p className="rca-chain-message">{log.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventCorrelation({ logs }) {
  if (!logs || logs.length < 2) return null;

  const components = [...new Set(logs.map(l => l.component_id))];
  const pairs = [];
  for (let i = 0; i < logs.length - 1; i++) {
    const pair = `${logs[i].component_id} → ${logs[i + 1].component_id}`;
    if (!pairs.includes(pair)) pairs.push(pair);
  }

  return (
    <div className="rca-correlation">
      <div className="rca-chain-header"><Search size={14} /> Event Correlation</div>
      <p className="rca-correlation-text">
        {components.length} components involved in {logs.length} events.
      </p>
      {pairs.length > 0 && (
        <div className="rca-correlation-pairs">
          {pairs.slice(0, 5).map((p, i) => (
            <div key={i} className="rca-pair">
              <ArrowDown size={12} /> {p}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RCAView() {
  const [incidents, setIncidents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const { incident, logs } = useIncidentDetail(selectedId);

  useEffect(() => {
    fetch("/incidents?status=ALL").then(r => r.json())
      .then(setIncidents).catch(() => {});
  }, []);

  return (
    <div className="rca-view">
      <div className="rca-view-header">
        <GitBranch size={16} />
        <span>Root Cause Analysis</span>
      </div>
      <div className="rca-view-body">
        <IncidentSelector incidents={incidents} selectedId={selectedId} onSelect={setSelectedId} />

        {selectedId ? (
          <div className="rca-analysis">
            {incident && (
              <div className="rca-incident-info">
                <span className="severity-badge" style={{
                  background: incident.severity === "P0" ? "rgba(239,68,68,0.3)" : incident.severity === "P1" ? "rgba(249,115,22,0.3)" : "rgba(234,179,8,0.3)",
                  color: incident.severity === "P0" ? "#ef4444" : incident.severity === "P1" ? "#f97316" : "#eab308",
                  border: `1px solid ${incident.severity === "P0" ? "#ef4444" : incident.severity === "P1" ? "#f97316" : "#eab308"}`
                }}>{incident.severity}</span>
                <span className={`badge badge-${incident.status.toLowerCase()}`}>{incident.status}</span>
                <span className="muted">{incident.component_id}</span>
              </div>
            )}

            <div className="rca-panels">
              <CausalChain logs={logs} />
              <EventCorrelation logs={logs} />
            </div>

            {incident?.rca && (
              <div className="rca-conclusion">
                <div className="rca-chain-header"><Search size={14} /> Analysis Conclusion</div>
                <div className="rca-block">
                  <p><strong>Root Cause:</strong> {incident.rca.root_cause}</p>
                  <p><strong>Fix:</strong> {incident.rca.fix}</p>
                  <p><strong>Prevention:</strong> {incident.rca.prevention}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rca-placeholder">
            <GitBranch size={48} />
            <p>Select an incident to begin root cause analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}
