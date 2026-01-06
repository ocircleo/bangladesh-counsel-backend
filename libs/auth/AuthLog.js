const UAParser = require("ua-parser-js");
const { AuthLogModel } = require("../../Models/AuthLogModel");
async function createAuthLog({
  identifier,
  action,
  status,
  authMethod = "password",
  req,
}) {
  try {
    const uaParser = new UAParser(req.headers["user-agent"]);
    const ua = uaParser.getResult();

    const log = new AuthLogModel({
      identifier,
      action,
      status,
      authMethod,
      deviceInfo: {
        ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
        browser: ua.browser.name || "Unknown",
        os: ua.os.name || "Unknown",
        deviceType: ua.device.type || "desktop",
        userAgent: req.headers["user-agent"] || "unknown",
      },
    });
    await log.save();
  } catch (error) {
    // Logging failures should NEVER break auth flow
    console.error("Auth log error:", error.message);
  }
}

const clearOldAuthLogs = async (identifier) => {
  try {
    const previousLogs = await AuthLogModel.find({ phone: identifier }).sort({
      createdAt: 1,
    });
    if (previousLogs.length <= 10) return; //no need to delete
    const logsToDelete = previousLogs.slice(0, previousLogs.length - 10);
    const deletePromises = logsToDelete.map((log) =>
      AuthLogModel.deleteOne({ _id: log._id })
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error clearing old auth logs:", error.message);
  }
};

module.exports = { createAuthLog, clearOldAuthLogs };
