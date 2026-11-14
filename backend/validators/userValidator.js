const mongoose = require("mongoose");
const { USER_ROLES } = require("../models/User");

const validateCreateUser = (req, res, next) => {
  const { name, email, password, role, phone, branch, permissions } = req.body;

  const errors = [];

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 100
  ) {
    errors.push("Name must be between 2 and 100 characters");
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.push("Valid email is required");
  }

  if (typeof password !== "string" || password.length < 8) {
    errors.push("Password must contain at least 8 characters");
  }

  if (!USER_ROLES.includes(role) || role === "super_admin") {
    errors.push("Invalid user role");
  }

  if (
    phone !== undefined &&
    phone !== null &&
    (typeof phone !== "string" || !/^[0-9]{10}$/.test(phone))
  ) {
    errors.push("Phone must contain 10 digits");
  }

  if (
    branch !== undefined &&
    branch !== null &&
    !mongoose.isValidObjectId(branch)
  ) {
    errors.push("Invalid branch ID");
  }

  if (
    permissions !== undefined &&
    (!Array.isArray(permissions) ||
      permissions.some((item) => typeof item !== "string" || !item.trim()))
  ) {
    errors.push("Permissions must be an array of strings");
  }

  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: "User validation failed",
      errors,
    });
  }

  next();
};

const validateUpdateUser = (req, res, next) => {
  const allowedFields = ["name", "phone", "role", "branch", "permissions"];

  const errors = [];

  Object.keys(req.body).forEach((field) => {
    if (!allowedFields.includes(field)) {
      errors.push(`Field '${field}' is not allowed`);
    }
  });

  const { name, phone, role, branch, permissions } = req.body;

  if (
    name !== undefined &&
    (typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100)
  ) {
    errors.push("Invalid name");
  }

  if (
    phone !== undefined &&
    phone !== null &&
    (typeof phone !== "string" || !/^[0-9]{10}$/.test(phone))
  ) {
    errors.push("Invalid phone number");
  }

  if (role !== undefined && !USER_ROLES.includes(role)) {
    errors.push("Invalid user role");
  }

  if (
    branch !== undefined &&
    branch !== null &&
    !mongoose.isValidObjectId(branch)
  ) {
    errors.push("Invalid branch ID");
  }

  if (
    permissions !== undefined &&
    (!Array.isArray(permissions) ||
      permissions.some((item) => typeof item !== "string" || !item.trim()))
  ) {
    errors.push("Invalid permissions");
  }

  if (Object.keys(req.body).length === 0) {
    errors.push("At least one field is required");
  }

  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: "User validation failed",
      errors,
    });
  }

  next();
};

module.exports = {
  validateCreateUser,
  validateUpdateUser,
};
