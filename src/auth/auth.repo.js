const pool = require("../core/db/pool");

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
async function saveUser(data) {
  try {
    const result = await pool.query(
      "INSERT INTO users (name, phone, password) VALUES ($1, $2, $3) RETURNING name, phone, id",
      data,
    );

    if (result.rowCount > 0) return { error: false, data: result.rows[0] };
    return { error: true, message: "Failed to insert into database" };
  } catch (error) {
    console.log(error.message);
    return { error: true, message: "Some Error hapened while saving user" };
  }
}
async function saveRefreshToken(data) {
  try {
    await pool.query(
      "INSERT INTO tokens (user_id, device_id, token) VALUES ($1, $2, $3);",
      data,
    );
  } catch (error) {
    console.log(error.message);
  }
}
const removeOlderRefreshToken = async (userId) => {
  try {
    const allRefreshTokens = await pool.query(
      "SELECT * FROM tokens WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    const tokenList = allRefreshTokens.rows;
  

    const tokensToRemove = []; //tokens that will be removed
    const filteredTokens = []; //temporary store for filtered tokens

    //1.Filter out duplicate device tokens of -> last logged in device
    let count = 0;
    for (let i = 0; i < tokenList.length; i++) {
      if (count == 2) {
        tokensToRemove.push(tokenList[i].id);
        continue;
      }

      if (filteredTokens.includes(tokenList[i].device_id))
        tokensToRemove.push(tokenList[i].id);
      else {
        filteredTokens.push(tokenList[i].device_id);
        count++;
      }
    }
   
    if (tokensToRemove.length > 0)
      await pool.query("DELETE FROM tokens WHERE id = ANY($1)", [
        tokensToRemove,
      ]);
  } catch (error) {
    console.error("Error saving refresh token:", error.message);
  }
};
async function removeRefreshTokenById(user_id, token) {
  try {
    await pool.query("DELETE FROM tokens WHERE user_id = $1 AND token = $2;", [
      user_id,
      token,
    ]);
  } catch (error) {
    console.log(error.message);
  }
}
async function findTokenByUserId(id) {
  try {
    const result = await pool.query(
      "SELECT users.id, users.role FROM users JOIN tokens ON users.id = tokens.user_id WHERE users.id = $1",
      [id],
    );

    if (result.rowCount > 0) return result.rows[0];
    return null;
  } catch (error) {
    return null;
  }
}
//SELECT * WHERE  user_id = $1
module.exports = {
  findUserByPhone,
  saveUser,
  saveRefreshToken,
  removeOlderRefreshToken,
  removeRefreshTokenById,
  findUserById,
  findTokenByUserId,
};
