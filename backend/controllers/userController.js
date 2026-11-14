const asyncHandler = require("../utils/asyncHandler");
const { hasPermission } = require("../config/permissions");

const {
  getRoles,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  resetUserPassword,
  updateOwnProfile,
} = require("../services/userService");

const getUserRoles = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Roles fetched successfully",
    data: { roles: getRoles() },
  });
});

const createNewUser = asyncHandler(async (req, res) => {
  if (req.body.branch && !hasPermission(req.user, "users.assign_branch")) {
    return res.status(403).json({
      success: false,
      message: "Missing permission: users.assign_branch",
    });
  }

  if (
    req.body.permissions?.length &&
    !hasPermission(req.user, "users.custom_permissions")
  ) {
    return res.status(403).json({
      success: false,
      message: "Missing permission: users.custom_permissions",
    });
  }

  const user = await createUser(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: { user: user.toSafeObject() },
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await getUsers(req.query);

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    results: result.users.length,
    data: result,
  });
});

const getSingleUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.userId);

  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: { user: user.toSafeObject() },
  });
});

const updateExistingUser = asyncHandler(async (req, res) => {
  if (
    req.body.role !== undefined &&
    !hasPermission(req.user, "users.assign_role")
  ) {
    return res.status(403).json({
      success: false,
      message: "Missing permission: users.assign_role",
    });
  }

  if (
    req.body.branch !== undefined &&
    !hasPermission(req.user, "users.assign_branch")
  ) {
    return res.status(403).json({
      success: false,
      message: "Missing permission: users.assign_branch",
    });
  }

  if (
    req.body.permissions !== undefined &&
    !hasPermission(req.user, "users.custom_permissions")
  ) {
    return res.status(403).json({
      success: false,
      message: "Missing permission: users.custom_permissions",
    });
  }

  const user = await updateUser(req.params.userId, req.body, req.user);

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: { user: user.toSafeObject() },
  });
});

const changeUserStatus = asyncHandler(async (req, res) => {
  const user = await updateUserStatus(
    req.params.userId,
    req.body.status,
    req.user,
  );

  res.status(200).json({
    success: true,
    message: "User status updated successfully",
    data: { user: user.toSafeObject() },
  });
});

const adminResetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  await resetUserPassword(req.params.userId, password);

  res.status(200).json({
    success: true,
    message: "User password reset successfully. All existing sessions revoked.",
  });
});

const deactivateUser = asyncHandler(async (req, res) => {
  const user = await updateUserStatus(req.params.userId, "inactive", req.user);

  res.status(200).json({
    success: true,
    message: "User deactivated successfully",
    data: { user: user.toSafeObject() },
  });
});

const getOwnProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: { user: req.user.toSafeObject() },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateOwnProfile(req.user, req.body);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { user: user.toSafeObject() },
  });
});

module.exports = {
  getUserRoles,
  createNewUser,
  getAllUsers,
  getSingleUser,
  updateExistingUser,
  changeUserStatus,
  adminResetPassword,
  deactivateUser,
  getOwnProfile,
  updateProfile,
};
