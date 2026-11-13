const User = require("../models/User");

const asyncHandler = require("../utils/asyncHandler");

const { ACCESS_COOKIE } = require("../utils/authCookies");

const { verifyAccessToken } = require("../utils/generateTokens");

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.[ACCESS_COOKIE];

  // Also support Authorization: Bearer token
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please login.",
    });
  }

  let decoded;

  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }

  if (!decoded.sub || decoded.type !== "access") {
    return res.status(401).json({
      success: false,
      message: "Invalid access token",
    });
  }

  const user = await User.findById(decoded.sub);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User account not found",
    });
  }

  if (user.status !== "active") {
    return res.status(403).json({
      success: false,
      message: "Your account is inactive or blocked",
    });
  }

  // Invalidate tokens issued before a password change.
  if (
    user.passwordChangedAt &&
    decoded.iat <= Math.floor(user.passwordChangedAt.getTime() / 1000)
  ) {
    return res.status(401).json({
      success: false,
      message: "Password changed. Please login again.",
    });
  }

  req.user = user;

  next();
});

module.exports = {
  protect,
};
