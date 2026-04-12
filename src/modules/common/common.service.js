const { findCourseById } = require("../../repo/course/course");
const {
  sendSuccess,
  sendError,
} = require("../../shared/utility/res/ReturnFunctations");
const { searchCourseInDB, searchCourseInDBCount } = require("./common.repo");

async function courseSearch(req, res) {
  try {
    const text = String(req?.query?.text || "");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let dataArray = [text, skip, limit];
    const [rows, countResult] = await Promise.all([
      searchCourseInDB(dataArray),
      searchCourseInDBCount([text]),
    ]);

    if (countResult.error)
      return sendError(res, 501, "Some error happned searching in db");
    const noOfPages = Math.ceil(parseInt(countResult?.data || 10) / limit);
    sendSuccess(res, 201, "test success", {
      courses: rows?.data,
      count: noOfPages,
    });
  } catch (error) {
    sendError(res, 401, error.message);
  }
}
async function getCourseBasicInfo(req, res) {
  try {
    const id = req.params.id;
    const result = await findCourseById(id);

    if (result.error)
      return sendError(res, 501, "Some error happned searching in db");

    sendSuccess(res, 201, "test success", result.data);
  } catch (error) {
    sendError(res, 401, error.message);
  }
}

module.exports = { courseSearch, getCourseBasicInfo };
