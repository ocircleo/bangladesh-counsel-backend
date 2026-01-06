const express = require("express");
const { Users } = require("../Models/Users");
const { generateUUID } = require("../libs/token/AuthToken");
const { hashPassword, comparePassword } = require("../utls/BCrypt");
const {
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
} = require("../utls/JWTFunctions");

const { sendError } = require("../utls/ReturnFunctations");
const { createAuthLog, clearOldAuthLogs } = require("../libs/auth/AuthLog");
const {
  SaveRefreshToken,
  removeOlderRefreshToken,
} = require("../libs/auth/SaveRefreshToken");

const { prodMode, domain } = require("../modeConfig");
const { RefreshToken } = require("../Models/Token");
const Authentication_Route = express.Router();

const cookieOptions = {
  httpOnly: true,
  secure: prodMode,
  sameSite: prodMode ? "none" : "lax",
  domain: domain,
};

Authentication_Route.put("/generate-new-token", async (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) {
    return sendError(res, 400, "Please Login Again");
  }
  //This will return payload even if token is expired
  const payload = verifyRefreshToken(token.replace("bearer ", ""));
  if (!payload) {
    return res.clearCookie("access_token", cookieOptions).status(200).send({
      success: false,
      message: "Please Login Again",
      data: {},
    });
  }
  // Optionally check if token matches in DB
  try {
    const tokenInDb = await RefreshToken.findOne({
      token: token.replace("bearer ", ""),
      user: payload.id,
    });
    if (!tokenInDb) {
      return res.clearCookie("access_token", cookieOptions).status(200).send({
        success: false,
        message: "Please Login Again",
        data: {},
      });
    }
    const user = await Users.findById(payload.id);
    const tokenPayload = {
      id: user._id,
      role: user.role,
      deviceId: payload.deviceId,
    };
    const accessToken = generateToken(tokenPayload, "30m");
    res.cookie("access_token", `bearer ${accessToken}`, {
      ...cookieOptions,
      maxAge: 30 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "Access Token Generated Successfully.",
      data: {},
    });
  } catch (err) {
    return sendError(res, 500, "Server error while validating token.");
  }
});

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

    const userId = savedUser._id;
    const deviceId = generateUUID();
    const tokenPayload = { id: userId, role: "user", deviceId: deviceId };
    const accessToken = generateToken(tokenPayload, "30m");
    const refreshToken = generateRefreshToken(tokenPayload, "7d");

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
    const { phone, password,remember } = req.body;
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
    const userId = user._id;
    let deviceId;
    //if device id exists from cookie then use it otherwise generate new one as device id has long expiry
    if (previousDeviceId) deviceId = previousDeviceId;
    else deviceId = generateUUID();
    const tokenPayload = { id: userId, role: "user", deviceId: deviceId };
    const accessToken = generateToken(tokenPayload, "30m");
    const refreshToken = generateRefreshToken(tokenPayload, remember ? "7d" : "1d");
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
