const cors = require("cors");
const express = require("express");
const signalRoutes = require("./api/signal.routes");
const workItemRoutes = require("./api/workitem.routes");
const rateLimiter = require("./middleware/rateLimiter");
const dashboardRoutes = require("./api/dashboard.routes");
const { connectMongo } = require("./db/mongo");
const eventBus = require("./core/events/eventBus");
const redis = require("./db/redis");
const { pgPool } = require("./db/postgres");
const topologyRoutes = require("./api/topology.routes");
const {
  bootstrapResources,
} = require("./core/resources/bootstrapResources");
const {
  bootstrapDiscovery,
} = require("./core/discovery/bootstrapDiscovery");
const {
  initializeRuntimeMonitor,
} = require("./core/discovery/runtimeMonitor");
const {
  discoverDependencies,
} = require("./core/discovery/dependencyDiscovery");
const { loadPlugins } = require("./core/plugins/pluginRegistry");
const {
  initializeTopology,
} = require("./core/topology/topologyServices");
require("./core/events/eventHandlers");
require("./core/realtime/realtimeEvents");
require("./core/topology/topologyEvents");
global.crypto = require("crypto").webcrypto;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/workitem", workItemRoutes);
app.use("/signal", rateLimiter, signalRoutes);
app.use("/", dashboardRoutes);
app.use("/", topologyRoutes);
app.use("/", require("./api/plugins.routes"));
app.use("/", require("./api/integrations.routes"));
app.use("/", require("./api/settings.routes"));
app.use("/", require("./api/audit.routes"));
app.use("/", require("./api/github.routes"));
app.use("/", require("./api/repoMapping.routes"));
app.use("/", require("./api/services.routes"));
app.use("/", require("./api/logs.routes"));
app.get("/health", (req, res) => {
    res.json({
      status: "OK",
      uptime: process.uptime(),
      timestamp: new Date(),
    });
  }); 

async function ensurePostgresSchema() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS work_item_logs (
      id SERIAL PRIMARY KEY,
      work_item_id INTEGER NOT NULL REFERENCES work_items(id),
      status TEXT,
      rca JSONB,
      changed_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS plugins (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'active',
      config JSONB DEFAULT '{}',
      icon TEXT,
      subscribed_events JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS plugin_activity (
      id SERIAL PRIMARY KEY,
      plugin_name TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS integrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'pending',
      config JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      component TEXT,
      severity TEXT,
      message TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    )`,
  ];
  for (const sql of tables) {
    await pgPool.query(sql);
  }
}

async function waitForPostgres(maxAttempts = 20, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await ensurePostgresSchema();
      return;
    } catch (err) {
      const isLastAttempt = attempt === maxAttempts;
      console.warn(
        `[postgres] not ready (attempt ${attempt}/${maxAttempts}): ${err.message}`
      );
      if (isLastAttempt) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function start() {
  await connectMongo();
  bootstrapResources();
  const k8sData = await bootstrapDiscovery();
  await waitForPostgres();

  const { seedPlugins } = require("./services/pluginService");
  const { seedIntegrations } = require("./services/integrationService");
  const { seedSettings } = require("./services/settingsService");
  await seedPlugins();
  await seedIntegrations();
  await seedSettings();

  initializeTopology();
  await initializeRuntimeMonitor();
  await discoverDependencies(k8sData?.pods);

  const { initializeK8sRuntimeMonitor } = require("./core/discovery/kubernetes/k8sRuntimeMonitor");
  initializeK8sRuntimeMonitor();

  const {
    discoverAnnotationsFromCluster,
  } = require("./core/discovery/annotationDiscovery");
  if (k8sData) {
    await discoverAnnotationsFromCluster(k8sData).catch(console.error);
  }

  const {
    initializeSubscriber,
  } = require("./core/distributed/subscriber");
  initializeSubscriber().catch(console.error);

  await loadPlugins({
    redis,
    pgPool,
    eventBus,
  });

  const server = app.listen(3000, () => {
    console.log("API running");
  });

  const {
  initializeSocket,
  } = require("./core/realtime/socketServer");

  initializeSocket(server);

  server.keepAliveTimeout = 5000;
  server.headersTimeout = 6000;
  server.maxConnections = 2000;
}

start();
