const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, default: "no title" },
    slug: { type: String, index: true, unique: true },
    description: { type: String, default: "no description" },
    course_image: String,
    course_image2: String,
    category: { type: String, default: "no category" },
    release_date: { type: String, default: "31-11-2026" },
    course_location_type: {
      type: String,
      default: "pre-recorded",
      enum: ["pre-recorded", "online", "in-person"],
    },
    course_location_city: { type: String, default: "dhaka" },
    course_location_up: { type: String, default: "savar" },
    course_location: { type: String, default: "savar radio colony" },
    course_location_country: { type: String, default: "bangladesh" },
    type: { type: String, default: "course" },
    coupon_code: { type: String, default: "31-11-2026" },
    special_offer: { type: Boolean, default: false },
    offer_price: { type: Number, default: 0 },
    offer_end_date: { type: String, date: "31-11-2026" },
    totalEnrollment: { type: Number, default: 0 },
    what_you_will_learn: { type: String, default: "none" },
    course_includes: { type: String, default: "none" },
    requirements: { type: String, default: "none" },
    price: { type: Number, default: 1000 },
    ratings: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
    language: { type: [], default: ["English"] },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Modules" }],
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserInfo" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserInfo" },
  },
  { timestamps: true },
);
const Courses = mongoose.model("Course", CourseSchema);
module.exports = { Courses };
