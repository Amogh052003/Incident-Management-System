const topology = {
  "frontend-app": ["api-gateway"],

  "api-gateway": [
    "auth-service",
    "database-service",
    "cache-layer",
  ],

  "auth-service": [
    "database-service",
  ],

  "worker-service": [
    "redis",
    "database-service",
  ],

  "cache-layer": [
    "database-service",
  ],

  redis: [],

  "database-service": [],
};

module.exports = topology;