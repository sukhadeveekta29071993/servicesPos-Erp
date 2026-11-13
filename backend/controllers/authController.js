const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

const env = require("../config/env");

const asyncHandler = require("../utils/asyncHandler");

const {
  createSession,
  rotateSession,
  revokeSession,
} = require("../services/authService");

const {
  REFRESH_COOKIE,
  setAuthCookies,
  clearAuthCookies,
} = require("../utils/authCookies");

const { USER_ROLES } = require("../models/User");

// LOGIN
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  if (user.status !== "active") {
    return res.status(403).json({
      success: false,
      message: "Your account is inactive or blocked",
    });
  }

  const tokens = await createSession(user, req);

  user.lastLoginAt = new Date();
  await user.save();

  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: user.toSafeObject(),
    },
  });
});

// REGISTER USER - ADMIN ONLY
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, permissions } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  }

  if (name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: "Name must be between 2 and 100 characters",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 8 characters",
    });
  }

  if (!USER_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user role",
    });
  }

  if (role === "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Super Admin can only be created through secure setup",
    });
  }

  if (
    permissions !== undefined &&
    (!Array.isArray(permissions) ||
      permissions.some((permission) => typeof permission !== "string"))
  ) {
    return res.status(400).json({
      success: false,
      message: "Permissions must be an array of strings",
    });
  }

  if (
    req.user.role === "admin" &&
    !["salesperson", "mechanic", "cashier"].includes(role)
  ) {
    return res.status(403).json({
      success: false,
      message: "Admin cannot create this role",
    });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Email is already registered",
    });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone || null,
    password,
    role,
    permissions: [],
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      user: user.toSafeObject(),
    },
  });
});

// REFRESH TOKEN
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE];

  if (!token) {
    clearAuthCookies(res);

    return res.status(401).json({
      success: false,
      message: "Refresh token is required. Please login again.",
    });
  }

  let session;

  try {
    session = await rotateSession(token, req);
  } catch (error) {
    clearAuthCookies(res);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh session. Please login again.",
    });
  }

  setAuthCookies(res, session.accessToken, session.refreshToken);

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      user: session.user.toSafeObject(),
    },
  });
});

// LOGOUT
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_COOKIE];

  await revokeSession(refreshToken);

  clearAuthCookies(res);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// GET CURRENT USER
const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: {
      user: req.user.toSafeObject(),
    },
  });
});

// CHANGE PASSWORD
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    !currentPassword ||
    !newPassword
  ) {
    return res.status(400).json({
      success: false,
      message: "Current and new passwords are required",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must contain at least 8 characters",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different",
    });
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user || !(await user.comparePassword(currentPassword))) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();

  await user.save();

  // Revoke every existing session after password change.
  await RefreshToken.updateMany(
    {
      user: user._id,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );

  clearAuthCookies(res);

  return res.status(200).json({
    success: true,
    message: "Password changed successfully. Please login again.",
  });
});

module.exports = {
  login,
  register,
  refresh,
  logout,
  getMe,
  changePassword,
};
