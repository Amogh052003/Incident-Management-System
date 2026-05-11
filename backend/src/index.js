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
const { loadPlugins } = require("./core/plugins/pluginRegistry");
const {
  initializeTopology,
} = require("./core/topology/topologyServices");
require("./core/events/eventHandlers");
require("./core/realtime/realtimeEvents");
require("./core/topology/topologyEvents");
// Fix for Node.js crypto compatibility with Mongoose
global.crypto = require("crypto").webcrypto;

const app = express();

app.use(cors());

app.use(express.json());
app.use("/workitem", workItemRoutes);
app.use("/signal", rateLimiter, signalRoutes);
app.use("/", dashboardRoutes);
app.use("/", topologyRoutes);
app.get("/health", (req, res) => {
    res.json({
      status: "OK",
      uptime: process.uptime(),
      timestamp: new Date(),
    });
  }); 

async function ensurePostgresSchema() {
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS work_item_logs (
      id SERIAL PRIMARY KEY,
      work_item_id INTEGER NOT NULL REFERENCES work_items(id),
      status TEXT,
      rca JSONB,
      changed_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
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
      if (isLastAttempt) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function start() {
  await connectMongo();
  await waitForPostgres();
  bootstrapResources();
  await bootstrapDiscovery();
  initializeTopology();
  await initializeRuntimeMonitor();

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
