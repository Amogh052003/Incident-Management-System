import { motion } from "framer-motion";
import { Activity, AlertTriangle, GitMerge, Workflow, Layers } from "lucide-react";

const METRICS = [
  { icon: Activity, label: "Signals/s", value: "24", color: "#00f0ff" },
  { icon: AlertTriangle, label: "Incidents/hr", value: "3", color: "#ef4444" },
  { icon: GitMerge, label: "Dedup Ratio", value: "87%", color: "#22c55e" },
  { icon: Workflow, label: "Worker Throughput", value: "142/s", color: "#a855f7" },
  { icon: Layers, label: "Queue Depth", value: "7", color: "#f97316" },
];

export default function MetricsPanel() {
  return (
    <div className="metrics-panel">
      {METRICS.map(({ icon: Icon, label, value, color }) => (
        <motion.div
          key={label}
          className="metric-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="metric-icon" style={{ color }}>
            <Icon size={18} />
          </div>
          <div className="metric-body">
            <span className="metric-value" style={{ color }}>{value}</span>
            <span className="metric-label">{label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
