const express = require("express");
const { sendSuccess, sendError } = require("../utls/ReturnFunctations");
const Course = require("../Models/Course");
const course_router = express.Router();

// POST /api/courses
course_router.delete("/delete-course/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const course = await Course.findById(id);
    if (!course) {
      return sendError(res, 404, "Course not found");
    }
    if (course?.modules?.length > 0 || course?.course_image?.length > 3 || course?.course_image2?.length > 3) {
      return sendError(res, 400, "Cannot delete course with existing modules or images");
    } else {
      await Course.findByIdAndDelete(id);
      sendSuccess(res, 200, "Course deleted successfully", {});
    }
  } catch (error) {
    sendError(res, 500, error.message);
  }
});
course_router.put("/upload-image", async (req, res) => {
  const id = req.body.id;
  const url = req.body.url;
  const targetIndex = req.body.targetIndex;
  const data = {};
  if(targetIndex == 0) data.course_image = url;
  else data.course_image2 = url;
  try {
    const course = await Course.findById(id);
    if (!course) {
      return sendError(res, 404, "Course not found");
    }
    await Course.findByIdAndUpdate(id,data);
    sendSuccess(res, 200, "Image Uploaded successfully", {});
  } catch (error) {
    sendError(res, 500, error.message);
  }
});
course_router.delete("/delete-image", async (req, res) => {
  const id = req.body.id;
  const url = req.body.url;
  const targetIndex = req.body.targetIndex;
  const data = {};
  if(targetIndex == 0) data.course_image = url;
  else data.course_image2 = url;
  try {
    const course = await Course.findById(id);
    if (!course) {
      return sendError(res, 404, "Course not found");
    }
    await Course.findByIdAndUpdate(id,data);
    sendSuccess(res, 200, "Image deleted successfully", {});
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

course_router.post("/create-course", async (req, res) => {
  try {
    const data = req.body.data;
    
    // We purposely ignore course_image & modules on creation
    const newCourse = new Course({
      title: data.title,
      description: data.description,
      what_you_will_learn: data.what_you_will_learn,
      course_includes: data.course_includes,
      requirements: data.requirements,
      price: data.price,
      language: data.language,
      category: data.category,
      type: data.type,
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
course_router.post("/update-course", async (req, res) => {
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
      type: data.type,
      instructors: data.instructors,
      createdBy: req.user._id,
    };
    const course = await Course.findByIdAndUpdate(id,courseUpdateData)
    
    sendSuccess(res, 201, "Course created successfully", course);
  } catch (error) {
    console.log(error);
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
