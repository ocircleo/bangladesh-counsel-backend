const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserInfo",
    required: true,
  },
  deviceId: { type: String, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "7d" }, // auto-remove after 7 days
});

const RefreshToken = mongoose.model("RefreshToken", TokenSchema);
module.exports = { RefreshToken };
