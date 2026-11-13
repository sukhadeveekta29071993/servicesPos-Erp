const express = require("express");
const router = express.Router();

const {
  createBusiness,
  getBusiness,
  updateBusiness,
  addBrandAuthorization,
  updateBrandAuthorization,
  removeBrandAuthorization,
} = require("../controllers/businessController");

const { protect } = require("../middleware/authMiddleware");

const authorizePermission = require("../middleware/authorizePermission");

const {
  validateBusiness,
  validateBrandAuthorization,
} = require("../validators/businessValidator");

// All routes require authentication
router.use(protect);

// Business profile
router.get("/", authorizePermission("business.read"), getBusiness);

router.post(
  "/",
  authorizePermission("business.create"),
  validateBusiness,
  createBusiness,
);

router.patch(
  "/",
  authorizePermission("business.update"),
  validateBusiness,
  updateBusiness,
);

// Brand authorization
router.post(
  "/brand-authorizations",
  authorizePermission("business.brand.update"),
  validateBrandAuthorization,
  addBrandAuthorization,
);

router.patch(
  "/brand-authorizations/:brandId",
  authorizePermission("business.brand.update"),
  validateBrandAuthorization,
  updateBrandAuthorization,
);

router.delete(
  "/brand-authorizations/:brandId",
  authorizePermission("business.brand.update"),
  removeBrandAuthorization,
);

module.exports = router;
