const pool = require("../../core/db/pool");

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
      "UPDATE users SET blocked = true WHERE id = $1;",
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
module.exports = {
  searchUsersInDB,
  searchUsersInDBCount,
  blockUserInDB,
  unBlockUserInDB,
  makeAdminInDb,
  removeAdminInDb,
  searchAdminsInDB,
};
