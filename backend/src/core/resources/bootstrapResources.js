const {
  registerResource,
} = require("./resourceRegistry");

function bootstrapResources() {
  registerResource({
    id: "frontend-app",

    type: "frontend",

    runtimeSelector: "frontend",

    runtimeAliases: [
      "frontend",
      "frontend-app",
    ],
  });

  registerResource({
    id: "api-gateway",

    type: "api",

    runtimeSelector: "backend",

    runtimeAliases: [
      "backend",
      "api",
      "api-gateway",
    ],
  });

  registerResource({
    id: "auth-service",

    type: "service",

    runtimeSelector: "auth",

    runtimeAliases: [
      "auth",
      "auth-service",
    ],
  });

  registerResource({
    id: "database-service",

    type: "database",

    runtimeSelector: "postgres",

    runtimeAliases: [
      "postgres",
      "db",
      "database-service",
    ],
  });

  registerResource({
    id: "cache-layer",

    type: "cache",

    runtimeSelector: "redis",

    runtimeAliases: [
      "redis",
      "cache",
      "cache-layer",
    ],
  });
}

module.exports = {
  bootstrapResources,
};
