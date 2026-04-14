const { prodMode, domain } = require("../../../config/mode.Config");

const {
  verifyToken,
  verifyAnyToken,
  generateToken,
} = require("./JWTFunctions");
const { sendError } = require("../res/ReturnFunctations");
const pool = require("../../../core/db/pool");
const { findUserById } = require("../../../repo/user/user");

const cookieOptions = {
  httpOnly: true,
  secure: prodMode,
  sameSite: prodMode ? "none" : "lax",
  domain: domain,
};
// Middleware to validate access token and refresh token on the fly, if access token is expired then generate new access token and if refresh token is expired or has error then clear all token accept deviceId
// Need to fix this payload.payload.payload naming

const accessTokenValidation = async (req, res, next) => {
  const accessToken = await req.cookies.access_token;
  const refreshToken = await req.cookies.refresh_token;
  
  if (!accessToken && !refreshToken)
    return clearTokens("No Tokens found at all...");
  //if there is no access token then we will surly have an refresh token
  if (!accessToken) return await verifyRefreshAndGenerateAccessToken();

  const mainAccessToken = accessToken.replace("bearer ", "");
  const verificationResult = await verifyAnyToken(
    mainAccessToken,
    false,
    "access",
  );
  // we need an function that takes an refresh token validates it
  if (verificationResult.error)
    return await verifyRefreshAndGenerateAccessToken();

  //if valid acces token then continue
  req.user = verificationResult.payload;
  next();

  function clearTokens(
    message = "Please login again.",
    clearRefreshToken = false,
  ) {
    res.clearCookie("access_token", cookieOptions);
    if (clearRefreshToken) res.clearCookie("refresh_token", cookieOptions);
    return sendError(res, 401, message);
  }
  async function verifyRefreshAndGenerateAccessToken() {
    const mainRefreshToken = refreshToken.replace("bearer ", "");
    const result = await verifyAnyToken(mainRefreshToken, false, "refresh");
    if (result.error) clearTokens("Refresh Token Invalid", true);

    //Need to verify that current refresh token exists on database;
    const refreshTokenOnDb = await refreshTokenValidation(result.payload.id);
    
    if (!refreshTokenOnDb) return clearTokens("Refresh Token invalid", true);

    let tokenMatch = false;
    for (let i = 0; i < refreshTokenOnDb.length; i++)
      if (refreshTokenOnDb[i].token == mainRefreshToken) tokenMatch = true;

    if (!tokenMatch) {
      return clearTokens("Tokens Did not mathc on database", true);
    }

    const newPayload = {
      id: result.payload.id,
      role: refreshTokenOnDb[0].role,
      deviceId: result.payload.deviceId,
    };
    const newAccessToken = await generateToken(newPayload, "30m");

    req.user = newPayload;
    res.cookie("access_token", `bearer ${newAccessToken}`, {
      ...cookieOptions,
      maxAge: 30 * 60 * 1000,
    });
    return next();
  }
};

const refreshTokenValidation = async (id) => {
  try {
    const result = await pool.query(
      "SELECT users.id, users.role, tokens.token FROM users JOIN tokens ON users.id = tokens.user_id WHERE users.id = $1",
      [id],
    );

    if (result.rowCount > 0) {
      return result.rows;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const isUserAdmin = async (req, res, next) => {
  try {
    const reqUser = await req.user;
    const userInDB = await findUserById(reqUser.id);
    
    if (userInDB.error || userInDB.data.blocked) {
      return sendError(res, 401, "User not found or disabled.");
    }

    if (userInDB.data.role !== "admin") {
      return sendError(res, 403, "Access denied. Admin privileges required.");
    }
    next();
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error during authorization.");
  }
};

const isUserStaff = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return sendError(res, 401, "Token required. Please login first.");
    }

    const mainToken = token.replace("Bearer ", "");
    const payload = verifyToken(mainToken);

    if (!payload) {
      return sendError(res, 401, "Invalid or expired token.");
    }

    const user = await Users.findById(payload.id);
    if (!user || user.disabled) {
      return sendError(res, 401, "User not found or disabled.");
    }

    if (user.role !== "staff" && user.role !== "admin") {
      return sendError(
        res,
        403,
        "Access denied. Staff or Admin privileges required.",
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 500, "Server error during authorization.");
  }
};
const isUserAuthorized = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, 401, "User not found");
    }
    const validRoles = ["instructor", "admin", "super-admin"];
    if (!validRoles.includes(user.role)) {
      return sendError(
        res,
        403,
        "Access denied. Staff or Admin privileges required.",
      );
    }
    next();
  } catch (error) {
    return sendError(res, 500, "Server error during authorization.");
  }
};

module.exports = {
  isUserAdmin,
  isUserStaff,
  isUserAuthorized,
  accessTokenValidation,
};
