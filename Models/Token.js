const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "7d" } // auto-remove after 7 days
});

module.exports = mongoose.model("Token", TokenSchema);
