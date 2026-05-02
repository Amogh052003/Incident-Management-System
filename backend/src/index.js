const express = require("express");
const signalRoutes = require("./api/signal.routes");
const workItemRoutes = require("./api/workitem.routes");
const rateLimiter = require("./middleware/rateLimiter");
const dashboardRoutes = require("./api/dashboard.routes");
const { connectMongo } = require("./db/mongo");
const { pgPool } = require("./db/postgres");

// Fix for Node.js crypto compatibility with Mongoose
global.crypto = require("crypto").webcrypto;

const app = express();
app.use(express.json());
app.use("/workitem", workItemRoutes);
app.use("/signal", rateLimiter, signalRoutes);
app.use("/", dashboardRoutes);
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

async function start() {
  await connectMongo();
  await ensurePostgresSchema();
  app.listen(3000, () => console.log("API running"));
}

start();