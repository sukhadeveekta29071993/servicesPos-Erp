const mongoose = require("mongoose");

const User = require("../models/User");
const Branch = require("../models/Branch");
const RefreshToken = require("../models/RefreshToken");
const { ROLE_PERMISSIONS } = require("../config/permissions");

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateBranch = async (branchId) => {
  if (!branchId) return null;

  if (!mongoose.isValidObjectId(branchId)) {
    throw createError("Invalid branch ID");
  }

  const branch = await Branch.findOne({
    _id: branchId,
    status: "active",
  });

  if (!branch) {
    throw createError("Active branch not found", 404);
  }

  return branch._id;
};

const getRoles = () => {
  return Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
    role,
    permissions,
  }));
};

const createUser = async (data, currentUser) => {
  if (data.role === "super_admin") {
    throw createError(
      "Super Admin cannot be created through User Management",
      403,
    );
  }

  if (
    currentUser.role === "admin" &&
    !["salesperson", "mechanic", "cashier"].includes(data.role)
  ) {
    throw createError("Admin cannot create this role", 403);
  }

  if (currentUser.role !== "super_admin" && data.permissions?.length) {
    throw createError("Only Super Admin can assign custom permissions", 403);
  }

  const email = data.email.trim().toLowerCase();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createError("Email is already registered", 409);
  }

  const branch = await validateBranch(data.branch);

  const user = await User.create({
    name: data.name.trim(),
    email,
    phone: data.phone || null,
    password: data.password,
    role: data.role,
    branch,
    permissions:
      currentUser.role === "super_admin" ? data.permissions || [] : [],
    createdBy: currentUser._id,
  });

  return user;
};

const getUsers = async (filters = {}) => {
  const { role, status, branch, search, page = 1, limit = 20 } = filters;

  const query = {};

  if (role) query.role = role;
  if (status) query.status = status;
  if (branch) query.branch = branch;

  if (search) {
    const searchRegex = new RegExp(
      search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );

    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const [users, total] = await Promise.all([
    User.find(query)
      .populate("branch", "branchCode branchName")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage),

    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

const getUserById = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid user ID");
  }

  const user = await User.findById(userId)
    .populate("branch", "branchCode branchName")
    .populate("createdBy", "name email");

  if (!user) {
    throw createError("User not found", 404);
  }

  return user;
};

const updateUser = async (userId, data, currentUser) => {
  const user = await getUserById(userId);

  if (user._id.toString() === currentUser._id.toString()) {
    if (data.role !== undefined || data.permissions !== undefined) {
      throw createError("You cannot change your own role or permissions", 403);
    }
  }

  if (user.role === "super_admin") {
    throw createError("Super Admin account cannot be modified here", 403);
  }

  if (
    currentUser.role === "admin" &&
    data.role !== undefined &&
    !["salesperson", "mechanic", "cashier"].includes(data.role)
  ) {
    throw createError("Admin cannot assign this role", 403);
  }

  if (data.role === "super_admin") {
    throw createError("Super Admin role cannot be assigned", 403);
  }

  if (data.permissions !== undefined && currentUser.role !== "super_admin") {
    throw createError("Only Super Admin can modify custom permissions", 403);
  }

  if (data.branch !== undefined) {
    user.branch = await validateBranch(data.branch);
  }

  if (data.name !== undefined) user.name = data.name.trim();
  if (data.phone !== undefined) user.phone = data.phone || null;
  if (data.role !== undefined) user.role = data.role;

  if (data.permissions !== undefined) {
    user.permissions = data.permissions;
  }

  await user.save();

  return user;
};

const updateUserStatus = async (userId, status, currentUser) => {
  const user = await getUserById(userId);

  if (!["active", "inactive", "blocked"].includes(status)) {
    throw createError("Invalid user status");
  }

  if (user._id.toString() === currentUser._id.toString()) {
    throw createError("You cannot change your own account status", 403);
  }

  if (user.role === "super_admin") {
    throw createError("Super Admin account cannot be deactivated", 403);
  }

  user.status = status;
  await user.save();

  if (status !== "active") {
    await RefreshToken.updateMany(
      { user: user._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }

  return user;
};

const resetUserPassword = async (userId, password) => {
  const user = await getUserById(userId);

  if (user.role === "super_admin") {
    throw createError("Super Admin password cannot be reset here", 403);
  }

  if (typeof password !== "string" || password.length < 8) {
    throw createError("Password must contain at least 8 characters");
  }

  user.password = password;
  user.passwordChangedAt = new Date();

  await user.save();

  await RefreshToken.updateMany(
    { user: user._id, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );

  return user;
};

const updateOwnProfile = async (currentUser, data) => {
  const allowedFields = ["name", "phone"];

  Object.keys(data).forEach((field) => {
    if (!allowedFields.includes(field)) {
      throw createError(`Field '${field}' is not allowed`);
    }
  });

  if (data.name !== undefined) {
    if (
      typeof data.name !== "string" ||
      data.name.trim().length < 2 ||
      data.name.trim().length > 100
    ) {
      throw createError("Invalid name");
    }

    currentUser.name = data.name.trim();
  }

  if (data.phone !== undefined) {
    if (
      data.phone !== null &&
      (typeof data.phone !== "string" || !/^[0-9]{10}$/.test(data.phone))
    ) {
      throw createError("Invalid phone number");
    }

    currentUser.phone = data.phone || null;
  }

  await currentUser.save();

  return currentUser;
};

module.exports = {
  getRoles,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  resetUserPassword,
  updateOwnProfile,
};
