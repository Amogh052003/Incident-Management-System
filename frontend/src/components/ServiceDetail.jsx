import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X, Server, Activity, Clock, CheckCircle, XCircle, AlertTriangle,
  Cpu, HardDrive, Network, Radio, Terminal, GitBranch, ArrowUp,
} from "lucide-react";

function formatUptime(seconds) {
  if (!seconds) return "N/A";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) { val /= 1024; i++; }
  return `${val.toFixed(1)} ${units[i]}`;
}

export default function ServiceDetail({ name, onClose }) {
  const [service, setService] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [tab, setTab] = useState("overview");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    setError(null);
    fetch(`/services/${encodeURIComponent(name)}`)
      .then(r => r.ok ? r.json() : Promise.reject("Not found"))
      .then(setService)
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, [name]);

  useEffect(() => {
    if (!name || tab !== "logs") return;
    setLoadingLogs(true);
    fetch(`/services/${encodeURIComponent(name)}/logs?limit=50`)
      .then(r => r.json())
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoadingLogs(false));
  }, [name, tab]);

  if (!name) return null;

  const statusColor = service?.state?.status === "healthy" ? "#22c55e"
    : service?.state?.status === "degraded" ? "#ef4444"
    : "#6b7280";

  return (
    <motion.aside
      className="incident-detail"
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      transition={{ duration: 0.25 }}
      style={{ width: 440 }}
    >
      <div className="incident-detail-header">
        <span className="incident-detail-title">
          <Server size={14} style={{ marginRight: 6 }} />
          {name}
        </span>
        <button className="incident-detail-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {loading ? (
        <div className="incident-detail-loading">Loading...</div>
      ) : error ? (
        <div className="incident-detail-loading" style={{ color: "#ef4444" }}>
          Service not found
        </div>
      ) : service ? (
        <>
          <div className="service-detail-tabs">
            {["overview", "logs", "dependencies"].map(t => (
              <button
                key={t}
                className={`service-detail-tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "overview" && <Activity size={12} />}
                {t === "logs" && <Terminal size={12} />}
                {t === "dependencies" && <GitBranch size={12} />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="incident-detail-body">
            {tab === "overview" && (
              <div className="service-detail-overview">
                <div className="detail-summary">
                  <span className="service-card-status-badge" style={{
                    background: `${statusColor}22`,
                    color: statusColor,
                    border: `1px solid ${statusColor}44`,
                  }}>
                    {service.state?.status === "healthy" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {service.state?.status || "unknown"}
                  </span>
                  <span className="service-tag">{service.type || "service"}</span>
                  {service.runtime && <span className="service-tag">{service.runtime}</span>}
                </div>

                {service.state?.incidents?.length > 0 && (
                  <div className="detail-field" style={{ color: "#ef4444" }}>
                    <AlertTriangle size={13} />
                    <span className="detail-field-label">Incidents</span>
                    <span className="detail-field-value">{service.state.incidents.length} active</span>
                  </div>
                )}

                <div className="detail-grid" style={{ marginTop: 12 }}>
                  {service.uptime && (
                    <>
                      <div className="service-metric-box">
                        <Clock size={14} color="#6b7280" />
                        <span className="service-metric-value">{formatUptime(service.uptime.uptime)}</span>
                        <span className="service-metric-label">Uptime</span>
                      </div>
                      <div className="service-metric-box">
                        <ArrowUp size={14} color="#6b7280" />
                        <span className="service-metric-value">
                          {service.uptime.startedAt
                            ? new Date(service.uptime.startedAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                        <span className="service-metric-label">Started</span>
                      </div>
                    </>
                  )}

                  {service.metrics?.cpu && (
                    <div className="service-metric-box">
                      <Cpu size={14} color="#6b7280" />
                      <span className="service-metric-value">{service.metrics.cpu.usage}%</span>
                      <span className="service-metric-label">CPU</span>
                    </div>
                  )}
                  {service.metrics?.memory && (
                    <div className="service-metric-box">
                      <HardDrive size={14} color="#6b7280" />
                      <span className="service-metric-value">{service.metrics.memory.usagePercent}%</span>
                      <span className="service-metric-label">Memory</span>
                    </div>
                  )}
                  {service.metrics?.network && (
                    <div className="service-metric-box">
                      <Network size={14} color="#6b7280" />
                      <span className="service-metric-value">{formatBytes(service.metrics.network.rxBytes)}</span>
                      <span className="service-metric-label">Network RX</span>
                    </div>
                  )}
                </div>

                {service.uptime?.conditions && service.uptime.conditions.length > 0 && (
                  <div className="detail-field" style={{ flexDirection: "column", alignItems: "stretch", gap: 6, padding: "12px 0" }}>
                    <span className="detail-field-label">Conditions</span>
                    {service.uptime.conditions.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem" }}>
                        {c.status === "True"
                          ? <CheckCircle size={12} color="#22c55e" />
                          : <XCircle size={12} color="#ef4444" />
                        }
                        <span style={{ color: "#d4dae8" }}>{c.type}</span>
                        <span style={{ color: "#6b7280", marginLeft: "auto" }}>
                          {c.lastTransitionTime ? new Date(c.lastTransitionTime).toLocaleString() : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {service.metrics?.restartCount !== undefined && (
                  <div className="detail-field">
                    <Activity size={13} />
                    <span className="detail-field-label">Restarts</span>
                    <span className="detail-field-value">{service.metrics.restartCount}</span>
                  </div>
                )}

                {service.metadata?.image && (
                  <div className="detail-field">
                    <Radio size={13} />
                    <span className="detail-field-label">Image</span>
                    <span className="detail-field-value" style={{ fontSize: "0.78rem" }}>{service.metadata.image}</span>
                  </div>
                )}

                {service.uptime?.podIP && (
                  <div className="detail-field">
                    <Radio size={13} />
                    <span className="detail-field-label">Pod IP</span>
                    <span className="detail-field-value">{service.uptime.podIP}</span>
                  </div>
                )}

                {service.uptime?.nodeName && (
                  <div className="detail-field">
                    <Radio size={13} />
                    <span className="detail-field-label">Node</span>
                    <span className="detail-field-value">{service.uptime.nodeName}</span>
                  </div>
                )}
              </div>
            )}

            {tab === "logs" && (
              <div className="detail-logs">
                {loadingLogs ? (
                  <div className="incident-detail-loading">Loading logs...</div>
                ) : logs.length === 0 ? (
                  <div className="incident-detail-loading">No logs available</div>
                ) : (
                  <div className="logs-container" style={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}>
                    {logs.map((log, i) => (
                      <div key={i} className="log-entry" style={{ fontSize: "0.75rem" }}>
                        <div className="log-header">
                          <span className="log-component" style={{ fontSize: "0.7rem" }}>{log.source}</span>
                          <span className="log-timestamp" style={{ fontSize: "0.7rem" }}>
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="log-message" style={{ fontFamily: "monospace", fontSize: "0.72rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{log.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "dependencies" && (
              <div>
                {service.dependencies?.length > 0 && (
                  <div className="detail-rca">
                    <h4 style={{ marginTop: 0 }}><ArrowUp size={13} /> Depends On</h4>
                    <div className="service-card-tags">
                      {service.dependencies.map(d => (
                        <span key={d} className="service-tag">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
                {service.dependents?.length > 0 && (
                  <div className="detail-rca">
                    <h4><ArrowUp size={13} style={{ transform: "rotate(180deg)" }} /> Depended By</h4>
                    <div className="service-card-tags">
                      {service.dependents.map(d => (
                        <span key={d} className="service-tag">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(!service.dependencies?.length && !service.dependents?.length) && (
                  <div className="incident-detail-loading">No dependencies</div>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}
    </motion.aside>
  );
}
