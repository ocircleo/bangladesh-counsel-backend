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
async function deleteCourseInDb(data) {
  try {
    const result = await pool.query("DELETE FROM courses WHERE id = $1;", data);

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
      return {
        error: false,
        message: "found data",
        data: result.rows[0]?.count,
      };
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
          'phone', users.phone,
          'name', users.name
         )
        ), '[]') FROM instructors
        JOIN users ON users.id = instructors.user_id
        WHERE instructors.course_id = courses.id
       ) AS instructors,

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
async function findCourseDetailsGeneralInDb(slug) {
  try {
    const result = await pool.query(
      `SELECT 
    courses.id, courses.title, courses.description, courses.category, courses.course_type, courses.location_type, courses.price, courses.offer_price, courses.offer_end_date, courses.course_detail, courses.languages, thumbnail_rect.directory AS thumbnail_rect, thumbnail_square.directory AS thumbnail_square, ratings_data.avarage_rating, ratings_data.count,

  COALESCE(modules_data.modules, '[]') AS modules,
  COALESCE(instructors_data.instructors, '[]') AS instructors

FROM courses

LEFT JOIN LATERAL (
  SELECT 
    json_agg(
      json_build_object(
        'id', modules.id,
        'title', modules.title
      )
    ) AS modules
  FROM modules
  WHERE 
    modules.course_id = courses.id
    AND modules.is_public = true
) AS modules_data ON true

LEFT JOIN LATERAL (
  SELECT 
    json_agg(
      json_build_object(
        'name', users.name,
        'phone', users.phone
      )
    ) AS instructors
  FROM instructors
  LEFT JOIN users 
    ON users.id = instructors.user_id
  WHERE instructors.course_id = courses.id
) AS instructors_data ON true

LEFT JOIN LATERAL (
  SELECT  directory 
  FROM images
  WHERE courses.thumbnail_rect = images.id
) AS thumbnail_rect ON true

LEFT JOIN LATERAL (
  SELECT  directory 
  FROM images
  WHERE courses.thumbnail_square = images.id
) AS thumbnail_square ON true

LEFT JOIN LATERAL (
SELECT ROUND(COALESCE(avg(ratings.rating),0.0),2) as avarage_rating, COUNT(*)
FROM ratings
WHERE ratings.course_id = courses.id
) AS ratings_data ON true

WHERE courses.slug = $1;`,
      slug,
    );

    if (result.rowCount > 0)
      return { error: false, message: "found data", data: result.rows[0] };
    return { error: true, message: "now Data found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function findSignatureCoursesInDB() {
  try {
    const result = await pool.query(
      `SELECT courses.id, courses.title, courses.slug, ratings_data.avarage_rating, react_image_data.directory AS thumbnail_rect, squre_image_data.directory AS thumbnail_square
FROM courses

LEFT JOIN LATERAL (
SELECT ROUND(COALESCE(avg(ratings.rating),0.0),2) as avarage_rating
FROM ratings
WHERE ratings.course_id = courses.id
) AS ratings_data ON true

LEFT JOIN LATERAL (
SELECT directory 
FROM images
WHERE images.id = courses.thumbnail_rect
) AS react_image_data ON true

LEFT JOIN LATERAL (
SELECT directory 
FROM images
WHERE images.id = courses.thumbnail_square
) AS squre_image_data ON true

ORDER BY created_at ASC FETCH FIRST 6 ROWS ONLY;;
       `,
    );

    if (result.rowCount > 0)
      return { error: false, message: "found data", data: result.rows };
    return { error: true, message: "now Data found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function insertImageInDB(data, courseId, image_size_type) {
  try {
    const result = await withTransaction(async (client) => {
      try {
        const insertImage = await client.query(
          `INSERT INTO images
           (directory, file_type, estimated_size)
            VALUES ($1, $2, $3) RETURNING *;`,
          data,
        );
        console.log({insertImage});
        const courseUpdateData = [insertImage?.rows[0]?.id, courseId];
        console.log({courseUpdateData});
        let updateCourse;
        if (image_size_type == "react")
          updateCourse = await pool.query(
            "UPDATE courses SET thumbnail_rect = $1 WHERE user_id = $2",
            [data],
          );
        else
          updateCourse = await pool.query(
            "UPDATE courses SET thumbnail_square = $1 WHERE user_id = $2",
            [data],
          );
        console.log({updateCourse});
        return true;
      } catch (error) {
        console.log("transaction query error: ", error);
        return false;
      }
    });

    if (result)
      return {
        error: false,
        message: "Failed to Insert images date in db",
      };
    return { error: true, message: "Some Errror happned in transaction" };
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
  searchCourseInDBAdminCount,
  deleteCourseInDb,
  findCourseDetailsGeneralInDb,
  findSignatureCoursesInDB,
  insertImageInDB,
};
