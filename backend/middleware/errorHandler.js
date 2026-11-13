const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || "Something went wrong";

  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue || {})[0] || "field";
    message = `${field} already exists`;
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid data format";
  }

  const response = {
    success: false,
    message:
      statusCode >= 500 && process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : message,
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
