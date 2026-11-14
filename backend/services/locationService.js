const mongoose = require("mongoose");

const Location = require("../models/Location");
const Branch = require("../models/Branch");
const Business = require("../models/Business");

const createLocation = async (data, userId) => {
  if (!mongoose.isValidObjectId(data.branch)) {
    const error = new Error("Invalid branch ID");
    error.statusCode = 400;
    throw error;
  }

  const business = await Business.findOne({ isPrimary: true });

  if (!business) {
    const error = new Error("Business profile not found");
    error.statusCode = 404;
    throw error;
  }

  const branch = await Branch.findOne({
    _id: data.branch,
    business: business._id,
    status: "active",
  });

  if (!branch) {
    const error = new Error("Active branch not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.isDefault) {
    await Location.updateMany(
      { branch: branch._id, isDefault: true },
      { $set: { isDefault: false } },
    );
  }

  return Location.create({
    ...data,
    business: business._id,
    branch: branch._id,
    createdBy: userId,
  });
};

const getLocations = async (filters = {}) => {
  const business = await Business.findOne({ isPrimary: true });

  if (!business) {
    const error = new Error("Business profile not found");
    error.statusCode = 404;
    throw error;
  }

  const query = { business: business._id };

  if (filters.branch) {
    if (!mongoose.isValidObjectId(filters.branch)) {
      const error = new Error("Invalid branch ID");
      error.statusCode = 400;
      throw error;
    }
    query.branch = filters.branch;
  }

  if (filters.status) query.status = filters.status;
  if (filters.locationType) query.locationType = filters.locationType;

  return Location.find(query)
    .populate("branch", "branchCode branchName branchType")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .sort({ branch: 1, isDefault: -1, locationName: 1 });
};

const getLocationById = async (locationId) => {
  if (!mongoose.isValidObjectId(locationId)) {
    const error = new Error("Invalid location ID");
    error.statusCode = 400;
    throw error;
  }

  const location = await Location.findById(locationId)
    .populate("business", "businessName businessCode")
    .populate("branch", "branchCode branchName")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  if (!location) {
    const error = new Error("Location not found");
    error.statusCode = 404;
    throw error;
  }

  return location;
};

const updateLocation = async (locationId, data, userId) => {
  if (!mongoose.isValidObjectId(locationId)) {
    const error = new Error("Invalid location ID");
    error.statusCode = 400;
    throw error;
  }

  const location = await Location.findById(locationId);

  if (!location) {
    const error = new Error("Location not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.branch && data.branch.toString() !== location.branch.toString()) {
    const error = new Error(
      "Location cannot be moved to another branch through update",
    );
    error.statusCode = 400;
    throw error;
  }

  if (data.isDefault === true) {
    await Location.updateMany(
      {
        branch: location.branch,
        _id: { $ne: location._id },
        isDefault: true,
      },
      { $set: { isDefault: false } },
    );
  }

  const allowedFields = [
    "locationName",
    "locationType",
    "isDefault",
    "address",
    "allowNegativeStock",
    "status",
  ];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      if (field === "address") {
        location.set("address", {
          ...location.address?.toObject?.(),
          ...data.address,
        });
      } else {
        location.set(field, data[field]);
      }
    }
  }

  if (location.status === "inactive") {
    location.isDefault = false;
  }

  location.updatedBy = userId;
  await location.save();

  return location;
};

const deactivateLocation = async (locationId, userId) => {
  if (!mongoose.isValidObjectId(locationId)) {
    const error = new Error("Invalid location ID");
    error.statusCode = 400;
    throw error;
  }

  const location = await Location.findById(locationId);

  if (!location) {
    const error = new Error("Location not found");
    error.statusCode = 404;
    throw error;
  }

  location.status = "inactive";
  location.isDefault = false;
  location.updatedBy = userId;

  await location.save();

  return location;
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deactivateLocation,
};
