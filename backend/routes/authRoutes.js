const express = require("express");
const router = express.Router();

const {
  login,
  register,
  refresh,
  logout,
  getMe,
  changePassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/authorizeRoles");

// Public routes
router.post("/login", login);
router.post("/refresh", refresh);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch("/change-password", protect, changePassword);

// Only Admin and Super Admin can create users
router.post(
  "/register",
  protect,
  authorizeRoles("super_admin", "admin"),
  register,
);

module.exports = router;
