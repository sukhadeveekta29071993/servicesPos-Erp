const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || error.status || 500;

  const response = {
    success: false,
    message:
      statusCode >= 500 && process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error.message || "Something went wrong",
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
