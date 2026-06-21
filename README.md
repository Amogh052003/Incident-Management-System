# Incident Management System (IMS)

A scalable, distributed Incident Management System designed to ingest high-volume signals, process them asynchronously, and manage incidents through a structured workflow with real-time visibility, runtime topology discovery, and extensible plugin/integration architecture.

---

# Problem Statement

Modern engineering teams operate highly distributed systems composed of APIs, databases, workers, caches, authentication services, message queues, and third-party integrations. When failures occur, organizations often struggle to quickly identify the root cause, understand the blast radius, coordinate response efforts, and communicate operational impact across teams.

Existing monitoring solutions primarily focus on metrics, logs, and alerts independently, but they frequently lack:

* centralized operational incident correlation,
* topology-aware impact visualization,
* realtime dependency propagation,
* integrated incident workflows,
* extensible automation pipelines,
* and self-hosted lightweight operational control planes.

As systems scale, a single infrastructure failure can cascade across multiple services, causing downstream outages and degraded user experience. Engineers are forced to manually correlate logs, alerts, dashboards, and tickets across fragmented tools such as Grafana, GitHub, Jira, Slack, Prometheus, and cloud monitoring systems.

This results in:

* slow incident response,
* delayed root cause analysis,
* alert fatigue,
* operational blind spots,
* and increased Mean Time To Resolution (MTTR).

There is a need for a lightweight, extensible, self-hosted Incident Management and Operational Intelligence Platform that can:

* ingest and correlate operational signals,
* model infrastructure/service dependencies,
* visualize realtime system health,
* propagate impact across service topology,
* automate workflows through plugins,
* integrate with existing engineering tools,
* and provide a centralized operational response interface.

The platform should support:

* realtime incident tracking,
* distributed event processing,
* plugin-based integrations,
* operational topology visualization,
* alert orchestration,
* audit logging,
* and deployment through Docker Compose or Kubernetes for easy self-hosting.

The goal is to provide engineering teams with a unified operational intelligence layer that transforms raw infrastructure signals into actionable operational awareness.

---

# Overview

Modern distributed systems generate thousands of signals (errors, latency spikes, failures). This system simulates a production-grade pipeline that:

* Ingests signals at high throughput
* Buffers and processes them asynchronously
* Groups related signals into incidents (debouncing)
* Tracks incidents through a workflow lifecycle
* Requires Root Cause Analysis (RCA) before closure
* Discovers runtime infrastructure (Docker + Kubernetes)
* Builds operational topology from runtime state
* Provides real-time dashboard with WebSocket updates
* Extends via plugins and third-party integrations

---

# Tech Stack

* **Frontend:** React (Vite)
* **Backend:** Node.js + Express
* **Queue & Cache:** Redis
* **Database (Source of Truth):** PostgreSQL
* **Data Lake:** MongoDB
* **Real-time:** Socket.IO (WebSockets)
* **Containerization:** Docker + Docker Compose
* **Orchestration:** Kubernetes (k8s manifests)
* **Runtime Discovery:** Docker SDK + Kubernetes API

---

# Setup Instructions (Docker)

## 1. Clone repository

```bash
git clone https://github.com/Amogh052003/zeotap-IMS
cd zeotap-IMS
```

## 2. Configure environment

Copy the environment template and configure integrations as needed:

```bash
cp .env.example .env
```

## 3. Start system

```bash
docker compose up --build --scale worker=3
```

## 4. Access services

* Frontend: http://localhost:5173
* Backend API: http://localhost:3000

## 5. Generate data

```bash
node backend/scenarios/rdbms-outage.js
```

---

# Backpressure Handling

To handle bursts up to **10,000 signals/sec**, the system decouples ingestion from persistence using a Redis queue.

```
API → Redis Queue → Worker → DB
```

* Signals are pushed to the Redis queue instantly — the API never waits for a DB write
* Workers consume and persist asynchronously at their own pace
* **Even if PostgreSQL slows to 100 writes/sec, the API continues accepting at full speed — the queue absorbs the burst**
* Prevents database overload and ensures the system never crashes under load

---

# Key Features

## 1. High Throughput Ingestion

* Handles burst traffic (~2000–4000 req/sec locally tested)
* Non-blocking ingestion via Redis queue

## 2. Async Processing

* Worker-based architecture
* Decouples ingestion from persistence

## 3. Debouncing Logic

* Multiple signals for same `component_id` grouped into one incident
* Prevents incident explosion during burst failures

## 4. Multi-Layer Storage

* MongoDB → raw signals (audit log)
* PostgreSQL → structured incidents + RCA
* Redis → hot-path dashboard cache

