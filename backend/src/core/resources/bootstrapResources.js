const {
  registerResource,
} = require("./resourceRegistry");

function bootstrapResources() {
  registerResource({
    id: "frontend-app",

    type: "frontend",

    dependencies: [
      "api-gateway",
    ],
  });

  registerResource({
    id: "api-gateway",

    type: "api",

    dependencies: [
      "auth-service",
      "database-service",
      "cache-layer",
    ],
  });

  registerResource({
    id: "auth-service",

    type: "service",

    dependencies: [
      "database-service",
    ],
  });

  registerResource({
    id: "database-service",

    type: "database",

    dependencies: [],
  });

  registerResource({
    id: "cache-layer",

    type: "cache",

    dependencies: [],
  });
}

module.exports = {
  bootstrapResources,
};