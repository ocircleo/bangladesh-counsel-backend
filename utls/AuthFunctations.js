const { domain, prodMode } = require("../modeConfig");
const { RefreshToken } = require("../Models/Token");
const { Users } = require("../Models/Users");
const {
  verifyToken,
  verifyAnyToken,
  verifyRefreshToken,
} = require("./JWTFunctions");
const { sendError } = require("./ReturnFunctations");

const cookieOptions = {
  httpOnly: true,
  secure: prodMode,
  sameSite: prodMode ? "none" : "lax",
  domain: domain,
};
// Middleware to validate access token and refresh if expired on the fly
const accessTokenVAlidation = async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;
  if (!accessToken) return sendError(res, 401, "Token required. Please login first.");
  const mainToken = accessToken.replace("bearer ", "");
  const payload = verifyAnyToken(mainToken, false, "access");
  // If token is expired or invalid, try to generate a new access token using refresh token
  if (payload.error) {
    if (!refreshToken) {
      res.clearCookie("access_token", cookieOptions);
      res.clearCookie("refresh_token", cookieOptions);
      return sendError(res, 401, "Refresh token required. Please login again.");
    }
    const newAccessToken = await generateNewAccessToken(refreshToken); //{error:boolean, accessToken:string}
    if (newAccessToken.error) {
      res.clearCookie("access_token", cookieOptions);
      res.clearCookie("refresh_token", cookieOptions);
      return sendError(res, 401, "Invalid refresh token. Please login again.");
    }
    res.cookie("access_token", `bearer ${newAccessToken.accessToken}`, {
      ...cookieOptions,
      maxAge: 30 * 60 * 1000,
    });
    return next();
  }else return next();
};
const generateNewAccessToken = async (refreshToken) => {
  //This will return payload even if token is expired
  const payload = verifyRefreshToken(refreshToken.replace("bearer ", ""));
  const error = { error: true };
  if (!payload) return error;
  // Optionally check if token matches in DB
  try {
    const tokenInDb = await RefreshToken.findOne({
      token: refreshToken.replace("bearer ", ""),
      user: payload.id,
    });
    if (!tokenInDb) return error;
    const user = await Users.findById(payload.id);
    const tokenPayload = {
      id: user._id,
      role: user.role,
      deviceId: payload.deviceId,
    };
    const accessToken = generateToken(tokenPayload, "30m");
    return { error: false, accessToken: accessToken};
  } catch (err) {
    return error;
  }
};
const isUsersRegistered = async (req, res, next) => {
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

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 500, "Server error during authentication.");
  }
};

const isUserAdmin = async (req, res, next) => {
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

    if (user.role !== "admin") {
      return sendError(res, 403, "Access denied. Admin privileges required.");
    }

    req.user = user;
    next();
  } catch (error) {
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
        "Access denied. Staff or Admin privileges required."
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
    const validRoles = ["instructor", "admin", "super-admin"];
    if (!validRoles.includes(user.role)) {
      return sendError(
        res,
        403,
        "Access denied. Staff or Admin privileges required."
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 500, "Server error during authorization.");
  }
};

module.exports = {
  isUsersRegistered,
  isUserAdmin,
  isUserStaff,
  isUserAuthorized,
  accessTokenVAlidation
};
