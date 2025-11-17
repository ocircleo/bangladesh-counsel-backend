const express = require("express");
const { isUserAdmin } = require("../utls/AuthFunctations");
const { sendSuccess, sendError } = require("../utls/ReturnFunctations");
const Course = require("../Models/Course");
const course_router = express.Router();
// POST /api/courses
course_router.post("/create-course", async (req, res) => {
  try {
    const data = req.body;

    // We purposely ignore course_image & modules on creation
    const course = await Course.create({
      title: data.title,
      description: data.description,
      what_you_will_learn: data.what_you_will_learn,
      course_includes: data.course_includes,
      requirements: data.requirements,
      price: data.price,
      language: data.language,
      instructors: data.instructors,
      createdBy: req.user._id,
    });
    sendSuccess(res, 201, "Course created successfully", course);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// PATCH /api/courses/:id/image
course_router.patch("/course-image-update", async (req, res) => {
  try {
    const { course_image, id } = req.body;

    if (!course_image) {
      return res
        .status(400)
        .json({ success: false, message: "course_image is required" });
    }

    const course = await Course.findByIdAndUpdate(
      id,
      { course_image },
      { new: true }
    );

    sendSuccess(res, 201, "course image updated", course);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/courses/:id/module
course_router.patch("/add-course-module", async (req, res) => {
  try {
    const { moduleId, courseId } = req.body;

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: "moduleId is required",
      });
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      { $push: { modules: moduleId } }, // only ONE module
      { new: true }
    );

    sendSuccess(res, 201, "Module added successfully", course);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



module.exports = { course_router };
