import { useState } from "react";
import { Filter, Network, Radio, Server, ArrowRight } from "lucide-react";
import TopologyGraph from "../components/TopologyGraph";

const FILTERS = ["All", "prod-us-east", "staging", "kube-system", "payments"];

export default function TopologyView() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="topology-view">
      <div className="topology-view-main">
        <div className="topology-toolbar">
          <div className="topology-toolbar-left">
            <Network size={16} />
            <span className="topology-toolbar-title">Infrastructure Topology</span>
          </div>
          <div className="topology-toolbar-filters">
            <Filter size={14} />
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`topology-filter-btn ${activeFilter === f ? "topology-filter-active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="topology-view-graph">
          <TopologyGraph />
        </div>
      </div>

      {selectedService && (
        <div className="topology-detail-panel">
          <div className="topology-detail-header">
            <Server size={16} /> <span>{selectedService}</span>
          </div>
          <div className="topology-detail-body">
            <p className="muted">Dependency information will appear here when a node is clicked.</p>
          </div>
        </div>
      )}

      {!selectedService && (
        <div className="topology-detail-panel topology-detail-empty">
          <Network size={32} />
          <p>Click a service node to view details</p>
        </div>
      )}
    </div>
  );
}
