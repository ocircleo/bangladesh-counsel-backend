const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Videos" }],
    resources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resources" }],
    duration: Number,
    
  },
  { timestamps: true }
);
const Modules = mongoose.model("Modules", ModuleSchema);
module.exports = { Modules };
