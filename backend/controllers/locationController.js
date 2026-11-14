const asyncHandler = require("../utils/asyncHandler");
const locationService = require("../services/locationService");

const createLocation = asyncHandler(async (req, res) => {
  const location = await locationService.createLocation(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: "Location created successfully",
    data: { location },
  });
});

const getLocations = asyncHandler(async (req, res) => {
  const locations = await locationService.getLocations(req.query);

  res.status(200).json({
    success: true,
    message: "Locations fetched successfully",
    results: locations.length,
    data: { locations },
  });
});

const getLocationById = asyncHandler(async (req, res) => {
  const location = await locationService.getLocationById(req.params.locationId);

  res.status(200).json({
    success: true,
    message: "Location fetched successfully",
    data: { location },
  });
});

const updateLocation = asyncHandler(async (req, res) => {
  const location = await locationService.updateLocation(
    req.params.locationId,
    req.body,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Location updated successfully",
    data: { location },
  });
});

const deactivateLocation = asyncHandler(async (req, res) => {
  const location = await locationService.deactivateLocation(
    req.params.locationId,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Location deactivated successfully",
    data: { location },
  });
});

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deactivateLocation,
};
