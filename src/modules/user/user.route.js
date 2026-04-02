const express = require("express");
const { updateProfile, updatePassword } = require("./user.service");
const {
  accessTokenValidation,
} = require("../../shared/utility/cryptic/AuthFunctations");

const UserRoute = express.Router();

UserRoute.put("/update-profile", accessTokenValidation, updateProfile);
UserRoute.put("/update-password", accessTokenValidation, updatePassword);

module.exports = UserRoute;
