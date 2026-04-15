const pool = require("./pool.js");

async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    console.log("Transaction function error:",err);
    return false;
  } finally {
    client.release();
  }
}
module.exports = { withTransaction };
//usecase
/*
await withTransaction(async (client) => {
  const user = await client.query(
    "INSERT INTO users(name) VALUES($1) RETURNING id",
    ["Salman"]
  );

  await client.query(
    "INSERT INTO profiles(user_id) VALUES($1)",
    [user.rows[0].id]
  );
});
*/
