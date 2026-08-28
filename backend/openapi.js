const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.1.0",

    info: {
      title: "Incident Management System API",
      version: "1.0.0",
      description: "API reference for the Incident Management System."
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server"
      }
    ],

    tags: [
      {
        name: "Audit",
        description: "Audit logging and audit event retrieval"
      }
    ],

    components: {
      schemas: {
        AuditLogRequest: {
          type: "object",
          required: ["event_type"],
          properties: {
            event_type: {
              type: "string",
              description: "Type of event being recorded."
            },
            component: {
              type: "string",
              description: "Component associated with the event."
            },
            severity: {
              type: "string",
              description: "Severity of the event."
            },
            message: {
              type: "string",
              description: "Human-readable description of the event."
            },
            metadata: {
              type: "object",
              description: "Additional structured metadata.",
              additionalProperties: true
            }
          }
        },

        AuditLog: {
          type: "object",
          properties: {
            id: {
              type: "integer"
            },
            event_type: {
              type: "string"
            },
            component: {
              type: "string",
              nullable: true
            },
            severity: {
              type: "string",
              nullable: true
            },
            message: {
              type: "string",
              nullable: true
            },
            metadata: {
              type: "object",
              additionalProperties: true
            },
            created_at: {
              type: "string",
              format: "date-time"
            }
          }
        }
      }
    }
  },

  apis: [
    path.join(__dirname, "src/api/*.js")
  ]
};

module.exports = swaggerJSDoc(options);