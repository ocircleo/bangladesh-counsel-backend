const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    email_address: { type: String, required: false},
    phone: { type: String,required:true, unique:true },
    password: { type: String, required: true },
    cart: [],
    bought_courses: [],
    address: { type: String },
    date_of_birth: { type: Date },
    role: { type: String, default: "user"},
    blocked: { type: Boolean, default: false },
    news_letter: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Users = mongoose.model("UserInfo", UserSchema);
module.exports = { Users };
