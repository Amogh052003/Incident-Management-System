import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X, Server, AlertTriangle, FileText, GitPullRequest,
  Loader, CheckCircle, Clock, Activity, Zap,
  ExternalLink, Copy, Check, List,
} from "lucide-react";

function generateTemplate(data) {
  if (!data?.health) return { title: "Incident Report", body: "Service data unavailable — automated template could not be generated." };
  const severity = data.severity || "P3";
  const isDegraded = data.health === "degraded";
  const title = `[${severity}] ${data.service}${isDegraded ? " degradation caused by infrastructure failure" : " health incident"}`;

  const depsList = data.dependencies?.length
    ? data.dependencies.map((d) => `- ${d}`).join("\n")
    : "- None";

  const dependentsList = data.dependents?.length
    ? data.dependents.map((d) => `- ${d}`).join("\n")
    : "- None";

  const timelineBlock = data.timeline?.length
    ? data.timeline.map((t) => {
        const time = t.time ? new Date(t.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "??:??";
        return `${time} ${t.event}`;
      }).join("\n")
    : "- No events recorded";

  const investigationAreas = data.dependencies?.length
    ? data.dependencies.map((d) => `- ${d} saturation / connectivity`).join("\n") + "\n- Retry storm handling\n- Connection pooling configuration"
    : "- Review service logs for error patterns\n- Check resource utilization and limits\n- Verify upstream dependency health";

  const body = `## Incident Summary

The \`${data.service}\` service is currently **${data.health.toUpperCase()}**.

## Current Service Health

| Property | Value |
|---|---|
| Status | ${data.health.toUpperCase()} |
| Namespace | ${data.namespace} |
| Severity | ${severity} |
| Runtime | ${data.runtime} |

## Dependencies

${depsList}

## Impacted Services

${dependentsList}

## Timeline

${timelineBlock}

## Suggested Investigation Areas

${investigationAreas}
`;

  return { title, body };
}

export default function IssueWorkspace({ service, installation, onClose, onIssueCreated }) {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [raising, setRaising] = useState(false);
  const [raised, setRaised] = useState(false);
  const [issueResult, setIssueResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/github/workspace/${service}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load workspace");
          setLoading(false);
          return;
        }
        if (!data.health) {
          setError("Service data is incomplete");
          setLoading(false);
          return;
        }
        setWorkspace(data);
        const template = generateTemplate(data);
        setTitle(template.title);
        setBody(template.body);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    load();
  }, [service]);

  function regenerate() {
    if (!workspace) return;
    const template = generateTemplate(workspace);
    setTitle(template.title);
    setBody(template.body);
  }

  async function raiseIssue() {
    setRaising(true);
    setError(null);
    try {
      const res = await fetch("/github/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, title, body }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create issue");
      }
      const data = await res.json();
      setIssueResult(data.issue);
      setRaised(true);
      setToast(`#${data.issue.number} · ${data.issue.title}`);
      setTimeout(() => setToast(null), 4000);
      onIssueCreated?.();
    } catch (err) {
      setError(err.message);
    }
    setRaising(false);
  }

  async function copyIssueLink() {
    if (!issueResult?.html_url) return;
    try {
      await navigator.clipboard.writeText(issueResult.html_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <motion.div className="github-workspace-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {toast && (
        <motion.div className="github-toast"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
        >
          <CheckCircle size={18} />
          <span>Issue raised — {toast}</span>
        </motion.div>
      )}
      <motion.div className="github-workspace"
        initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="github-workspace-header">
          <GitPullRequest size={16} />
          <span>Issue Workspace — {service}</span>
          <button className="github-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {loading ? (
          <div className="github-workspace-center"><Loader size={20} className="spin" /> Loading workspace...</div>
        ) : error || !workspace ? (
          <div className="github-workspace-center">{error || "Failed to load workspace data"}</div>
        ) : raised && issueResult ? (
          <div className="github-workspace-success">
            <CheckCircle size={36} className="github-success-icon" />
            <h3>GitHub Issue Created Successfully</h3>
            <div className="github-success-details">
              <span className="github-success-issue">Issue <strong>#{issueResult.number}</strong></span>
              <span className="github-success-repo">{issueResult.html_url?.replace(/https?:\/\/github\.com\//, "").replace(/\/issues\/\d+/, "")}</span>
            </div>
            <div className="github-success-actions">
              <a
                href={issueResult.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="github-success-btn"
              >
                <ExternalLink size={14} /> Open Issue
              </a>
              <button className="github-success-btn" onClick={copyIssueLink}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy Issue Link"}
              </button>
              <button className="github-success-btn github-success-btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="github-workspace-body">
            <div className="github-workspace-left">
              <div className="github-ws-section">
                <div className="github-ws-section-title"><Activity size={13} /> Service Status</div>
                <div className="github-ws-status-grid">
                  <div className="github-ws-status-item">
                    <span className="github-ws-label">Status</span>
                    <span className={`github-ws-value ${workspace.health}`}>{workspace.health.toUpperCase()}</span>
                  </div>
                  <div className="github-ws-status-item">
                    <span className="github-ws-label">Namespace</span>
                    <span className="github-ws-value">{workspace.namespace}</span>
                  </div>
                  <div className="github-ws-status-item">
                    <span className="github-ws-label">Severity</span>
                    <span className="github-ws-value">{workspace.severity}</span>
                  </div>
                  <div className="github-ws-status-item">
                    <span className="github-ws-label">Runtime</span>
                    <span className="github-ws-value">{workspace.runtime}</span>
                  </div>
                  <div className="github-ws-status-item">
                    <span className="github-ws-label">Incidents</span>
                    <span className="github-ws-value" style={workspace.incidentsCount > 0 ? { color: "#ef4444" } : {}}>
                      {workspace.incidentsCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="github-ws-section">
                <div className="github-ws-section-title"><List size={13} /> Dependencies</div>
                <div className="github-ws-list">
                  {workspace.dependencies?.length > 0
                    ? workspace.dependencies.map((d) => <div key={d} className="github-ws-list-item"><Server size={11} /> {d}</div>)
                    : <div className="github-ws-list-empty">No dependencies</div>}
                </div>
              </div>

              <div className="github-ws-section">
                <div className="github-ws-section-title"><AlertTriangle size={13} /> Blast Radius</div>
                <div className="github-ws-list">
                  {workspace.dependents?.length > 0
                    ? workspace.dependents.map((d) => <div key={d} className="github-ws-list-item"><Server size={11} /> {d}</div>)
                    : <div className="github-ws-list-empty">No impacted services</div>}
                </div>
              </div>

              <div className="github-ws-section">
                <div className="github-ws-section-title"><Clock size={13} /> Timeline</div>
                <div className="github-ws-timeline">
                  {workspace.timeline?.length > 0
                    ? workspace.timeline.map((t, i) => (
                        <div key={i} className="github-ws-timeline-entry">
                          <span className="github-ws-timeline-time">
                            {t.time ? new Date(t.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "??:??"}
                          </span>
                          <span className="github-ws-timeline-event">{t.event}</span>
                        </div>
                      ))
                    : <div className="github-ws-list-empty">No events recorded</div>}
                </div>
              </div>
            </div>

            <div className="github-workspace-right">
              <div className="github-ws-field">
                <label className="github-ws-field-label">Issue Title</label>
                <input
                  className="github-ws-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="github-ws-field github-ws-editor-field">
                <div className="github-ws-editor-header">
                  <label className="github-ws-field-label">Issue Details</label>
                  <button className="github-template-btn" onClick={regenerate}>
                    <FileText size={12} /> Generate Operational Template
                  </button>
                </div>
                <textarea
                  className="github-ws-editor"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>

              {error && <div className="github-ws-error-msg">{error}</div>}

              <div className="github-ws-actions">
                <button className="github-modal-cancel" onClick={onClose}>Cancel</button>
                <button className="github-raise-btn" onClick={raiseIssue} disabled={raising || !title.trim()}>
                  {raising ? <><Loader size={14} className="spin" /> Creating...</> : "Raise GitHub Issue"}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
