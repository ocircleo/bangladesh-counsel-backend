const express = require("express");
const { Users } = require("../Models/Users");
const { generateUUID } = require("../libs/token/AuthToken");
const { hashPassword, comparePassword } = require("../utls/BCrypt");
const {
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
  verifyAnyToken,
} = require("../utls/JWTFunctions");

const { sendError, sendSuccess } = require("../utls/ReturnFunctations");
const { createAuthLog, clearOldAuthLogs } = require("../libs/auth/AuthLog");
const {
  SaveRefreshToken,
  removeOlderRefreshToken,
} = require("../libs/auth/SaveRefreshToken");

const { prodMode, domain } = require("../modeConfig");
const { RefreshToken } = require("../Models/Token");
const { accessTokenValidation } = require("../utls/AuthFunctations");
const { default: Delay } = require("../utls/Delay");
const Authentication_Route = express.Router();

const cookieOptions = {
  httpOnly: true,
  secure: prodMode,
  sameSite: prodMode ? "none" : "lax",
  domain: domain,
};
Authentication_Route.get("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) return clearTokens("Logout Successfully");
    const mainRefreshToken = refreshToken.replace("bearer ", "");
    const payload = await verifyAnyToken(mainRefreshToken, true, "refresh");
    if (payload.error) return clearTokens("LogOut Successfully");
    // Optionally check if token matches in DB

    const tokenInDb = await RefreshToken.findOneAndDelete({
      token: mainRefreshToken,
      user: payload.payload.payload.id,
    });
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
});
Authentication_Route.get(
  "/userInfo",
  accessTokenValidation,
  async (req, res) => {
    try {
      const user = req.user;
      const id = user?.id;
      if (!id) return sendError(res, 400, "User ID not found in token.");
      await Delay(3 * 1000);
      const userData = await Users.findById(id).select(
        "_id name role phone cart bought_courses blocked"
      );
      if (!userData) return sendError(res, 404, "User not found.");
      return sendSuccess(res, 200, "User info fetched successfully", userData);
    } catch (error) {
      console.log(error.message);
      sendError(res, 500, "Server error while fetching user info.");
    }
  }
);

Authentication_Route.post("/register", async (req, res) => {
  try {
    const { name, phone, password, news_letter } = req.body;
    // Basic validation
    if (!name || !phone || !password)
      return sendError(res, 400, "All fields are required.");
    // Check if user already exists
    const existingUser = await Users.findOne({ phone });
    if (existingUser)
      return sendError(res, 400, "Phone number already registered.");
    //hash password
    const hashedPassword = await hashPassword(password);
    // Create new user
    const newUser = new Users({
      name,
      phone,
      role: "user",
      password: hashedPassword,
      news_letter: news_letter || false,
    });
    const savedUser = await newUser.save();

    const userId = savedUser.id;
    const deviceId = generateUUID();
    const tokenPayload = { id: userId, role: "user", deviceId: deviceId };
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
    await SaveRefreshToken(userId, deviceId, refreshToken);
    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: { userId, name, phone },
    });
    //save log in DB afterwards because it not critical to be saved before response and also to reduce response time

    await createAuthLog({
      identifier: phone,
      action: "REGISTER",
      status: "SUCCESS",
      authMethod: "password",
      req,
    });
  } catch (error) {
    console.log(error.message);
    return sendError(res, 500, "Server error during registration.");
  }
});
Authentication_Route.put("/login", async (req, res) => {
  try {
    const previousDeviceId = req.cookies["device_id"];
    const { phone, password, remember } = req.body;
    // Basic validation
    if (!phone || !password)
      return sendError(res, 400, "Phone and password are required.");
    // Check if user exists
    const user = await Users.findOne({ phone });
    if (!user) return sendError(res, 400, "Invalid phone or password.");
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid)
      return sendError(res, 400, "Invalid phone or password.");
    const userId = user.id;
    let deviceId;
    //if device id exists from cookie then use it otherwise generate new one as device id has long expiry
    if (previousDeviceId) deviceId = previousDeviceId;
    else deviceId = generateUUID();
    const tokenPayload = { id: userId, role: user.role, deviceId: deviceId };
    const accessToken = await generateToken(tokenPayload, "30m");
    const refreshToken = await generateRefreshToken(
      tokenPayload,
      remember ? "7d" : "1d"
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
    await SaveRefreshToken(userId, deviceId, refreshToken);
    res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      data: { userId, name: user.name, phone },
    });
    //save  log in DB afterwards because it's not critical to be saved before response and also to reduce response time
    //Hope this runs :)
    await createAuthLog({
      identifier: phone,
      action: "LOGIN",
      status: "SUCCESS",
      authMethod: "password",
      req,
    });
    //Happy if this goes well :)
    await removeOlderRefreshToken(userId, deviceId);
    await clearOldAuthLogs(phone);
  } catch (error) {
    console.log(error.message);
    return sendError(res, 500, "Server error during Login.");
  }
});

module.exports = { Authentication_Route };
