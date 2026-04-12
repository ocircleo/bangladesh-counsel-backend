const express = require("express");
const {
  accessTokenValidation,
  isUserAdmin,
} = require("../../shared/utility/cryptic/AuthFunctations");
const { courseSearch, getCourseBasicInfo } = require("./common.service");

const commonRoute = express.Router();

commonRoute.get("/course-search", courseSearch);
commonRoute.get("/get-course-basic-info/:id", getCourseBasicInfo);


module.exports = commonRoute;
