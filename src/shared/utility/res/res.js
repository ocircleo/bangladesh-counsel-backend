const resSuccess = (res, data, message = null, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const resError = (res, message, status = 500, code = null) => {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};

module.exports = { resSuccess, resError };
