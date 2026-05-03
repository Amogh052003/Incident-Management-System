
const http = require("http");

const API_URL = "http://localhost:3000";

function sendSignal(component, message, severity = "P1", retryCount = 0) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      component_id: component,
      message,
      severity,
      timestamp: new Date().toISOString(),
    });

    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/signal",
        method: "POST",
        timeout: 5000,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        res.on("data", () => {});
        res.on("end", () => resolve(res.statusCode));
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.on("error", (err) => {
      if (err.code === "ECONNRESET" && retryCount < 1) {
        console.log("Retrying...");
        return resolve(sendSignal(component, message, severity, retryCount + 1));
      }
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function simulateRDBMSOutage() {
  console.log("\n🔥 SCENARIO: RDBMS OUTAGE\n");

  // Step 1: DB failure
  console.log("💥 Step 1: Database goes down");
  for (let i = 0; i < 20; i++) {
    await sendSignal(
      "database-service",
      "Database connection failed",
      "P0"
    );
    await sleep(100);
  }

  await sleep(2000);

  // Step 2: API failures
  console.log("⚠️ Step 2: API layer impacted");
  for (let i = 0; i < 20; i++) {
    await sendSignal(
      "api-gateway",
      "Upstream DB unavailable",
      "P1"
    );
    await sleep(100);
  }

  await sleep(2000);

  // Step 3: Auth failures
  console.log("🔐 Step 3: Auth service errors");
  for (let i = 0; i < 15; i++) {
    await sendSignal(
      "auth-service",
      "User validation failed due to DB outage",
      "P1"
    );
    await sleep(100);
  }

  await sleep(2000);

  // Step 4: Cache strain
  console.log("⚡ Step 4: Cache overloaded");
  for (let i = 0; i < 15; i++) {
    await sendSignal(
      "cache-layer",
      "Cache miss spike due to DB outage",
      "P2"
    );
    await sleep(100);
  }

  console.log("\n✅ Scenario complete.\n");
}

simulateRDBMSOutage().catch(console.error);

