const { default: mongoose } = require("mongoose");

const DeviceInfoSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
    },
    browser: {
      type: String,
      default: "Unknown",
    },
    os: {
      type: String,
      default: "Unknown",
    },
    deviceType: {
      type: String,
      enum: ["mobile", "tablet", "desktop"],
      default: "desktop",
    },
    userAgent: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const AuthLogSchema = new mongoose.Schema(
  {
    identifier: {
      type: String, // email OR phone
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: ["LOGIN", "REGISTER", "LOGOUT"],
      required: true,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
    },

    authMethod: {
      type: String,
      enum: ["password", "otp", "oauth", "refresh"],
      default: "password",
    },

    deviceInfo: {
      type: DeviceInfoSchema,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt = log time
    versionKey: false,
  }
);

const AuthLogModel = mongoose.model("AuthLog", AuthLogSchema);
module.exports = { AuthLogModel };
