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

const branchSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    branchCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxLength: 20,
    },
    branchName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 150,
    },
    branchType: {
      type: String,
      enum: ["head_office", "branch"],
      default: "branch",
      required: true,
    },
    isMain: { type: Boolean, default: false },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    phone: { type: String, trim: true, required: true },
    alternatePhone: { type: String, trim: true, default: "" },
    address: { type: addressSchema, required: true },
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

branchSchema.index({ business: 1, branchCode: 1 }, { unique: true });

branchSchema.index(
  { business: 1, isMain: 1 },
  {
    unique: true,
    partialFilterExpression: { isMain: true },
  },
);

module.exports = mongoose.model("Branch", branchSchema);
