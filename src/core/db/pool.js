const pg = require("pg");
const { Pool } = pg;
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({
  connectionString: connectionString,
  max: 2,
});
module.exports = pool;
