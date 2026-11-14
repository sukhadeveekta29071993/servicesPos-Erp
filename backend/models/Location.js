const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    addressLine1: { type: String, required: true, trim: true, maxLength: 150 },
    addressLine2: { type: String, trim: true, default: "", maxLength: 150 },
    city: { type: String, required: true, trim: true },
    district: { type: String, trim: true, default: "" },
    state: { type: String, required: true, trim: true },
    pinCode: {
      type: String,
      required: true,
      match: [/^[1-9][0-9]{5}$/, "Invalid Indian PIN code"],
    },
    country: { type: String, default: "India", trim: true },
  },
  { _id: false },
);

const locationSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    locationCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxLength: 20,
    },
    locationName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 150,
    },
    locationType: {
      type: String,
      enum: [
        "showroom",
        "service_center",
        "warehouse",
        "spare_parts_store",
        "yard",
        "other",
      ],
      required: true,
    },
    isDefault: { type: Boolean, default: false },
    address: { type: addressSchema, required: true },
    allowNegativeStock: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

locationSchema.index({ branch: 1, locationCode: 1 }, { unique: true });

locationSchema.index(
  { branch: 1, isDefault: 1 },
  {
    unique: true,
    partialFilterExpression: { isDefault: true },
  },
);

module.exports = mongoose.model("Location", locationSchema);
