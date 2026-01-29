const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema(
  {
    courseId:{type:mongoose.Schema.Types.ObjectId, ref:"Courses"},
    title: String,
    url: String,
    downloadUrl:String,
  },
  { timestamps: true }
);
const Resources = mongoose.model("Resources", ResourceSchema);
module.exports = { Resources };