## 5. Workflow Engine

```
OPEN → INVESTIGATING → RESOLVED → CLOSED
```

* Enforced transitions — invalid transitions are rejected
* State-based behavior via the State pattern

## 6. Mandatory RCA

Incident cannot move to `CLOSED` without:

* Root cause
* Fix applied
* Prevention steps

## 7. MTTR Calculation

Automatically computed from:

```
MTTR = end_time - start_time
```

## 8. Rate Limiting

* Protects ingestion API from overload
* Prevents cascading failures

## 9. Real-Time Dashboard

* WebSocket-based real-time updates (via Socket.IO)
* Cached responses via Redis for fast UI
* Overview with P0/P1 counters, active incident timelines

## 10. Runtime Infrastructure Discovery

* Auto-discovers Docker containers and Kubernetes pods
* Builds service dependency graph from runtime state
* Monitors container health, CPU, memory, and network metrics

## 11. Operational Topology

* Real-time topology graph visualization
* Service dependency mapping
* Health status propagation across dependent services
* Visual impact analysis during incidents

## 12. Plugin System

* Extensible plugin architecture with event-driven hooks
* Slack plugin for alert notifications
* Plugin registry with enable/disable/toggle controls
* Activity feed for plugin actions

## 13. Integration Management

* Pre-configured integrations: Slack, GitHub, Jira, Prometheus, PagerDuty
* Status tracking per integration (pending, configured, active, error)
* Configuration management via UI

## 14. GitHub Integration

* GitHub App authentication with JWT-based tokens
* Automatic issue creation for incidents
* Repository-to-service mapping (manual + annotation-based)
* Installation management and webhook handling
* Incident-issue linking with bidirectional navigation

## 15. Audit Logging

* Event-driven audit trail for all system operations
* Filterable by event type, component, severity
* Timestamped, structured log entries with metadata

## 16. Logs Service

* Centralized log search with full-text query
* Filtering by source, severity, component, time range
* Paginated results

## 17. Settings Management

* Key-value settings store with category grouping
* System-wide configurable parameters

## 18. Services View

* Per-service detail view with runtime info
* Docker container and Kubernetes pod metrics
* Live container logs (Docker + K8s)
* Uptime, status, and resource usage

## 19. Kubernetes Support

* Native Kubernetes manifests (namespace, backend, redis)
* K8s-aware service discovery and monitoring
* Pod-level health and metrics tracking

---

# Alerting Strategy

Implemented using the **Strategy Pattern** — alerting logic is swappable per component type without changing core workflow code.

| Priority | Trigger | Behavior |
|----------|---------|----------|
| P0 | RDBMS / MCP failure | Immediate simulated page to on-call |
| P1 | API / Auth failure | Team notification |
| P2 | Cache strain | Logged only |

Extensible to real delivery channels:

* Slack webhooks (via Slack plugin)
* Email (SendGrid / SES)
* PagerDuty API

---

# Timeseries Aggregations

The system supports time-based aggregations using Redis counters:

* Signals per time bucket: `signals:YYYY-MM-DD:HH`
* Severity-based aggregation: `severity:P0:<timestamp>`

This enables:

* Monitoring signal volume per time window
* Tracking severity trends
* Observability for incident spikes

### Future Extension

* TimescaleDB (PostgreSQL extension) for long-term retention
* InfluxDB for large-scale metrics pipelines

---

# Concurrency & Consistency

* PostgreSQL transactions ensure atomic updates — status and RCA are written together or not at all
* Prevents race conditions during concurrent status updates to the same incident
* Redis queue guarantees ordered signal processing per component
* Multiple workers operate independently without conflict — debounce keys in Redis prevent duplicate incident creation

---

# API Endpoints

### Signal Ingestion

```
POST /signal
```

### Incidents

```
GET  /incidents
GET  /incidents/:id
```

### Logs

```
GET  /incidents/:id/logs
```

### Status Update

```
POST /workitem/:id/status
```

### Health

```
GET  /health
```

### Topology

```
GET  /topology
```

### Dashboard

```
GET  /dashboard
```

### Services

```
GET  /services/:name
GET  /services/:name/logs
```

### Plugins

```
GET  /plugins
GET  /plugins/:id
PUT  /plugins/:id
GET  /plugins/activity/feed
```

### Integrations

```
GET  /integrations
GET  /integrations/:name
PUT  /integrations/:name
```

### Settings

```
GET  /settings
GET  /settings/:key
PUT  /settings/:key
```

### Audit

```
POST /audit/log
GET  /audit/logs
GET  /audit/filters
```

