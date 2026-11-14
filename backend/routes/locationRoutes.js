const express = require("express");
const router = express.Router();

const {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deactivateLocation,
} = require("../controllers/locationController");

const { protect } = require("../middleware/authMiddleware");
const authorizePermission = require("../middleware/authorizePermission");
const { validateLocation } = require("../validators/locationValidator");

router.use(protect);

router.get("/", authorizePermission("locations.read"), getLocations);

router.get(
  "/:locationId",
  authorizePermission("locations.read"),
  getLocationById,
);

router.post(
  "/",
  authorizePermission("locations.create"),
  validateLocation,
  createLocation,
);

router.patch(
  "/:locationId",
  authorizePermission("locations.update"),
  validateLocation,
  updateLocation,
);

router.delete(
  "/:locationId",
  authorizePermission("locations.delete"),
  deactivateLocation,
);

module.exports = router;
