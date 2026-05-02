const { Pool } = require("pg");

const pgPool = new Pool({
  user: "ims",
  host: "localhost",
  database: "ims_db",
  password: "ims",
  port: 5432,
});

module.exports = { pgPool };