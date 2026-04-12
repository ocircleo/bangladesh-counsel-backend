const pool = require("../../core/db/pool");

async function findCourseById(id) {
  try {
    const result = await pool.query(
      "SELECT * FROM courses WHERE id = $1",
      [id],
    );

    if (result.rowCount > 0) return { error: false, data: result.rows[0] };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
module.exports = { findCourseById };
