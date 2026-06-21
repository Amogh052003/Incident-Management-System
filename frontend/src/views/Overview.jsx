import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity, AlertTriangle, Server, Zap, Layers,
  Radio, Clock, Shield, CheckCircle, XCircle
} from "lucide-react";
import TopologyGraph from "../components/TopologyGraph";
import MetricsPanel from "../components/MetricsPanel";
import IncidentPanel from "../incidents/IncidentPanel";
import { useIncidents } from "../hooks/useIncidents";

function useTopology() {
  const [state, setState] = useState({ graph: {}, topologyState: {} });
  useEffect(() => {
    fetch("/topology").then(r => r.json()).then(d =>
      setState({ graph: d.graph, topologyState: d.state })
    ).catch(err => console.error("Failed to load topology:", err));
  }, []);
  return state;
}

function useRealtimeFeed() {
  const [entries, setEntries] = useState([]);
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/incidents?status=ALL");
        const incidents = await res.json();
        const feed = [];
        for (const inc of incidents.slice(0, 20)) {
          feed.push({
            id: `${inc.id}-created`, time: inc.start_time,
            type: "incident", component: inc.component_id,
            message: `${inc.severity} incident — ${inc.status}`,
            severity: inc.severity,
          });
          try {
            const lr = await fetch(`/incidents/${inc.id}/logs?limit=3`);
            if (lr.ok) {
              const logs = await lr.json();
              logs.forEach(l => feed.push({
                id: `${inc.id}-${l.timestamp}`, time: l.timestamp,
                type: "signal", component: l.component_id,
                message: l.message, severity: null,
              }));
            }
          } catch (err) {
            console.error("Failed to load incident logs:", err);
          }
        }
        feed.sort((a, b) => new Date(b.time) - new Date(a.time));
        setEntries(feed.slice(0, 50));
      } catch (err) {
        console.error("Failed to load incidents:", err);
      }
    }
    load();
  }, []);
  return entries;
}

export default function Overview() {
  const { incidents, loading, p0Count, p1Count, totalActive } = useIncidents();
  const { graph, topologyState } = useTopology();
  const feed = useRealtimeFeed();

  const services = Object.entries(topologyState);
  const healthyCount = services.filter(([, s]) => s.status === "healthy").length;
  const degradedCount = services.filter(([, s]) => s.status !== "healthy").length;

  const clusterHealth = degradedCount > 0 ? "DEGRADED" : "HEALTHY";
  const clusterColor = clusterHealth === "HEALTHY" ? "#22c55e" : "#ef4444";

  return (
    <div className="overview">
      <div className="overview-top">
        <div className="overview-main">
          <motion.div className="health-banner" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ borderLeftColor: clusterColor }}>
            <div className="health-banner-left">
              <Shield size={20} style={{ color: clusterColor }} />
              <div>
                <div className="health-banner-title">Cluster: <span style={{ color: clusterColor }}>{clusterHealth}</span></div>
                <div className="health-banner-sub">prod-us-east</div>
              </div>
            </div>
            <div className="health-banner-stats">
              <div className="health-stat"><span className="health-stat-value severity-p0">{p0Count}</span><span className="health-stat-label">P0</span></div>
              <div className="health-stat"><span className="health-stat-value severity-p1">{p1Count}</span><span className="health-stat-label">P1</span></div>
              <div className="health-stat"><span className="health-stat-value">{degradedCount}</span><span className="health-stat-label">Degraded</span></div>
              <div className="health-stat"><span className="health-stat-value">{healthyCount}</span><span className="health-stat-label">Healthy</span></div>
              <div className="health-stat"><span className="health-stat-value">{services.length}</span><span className="health-stat-label">Total</span></div>
            </div>
          </motion.div>

          <div className="overview-cards">
            <div className="overview-card">
              <Server size={16} color="#22c55e" />
              <span className="overview-card-value">{healthyCount}</span>
              <span className="overview-card-label">Healthy</span>
            </div>
            <div className="overview-card">
              <XCircle size={16} color="#ef4444" />
              <span className="overview-card-value">{degradedCount}</span>
              <span className="overview-card-label">Degraded</span>
            </div>
            <div className="overview-card">
              <Activity size={16} color="#00f0ff" />
              <span className="overview-card-value">{totalActive}</span>
              <span className="overview-card-label">Incidents</span>
            </div>
            <div className="overview-card">
              <Zap size={16} color="#a855f7" />
              <span className="overview-card-value">{services.length}</span>
              <span className="overview-card-label">Services</span>
            </div>
            <div className="overview-card">
              <Layers size={16} color="#f97316" />
              <span className="overview-card-value">{feed.length}</span>
              <span className="overview-card-label">Events</span>
            </div>
          </div>

          <div className="overview-topology">
            <TopologyGraph />
          </div>
        </div>

        <div className="overview-side">
          <IncidentPanel incidents={incidents} loading={loading} />
        </div>
      </div>

      <div className="overview-bottom">
        <div className="overview-feed">
          <div className="overview-section-header">
            <Radio size={14} /> <span>Realtime Event Feed</span>
          </div>
          <div className="overview-feed-list">
            {feed.length === 0 ? (
              <div className="overview-feed-empty">No events yet</div>
            ) : (
              feed.map((e) => (
                <div key={e.id} className="feed-entry">
                  <span className="feed-time">
                    {new Date(e.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="feed-component">{e.component}</span>
                  <span className="feed-message">{e.message}</span>
                  {e.severity && (
                    <span className={`feed-severity ${`severity-${e.severity?.toLowerCase()}`}`}>{e.severity}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <MetricsPanel />
      </div>
    </div>
  );
}
