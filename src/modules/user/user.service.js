const { default: Delay } = require("../../../utls/Delay");
const { sendError, sendSuccess } = require("../../../utls/ReturnFunctations");
const { findUserPasswordById } = require("../../repo/user/user");
const {
  comparePassword,
  hashPassword,
} = require("../../shared/utility/cryptic/BCrypt");
const { updateProfileDB, updatePasswordDB } = require("./user.repo");

async function updateProfile(req, res) {
  try {
    const user = await req.user;
    const data = await req.body;

    let dataArray = [data?.name, data?.email, user?.id];
    const result = await updateProfileDB(dataArray);
    if (result.error)
      return sendError(
        res,
        501,
        "Some error happned while inserting in database",
      );
    sendSuccess(res, 201, result.message, {});
  } catch (error) {
    console.log(error);
    sendError(res, 401, error.message);
  }
}
async function updatePassword(req, res) {
  try {
    const user = await req.user;
    const data = await req.body;

    const userData = await findUserPasswordById(user?.id);

    if (userData.error) return sendError(res, 401, "Error While Updating");
    const passwordComarision = await comparePassword(
      data.prevPassword,
      userData.data.password,
    );
    if (!passwordComarision) return sendError(res, 401, "Password Does not match");
    const newHashedPassword = await hashPassword(data.newPassword);

    let dataArray = [newHashedPassword, user?.id];
    const result = await updatePasswordDB(dataArray);
    if (result.error)
      return sendError(
        res,
        501,
        "Some error happned while inserting in database",
      );
    sendSuccess(res, 201, result.message, {});
  } catch (error) {
    console.log(error);
    sendError(res, 401, error.message);
  }
}

module.exports = { updateProfile, updatePassword };
