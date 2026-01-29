const { domain, prodMode } = require("../modeConfig");
const { RefreshToken } = require("../Models/Token");
const { Users } = require("../Models/Users");
const {
  verifyToken,
  verifyAnyToken,
  generateToken,
} = require("./JWTFunctions");
const { sendError } = require("./ReturnFunctations");

const cookieOptions = {
  httpOnly: true,
  secure: prodMode,
  sameSite: prodMode ? "none" : "lax",
  domain: domain,
};
// Middleware to validate access token and refresh token on the fly, if access token is expired then generate new access token and if refresh token is expired or has error then clear all token accept deviceId
// Need to fix this payload.payload.payload naming
const accessTokenValidation = async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  if (!accessToken) {
    //checked ok
    if (!refreshToken) return clearTokens("No Refresh Token");
    const newAccessToken = await generateNewAccessToken(refreshToken); //{error:boolean, accessToken:string}

    if (newAccessToken.error) return clearTokens(newAccessToken.message);
    req.cookies.access_token = newAccessToken.accessToken;
    req.user = newAccessToken.payload;
    res.cookie("access_token", `bearer ${newAccessToken.accessToken}`, {
      ...cookieOptions,
      maxAge: 30 * 60 * 1000,
    });
    return next();
  } else {
    const mainToken = accessToken.replace("bearer ", "");
    const payload = await verifyAnyToken(mainToken, false, "access");
    // If token is expired or invalid, try to generate a new access token using refresh token
    if (payload.error) {
      //checked ok
      if (!refreshToken) return clearTokens("No Refresh Token");
      const newAccessToken = await generateNewAccessToken(refreshToken); //{error:boolean, accessToken:string}
      if (newAccessToken.error) return clearTokens(newAccessToken.message);
      req.cookies.access_token = newAccessToken.accessToken;
      req.user = newAccessToken.payload;
      res.cookie("access_token", `bearer ${newAccessToken.accessToken}`, {
        ...cookieOptions,
        maxAge: 30 * 60 * 1000,
      });
      return next();
    } else {
      //checked ok
      req.user = payload.payload.payload;
      return next();
    }
  }

  function clearTokens(message = "Please login again.") {
    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);
    return sendError(res, 401, message);
  }
};
const generateNewAccessToken = async (refreshToken) => {
  //This will return payload even if token is expired
  const mainRefreshToken = refreshToken.replace("bearer ", "");
  const payload = await verifyAnyToken(mainRefreshToken, true, "refresh");
  const result = {
    error: true,
    payload: null,
    message: "Invalid refresh token",
  };
  if (payload.error) return result;
  // Optionally check if token matches in DB
  try {
    const tokenInDb = await RefreshToken.findOne({
      token: mainRefreshToken,
      user: payload.payload.payload.id,
    });
    if (!tokenInDb)
      return { ...result, message: "Refresh token not found in database" };
    const user = await Users.findById(payload.payload.payload.id);
    const tokenPayload = {
      id: user.id,
      role: user.role,
      deviceId: payload.payload.payload.deviceId,
    };
    const accessToken = await generateToken(tokenPayload, "30m");
    return {
      error: false,
      accessToken: accessToken,
      payload: tokenPayload,
      message: "New access token generated successfully.",
    };
  } catch (err) {
    return {
      ...result,
      message: "Server error while generating new access token",
    };
  }
};


const isUserAdmin = async (req, res, next) => {
  try {
    const reqUser = req.user;
    console.log(reqUser);
    throw new Error("hello man");

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
