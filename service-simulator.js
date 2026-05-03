const http = require("http");

const SERVICES = [
  "api-gateway",
  "database-service",
  "cache-layer",
  "auth-service"
];

function sendSignal(component, message) {
  const payload = JSON.stringify({
    component_id: component,
    message,
    timestamp: new Date().toISOString()
  });

  const req = http.request({
    hostname: "localhost",
    port: 3000,
    path: "/signal",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload)
    }
  });

  req.write(payload);
  req.end();
}

function randomMessage(service) {
  const map = {
    "api-gateway": ["5xx error spike", "latency high"],
    "database-service": ["connection pool exhausted", "slow query"],
    "cache-layer": ["cache miss rate high", "redis timeout"],
    "auth-service": ["invalid token spike", "login failures"]
  };

  const msgs = map[service];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// Continuous emission
setInterval(() => {
  const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
  const msg = randomMessage(service);

  sendSignal(service, msg);
  console.log(`📡 ${service}: ${msg}`);
}, 500);