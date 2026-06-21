import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, CheckCircle, XCircle } from "lucide-react";
import ServiceDetail from "../components/ServiceDetail";

export default function ServicesView() {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);

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

  const healthy = services.filter(s => s.status === "healthy").length;
  const degraded = services.filter(s => s.status !== "healthy").length;

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
            onClick={() => setSelected(svc.name)}>
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

      <AnimatePresence>
        {selected && (
          <ServiceDetail key={selected} name={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
