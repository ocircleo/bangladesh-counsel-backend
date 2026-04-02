const express = require("express");

const {
  register,
  login,
  logout,
  userInfo,
  refresh,
} = require("./auth.service");
const {
  accessTokenValidation,
} = require("../shared/utility/cryptic/AuthFunctations");

const AuthRoute = express.Router();

AuthRoute.put("/login", login);
AuthRoute.post("/register", register);

AuthRoute.get("/logout", logout);
AuthRoute.get("/userInfo", accessTokenValidation, userInfo);

module.exports = AuthRoute;
