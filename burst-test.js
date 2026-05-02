#!/usr/bin/env node

const http = require('http');

/**
 * Burst Test Script - Generates multiple incidents rapidly
 */

const API_URL = 'http://localhost:3000';

// Sample incident data
const components = [
  'database-service',
  'api-gateway',
  'cache-layer',
  'payment-processor',
  'auth-service',
  'notification-service',
  'storage-service',
  'monitoring-service'
];

const messages = [
  'High memory usage detected',
  'Connection timeout',
  'Database query exceeds threshold',
  'Service unavailable',
  'Request latency critical',
  'Failed authentication attempt',
  'Disk space low',
  'CPU usage spike',
  'Network packet loss',
  'Configuration invalid'
];

async function sendSignal(componentId, message) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      component_id: componentId,
      message: message,
      work_item_id: Math.floor(Math.random() * 10000),
      timestamp: new Date().toISOString()
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/signal',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          component: componentId,
          message: message
        });
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function burstTest(count = 50, delayMs = 50) {
  console.log(`\n🚀 Starting BURST TEST - Generating ${count} incidents\n`);
  console.log(`📊 Sending ${Math.round(1000 / delayMs)} incidents/sec\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 1; i <= count; i++) {
    try {
      const component = components[Math.floor(Math.random() * components.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];

      const result = await sendSignal(component, message);

      if (result.status === 202) {
        successCount++;
        console.log(`✅ [${i}/${count}] ${component}: ${message}`);
      } else {
        errorCount++;
        console.log(`❌ [${i}/${count}] Failed with status ${result.status}`);
      }

      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, delayMs));

    } catch (err) {
      errorCount++;
      console.log(`❌ [${i}/${count}] Error: ${err.message}`);
    }
  }

  console.log(`\n📈 TEST COMPLETE`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`\n🎯 Open http://localhost:5174 to view incidents on the dashboard`);
  console.log(`\n⏱️  Dashboard polls every 5 seconds for updates\n`);
}

// Run burst test with parameters
const count = parseInt(process.argv[2]) || 50;
const delayMs = parseInt(process.argv[3]) || 50;

burstTest(count, delayMs).catch(console.error);
