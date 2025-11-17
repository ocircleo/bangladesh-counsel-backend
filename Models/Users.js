const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    email_address: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    bought_courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    address: { type: String },
    date_of_birth: { type: Date },
    role: { type: String, default: "user", enum:["user","admin","instructor","super-admin"]},
    date_registered: { type: Date, default: Date.now },
    disabled: { type: Boolean, default: false },
    news_letter: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Users = mongoose.model("Users", UserSchema);
module.exports = { Users };
