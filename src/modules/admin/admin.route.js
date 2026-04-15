const express = require("express");
const {
  searchUsers,
  blockUser,
  makeAdmin,
  unBlockUser,
  removeAdmin,
  userDetaill,
  addInstructor,
  removeInstructor,
} = require("./admin.service");
const adminRoute = express.Router();

adminRoute.get("/search-users", searchUsers);
adminRoute.get("/user-detaill/:id", userDetaill);
adminRoute.patch("/block-user/:id", blockUser);
adminRoute.patch("/unblock-user/:id", unBlockUser);
adminRoute.patch("/make-admin/:id", makeAdmin);
adminRoute.patch("/remove-admin/:id", removeAdmin);
adminRoute.post("/add-instructor", addInstructor);
adminRoute.post("/remove-instructor", removeInstructor);
module.exports = adminRoute;
