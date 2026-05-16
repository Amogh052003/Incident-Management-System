import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, MessageSquare, GitPullRequest, BookOpen, Database, Activity, CheckCircle, XCircle } from "lucide-react";

const ICON_MAP = { MessageSquare, GitPullRequest, BookOpen, Activity, Database };

export default function IntegrationsView() {
  const [integrations, setIntegrations] = useState([]);

  useEffect(() => {
    fetch("/integrations").then(r => r.json())
      .then(setIntegrations).catch(() => {});
  }, []);

  const statusColor = (s) => s === "configured" ? "#22c55e" : "#6b7280";
  const statusIcon = (s) => s === "configured" ? CheckCircle : XCircle;

  return (
    <div className="integrations-view">
      <div className="integrations-view-header">
        <Link size={16} />
        <span>Integrations</span>
        <span className="timeline-count">{integrations.length} configured</span>
      </div>
      <div className="integrations-grid">
        {integrations.map((int, i) => {
          const Icon = ICON_MAP[int.icon] || Database;
          const StatusIcon = statusIcon(int.status);
          return (
            <motion.div key={int.id || int.name} className="integration-card"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="integration-card-header">
                <div className="plugin-icon-wrap" style={{ background: `${statusColor(int.status)}22`, color: statusColor(int.status) }}>
                  <Icon size={20} />
                </div>
                <div>
                  <span className="integration-name">{int.name}</span>
                  <span className={`plugin-status`} style={{ color: statusColor(int.status) }}>
                    <StatusIcon size={12} />
                    {int.status}
                  </span>
                </div>
              </div>
              <button className="button integration-edit-btn">Configure</button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
