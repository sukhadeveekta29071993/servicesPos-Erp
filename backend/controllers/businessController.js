const asyncHandler = require("../utils/asyncHandler");

const businessService = require("../services/businessService");

const createBusiness = asyncHandler(async (req, res) => {
  const business = await businessService.createBusiness(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: "Business profile created successfully",
    data: { business },
  });
});

const getBusiness = asyncHandler(async (req, res) => {
  const business = await businessService.getBusiness();

  if (!business) {
    return res.status(404).json({
      success: false,
      message: "Business profile not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Business profile fetched successfully",
    data: { business },
  });
});

const updateBusiness = asyncHandler(async (req, res) => {
  const business = await businessService.updateBusiness(req.body, req.user._id);

  res.status(200).json({
    success: true,
    message: "Business profile updated successfully",
    data: { business },
  });
});

const addBrandAuthorization = asyncHandler(async (req, res) => {
  const business = await businessService.addBrandAuthorization(
    req.body,
    req.user._id,
  );

  res.status(201).json({
    success: true,
    message: "Brand authorization added successfully",
    data: { business },
  });
});

const updateBrandAuthorization = asyncHandler(async (req, res) => {
  const business = await businessService.updateBrandAuthorization(
    req.params.brandId,
    req.body,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Brand authorization updated successfully",
    data: { business },
  });
});

const removeBrandAuthorization = asyncHandler(async (req, res) => {
  const business = await businessService.removeBrandAuthorization(
    req.params.brandId,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Brand authorization removed successfully",
    data: { business },
  });
});

module.exports = {
  createBusiness,
  getBusiness,
  updateBusiness,
  addBrandAuthorization,
  updateBrandAuthorization,
  removeBrandAuthorization,
};
