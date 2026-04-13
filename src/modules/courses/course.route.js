const express = require("express");
const {
  accessTokenValidation,
  isUserAdmin,
} = require("../../shared/utility/cryptic/AuthFunctations");
const { addCourse, updateCourse, addModule, updateModule, deleteModule, adminCourseSearch, adminCourseById, courseDetaills } = require("./course.service");

const courseRoute = express.Router();

courseRoute.post("/create-course", accessTokenValidation, isUserAdmin, addCourse);
courseRoute.put("/update-course", accessTokenValidation, isUserAdmin, updateCourse);
//courseRoute.delete("/delete-course/:id",accessTokenValidation,isUserAdmin,addCourse);


/**
 * first user inits that we are uploading an image along with the full detaill
 * then after upload finish user will finish the image upload request
 * what if the image fails in midpoint?
 *    user calls the rollback -> deletes the field in db
 * on calling delete the image will be deleted from the storage and db
 *
 */
// courseRoute.post("/image-upload-init",accessTokenValidation,isUserAdmin,addCourse);
// courseRoute.put("/image-upload-finish",accessTokenValidation,isUserAdmin,addCourse);
// courseRoute.delete("/image-upload-rollback",accessTokenValidation,isUserAdmin,addCourse);
// courseRoute.delete("/image-delete",accessTokenValidation,isUserAdmin,addCourse);

// courseRoute.get("/modules/:id", accessTokenValidation, isUserAdmin, addCourse);
courseRoute.post("/add-module", accessTokenValidation, isUserAdmin, addModule);
courseRoute.put("/update-module", accessTokenValidation, isUserAdmin, updateModule);
courseRoute.delete("/delete-module",accessTokenValidation,isUserAdmin, deleteModule);

courseRoute.get("/admin-course-search", adminCourseSearch)
courseRoute.get("/admin-course-by-id/:id",  adminCourseById)
courseRoute.get("/admin-course-details/:courseId", courseDetaills)

module.exports = courseRoute;
