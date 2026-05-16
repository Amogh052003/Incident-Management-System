import { motion } from "framer-motion";
import { Clock, Radio, User, Zap } from "lucide-react";

const SEVERITY_CONFIG = {
  P0: { color: "#ef4444", glow: "rgba(239,68,68,0.3)", label: "P0" },
  P1: { color: "#f97316", glow: "rgba(249,115,22,0.3)", label: "P1" },
  P2: { color: "#eab308", glow: "rgba(234,179,8,0.3)", label: "P2" },
};

function formatTime(iso) {
  if (!iso) return "--";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export default function IncidentCard({ incident, onClick, selected }) {
  const sev = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.P2;

  return (
    <motion.div
      className={`incident-card ${selected ? "incident-card-selected" : ""}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick?.(incident.id)}
      style={{
        borderLeftColor: sev.color,
        boxShadow: selected
          ? `inset 0 0 0 1px ${sev.color}, 0 0 12px ${sev.glow}`
          : `inset 0 0 0 1px ${sev.glow}`,
      }}
    >
      <div className="incident-card-header">
        <span
          className="severity-badge"
          style={{
            background: sev.glow,
            color: sev.color,
            border: `1px solid ${sev.color}`,
          }}
        >
          {sev.label}
        </span>
        <span className="incident-status">{incident.status}</span>
        <span className="incident-time">{timeAgo(incident.start_time)}</span>
      </div>

      <div className="incident-card-body">
        <div className="incident-component">
          <Radio size={13} />
          <span>{incident.component_id || "unknown"}</span>
        </div>
      </div>

      <div className="incident-card-footer">
        <div className="incident-meta">
          <Clock size={12} />
          <span>{formatTime(incident.start_time)}</span>
        </div>
        <div className="incident-meta">
          <Zap size={12} />
          <span>{incident.signal_count ?? 0} signals</span>
        </div>
        <div className="incident-meta">
          <User size={12} />
          <span>auto</span>
        </div>
      </div>
    </motion.div>
  );
}
