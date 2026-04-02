const pool = require("../../core/db/pool");

async function findUserByPhone(phone) {
  try {
    const result = await pool.query(
      "SELECT id, phone, password, role FROM users WHERE phone = $1",
      [phone],
    );

    if (result.rowCount > 0) return { error: false, data: result.rows[0] };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function findUserById(id) {
  try {
    const result = await pool.query(
      "SELECT id, name, phone, email, role FROM users WHERE id = $1",
      [id],
    );

    if (result.rowCount > 0) return { error: false, data: result.rows[0] };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function findUserPasswordById(id) {
  try {
    const result = await pool.query(
      "SELECT id, password FROM users WHERE id = $1",
      [id],
    );

    if (result.rowCount > 0) return { error: false, data: result.rows[0] };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
module.exports = { findUserById, findUserByPhone, findUserPasswordById };
