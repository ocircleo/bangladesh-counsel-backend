const pool = require("../../core/db/pool");

async function createCourseInDB(data) {
  try {
    const result = await pool.query(
      "INSERT INTO courses (title, slug, price, description, languages, category, location_type,published, course_detail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;",
      data,
    );

    if (result.rowCount > 0)
      return {
        error: false,
        message: "Insertion Successfully",
        data: result.rows[0],
      };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function updateCourseInDB(data) {
  try {
    const result = await pool.query(
      "UPDATE courses SET title = $1, slug = $2, price = $3, description = $4, languages = $5, category = $6, location_type = $7, course_detail = $8, published = $9 WHERE id = $10 RETURNING *;",
      data,
    );

    if (result.rowCount > 0)
      return {
        error: false,
        message: "Update Successfully",
        data: result.rows[0],
      };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}

async function createModuleInDB(data) {
  try {
    //    let dataArray = [
    //   data?.title,
    //   data?.description,
    //   data?.published,
    //   data?.is_public,
    //   data?.course_id,
    // ];
    const result = await pool.query(
      "INSERT INTO modules (title, description, published, is_public, course_id) VALUES ($1, $2, $3, $4, $5);",
      data,
    );

    if (result.rowCount > 0)
      return { error: false, message: "Insertion Successfully" };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function updateModuleInDB(data) {
  try {
    const result = await pool.query(
      "UPDATE modules SET title = $1, description = $2, published = $3, is_public = $4 WHERE id = $5;",
      data,
    );

    if (result.rowCount > 0)
      return { error: false, message: "Insertion Successfully" };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function deleteModuleInDB(data) {
  try {
    const result = await pool.query("DELETE FROM modules WHERE id = $1;", data);

    if (result.rowCount > 0)
      return { error: false, message: "Insertion Successfully" };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function searchCourseInDBAdmin(data) {
  try {
    const result = await pool.query(
      "SELECT * FROM courses WHERE title ILIKE '%' || $1 || '%' OFFSET $2 FETCH FIRST $3 ROW ONLY;",
      data,
    );

    if (result.rowCount > 0)
      return { error: false, message: "found data", data: result.rows };
    return { error: true, message: "now Data found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function searchCourseInDBAdminCount(data) {
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
async function findCourseDetails(id) {
  try {
    const result = await pool.query(
      `SELECT courses.title, courses.id,

       (
        SELECT COALESCE(json_agg(
           json_build_object(
          'id', users.id,
          'name', users.name
         )
        ), '[]') FROM mentors
        JOIN users ON users.id = mentors.user_id
        WHERE mentors.course_id = courses.id
       ) AS mentors,

       (
        SELECT COALESCE(json_agg(modules), '[]') FROM modules
        WHERE modules.course_id = courses.id
       ) AS modules

      FROM courses WHERE courses.id = $1;`,
      id,
    );

    if (result.rowCount > 0)
      return { error: false, message: "found data", data: result.rows[0] };
    return { error: true, message: "now Data found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
module.exports = {
  createCourseInDB,
  updateCourseInDB,
  createModuleInDB,
  updateModuleInDB,
  deleteModuleInDB,
  searchCourseInDBAdmin,
  findCourseDetails,
  searchCourseInDBAdminCount
};
