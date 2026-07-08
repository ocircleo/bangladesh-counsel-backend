const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema(
  {
    title: { type: String, default: "not title provided" },
    description: { type: String, default: "not title provided" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Courses" },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Videos" }],
    resources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resources" }],
    duration: { type: Number, default: 0 },
    published: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
const Modules = mongoose.model("Modules", ModuleSchema);
module.exports = { Modules };
