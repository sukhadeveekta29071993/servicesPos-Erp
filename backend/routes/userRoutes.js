const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorizePermission = require("../middleware/authorizePermission");

const {
  validateCreateUser,
  validateUpdateUser,
} = require("../validators/userValidator");

const {
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
} = require("../controllers/userController");

router.use(protect);

// Own profile
router.get("/profile", getOwnProfile);
router.patch("/profile", updateProfile);

// Role listing
router.get("/roles", authorizePermission("users.read"), getUserRoles);

// User CRUD
router.get("/", authorizePermission("users.read"), getAllUsers);

router.post(
  "/",
  authorizePermission("users.create"),
  validateCreateUser,
  createNewUser,
);

router.get("/:userId", authorizePermission("users.read"), getSingleUser);

router.patch(
  "/:userId",
  authorizePermission("users.update"),
  validateUpdateUser,
  updateExistingUser,
);

router.patch(
  "/:userId/status",
  authorizePermission("users.update"),
  changeUserStatus,
);

router.patch(
  "/:userId/reset-password",
  authorizePermission("users.reset_password"),
  adminResetPassword,
);

router.delete("/:userId", authorizePermission("users.delete"), deactivateUser);

module.exports = router;
