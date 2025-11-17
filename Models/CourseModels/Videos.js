const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
  {
    title: String,
    path: String,
    fullPath: String,
    duration: Number,
    description: String,
    filesize: Number,
  },
  { timestamps: true }
);

const Videos = mongoose.model("Videos", VideoSchema);
module.exports = { Videos };
