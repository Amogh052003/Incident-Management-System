#!/usr/bin/env node

const http = require("http");

/**
 * Burst Test Script (Improved)
 * - Sends signals concurrently
 * - Correctly detects success (2xx)
 * - No invalid work_item_id
 */

const API_URL = "http://localhost:3000";

// Sample data
const components = [
  "database-service",
  "api-gateway",
  "cache-layer",
  "payment-processor",
  "auth-service",
  "notification-service",
  "storage-service",
  "monitoring-service",
];

const messages = [
  "High memory usage detected",
  "Connection timeout",
  "Database query exceeds threshold",
  "Service unavailable",
  "Request latency critical",
  "Failed authentication attempt",
  "Disk space low",
  "CPU usage spike",
  "Network packet loss",
  "Configuration invalid",
];

// Send one signal
function sendSignal(componentId, message) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      component_id: componentId,
      message: message,
      timestamp: new Date().toISOString(),
    });

    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/signal",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        res.on("data", () => {}); // ignore body
        res.on("end", () => {
          resolve(res.statusCode);
        });
      }
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// Burst runner
async function burstTest(total = 50, ratePerSec = 20) {
  console.log(`\n🚀 Starting BURST TEST - Generating ${total} signals`);
  console.log(`📊 Target rate: ${ratePerSec} signals/sec\n`);

  const delay = 1000 / ratePerSec;
  let success = 0;
  let failed = 0;

  for (let i = 0; i < total; i++) {
    const component =
      components[Math.floor(Math.random() * components.length)];
    const message =
      messages[Math.floor(Math.random() * messages.length)];

    // Fire request (no await → concurrency)
    sendSignal(component, message)
      .then((status) => {
        if (status >= 200 && status < 300) {
          success++;
        } else {
          failed++;
          console.log(`❌ Failed with status ${status}`);
        }
      })
      .catch((err) => {
        failed++;
        console.log(`❌ Error: ${err.message}`);
      });

    // Control rate
    await new Promise((r) => setTimeout(r, delay));
  }

  // Wait for all to finish
  await new Promise((r) => setTimeout(r, 2000));

  console.log(`\n📈 TEST COMPLETE`);
  console.log(`✅ Successful: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\n🌐 Open http://localhost:5173 to view dashboard\n`);
}

// CLI args
const total = parseInt(process.argv[2]) || 50;
const rate = parseInt(process.argv[3]) || 20;

burstTest(total, rate).catch(console.error);