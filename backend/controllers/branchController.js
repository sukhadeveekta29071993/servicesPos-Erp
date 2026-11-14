const asyncHandler = require("../utils/asyncHandler");
const branchService = require("../services/branchService");

const createBranch = asyncHandler(async (req, res) => {
  const branch = await branchService.createBranch(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: "Branch created successfully",
    data: { branch },
  });
});

const getBranches = asyncHandler(async (req, res) => {
  const branches = await branchService.getBranches(req.query);

  res.status(200).json({
    success: true,
    message: "Branches fetched successfully",
    results: branches.length,
    data: { branches },
  });
});

const getBranchById = asyncHandler(async (req, res) => {
  const branch = await branchService.getBranchById(req.params.branchId);

  res.status(200).json({
    success: true,
    message: "Branch fetched successfully",
    data: { branch },
  });
});

const updateBranch = asyncHandler(async (req, res) => {
  const branch = await branchService.updateBranch(
    req.params.branchId,
    req.body,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Branch updated successfully",
    data: { branch },
  });
});

const deactivateBranch = asyncHandler(async (req, res) => {
  const branch = await branchService.deactivateBranch(
    req.params.branchId,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Branch deactivated successfully",
    data: { branch },
  });
});

module.exports = {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deactivateBranch,
};
