const pool = require("../../core/db/pool");

async function updateProfileDB(data) {
  try {
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3",
      data,
    );
    if (result.rowCount > 0)
      return { error: false, message: "Update Successfully" };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function updatePasswordDB(data) {
  try {
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      data,
    );
    if (result.rowCount > 0)
      return { error: false, message: "Update Successfully" };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
module.exports = { updateProfileDB, updatePasswordDB };
