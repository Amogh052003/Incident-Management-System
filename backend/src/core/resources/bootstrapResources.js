const {
  registerResource,
} = require("./resourceRegistry");

function bootstrapResources() {
  registerResource({
    id: "frontend-app",

    type: "frontend",

    runtimeSelector: "frontend",

    dependencies: [
      "api-gateway",
    ],
  });

  registerResource({
    id: "api-gateway",

    type: "api",

    runtimeSelector: "backend",

    dependencies: [
      "auth-service",
      "database-service",
      "cache-layer",
    ],
  });

  registerResource({
    id: "auth-service",

    type: "service",

    runtimeSelector: "auth",

    dependencies: [
      "database-service",
    ],
  });

  registerResource({
    id: "database-service",

    type: "database",

    runtimeSelector: "postgres",

    dependencies: [],
  });

  registerResource({
    id: "cache-layer",

    type: "cache",

    runtimeSelector: "redis",

    dependencies: [],
  });
}

module.exports = {
  bootstrapResources,
};