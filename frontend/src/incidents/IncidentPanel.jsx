import { AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import IncidentCard from "./IncidentCard";
import IncidentDetail from "./IncidentDetail";
import { useState } from "react";

/**
 * Renders the active incident list and opens detail view for a selected incident.
 *
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.incidents - Incidents to display.
 * @param {boolean} props.loading - Whether incident data is loading.
 * @returns {JSX.Element} Incident panel and optional detail view.
 */
export default function IncidentPanel({ incidents, loading }) {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <>
      <aside className="incident-panel">
        <div className="incident-panel-header">
          <AlertTriangle size={16} className="incident-panel-icon" />
          <span className="incident-panel-title">Active Incidents</span>
          <span className="incident-panel-count">{incidents.length}</span>
        </div>

        <div className="incident-panel-list">
          {loading ? (
            <div className="incident-panel-empty">Loading...</div>
          ) : incidents.length === 0 ? (
            <div className="incident-panel-empty">All clear — no active incidents</div>
          ) : (
            <AnimatePresence>
              {incidents.map((inc) => (
                <IncidentCard
                  key={inc.id}
                  incident={inc}
                  onClick={setSelectedId}
                  selected={selectedId === inc.id}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </aside>

      <AnimatePresence>
        {selectedId && (
          <IncidentDetail id={selectedId} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
