import { useEffect, useMemo, useState } from "react";

const POLL_MS = 5000;

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function statusClass(status) {
  if (status === "OPEN") return "badge-open";
  if (status === "RESOLVED") return "badge-resolved";
  if (status === "CLOSED") return "badge-closed";
  return "";
}

function severityClass(severity) {
  if (severity === "P0") return "badge-p0";
  if (severity === "P1") return "badge-p1";
  if (severity === "P2") return "badge-p2";
  return "";
}

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [rca, setRca] = useState({ root_cause: "", fix: "", prevention: "" });
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  async function fetchIncidents() {
    try {
      const statusParam = statusFilter === "ALL" ? "status=ALL" : `status=${statusFilter}`;
      const res = await fetch(`/incidents?${statusParam}`);
      if (!res.ok) throw new Error("Failed to fetch incidents");
      const data = await res.json();
      setIncidents(data);
      setError("");

      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingList(false);
    }
  }

  async function fetchIncidentDetail(id) {
    if (!id) {
      setSelectedIncident(null);
      setLogs([]);
      return;
    }

    setLoadingDetail(true);
    try {
      const res = await fetch(`/incidents/${id}`);
      if (!res.ok) throw new Error("Failed to fetch incident detail");
      const data = await res.json();
      setSelectedIncident(data);
      setActionError("");

      setRca({
        root_cause: data?.rca?.root_cause || "",
        fix: data?.rca?.fix || "",
        prevention: data?.rca?.prevention || "",
      });
    } catch (err) {
      setActionError(err.message);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function fetchIncidentLogs(id) {
    if (!id) {
      setLogs([]);
      return;
    }

    setLoadingLogs(true);
    try {
      const res = await fetch(`/incidents/${id}/logs?limit=100`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }

  useEffect(() => {
    fetchIncidents();
    const timer = setInterval(fetchIncidents, POLL_MS);
    return () => clearInterval(timer);
  }, [statusFilter]);

  useEffect(() => {
    fetchIncidentDetail(selectedId);
    fetchIncidentLogs(selectedId);
  }, [selectedId]);

  const canResolve = selectedIncident?.status === "OPEN";
  const canClose = selectedIncident?.status === "RESOLVED";
  const isReadOnly = selectedIncident?.status === "CLOSED";
  const filteredIncidents = incidents; // Backend now filters by status

  const rcaInvalid = useMemo(() => {
    if (!canClose) return false;
    return !rca.root_cause.trim() || !rca.fix.trim() || !rca.prevention.trim();
  }, [canClose, rca]);

  async function updateStatus(status) {
    if (!selectedIncident?.id) return;

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const payload = { status };
      if (status === "CLOSED") {
        payload.rca = {
          root_cause: rca.root_cause.trim(),
          fix: rca.fix.trim(),
          prevention: rca.prevention.trim(),
        };
      }

      const res = await fetch(`/workitem/${selectedIncident.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to update status");
      }

      await Promise.all([fetchIncidents(), fetchIncidentDetail(selectedIncident.id)]);
      setActionSuccess(`Incident moved to ${status}.`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="background-glow" />
      <header className="panel header">
        <div>
          <p className="eyebrow">Incident Management System</p>
          <h1>Live Incident Dashboard</h1>
          <p className="muted">Auto-refresh every {POLL_MS / 1000}s</p>
        </div>
      </header>

      {error && <p className="error-banner">{error}</p>}

      <main className="layout">
        <section className="panel list-panel">
          <div className="section-title-row">
            <h2>Active Incidents</h2>
            <div className="list-toolbar">
              <span className="muted">{filteredIncidents.length} items</span>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All</option>
                <option value="OPEN">OPEN</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          {loadingList ? (
            <p className="muted">Loading incidents...</p>
          ) : filteredIncidents.length === 0 ? (
            <p className="muted">No active incidents 🎉</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Component</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Start Time</th>
                    <th>Signals</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map((item) => (
                    <tr
                      key={item.id}
                      className={item.id === selectedId ? "selected-row" : ""}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <td>{item.id}</td>
                      <td>{item.component_id}</td>
                      <td>
                        <span className={`badge ${severityClass(item.severity)}`}>
                          {item.severity}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${statusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{formatDate(item.start_time)}</td>
                      <td>{item.signal_count ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel detail-panel">
          <div className="section-title-row">
            <h2>Incident Detail</h2>
            {selectedIncident?.status && (
              <span className={`badge ${statusClass(selectedIncident.status)}`}>
                {selectedIncident.status}
              </span>
            )}
          </div>

          {!selectedId ? (
            <p className="muted">Select an incident to view details.</p>
          ) : loadingDetail && !selectedIncident ? (
            <p className="muted">Loading detail...</p>
          ) : selectedIncident ? (
            <>
              <div className="detail-grid">
                <div>
                  <p className="label">Incident ID</p>
                  <p>{selectedIncident.id}</p>
                </div>
                <div>
                  <p className="label">Component</p>
                  <p>{selectedIncident.component_id}</p>
                </div>
                <div>
                  <p className="label">Severity</p>
                  <p>
                    <span className={`badge ${severityClass(selectedIncident.severity)}`}>
                      {selectedIncident.severity}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="label">Start Time</p>
                  <p>{formatDate(selectedIncident.start_time)}</p>
                </div>
                <div>
                  <p className="label">End Time</p>
                  <p>{formatDate(selectedIncident.end_time)}</p>
                </div>
                <div>
                  <p className="label">Signal Count</p>
                  <p>{selectedIncident.signal_count ?? 0}</p>
                </div>
              </div>

              <div className="form-block">
                <h3>Update Status</h3>
                {canResolve && (
                  <button
                    className="button"
                    disabled={actionLoading}
                    onClick={() => updateStatus("RESOLVED")}
                  >
                    {actionLoading ? "Updating..." : "Resolve Incident"}
                  </button>
                )}

                {canClose && (
                  <>
                    <div className="field-group">
                      <label>Root Cause</label>
                      <textarea
                        placeholder="What caused the issue?"
                        value={rca.root_cause}
                        onChange={(e) =>
                          setRca((prev) => ({ ...prev, root_cause: e.target.value }))
                        }
                      />
                    </div>
                    <div className="field-group">
                      <label>Fix</label>
                      <textarea
                        placeholder="What was done to fix it?"
                        value={rca.fix}
                        onChange={(e) =>
                          setRca((prev) => ({ ...prev, fix: e.target.value }))
                        }
                      />
                    </div>
                    <div className="field-group">
                      <label>Prevention</label>
                      <textarea
                        placeholder="How will you prevent this next time?"
                        value={rca.prevention}
                        onChange={(e) =>
                          setRca((prev) => ({ ...prev, prevention: e.target.value }))
                        }
                      />
                    </div>
                    <button
                      className="button"
                      disabled={actionLoading || rcaInvalid}
                      onClick={() => updateStatus("CLOSED")}
                    >
                      {actionLoading ? "Updating..." : "Close Incident"}
                    </button>
                  </>
                )}

                {isReadOnly && (
                  <p className="muted">
                    This incident is CLOSED and is now read-only.
                  </p>
                )}
              </div>

              {(selectedIncident?.rca || isReadOnly) && (
                <div className="form-block">
                  <h3>RCA</h3>
                  {selectedIncident?.rca ? (
                    <div className="rca-block">
                      <p>
                        <span className="label">Root Cause:</span>{" "}
                        {selectedIncident.rca.root_cause || "-"}
                      </p>
                      <p>
                        <span className="label">Fix:</span>{" "}
                        {selectedIncident.rca.fix || "-"}
                      </p>
                      <p>
                        <span className="label">Prevention:</span>{" "}
                        {selectedIncident.rca.prevention || "-"}
                      </p>
                    </div>
                  ) : (
                    <p className="muted">No RCA available.</p>
                  )}
                </div>
              )}

              <div className="form-block">
                <h3>Incident Logs</h3>
                {loadingLogs ? (
                  <p className="muted">Loading logs...</p>
                ) : logs.length === 0 ? (
                  <p className="muted">No logs available.</p>
                ) : (
                  <div className="logs-container">
                    {logs.map((log, index) => (
                      <div key={index} className="log-entry">
                        <div className="log-header">
                          <span className="log-timestamp">{formatDate(log.timestamp)}</span>
                          <span className="log-component">{log.component_id}</span>
                        </div>
                        <div className="log-message">{log.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {actionError && <p className="error-text">{actionError}</p>}
              {actionSuccess && <p className="success-text">{actionSuccess}</p>}
            </>
          ) : (
            <p className="muted">Unable to load incident detail.</p>
          )}
        </section>
      </main>
    </div>
  );
}
