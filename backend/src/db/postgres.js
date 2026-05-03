const { Pool } = require("pg");

const pgPool = new Pool({
  user: process.env.PGUSER || "ims",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "ims_db",
  password: process.env.PGPASSWORD || "ims",
  port: Number(process.env.PGPORT || 5432),
});

module.exports = { pgPool };