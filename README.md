# Incident Management System (IMS)

A scalable, distributed Incident Management System designed to ingest high-volume signals, process them asynchronously, and manage incidents through a structured workflow with real-time visibility.

---

# Overview

Modern distributed systems generate thousands of signals (errors, latency spikes, failures). This system simulates a production-grade pipeline that:

* Ingests signals at high throughput
* Buffers and processes them asynchronously
* Groups related signals into incidents (debouncing)
* Tracks incidents through a workflow lifecycle
* Requires Root Cause Analysis (RCA) before closure
* Provides a real-time dashboard for monitoring

---

# Architecture Diagram

![Architecture Diagram](./assets/IMS_high_level_architecture.drawio.png)

### System Flow Explanation

1. **Signal Producers**

   * Generate high-volume signals (burst tests, failure scenarios)

2. **Backend API**

   * Handles `/signal` ingestion
   * Applies rate limiting
   * Pushes signals to Redis queue

3. **Redis Queue (Backpressure Layer)**

   * Buffers incoming signals
   * Decouples ingestion from processing

4. **Workers (Async Processing)**

   * Consume signals from queue
   * Apply debouncing logic
   * Trigger alerting strategies

5. **Storage Layer**

   * **MongoDB (Data Lake):** Stores raw signals (audit log)
   * **PostgreSQL (Source of Truth):** Stores incidents + RCA
   * **Redis (Hot Path Cache):** Stores dashboard state

6. **Frontend Dashboard**

   * Fetches incidents via API
   * Displays real-time updates (polling every 5s)

---

# Tech Stack

* **Frontend:** React (Vite)
* **Backend:** Node.js + Express
* **Queue & Cache:** Redis
* **Database (Source of Truth):** PostgreSQL
* **Data Lake:** MongoDB
* **Aggregations:** Redis (time-bucket counters), extensible to TimescaleDB
* **Containerization:** Docker + Docker Compose

---

# Setup Instructions (Docker)

## 1. Clone repository

```bash
git clone https://github.com/Amogh052003/zeotap-IMS
cd zeotap-IMS
```

## 2. Start system

```bash
docker compose up --build --scale worker=3
```

## 3. Access services

* Frontend: http://localhost:5173
* Backend API: http://localhost:3000

## 4. Generate data

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

# Load Testing

Tested using:

```bash
autocannon -c 100 -d 10 http://localhost:3000/signal
```

Results:

* ~3500 req/sec sustained throughput
* ~25ms avg latency under concurrency
* System stable — no crashes, no dropped signals

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

* Polling every 5 seconds
* Cached responses via Redis for fast UI

---

# Alerting Strategy

Implemented using the **Strategy Pattern** — alerting logic is swappable per component type without changing core workflow code.

| Priority | Trigger | Behavior |
|----------|---------|----------|
| P0 | RDBMS / MCP failure | Immediate simulated page to on-call |
| P1 | API / Auth failure | Team notification |
| P2 | Cache strain | Logged only |

Extensible to real delivery channels:

* Slack webhooks
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

# Project Structure

```
/backend
  /api          - Express routes and rate limiting
  /workers      - Async signal consumers
  /services     - Business logic (state machine, alerting, RCA)
  /scenarios    - Failure simulation scripts
/frontend
  src/          - React dashboard
/docs
  /prompts      - AI prompts and planning notes
  /design       - Architecture decisions and design docs
docker-compose.yml
README.md
```

---

# Screenshots

### Dashboard

![Dashboard](./assets/screenshots/dashboard.png)

### Incident Detail View

![Incident Detail](./assets/screenshots/incident.png)

### RCA Form

![RCA Form](./assets/screenshots/RCA.png)

### Status Update

![Status Update](./assets/screenshots/status.png)

---

# Prompts / Specs / Plans

All planning and design artifacts are available in:

```
/docs/prompts/
/docs/design/
```

Includes architecture decisions, feature planning, and system design notes — checked in as required by submission guidelines.

---

# Bonus Features

* Scenario-based failure simulation (RDBMS + MCP outage scripts)
* Cache consistency handling with centralized invalidation
* Horizontal worker scaling via `--scale worker=3`
* Realistic cascading failure behavior across priority levels
* Load-tested and benchmarked with autocannon

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

---

# Author

**Amogh Lokhande**
DevOps / Backend Engineer
