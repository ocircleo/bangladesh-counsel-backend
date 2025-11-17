const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema(
  {
    title: String,
    url: String,
  },
  { timestamps: true }
);
const Resources = mongoose.model("Resources", ResourceSchema);
module.exports = { Resources };
