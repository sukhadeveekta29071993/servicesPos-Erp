const mongoose = require("mongoose");

const Branch = require("../models/Branch");
const Location = require("../models/Location");
const Business = require("../models/Business");

const createBranch = async (data, userId) => {
  const business = await Business.findOne({ isPrimary: true });

  if (!business) {
    const error = new Error(
      "Business profile not found. Create business first.",
    );
    error.statusCode = 404;
    throw error;
  }

  if (data.isMain) {
    const existingMain = await Branch.findOne({
      business: business._id,
      isMain: true,
    });

    if (existingMain) {
      const error = new Error("Main branch already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  return Branch.create({
    ...data,
    business: business._id,
    createdBy: userId,
  });
};

const getBranches = async (filters = {}) => {
  const business = await Business.findOne({ isPrimary: true });

  if (!business) {
    const error = new Error("Business profile not found");
    error.statusCode = 404;
    throw error;
  }

  const query = { business: business._id };

  if (filters.status) query.status = filters.status;
  if (filters.branchType) query.branchType = filters.branchType;

  return Branch.find(query)
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .sort({ isMain: -1, branchName: 1 });
};

const getBranchById = async (branchId) => {
  if (!mongoose.isValidObjectId(branchId)) {
    const error = new Error("Invalid branch ID");
    error.statusCode = 400;
    throw error;
  }

  const branch = await Branch.findById(branchId)
    .populate("business", "businessName businessCode")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  if (!branch) {
    const error = new Error("Branch not found");
    error.statusCode = 404;
    throw error;
  }

  return branch;
};

const updateBranch = async (branchId, data, userId) => {
  if (!mongoose.isValidObjectId(branchId)) {
    const error = new Error("Invalid branch ID");
    error.statusCode = 400;
    throw error;
  }

  const branch = await Branch.findById(branchId);

  if (!branch) {
    const error = new Error("Branch not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.isMain !== undefined && data.isMain !== branch.isMain) {
    const error = new Error("Main branch designation cannot be changed here");
    error.statusCode = 400;
    throw error;
  }

  const allowedFields = [
    "branchName",
    "email",
    "phone",
    "alternatePhone",
    "address",
    "status",
  ];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      if (field === "address") {
        branch.set("address", {
          ...branch.address?.toObject?.(),
          ...data.address,
        });
      } else {
        branch.set(field, data[field]);
      }
    }
  }

  branch.updatedBy = userId;
  await branch.save();

  return branch;
};

const deactivateBranch = async (branchId, userId) => {
  if (!mongoose.isValidObjectId(branchId)) {
    const error = new Error("Invalid branch ID");
    error.statusCode = 400;
    throw error;
  }

  const branch = await Branch.findById(branchId);

  if (!branch) {
    const error = new Error("Branch not found");
    error.statusCode = 404;
    throw error;
  }

  if (branch.isMain) {
    const error = new Error("Main branch cannot be deactivated");
    error.statusCode = 400;
    throw error;
  }

  const activeLocation = await Location.findOne({
    branch: branch._id,
    status: "active",
  });

  if (activeLocation) {
    const error = new Error(
      "Deactivate or move active locations before deactivating this branch",
    );
    error.statusCode = 409;
    throw error;
  }

  branch.status = "inactive";
  branch.updatedBy = userId;
  await branch.save();

  return branch;
};

module.exports = {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deactivateBranch,
};
