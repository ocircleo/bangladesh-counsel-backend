const { getJose } = require("../libs/jose/Jose.cjs");

//Generates an token with payload and expiry time
async function generateToken(payload, expiresIn = "7d") {
  const { SignJWT, base64url } = await getJose();
  const JWT_SECRET = await base64url.decode(process.env.JWT_SECRET);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}
async function generateRefreshToken(payload, expiresIn = "7d") {
  const { SignJWT, base64url } = await getJose();
  const JWT_REFRESH_TOKEN_SECRET = await base64url.decode(
    process.env.JWT_REFRESH_TOKEN_SECRET
  );
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_REFRESH_TOKEN_SECRET);
}
//returns payload if token is valid else returns null
//  @returns:  { userId: 123, phone: "0123456789",role:"user", iat: 1700000000, exp: 1700604800 };
async function verifyToken(token) {
  const { jwtVerify, base64url } = await getJose();
  const JWT_SECRET = await base64url.decode(process.env.JWT_SECRET);
  try {
    return await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (err) {
    return null;
  }
}
//Returns payload if refresh token is valid which may be expired else returns null
//  @returns:  { userId: 123, phone: "0123456789",role:"user", iat: 1700000000, exp: 1700604800 };
async function verifyRefreshToken(token) {
  const { jwtVerify, base64url } = await getJose();
  const JWT_REFRESH_TOKEN_SECRET = await base64url.decode(
    process.env.JWT_REFRESH_TOKEN_SECRET
  );
  try {
    return await jwtVerify(token, JWT_REFRESH_TOKEN_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (err) {
    return null;
  }
}
// Verifies any token and indicates if it's expired or invalid
// @returns: { expired: false, error: false, message: "JWT Verified Successfully", payload: {...} }
async function verifyAnyToken(
  token,
  ignoreExpiration = false,
  type = "access"
) {
  const { jwtVerify, base64url } = await getJose();
  const JWT_REFRESH_TOKEN_SECRET = await base64url.decode(
    process.env.JWT_REFRESH_TOKEN_SECRET
  );
  const JWT_SECRET = await base64url.decode(process.env.JWT_SECRET);
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
        payload: await jwtVerify(token, JWT_SECRET, {
          algorithms: ["HS256"],
          ignoreExpiration: ignoreExpiration,
        }),
      };
    return {
      ...data,
      payload: await jwtVerify(token, JWT_REFRESH_TOKEN_SECRET, {
        algorithms: ["HS256"],
        ignoreExpiration: ignoreExpiration,
      }),
    };
  } catch (error) {
    const data = {
      expired: false,
      error: true,
      message: "no message",
      payload: null,
    };
    if (error.code === "ERR_JWT_EXPIRED") {
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
  verifyAnyToken,
};