### GitHub

```
GET  /github/installations
POST /github/installations/fetch
GET  /github/mappings
POST /github/mappings
POST /github/issues
GET  /github/issues/:incidentId
GET  /github/install-url
POST /github/webhook
```

---

# Failure Simulation (Sample Data)

## RDBMS Outage

Simulates a cascading database failure:

1. Database goes down (P0)
2. API failures begin (P1)
3. Auth failures (P1)
4. Cache strain (P2)

```bash
node backend/scenarios/rdbms-outage.js
```

## MCP Host Failure

Simulates a config/control plane failure:

1. MCP unavailable (P0)
2. Services misconfigured (P1)
3. Auth/API failures (P1)
4. Monitoring detects instability (P2)

```bash
node backend/scenarios/mcp-outage.js
```

---

# Testing

```bash
npm test
```

### Covered Cases

* RCA validation — mandatory fields enforced, incomplete RCA rejected
* Status transitions — invalid transitions blocked (e.g. OPEN → CLOSED)
* API input validation

### Future Improvements

* Integration tests for full worker pipeline
* Load testing automation
* End-to-end UI testing

---

# Project Structure

```
/backend
  /api          - Express routes (signal, workitem, topology, plugins, integrations, settings, audit, github, services, logs)
  /core         - Core logic (events, resources, discovery, topology, plugins, realtime, distributed)
  /db           - Database connections (PostgreSQL, MongoDB, Redis)
  /middleware   - Rate limiting middleware
  /models       - Mongoose models (GitHubInstallation, RepoMapping, IncidentIssueLink)
  /plugins      - Plugin implementations (Slack)
  /services     - Business logic (signal, workflow, alerting, RCA, dashboard, plugin, integration, settings, audit, github, log)
  /states       - State machine (State pattern)
  /strategies   - Alerting strategies (Strategy pattern)
  /workers      - Async signal consumers
  /scenarios    - Failure simulation scripts
/frontend
  src/
    /components - Reusable UI components (topology graph, service detail, metrics panel)
    /hooks      - Custom React hooks (useIncidents)
    /incidents  - Incident-related components
    /layout     - Layout components (TopNavbar, Sidebar)
    /views      - Page views (Overview, Topology, Incidents, Services, RCA, GitHub, Plugins, Integrations, Settings, Audit, Logs, Timeline)
/k8s           - Kubernetes manifests (namespace, backend, redis)
docker-compose.yaml
README.md
```

---

# Dashboard Views

* **Overview** — Real-time summary with P0/P1 counters, active incidents, timeline
* **Topology** — Live service dependency graph with health status propagation
* **Incidents** — Incident list with status, priority, and filtering
* **Services** — Per-service runtime detail, metrics, and live logs
* **RCA** — Root Cause Analysis form and review
* **GitHub** — GitHub App installation, repo mappings, and incident-issue links
* **Plugins** — Plugin registry with enable/disable controls and activity feed
* **Integrations** — Third-party integration management (Slack, Jira, Prometheus, PagerDuty)
* **Settings** — System-wide configuration

---

# Notable Challenge: Cache Invalidation

### Problem

The dashboard used multiple Redis keys:

```
dashboard:all
dashboard:status:*
dashboard:incident:<id>
```

Partial invalidation caused stale UI — the list view would show a different status than the detail view for the same incident.

### Fix

Centralized invalidation after every write operation:

```
DEL dashboard:*
```

This ensures full consistency across all views at the cost of one extra cache miss per write — an acceptable tradeoff for correctness.

---

# Bonus Features

* Scenario-based failure simulation (RDBMS + MCP outage scripts)
* Cache consistency handling with centralized invalidation
* Horizontal worker scaling via `--scale worker=3`
* Realistic cascading failure behavior across priority levels
* Load-tested and benchmarked with autocannon
* Runtime infrastructure discovery (Docker + Kubernetes)
* WebSocket-based real-time updates
* Plugin architecture with event-driven hooks
* GitHub App integration with issue auto-creation
* Kubernetes-native deployment support

---

# Conclusion

This project demonstrates:

* Scalable ingestion pipeline with backpressure handling
* Async distributed processing via worker pool
* Multi-database architecture with clear separation of concerns
* Cache optimization and consistency-safe invalidation
* Time-series aggregation support
* Real-time incident tracking with enforced workflow
* Production-style design patterns (Strategy + State)
* Runtime infrastructure discovery and topology visualization
* Extensible plugin and integration architecture
* Kubernetes-native deployment model

---

# Author

**Amogh Lokhande**
DevOps / Backend Engineer
