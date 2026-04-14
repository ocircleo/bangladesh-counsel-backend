const { findUserById } = require("../../repo/user/user");
const {
  sendError,
  sendSuccess,
} = require("../../shared/utility/res/ReturnFunctations");
const {
  searchUsersInDB,
  searchUsersInDBCount,
  blockUserInDB,
  makeAdminInDb,
  unBlockUserInDB,
  removeAdminInDb,
  searchAdminsInDB,
} = require("./admin.repo");

async function searchUsers(req, res) {
  try {
    const phone = String(req?.query?.phone || "");
    const role = String(req?.query?.role || "");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let dataArray = [phone, skip, limit, role];
    const [rows, countResult] = await Promise.all([
      searchUsersInDB(dataArray),
      searchUsersInDBCount([phone]),
    ]);

    if (countResult.error)
      return sendError(res, 501, "Some error happned searching in db");
    const noOfPages = Math.ceil(parseInt(countResult?.data || 10) / limit);

    sendSuccess(res, 201, "test success", {
      users: rows?.data,
      count: noOfPages,
    });
  } catch (error) {
    sendError(res, 401, error.message);
  }
}
async function userDetaill(req, res) {
  try {
    const id = req.params.id;

    const result = await findUserById(id);

    if (result.error)
      return sendError(res, 501, "Some error happned searching in db");

    sendSuccess(res, 201, "User blocked", result?.data);
  } catch (error) {
    sendError(res, 401, error.message);
  }
}
async function blockUser(req, res) {
  try {
    const id = req.params.id;

    const result = await blockUserInDB([id]);

    if (result.error)
      return sendError(res, 501, "Some error happned searching in db");

    sendSuccess(res, 201, "User blocked");
  } catch (error) {
    sendError(res, 401, error.message);
  }
}
async function unBlockUser(req, res) {
  try {
    const id = req.params.id;

    const result = await unBlockUserInDB([id]);

    if (result.error)
      return sendError(res, 501, "Some error happned searching in db");

    sendSuccess(res, 201, "User Un blocked");
  } catch (error) {
    sendError(res, 401, error.message);
  }
}
async function makeAdmin(req, res) {
  try {
    const id = req.params.id;

    const result = await makeAdminInDb([id]);
    
    if (result.error)
      return sendError(res, 501, "Some error happned searching in db");

    sendSuccess(res, 201, "User is now admin");
  } catch (error) {
    sendError(res, 401, error.message);
  }
}
async function removeAdmin(req, res) {
  try {
    const id = req.params.id;
    const admins = await searchAdminsInDB();
    if (admins.data.length < 2)
      return sendError(res, 501, "At least 1 admin is required");

    const result = await removeAdminInDb([id]);

    if (result.error)
      return sendError(res, 501, "Some error happned searching in db");

    sendSuccess(res, 201, "User removed from admin");
  } catch (error) {
    sendError(res, 401, error.message);
  }
}
module.exports = {
  searchUsers,
  blockUser,
  unBlockUser,
  makeAdmin,
  removeAdmin,
  userDetaill,
};
