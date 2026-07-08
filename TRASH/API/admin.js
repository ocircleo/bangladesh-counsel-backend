const express = require("express");
const { isUserAdmin } = require("../utls/AuthFunctations");
const Labs = require("../Models/Labs");
const { Users } = require("../Models/Users");
const { sendSuccess, sendError } = require("../utls/ReturnFunctations");
const Logs = require("../Models/Logs");
const { printConsumedTime } = require("../utls/RequestTimeInfo");

const admin_router = express.Router();

// ============ LAB MANAGEMENT ============

/**
 * @route POST /admin/labs
 * @description Create a new lab
 * @access Private (Admin only)
 */
admin_router.post("/labs", isUserAdmin, async (req, res) => {
  try {
    const { name, type, dept } = req.body;

    if (!name || !type || !dept) {
      return sendError(res, 400, "Lab name, type, and department are required.");
    }

    const newLab = new Labs({
      name,
      type,
      dept,
      admins: [req.user._id],
      staffs: [],
      items: [],
    });

    await newLab.save();

    // Add lab to admin's labs array
    await Users.findByIdAndUpdate(req.user._id, {
      $addToSet: { labs: newLab._id },
    });

    printConsumedTime(req, "Create Lab ---");
    return sendSuccess(res, 201, "Lab created successfully.", {
      labId: newLab._id,
      name: newLab.name,
      type: newLab.type,
      dept: newLab.dept,
    });
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error while creating lab.");
  }
});

/**
 * @route GET /admin/labs
 * @description Get all labs
 * @access Private (Admin only)
 * @query page: number, limit: number
 */
admin_router.get("/labs", isUserAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const labs = await Labs.find()
      .populate("admins", "name email_address")
      .populate("staffs", "name email_address")
      .populate("items")
      .skip(skip)
      .limit(limit);

    const total = await Labs.countDocuments();

    printConsumedTime(req, "Get Labs ---");
    return sendSuccess(res, 200, "Labs retrieved successfully.", {
      labs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error while retrieving labs.");
  }
});

/**
 * @route GET /admin/labs/:labId
 * @description Get specific lab details
 * @access Private (Admin only)
 */
admin_router.get("/labs/:labId", isUserAdmin, async (req, res) => {
  try {
    const { labId } = req.params;

    const lab = await Labs.findById(labId)
      .populate("admins", "name email_address")
      .populate("staffs", "name email_address")
      .populate("items");

    if (!lab) {
      return sendError(res, 404, "Lab not found.");
    }

    printConsumedTime(req, "Get Lab Details ---");
    return sendSuccess(res, 200, "Lab details retrieved successfully.", lab);
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error while retrieving lab.");
  }
});

/**
 * @route PUT /admin/labs/:labId
 * @description Update lab details
 * @access Private (Admin only)
 */
admin_router.put("/labs/:labId", isUserAdmin, async (req, res) => {
  try {
    const { labId } = req.params;
    const { name, type, dept } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (dept) updateData.dept = dept;

    const updatedLab = await Labs.findByIdAndUpdate(labId, updateData, {
      new: true,
    })
      .populate("admins", "name email_address")
      .populate("staffs", "name email_address")
      .populate("items");

    if (!updatedLab) {
      return sendError(res, 404, "Lab not found.");
    }

    printConsumedTime(req, "Update Lab ---");
    return sendSuccess(res, 200, "Lab updated successfully.", updatedLab);
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error while updating lab.");
  }
});

/**
 * @route DELETE /admin/labs/:labId
 * @description Delete a lab
 * @access Private (Admin only)
 */
admin_router.delete("/labs/:labId", isUserAdmin, async (req, res) => {
  try {
    const { labId } = req.params;

    const lab = await Labs.findByIdAndDelete(labId);
    if (!lab) {
      return sendError(res, 404, "Lab not found.");
    }

    // Remove lab from all users
    await Users.updateMany({ labs: labId }, { $pull: { labs: labId } });

    printConsumedTime(req, "Delete Lab ---");
    return sendSuccess(res, 200, "Lab deleted successfully.", {
      labId: lab._id,
    });
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error while deleting lab.");
  }
});

// ============ DEVICE/ITEM MANAGEMENT ============

/**
 * @route POST /admin/devices
 * @description Create a new device/item
 * @access Private (Admin only)
 */
admin_router.post("/devices", isUserAdmin, async (req, res) => {
  try {
    const { name, category, labId, majorComponent, minorDescription } =
      req.body;

    if (!name || !category || !labId) {
      return sendError(
        res,
        400,
        "Device name, category, and lab are required."
      );
    }

    const Items = require("../Models/Items");
    const newItem = new Items({
      name,
      category,
      labId,
      majorComponent: majorComponent || {},
      minorDescription,
      createdBy: req.user._id,
      currentState: "working",
    });

    await newItem.save();

    // Add item to lab's items array
    await Labs.findByIdAndUpdate(labId, { $addToSet: { items: newItem._id } });

    printConsumedTime(req, "Create Device ---");
    return sendSuccess(res, 201, "Device created successfully.", {
      deviceId: newItem._id,
      name: newItem.name,
      category: newItem.category,
      status: newItem.currentState,
    });
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error while creating device.");
  }
});

/**
 * @route GET /admin/devices
 * @description Get all devices/items
 * @access Private (Admin only)
 * @query page: number, limit: number
 */
admin_router.get("/devices", isUserAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const Items = require("../Models/Items");
    const items = await Items.find()
      .populate("labId", "name type dept")
      .populate("createdBy", "name email_address")
      .skip(skip)
      .limit(limit);

    const total = await Items.countDocuments();

    printConsumedTime(req, "Get Devices ---");
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




module.exports = { admin_router };
