import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Puzzle, CheckCircle, XCircle, Activity, Clock, MessageSquare, GitPullRequest, BookOpen, Bell } from "lucide-react";

const ICON_MAP = { MessageSquare, GitPullRequest, BookOpen, Bell };

export default function PluginsView() {
  const [plugins, setPlugins] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/plugins").then(r => r.json()),
      fetch("/plugins/activity/feed?limit=20").then(r => r.json()),
    ]).then(([p, a]) => {
      setPlugins(p);
      setActivity(a);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="plugins-view">
      <div className="plugins-view-header">
        <Puzzle size={16} />
        <span>Plugin Registry</span>
        <span className="timeline-count">{plugins.length} plugins</span>
      </div>

      <div className="plugins-grid">
        {loading ? <div className="incident-panel-empty">Loading...</div>
          : plugins.map((p, i) => {
            const Icon = ICON_MAP[p.icon] || Puzzle;
            const isActive = p.status === "active";
            return (
              <motion.div key={p.id} className="plugin-card"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="plugin-card-header">
                  <div className="plugin-icon-wrap" style={{ background: `${isActive ? "rgba(34,197,94,0.15)" : "rgba(107,114,128,0.15)"}`, color: isActive ? "#22c55e" : "#6b7280" }}>
                    <Icon size={20} />
                  </div>
                  <div className="plugin-info">
                    <span className="plugin-name">{p.name}</span>
                    <span className={`plugin-status ${isActive ? "plugin-status-ok" : "plugin-status-err"}`}>
                      {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="plugin-events">
                  <span className="plugin-events-label">Subscribed Events:</span>
                  {(p.subscribed_events || []).map(e => <span key={e} className="plugin-event-tag">{e}</span>)}
                </div>
                <div className="plugin-footer">
                  <Clock size={12} /> Registered
                </div>
              </motion.div>
            );
          })}
      </div>

      <div className="plugins-activity">
        <div className="plugins-activity-header">
          <Activity size={14} /> <span>Plugin Activity Feed</span>
        </div>
        <div className="plugins-activity-list">
          {activity.length === 0
            ? <div className="timeline-empty" style={{ padding: 12 }}>No activity yet</div>
            : activity.map((a, i) => (
              <div key={a.id || i} className="plugins-activity-entry">
                <span className="plugins-activity-plugin">{a.plugin_name}</span>
                <span className="plugins-activity-action">{a.action}</span>
                <span className="plugins-activity-time">
                  {a.created_at ? new Date(a.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
