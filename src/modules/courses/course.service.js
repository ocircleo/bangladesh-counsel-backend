const { findCourseById } = require("../../repo/course/course");
const {
  sendSuccess,
  sendError,
} = require("../../shared/utility/res/ReturnFunctations");
const { slugGenerator } = require("../../shared/utility/Slug");
const {
  createCourseInDB,
  updateCourseInDB,
  createModuleInDB,
  updateModuleInDB,
  deleteModuleInDB,
  searchCourseInDBAdmin,
  findCourseDetails,
  searchCourseInDBAdminCount,
  deleteCourseInDb,
} = require("./course.repo");

async function addCourse(req, res) {
  try {
    const data = await req.body.data;

    const slug = slugGenerator(data.title);
    let dataArray = [
      data?.title,
      slug,
      data?.price,
      data?.description,
      data?.languages,
      data?.category,
      data?.location_type,
      data?.published,
      data?.course_detail,
    ];

    const result = await createCourseInDB(dataArray);

    if (result.error)
      return sendError(
        res,
        501,
        "Some error happned while inserting in database",
      );

    sendSuccess(res, 201, "test success", result?.data);
  } catch (error) {
    sendError(res, 401, error.message);
  }
}
async function updateCourse(req, res) {
  try {
    const data = await req.body.data;
    const id = req.body.id;

    const prevData = await findCourseById(data?.id);
    let slug;
    if (data.title == prevData.title) slug = data?.prevSlug;
    else slug = slugGenerator(data.title);

    let dataArray = [
      data?.title,
      slug,
      data?.price,
      data?.description,
      data?.languages,
      data?.category,
      data?.location_type,
      data?.course_detail,
      data?.published,
      id,
    ];

    const result = await updateCourseInDB(dataArray);
    if (result.error)
      return sendError(
        res,
        501,
        "Some error happned while inserting in database",
      );
    sendSuccess(res, 201, "test success", result?.data);
  } catch (error) {
    sendError(res, 401, error.message);
  }
}

async function addModule(req, res) {
  try {
    const data = await req.body.data;
    let dataArray = [
      data?.title,
      data?.description,
      data?.published,
      data?.is_public,
      data?.course_id,
    ];

    const result = await createModuleInDB(dataArray);
    if (result.error)
      return sendError(
        res,
        501,
        "Some error happned while inserting in database",
      );
    sendSuccess(res, 201, "test success", {});
  } catch (error) {
    sendError(res, 401, error.message);
  }
}
async function updateModule(req, res) {
  try {
    const data = await req.body.data;
    const moduleId = await req.body.moduleId;

    let dataArray = [
      data?.title,
      data?.description,
      data?.published,
      data?.is_public,
      moduleId,
    ];

    const result = await updateModuleInDB(dataArray);
    if (result.error)
      return sendError(
        res,
        501,
        "Some error happned while inserting in database",
      );
    sendSuccess(res, 201, "test success", {});
  } catch (error) {
    sendError(res, 401, error.message);
  }
}
async function deleteModule(req, res) {
  try {
    const moduleId = await req.body.moduleId;

    let dataArray = [moduleId];

    const result = await deleteModuleInDB(dataArray);
    if (result.error)
      return sendError(
        res,
        501,
        "Some error happned while inserting in database",
      );
    sendSuccess(res, 201, "test success", {});
  } catch (error) {
    sendError(res, 401, error.message);
  }
}
async function adminCourseSearch(req, res) {
  try {
    const text = String(req?.query?.text || "");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let dataArray = [text, skip, limit];
    const [rows, countResult] = await Promise.all([
      searchCourseInDBAdmin(dataArray),
      searchCourseInDBAdminCount([text]),
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
async function adminCourseById(req, res) {
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
async function courseDetaills(req, res) {
  try {
    const id = req.params.courseId;

    const result = await findCourseDetails([id]);
    
    if (result.error)
      return sendError(res, 501, "Some error happned searching in db");

    sendSuccess(res, 201, "test success", result.data);
  } catch (error) {
    sendError(res, 401, error.message);
  }
}
async function deleteCourse(req, res) {
  try {
    const id = req.params.courseId;

    const result = await findCourseDetails([id]);

    if (result.error)
      return sendError(res, 501, "Some error happned searching in db");

    if (result?.data?.modules.length > 0)
      return sendError(res, 501, "Remove Course Modules first.");

    const deletionResult = await deleteCourseInDb([id]);
    if (deletionResult.error)
      return sendError(res, 501, "Some error happned Deleting course");
    sendSuccess(res, 201, "Deletion Success", result.data);
  } catch (error) {
    sendError(res, 401, error.message);
  }
}

module.exports = {
  addCourse,
  updateCourse,
  addModule,
  updateModule,
  deleteModule,
  adminCourseSearch,
  adminCourseById,
  courseDetaills,
  deleteCourse,
};
