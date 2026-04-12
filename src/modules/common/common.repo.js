const pool = require("../../core/db/pool");

async function searchCourseInDB(data) {
  try {
    const result = await pool.query(
      "SELECT id, title, slug, thumbnail_rect, thumbnail_square, category, location_type, location_city, price, offer_price, offer_end_date, course_detail, languages  FROM courses WHERE title ILIKE '%' || $1 || '%' OFFSET $2 FETCH FIRST $3 ROW ONLY;",
      data,
    );

    if (result.rowCount > 0)
      return { error: false, message: "found data", data: result.rows };
    return { error: true, message: "now Data found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function searchCourseInDBCount(data) {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM courses WHERE title ILIKE '%' || $1 || '%';",
      data,
    );

    if (result.rowCount > 0)
      return { error: false, message: "found data", data: result.rows[0]?.count };
    return { error: true, message: "now Data found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}

module.exports = { searchCourseInDB, searchCourseInDBCount };
