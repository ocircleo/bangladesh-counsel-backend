const express = require("express");
const course_router = express.Router();

const { Courses } = require("../Models/Course");
const { sendSuccess, sendError } = require("../utls/ReturnFunctations");
const { slugGenerator } = require("../utls/Slug");
const { isUserAuthorized, accessTokenValidation } = require("../utls/AuthFunctations");
const { Modules } = require("../Models/CourseModels/Modules");

/**
 * @route DELETE /api/courses/create-course
 * @access Private (Admin only)
 */
course_router.post("/create-course",accessTokenValidation,isUserAuthorized, async (req, res) => {
  try {
    const data = req.body.data;

    // We purposely ignore course_image & modules on creation
    const newCourse = new Courses({
      title: data.title,
      slug: slugGenerator(data.title),
      description: data.description,
      what_you_will_learn: data.what_you_will_learn,
      course_includes: data.course_includes,
      requirements: data.requirements,
      price: data.price,
      language: data.language,
      category: data.category,
      course_location_type: data.course_location_type,
      instructors: data.instructors,
      createdBy: req.user._id,
    });
    const course = await newCourse.save();
    sendSuccess(res, 201, "Course created successfully", course);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
/**
 * @route POST /api/courses/update-course
 * @access Private (Admin only)
 */
course_router.post("/update-course",accessTokenValidation,isUserAuthorized, async (req, res) => {
  try {
    const data = req.body.data;
    const id = req.body.id;

    // We purposely ignore course_image & modules on creation
    const courseUpdateData = {
      title: data.title,
      description: data.description,
      what_you_will_learn: data.what_you_will_learn,
      course_includes: data.course_includes,
      requirements: data.requirements,
      price: data.price,
      language: data.language,
      category: data.category,
      course_location_type: data.course_location_type,
      instructors: data.instructors,
      createdBy: req.user._id,
    };
    const course = await Courses.findByIdAndUpdate(id, courseUpdateData);

    sendSuccess(res, 201, "Course created successfully", course);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
/**
 * @route DELETE /api/courses/delete-course/:id
 * @access Private (Admin only)
 */
course_router.delete("/delete-course/:id",accessTokenValidation,isUserAuthorized, async (req, res) => {
  const id = req.params.id;

  try {
    const course = await Courses.findById(id);
    if (!course) {
      return sendError(res, 404, "Course not found");
    }
    if (
      course?.modules?.length > 0 ||
      course?.course_image?.length > 3 ||
      course?.course_image2?.length > 3
    ) {
      return sendError(
        res,
        400,
        "Cannot delete course with existing modules or images",
      );
    } else {
      await Courses.findByIdAndDelete(id);
      sendSuccess(res, 200, "Course deleted successfully", {});
    }
  } catch (error) {
    sendError(res, 500, error.message);
  }
});
/**
 * @route PUT /api/courses/upload-image
 * @access Private (Admin only)
 */
course_router.put("/upload-image",accessTokenValidation,isUserAuthorized, async (req, res) => {
  const id = req.body.id;
  const url = req.body.url;
  const targetIndex = req.body.targetIndex;
  const data = {};
  if (targetIndex == 0) data.course_image = url;
  else data.course_image2 = url;
  try {
    const course = await Courses.findById(id);
    if (!course) {
      return sendError(res, 404, "Course not found");
    }
    await Courses.findByIdAndUpdate(id, data);
    sendSuccess(res, 200, "Image Uploaded successfully", {});
  } catch (error) {
    sendError(res, 500, error.message);
  }
});
/**
 * @route PATCH /api/courses/course-image-update
 * @access Private (Admin only)
 */
course_router.patch("/course-image-update",accessTokenValidation,isUserAuthorized, async (req, res) => {
  try {
    const { course_image, id } = req.body;

    if (!course_image) {
      return res
        .status(400)
        .json({ success: false, message: "course_image is required" });
    }

    const course = await Courses.findByIdAndUpdate(
      id,
      { course_image },
      { new: true },
    );

    sendSuccess(res, 201, "course image updated", course);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route DELETE /api/courses/delete-image
 * @access Private (Admin only)
 */
course_router.delete("/delete-image",accessTokenValidation,isUserAuthorized, async (req, res) => {
  const id = req.body.id;
  const url = req.body.url;
  const targetIndex = req.body.targetIndex;
  const data = {};
  if (targetIndex == 0) data.course_image = url;
  else data.course_image2 = url;
  try {
    const course = await Courses.findById(id);
    if (!course) {
      return sendError(res, 404, "Course not found");
    }
    await Courses.findByIdAndUpdate(id, data);
    sendSuccess(res, 200, "Image deleted successfully", {});
  } catch (error) {
    sendError(res, 500, error.message);
  }
});
/**
 * @route GET /courses/modules/:id
 * @access Private (Admin only)
 * @state TEST
 */
course_router.get("/modules/:id", async (req, res) => {
  try {
    let id = req.params?.id;
    const course = await Courses.findById(id).populate("modules")
    const modules = course.modules;


    sendSuccess(res, 201, "Found modules", modules);
  } catch (error) {
    sendError(res,400,error.message);
  }
});
/**
 * @route POST /courses/add-course-module
 * @access Private (Admin only)
 * @state prod
 */
course_router.post("/add-course-module",accessTokenValidation,isUserAuthorized, async (req, res) => {
  try {
    let data = req.body?.data;
     // data = {title,description,published,isPublic,course(courseId)}
     const module = new Modules(data);
     const result = await module.save();
     
    const courseUpdateResult = await Courses.findByIdAndUpdate(
      data.course,
      { $push: { modules: result._id } },
      { new: true },
    );

    sendSuccess(res, 201, "Module added successfully", result);
  } catch (error) {
    sendError(res,400,error.message);
  }
});
/**
 * @route PUT /courses/update-course-module
 * @access Protected (Authorized users)
 * @state dev
 */
course_router.post("/add-course-module",accessTokenValidation,isUserAuthorized, async (req, res) => {
  try {
    let data = req.body?.data;
    const id = req.body?.moduleId;
     // data = {title,description,published,isPublic,course(courseId)}
    const updateResult = Modules.findByIdAndUpdate(id,data)
    sendSuccess(res, 201, "Module added successfully", updateResult);
  } catch (error) {
    sendError(res,400,error.message);
  }
});
module.exports = { course_router };
