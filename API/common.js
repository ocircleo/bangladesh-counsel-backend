const express = require("express");
const bcrypt = require("bcrypt");
const common_router = express.Router();

const { Users } = require("../Models/Users");
const { Courses } = require("../Models/Course");
const { accessTokenValidation } = require("../utls/AuthFunctations");
const { sendSuccess, sendError } = require("../utls/ReturnFunctations");

common_router.get("/get-course/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const course = await Courses.findById(id).populate({ path: "instructors", select: "name" });
    sendSuccess(res, 200, "Course fetched successfully", course);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
common_router.get("/get-course-basic-info/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const course = await Courses.findById(id)
      .populate({ path: "instructors", select: "name -_id" })
      .select({
        title: 1,
        description: 1,
        instructors: 1,
      });
    sendSuccess(res, 200, "Course fetched successfully", course);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
common_router.get("/get-courses", async (req, res) => {
  try {
    //  await Delay(3000);
    const text = req?.query?.text || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filters = {};
    if (text.length > 0) filters["title"] = { $regex: text, $options: "i" };
    console.log(filters);
    const courses = await Courses.find(filters).skip(skip).limit(limit);
    const total = await Courses.countDocuments(filters);
    res
      .status(200)
      .json({ success: true, data: courses, total: Math.ceil(total / limit) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
common_router.get("/search_users", async (req, res) => {
  const phone = req?.query?.phone;
  const role = req?.query?.role;
  const page = req?.query?.page || 1;
  const skip = page * 12;
  const filter = {};
  if (phone) filter.phone = phone;
  if (role && role != "all") filter.role = role;

  try {
    const users = await Users.find(filter).skip(skip).limit(12);
    const usersLength = await Users.find(filter).countDocuments();

    res.status(200).send({
      success: true,
      result: { data: users, length: usersLength },
      message: "found users",
    });
  } catch (error) {
    res.status(404).send({ success: false, result: [], message: "" });
  }
});
// ============ PROFILE MANAGEMENT ============

/**
 * @route GET /common/profile
 * @description Get current user's profile
 * @access Private
 */
common_router.get("/profile", accessTokenValidation, async (req, res) => {
  try {
    const user = await Users.findById(req.user._id).populate("labs");
    if (!user) {
      return sendError(res, 404, "User not found.");
    }
    return sendSuccess(res, 200, "Profile retrieved successfully.", {
      id: user._id,
      name: user.name,
      email_address: user.email_address,
      phone: user.phone,
      address: user.address,
      role: user.role,
      customId: user.customId,
      labs: user.labs,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error while retrieving profile.");
  }
});

/**
 * @route PUT /common/profile
 * @description Update user's profile (name, phone, address)
 * @access Private
 */
common_router.put("/profile", accessTokenValidation, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await Users.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).populate("labs");

    if (!user) {
      return sendError(res, 404, "User not found.");
    }
    return sendSuccess(res, 200, "Profile updated successfully.", {
      id: user._id,
      name: user.name,
      email_address: user.email_address,
      phone: user.phone,
      address: user.address,
      role: user.role,
    });
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error while updating profile.");
  }
});

/**
 * @route PUT /common/change-password
 * @description Change user's password
 * @access Private
 */
common_router.put(
  "/change-password",
  accessTokenValidation,
  async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        return sendError(res, 400, "All password fields are required.");
      }

      if (newPassword !== confirmPassword) {
        return sendError(res, 400, "New passwords do not match.");
      }

      if (newPassword.length < 6) {
        return sendError(res, 400, "Password must be at least 6 characters.");
      }

      const user = await Users.findById(req.user._id);
      if (!user) {
        return sendError(res, 404, "User not found.");
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return sendError(res, 401, "Current password is incorrect.");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      return sendSuccess(res, 200, "Password changed successfully.");
    } catch (error) {
      console.log(error);
      return sendError(res, 500, "Server error while changing password.");
    }
  },
);

/**
 * @route GET /common/devices
 * @description Get paginated list of devices (user can see their assigned devices)
 * @access Private
 * @query page: number, limit: number
 */
common_router.get("/labs", accessTokenValidation, async (req, res) => {
  try {
    const dept = req.query?.dept; // dept may be -> null, undefined, "",
    const filters = [null, undefined, ""];
    if (filters.includes(dept)) dept = "all";

    if (dept == "all") {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const items = await Items.find().skip(skip).limit(limit);
      const total = await Items.countDocuments();
      return sendSuccess(res, 200, "Devices retrieved successfully.", {
        items,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
    }
    const items = await Items.find({ dept: dept }).skip(skip).limit(limit);
    const total = await Items.countDocuments({ dept: dept });

    return sendSuccess(res, 200, "Devices retrieved successfully.", {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error while retrieving devices.");
  }
});
common_router.get("/labs/:labId", accessTokenValidation, async (req, res) => {
  try {
    const labId = req.params.labId;

    const fullLab = await Labs.find({ _id: labId })
      .populate("items")
      .populate({ path: "admins", select: "name" })
      .populate({ path: "staffs", select: "name" });
    return sendSuccess(res, 200, "Devices retrieved successfully.", {
      fullLab,
    });
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error while retrieving devices.");
  }
});

module.exports = { common_router };
