const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    addressLine1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    addressLine2: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      match: [/^[1-9][0-9]{5}$/, "Invalid Indian PIN code"],
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
  },
  { _id: false },
);

const dealerSchema = new mongoose.Schema(
  {
    dealerType: {
      type: String,
      enum: ["sub_dealer"],
      default: "sub_dealer",
      required: true,
    },
    dealerCode: {
      type: String,
      trim: true,
      uppercase: true,
      required: true,
    },
    parentDealerName: {
      type: String,
      required: true,
      trim: true,
    },
    parentDealerCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    agreementStartDate: {
      type: Date,
      default: null,
    },
    agreementEndDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const brandAuthorizationSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    brandCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    dealerCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    validFrom: {
      type: Date,
      default: null,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
  },
  { timestamps: true },
);

const invoiceSettingsSchema = new mongoose.Schema(
  {
    invoicePrefix: {
      type: String,
      default: "INV",
      uppercase: true,
      trim: true,
    },
    nextInvoiceNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    gstPricing: {
      type: String,
      enum: ["exclusive", "inclusive"],
      default: "exclusive",
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR"],
    },
  },
  { _id: false },
);

const businessSchema = new mongoose.Schema(
  {
    businessCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    isPrimary: {
      type: Boolean,
      default: true,
      immutable: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    legalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    businessType: {
      type: String,
      enum: [
        "sole_proprietorship",
        "partnership",
        "llp",
        "private_limited",
        "public_limited",
        "other",
      ],
      required: true,
    },

    showroomType: {
      type: String,
      enum: ["multi_brand_two_wheeler"],
      default: "multi_brand_two_wheeler",
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    alternatePhone: {
      type: String,
      trim: true,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    gstin: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
        "Invalid GSTIN format",
      ],
    },

    pan: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN format"],
    },

    address: {
      type: addressSchema,
      required: true,
    },

    dealerDetails: {
      type: dealerSchema,
      required: true,
    },

    brandAuthorizations: {
      type: [brandAuthorizationSchema],
      default: [],
    },

    invoiceSettings: {
      type: invoiceSettingsSchema,
      default: () => ({}),
    },

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
  {
    timestamps: true,
    versionKey: false,
  },
);

businessSchema.index(
  { isPrimary: 1 },
  {
    unique: true,
    partialFilterExpression: { isPrimary: true },
  },
);

businessSchema.index({ gstin: 1 }, { sparse: true });

module.exports = mongoose.model("Business", businessSchema);
