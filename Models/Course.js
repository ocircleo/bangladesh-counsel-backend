const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    course_image: String,
    coupon_code: { type: String, default: "" },
    special_offer: { type: Boolean, default: false },
    offer_price: { type: Number, default: 0 },
    offer_end_date: { type: Date },
    totalEnrollment: { type: Number, default: 0 },
    what_you_will_learn: String,
    course_includes: String,
    requirements: String,
    price: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
    language: { type: [], default: ["English"] },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Modules" }],
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
