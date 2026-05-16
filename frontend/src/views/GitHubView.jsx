import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, XCircle, AlertTriangle,
  Server, MapPin, BookOpen,
  RefreshCw, Loader, ExternalLink,
  X, ArrowUpRight, Copy, Check,
} from "lucide-react";
import IssueWorkspace from "../components/github/IssueWorkspace";

const GithubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const STATUS_COLORS = {
  healthy: "#22c55e",
  degraded: "#ef4444",
  unknown: "#6b7280",
};

export default function GitHubView() {
  const [installation, setInstallation] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showRepoModal, setShowRepoModal] = useState(null);
  const [repoModalCallback, setRepoModalCallback] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    function checkInstallOnFocus() {
      if (installation) return;
      fetch("/github/installation")
        .then((r) => r.json())
        .then((data) => {
          if (data.connected) {
            setInstallation(data);
            fetch("/github/services")
              .then((r) => r.json())
              .then((res) => setServices(res.services || []))
              .catch(() => {});
          }
        })
        .catch(() => {});
    }
    window.addEventListener("focus", checkInstallOnFocus);
    return () => window.removeEventListener("focus", checkInstallOnFocus);
  }, [installation]);

  async function loadAll() {
    setLoading(true);
    try {
      const [instRes, servicesRes] = await Promise.all([
        fetch("/github/installation").then((r) => r.json()),
        fetch("/github/services").then((r) => r.json()),
      ]);
      if (instRes.connected) setInstallation(instRes);
      setServices(servicesRes.services || []);
    } catch (err) {
      console.error("Failed to load GitHub data", err);
    }
    setLoading(false);
  }

  async function connectGitHub() {
    setConnecting(true);
    setConnectError(null);
    try {
      const res = await fetch("/github/install");
      const data = await res.json();
      if (!res.ok) {
        setConnectError(data.error || "GitHub App not configured");
      } else if (data.alreadyConnected) {
        setInstallation(data.installation);
        fetch("/github/services")
          .then((r) => r.json())
          .then((res) => setServices(res.services || []))
          .catch(() => {});
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setConnectError("Could not reach the server");
    }
    setConnecting(false);
  }

  async function saveRepoMapping(service, repo) {
    try {
      const res = await fetch(`/repo-mappings/${service}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo }),
      });
      if (!res.ok) {
        const err = await res.json();
        return { error: err.error || "Failed to save mapping" };
      }
      await loadAll();
      return { success: true };
    } catch (err) {
      return { error: "Failed to save mapping" };
    }
  }

  function handleServiceClick(svc) {
    if (svc.repo) {
      setSelectedService(svc.name);
    } else {
      setShowRepoModal(svc.name);
    }
  }

  function handleRepoModalSave(service, repo) {
    setRepoModalCallback({ service, repo });
    setShowRepoModal(null);
  }

  useEffect(() => {
    if (!repoModalCallback) return;
    const { service, repo } = repoModalCallback;
    setRepoModalCallback(null);
    saveRepoMapping(service, repo).then((result) => {
      if (!result.error) {
        setSelectedService(service);
      }
    });
  }, [repoModalCallback]);

  if (loading) {
    return (
      <div className="github-view">
        <div className="github-loading"><Loader size={24} className="spin" /> <span>Loading...</span></div>
      </div>
    );
  }

  const connected = !!installation;
  const healthyCount = services.filter((s) => s.status === "healthy").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;
  const mappedCount = services.filter((s) => s.repo).length;

  if (!connected) {
    return (
      <div className="github-view">
        <div className="github-disconnected-screen">
          <div className="github-disconnected-icon"><GithubIcon size={48} /></div>
          <h2 className="github-disconnected-title">GitHub Integration Required</h2>
          <p className="github-disconnected-desc">
            Connect GitHub to enable operational issue creation,<br />
            incident escalation, deployment correlation,<br />
            and engineering workflows.
          </p>
          <button className="github-connect-btn github-connect-btn-large" onClick={connectGitHub} disabled={connecting}>
            {connecting ? "Connecting..." : "Connect with GitHub"}
          </button>
          <button
            className="github-connect-btn"
            onClick={loadAll}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? "Checking..." : "Already installed? Re-check connection"}
          </button>
          {connectError && <div className="github-connect-error">{connectError}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="github-view">
      <div className="github-connected-header">
        <div className="github-connected-header-left">
          <CheckCircle size={18} className="github-connected-icon" />
          <div>
            <div className="github-connected-title">GitHub Connected</div>
            <div className="github-connected-sub">Organization: {installation.organization}</div>
          </div>
        </div>
        <div className="github-connected-header-right">
          <span className="github-header-stat"><Server size={13} /> {services.length} services</span>
          <span className="github-header-stat"><BookOpen size={13} /> {mappedCount} mapped</span>
          <button className="github-refresh-btn" onClick={loadAll} title="Refresh"><RefreshCw size={14} /></button>
        </div>
      </div>

      <div className="github-summary-row">
        <div className="github-summary-card"><span className="github-summary-value">{services.length}</span><span>Total Services</span></div>
        <div className="github-summary-card"><span className="github-summary-value" style={{ color: "#22c55e" }}>{healthyCount}</span><span>Healthy</span></div>
        <div className="github-summary-card"><span className="github-summary-value" style={{ color: "#ef4444" }}>{degradedCount}</span><span>Degraded</span></div>
        <div className="github-summary-card"><span className="github-summary-value">{mappedCount}</span><span>Repo Mapped</span></div>
      </div>

      <div className="github-services-section">
        <div className="github-services-header">
          <Server size={14} />
          <span>Discovered Services</span>
          <span className="github-services-count">{services.length} total</span>
        </div>

        <div className="github-services-grid">
          {services.length === 0 && (
            <div className="github-services-empty">No services discovered</div>
          )}
          {services.map((svc, i) => {
            const isMapped = !!svc.repo;
            return (
              <motion.div
                key={svc.name}
                className={`github-service-card ${isMapped ? "github-svc-mapped" : "github-svc-unmapped"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleServiceClick(svc)}
              >
                <div className="github-service-top">
                  <div className="github-service-name-row">
                    <span className="github-service-dot" style={{ background: STATUS_COLORS[svc.status] || STATUS_COLORS.unknown }} />
                    <span className="github-service-name">{svc.name}</span>
                  </div>
                  <span className={`github-service-badge ${isMapped ? "badge-connected" : "badge-notconnected"}`}>
                    {isMapped ? "CONNECTED" : "NOT CONNECTED"}
                  </span>
                </div>

                <div className="github-service-meta">
                  <span><MapPin size={11} /> {svc.namespace}</span>
                  <span className={`github-health-label ${svc.status}`}>{svc.status}</span>
                  {svc.incidentsCount > 0 && (
                    <span className="github-incident-badge"><AlertTriangle size={11} /> {svc.incidentsCount}</span>
                  )}
                </div>

                <div className="github-service-repo-row">
                  {isMapped ? (
                    <>
                      <BookOpen size={12} className="github-repo-icon" />
                      <span className="github-repo-name">{svc.repo.fullName}</span>
                      <span className="github-mapping-label">
                        {svc.mappingSource === "annotation" ? "via K8s annotation" : "via manual mapping"}
                      </span>
                    </>
                  ) : (
                    <span className="github-norepo-text">Repository not connected — annotations not found</span>
                  )}
                </div>

                <div className="github-service-action-hint">
                  {isMapped ? (
                    <span><ExternalLink size={11} /> Raise Issue</span>
                  ) : (
                    <span><BookOpen size={11} /> Connect Repository</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showRepoModal && (
          <RepoMappingModal
            service={showRepoModal}
            onSave={handleRepoModalSave}
            onClose={() => setShowRepoModal(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedService && (
          <IssueWorkspace
            service={selectedService}
            installation={installation}
            onClose={() => setSelectedService(null)}
            onIssueCreated={() => loadAll()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RepoMappingModal({ service, onSave, onClose }) {
  const [repo, setRepo] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSave() {
    if (!repo.trim()) return;
    setValidating(true);
    setError(null);
    try {
      const validRes = await fetch("/github/validate-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: repo.trim() }),
      });
      const validData = await validRes.json();
      if (!validRes.ok || validData.valid === false) {
        setError(validData.error || "Repository not found or not accessible");
        setValidating(false);
        return;
      }
    } catch (err) {
      setError("Could not validate repository access");
      setValidating(false);
      return;
    }
    setValidating(false);
    onSave(service, repo.trim());
  }

  return (
    <motion.div className="github-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div className="github-modal"
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="github-modal-header">
          <BookOpen size={16} />
          <span>Connect Repository</span>
          <button className="github-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="github-modal-body">
          <p className="github-modal-desc">
            This service does not currently have a GitHub repository mapping.
            Enter the repository name to continue.
          </p>
          <div className="github-modal-field">
            <label>Repository Name</label>
            <input
              ref={inputRef}
              type="text"
              value={repo}
              onChange={(e) => { setRepo(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="zeotap/api-gateway"
            />
          </div>
          {error && <div className="github-modal-error">{error}</div>}
        </div>
        <div className="github-modal-footer">
          <button className="github-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="github-modal-save" onClick={handleSave} disabled={!repo.trim() || validating}>
            {validating ? "Validating..." : "Connect Repository"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
