const pool = require("../../core/db/pool");
const { withTransaction } = require("../../core/db/transaction");

async function searchUsersInDB(data) {
  try {
    let result,
      allIncluded = [...data.slice(0, 3)];

    if (!data[3] || data[3] == "all")
      result = await pool.query(
        "SELECT id, name, phone, role, blocked FROM users WHERE phone ILIKE '%' || $1 || '%' OFFSET $2 FETCH FIRST $3 ROW ONLY;",
        allIncluded,
      );
    else
      result = await pool.query(
        "SELECT id, name, phone, role, blocked FROM users WHERE phone ILIKE '%' || $1 || '%' AND role = $4 OFFSET $2 FETCH FIRST $3 ROW ONLY;",
        data,
      );

    if (result.rowCount > 0)
      return {
        error: false,
        message: "Found users",
        data: result.rows,
      };
    return { error: true, message: "No User Found" };
  } catch (error) {
    console.log(error.message);
    return { error: true, message: error.message };
  }
}
async function searchUsersInDBCount(data) {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM users WHERE phone ILIKE '%' || $1 || '%';",
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
async function blockUserInDB(data) {
  try {
    const result = await pool.query(
      "UPDATE users SET blocked = true WHERE id = $1 AND role != 'admin';",
      data,
    );

    if (result.rowCount > 0)
      return {
        error: false,
        message: "User blocked",
      };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function unBlockUserInDB(data) {
  try {
    const result = await pool.query(
      "UPDATE users SET blocked = false WHERE id = $1;",
      data,
    );

    if (result.rowCount > 0)
      return {
        error: false,
        message: "User unblocked",
      };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function makeAdminInDb(data) {
  try {
    const result = await pool.query(
      "UPDATE users SET role = 'admin' WHERE id = $1;",
      data,
    );

    if (result.rowCount > 0)
      return {
        error: false,
        message: "User now Admin",
      };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function removeAdminInDb(data) {
  try {
    const result = await pool.query(
      "UPDATE users SET role = 'student' WHERE id = $1;",
      data,
    );

    if (result.rowCount > 0)
      return {
        error: false,
        message: "User removed from admin",
      };
    return { error: true, message: "No User Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function searchAdminsInDB() {
  try {
    const result = await pool.query(
      "SELECT id, name, phone, role, blocked FROM users WHERE role = 'admin';",
    );

    if (result.rowCount > 0)
      return {
        error: false,
        message: "Found Admins",
        data: result.rows,
      };
    return { error: true, message: "No admins Found" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
/// We need an transaction hare
// 1. need to make the user role to instructor
// 2. need to insert data in instructors table
async function addInstructorInDb(data) {
  try {
    const result = await withTransaction(async (client) => {
      try {
        const instructiorResult = await client.query(
          "INSERT INTO instructors (course_id, user_id) VALUES ($1, $2);",
          data,
        );

        const updateResult = await client.query(
          "UPDATE users SET role = 'instructor' WHERE id = $1",
          [data[1]],
        );

        return true;
      } catch (error) {
        console.log("transaction query error: ", error);
        return false;
      }
    });

    if (result)
      return {
        error: false,
        message: "User Added as Instructor",
      };
    return { error: true, message: "Some Errror happned in transaction" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
async function removeInstructorInDb(data) {
  try {
    const result = await withTransaction(async (client) => {
      try {
        const instructiorResult = await client.query(
          "DELETE FROM instructors WHERE course_id = $1 AND user_id = $2;",
          data,
        );
        const instructor = await pool.query(
          "SELECT * FROM instructors WHERE user_id = $1",
          [data[1]],
        );
        
        if (instructor.rowCount <= 1) {
          const roleConvertResult = await client.query(
            "UPDATE users SET role = 'student' WHERE id = $1",
            [data[1]],
          );
         
        }

        return true;
      } catch (error) {
        console.log("transaction query error: ", error);
        return false;
      }
    });

    if (result)
      return {
        error: false,
        message: "User removed from Instructor",
      };
    return { error: true, message: "Some Errror happned in transaction" };
  } catch (error) {
    return { error: true, message: error.message };
  }
}
module.exports = {
  searchUsersInDB,
  searchUsersInDBCount,
  blockUserInDB,
  unBlockUserInDB,
  makeAdminInDb,
  removeAdminInDb,
  searchAdminsInDB,
  addInstructorInDb,
  removeInstructorInDb,
};
