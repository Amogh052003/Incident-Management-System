const http = require("http");

function sendSignal(component, message, severity = "P1") {
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

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function simulateMCPOutage() {
  console.log("\n🔥 SCENARIO: MCP HOST FAILURE\n");

  // Step 1: MCP fails
  console.log("💥 Step 1: MCP host unavailable");
  for (let i = 0; i < 15; i++) {
    await sendSignal(
      "mcp-host",
      "Configuration service unreachable",
      "P0"
    );
    await sleep(100);
  }

  await sleep(2000);

  // Step 2: Services lose config
  console.log("⚠️ Step 2: Services misconfigured");
  for (let i = 0; i < 20; i++) {
    await sendSignal(
      "api-gateway",
      "Invalid routing config from MCP",
      "P1"
    );
    await sleep(100);
  }

  await sleep(2000);

  // Step 3: Downstream failures
  console.log("🔐 Step 3: Auth + services failing");
  for (let i = 0; i < 15; i++) {
    await sendSignal(
      "auth-service",
      "Token validation failed due to config error",
      "P1"
    );
    await sleep(100);
  }

  await sleep(2000);

  // Step 4: System instability
  console.log("⚡ Step 4: System instability observed");
  for (let i = 0; i < 15; i++) {
    await sendSignal(
      "monitoring-service",
      "Unexpected error spike across services",
      "P2"
    );
    await sleep(100);
  }

  console.log("\n✅ MCP failure scenario complete.\n");
}

simulateMCPOutage().catch(console.error);

