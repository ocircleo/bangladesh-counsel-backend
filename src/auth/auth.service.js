const { v4: uuidv4 } = require("uuid");
const {
  hashPassword,
  comparePassword,
} = require("../shared/utility/cryptic/BCrypt");

const {
  sendError,
  sendSuccess,
} = require("../shared/utility/res/ReturnFunctations");
const {
  generateToken,
  generateRefreshToken,
  verifyAnyToken,
} = require("../shared/utility/cryptic/JWTFunctions");

const {
  findUserByPhone,
  saveUser,
  saveRefreshToken,
  removeOlderRefreshToken,
  removeRefreshTokenById,
  findUserById,
  findTokenByUserId,
} = require("./auth.repo");

const { prodMode, domain } = require("../config/mode.Config");

const cookieOptions = {
  httpOnly: true,
  secure: prodMode,
  sameSite: prodMode ? "none" : "lax",
  domain: domain,
};

async function login(req, res) {
  try {
    const previousDeviceId = req.cookies["device_id"];
    const { phone, password, remember } = req.body;
    // Basic validation
    if (!phone || !password)
      return sendError(res, 400, "Phone and password are required.");

    const user = await findUserByPhone(phone);
    // Check if user exists
    if (!user?.data) return sendError(res, 403, "Invalid User");
    // Verify password
    const isPasswordValid = await comparePassword(
      password,
      user?.data.password,
    );
    if (!isPasswordValid)
      return sendError(res, 400, "Invalid phone or password.");
    const userId = user?.data?.id;
    let deviceId;
    //if device id exists from cookie then use it otherwise generate new one as device id has long expiry
    if (previousDeviceId) deviceId = previousDeviceId;
    else deviceId = uuidv4();
    const tokenPayload = {
      id: userId,
      role: user?.data.role,
      deviceId: deviceId,
    };
    const accessToken = await generateToken(tokenPayload, "30m");
    const refreshToken = await generateRefreshToken(
      tokenPayload,
      remember ? "7d" : "1d",
    );

    //send necessary cookies
    res.cookie("access_token", `bearer ${accessToken}`, {
      ...cookieOptions,
      maxAge: 30 * 60 * 1000,
    });
    res.cookie("refresh_token", `bearer ${refreshToken}`, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("device_id", deviceId, {
      ...cookieOptions,
      maxAge: 5 * 365 * 24 * 60 * 60 * 1000,
    });
    //save refresh token in DB
    await saveRefreshToken([userId, deviceId, refreshToken]);

    res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      data: { userId, name: user?.data?.name, phone, email: user?.data?.email },
    });
    //save  log in DB afterwards because it's not critical to be saved before response and also to reduce response time
    //Hope this runs :)
    // await createAuthLog({
    //   identifier: phone,
    //   action: "LOGIN",
    //   status: "SUCCESS",
    //   authMethod: "password",
    //   req,
    // });
    //Happy if this goes well :)
    await removeOlderRefreshToken(userId, deviceId);
    // await clearOldAuthLogs(phone);
  } catch (error) {
    console.log(error.message);
    return sendError(res, 500, "Server error during Login.");
  }
}
async function register(req, res) {
  try {
    const { name, phone, password } = req.body;
    // Basic validation
    if (!name || !phone || !password)
      return sendError(res, 400, "All fields are required.");
    const previousUserCheck = await findUserByPhone(phone);
    //checks phone
    if (previousUserCheck?.data)
      return sendError(res, 403, "Phone Alerady Exists");
    //hash password
    const hashedPassword = await hashPassword(password);
    // Create new user
    const newUser = await saveUser([name, phone, hashedPassword]);

    if (newUser.error) return sendError(res, 400, newUser.message);
    const userId = newUser?.data?.id;
    const deviceId = uuidv4();
    const tokenPayload = { id: userId, role: "student", deviceId: deviceId };
    const accessToken = await generateToken(tokenPayload, "30m");
    const refreshToken = await generateRefreshToken(tokenPayload, "7d");

    //send necessary cookies
    res.cookie("access_token", `bearer ${accessToken}`, {
      ...cookieOptions,
      maxAge: 30 * 60 * 1000,
    });
    res.cookie("refresh_token", `bearer ${refreshToken}`, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("device_id", deviceId, {
      ...cookieOptions,
      maxAge: 5 * 365 * 24 * 60 * 60 * 1000,
    });

    await saveRefreshToken([userId, deviceId, refreshToken]);
    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: { userId, name, phone },
    });
    //save log in DB afterwards because it not critical to be saved before response and also to reduce response time

    // await createAuthLog({
    //   identifier: phone,
    //   action: "REGISTER",
    //   status: "SUCCESS",
    //   authMethod: "password",
    //   req,
    // });
  } catch (error) {
    console.log(error.message);
    return sendError(res, 500, error.message);
  }
}
async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) return clearTokens("Logout Successfully");
    const mainRefreshToken = refreshToken.replace("bearer ", "");
    const verificationResult = await verifyAnyToken(
      mainRefreshToken,
      true,
      "refresh",
    );
    if (verificationResult.error) return clearTokens("LogOut Successfully");
    // Optionally check if token matches in DB

    await removeRefreshTokenById(
      verificationResult.payload.id,
      mainRefreshToken,
    );
    clearTokens("LogOut Successfully");

    function clearTokens(message = "Please login again.") {
      res.clearCookie("access_token", cookieOptions);
      res.clearCookie("refresh_token", cookieOptions);
      return sendSuccess(res, 201, message);
    }
  } catch (error) {
    console.log(error);
    sendError(res, 400, "Server error during logout");
  }
}
async function userInfo(req, res) {
  try {
    const user = req.user;
    const id = user?.id;
    if (!id) return sendError(res, 400, "User ID not found in token.");

    const userData = await findUserById(id);
    if (!userData) return sendError(res, 404, "User not found.");
    return sendSuccess(
      res,
      200,
      "User info fetched successfully",
      userData?.data,
    );
  } catch (error) {
    console.log(error.message);
    sendError(res, 500, "Server error while fetching user info.");
  }
}

module.exports = { register, login, logout, userInfo };
