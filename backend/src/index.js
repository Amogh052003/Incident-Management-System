const express = require("express");
const signalRoutes = require("./api/signal.routes");
const workItemRoutes = require("./api/workitem.routes");
const rateLimiter = require("./middleware/rateLimiter");
const dashboardRoutes = require("./api/dashboard.routes");
const { connectMongo } = require("./db/mongo");

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

async function start() {
  await connectMongo();
  app.listen(3000, () => console.log("API running"));
}

start();