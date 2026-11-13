const mongoose = require("mongoose");

const Business = require("../models/Business");

const createBusiness = async (data, userId) => {
  const existingBusiness = await Business.findOne({
    isPrimary: true,
  });

  if (existingBusiness) {
    const error = new Error("Primary business profile already exists");
    error.statusCode = 409;
    throw error;
  }

  return Business.create({
    ...data,
    businessCode: data.businessCode,
    isPrimary: true,
    createdBy: userId,
  });
};

const getBusiness = async () => {
  return Business.findOne({ isPrimary: true })
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");
};

const updateBusiness = async (data, userId) => {
  const business = await Business.findOne({ isPrimary: true });

  if (!business) {
    const error = new Error("Business profile not found");
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    "businessName",
    "legalName",
    "businessType",
    "email",
    "phone",
    "alternatePhone",
    "website",
    "gstIn",
    "pan",
    "address",
    "dealerDetails",
    "invoiceSettings",
    "status",
  ];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      if (["address", "dealerDetails", "invoiceSettings"].includes(field)) {
        business.set(field, {
          ...business[field]?.toObject?.(),
          ...data[field],
        });
      } else {
        business.set(field, data[field]);
      }
    }
  }

  business.updatedBy = userId;

  await business.save();

  return business;
};

const addBrandAuthorization = async (data, userId) => {
  const business = await Business.findOne({ isPrimary: true });

  if (!business) {
    const error = new Error("Business profile not found");
    error.statusCode = 404;
    throw error;
  }

  const exists = business.brandAuthorizations.some(
    (brand) => brand.brandCode.toUpperCase() === data.brandCode.toUpperCase(),
  );

  if (exists) {
    const error = new Error("Brand authorization already exists");
    error.statusCode = 409;
    throw error;
  }

  business.brandAuthorizations.push(data);
  business.updatedBy = userId;

  await business.save();

  return business;
};

const updateBrandAuthorization = async (brandId, data, userId) => {
  if (!mongoose.isValidObjectId(brandId)) {
    const error = new Error("Invalid brand authorization ID");
    error.statusCode = 400;
    throw error;
  }

  const business = await Business.findOne({ isPrimary: true });

  if (!business) {
    const error = new Error("Business profile not found");
    error.statusCode = 404;
    throw error;
  }

  const brand = business.brandAuthorizations.id(brandId);

  if (!brand) {
    const error = new Error("Brand authorization not found");
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    "brandName",
    "brandCode",
    "dealerCode",
    "validFrom",
    "validUntil",
    "status",
  ];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      brand.set(field, data[field]);
    }
  }

  business.updatedBy = userId;

  await business.save();

  return business;
};

const removeBrandAuthorization = async (brandId, userId) => {
  if (!mongoose.isValidObjectId(brandId)) {
    const error = new Error("Invalid brand authorization ID");
    error.statusCode = 400;
    throw error;
  }

  const business = await Business.findOne({ isPrimary: true });

  if (!business) {
    const error = new Error("Business profile not found");
    error.statusCode = 404;
    throw error;
  }

  const brand = business.brandAuthorizations.id(brandId);

  if (!brand) {
    const error = new Error("Brand authorization not found");
    error.statusCode = 404;
    throw error;
  }

  brand.deleteOne();

  business.updatedBy = userId;

  await business.save();

  return business;
};

module.exports = {
  createBusiness,
  getBusiness,
  updateBusiness,
  addBrandAuthorization,
  updateBrandAuthorization,
  removeBrandAuthorization,
};
