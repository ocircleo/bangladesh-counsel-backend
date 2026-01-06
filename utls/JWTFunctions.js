const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
//Generates an token with payload and expiry time
function generateToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
function generateRefreshToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET, { expiresIn });
}
//returns payload if token is valid else returns null
//  @returns:  { userId: 123, phone: "0123456789",role:"user", iat: 1700000000, exp: 1700604800 };
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
//Returns payload if refresh token is valid which may be expired else returns null
//  @returns:  { userId: 123, phone: "0123456789",role:"user", iat: 1700000000, exp: 1700604800 };
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_TOKEN_SECRET, {
      ignoreExpiration: true,
    });
  } catch (err) {
    return null;
  }
}
// Verifies any token and indicates if it's expired or invalid
// @returns: { expired: false, error: false, message: "JWT Verified Successfully", payload: {...} }
function verifyAnyToken(token, ignoreExpiration = false, type = "access") {
  try {
    const data = {
      expired: false,
      error: false,
      message: "JWT Verified Successfully",
      payload: null,
    };
    if (type === "access")
      return {
        ...data,
        payload: jwt.verify(token, JWT_SECRET, { ignoreExpiration }),
      };
    return {
      ...data,
      payload: jwt.verify(token, JWT_REFRESH_TOKEN_SECRET, {
        ignoreExpiration,
      }),
    };
  } catch (error) {
    const data = {
      expired: false,
      error: true,
      message: "no message",
      payload: null,
    };
    if (error.name === "TokenExpiredError") {
      return { ...data, expired: true, message: "JWT Expired" };
    }
    return { ...data, message: "Invalid JWT Token" };
  }
}
module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAnyToken
};
