const validateBusiness = (req, res, next) => {
  const errors = [];

  const isUpdate = req.method === "PATCH";
  const data = req.body;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
    });
  }

  const allowedFields = [
    "businessCode",
    "businessName",
    "legalName",
    "businessType",
    "email",
    "phone",
    "alternatePhone",
    "website",
    "gstin",
    "pan",
    "address",
    "dealerDetails",
    "brandAuthorizations",
    "invoiceSettings",
    "status",
  ];

  const allowedUpdateFields = allowedFields.filter(
    (field) => field !== "businessCode" && field !== "brandAuthorizations",
  );

  const allowed = isUpdate
    ? allowedUpdateFields
    : allowedFields.filter((field) => field !== "brandAuthorizations");

  Object.keys(data).forEach((key) => {
    if (!allowed.includes(key)) {
      errors.push(`Field '${key}' is not allowed`);
    }
  });

  const requiredFields = [
    "businessCode",
    "businessName",
    "legalName",
    "businessType",
    "email",
    "phone",
    "address",
    "dealerDetails",
  ];

  if (!isUpdate) {
    requiredFields.forEach((field) => {
      if (data[field] === undefined || data[field] === null) {
        errors.push(`${field} is required`);
      }
    });
  }

  const businessTypes = [
    "sole_proprietorship",
    "partnership",
    "llp",
    "private_limited",
    "public_limited",
    "other",
  ];

  if (
    data.businessType !== undefined &&
    !businessTypes.includes(data.businessType)
  ) {
    errors.push("Invalid business type");
  }

  if (
    data.businessCode !== undefined &&
    (typeof data.businessCode !== "string" ||
      !/^[A-Za-z0-9_-]{3,30}$/.test(data.businessCode))
  ) {
    errors.push("Business code must contain 3-30 valid characters");
  }

  if (
    data.businessName !== undefined &&
    (typeof data.businessName !== "string" ||
      data.businessName.trim().length < 2)
  ) {
    errors.push("Invalid business name");
  }

  if (
    data.legalName !== undefined &&
    (typeof data.legalName !== "string" || !data.legalName.trim())
  ) {
    errors.push("Invalid legal name");
  }

  if (
    data.email !== undefined &&
    (typeof data.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
  ) {
    errors.push("Invalid email address");
  }

  const phonePattern = /^\+?[0-9]{10,15}$/;

  for (const field of ["phone", "alternatePhone"]) {
    if (
      data[field] !== undefined &&
      data[field] !== "" &&
      (typeof data[field] !== "string" ||
        !phonePattern.test(data[field].replace(/[\s-]/g, "")))
    ) {
      errors.push(`Invalid ${field}`);
    }
  }

  if (
    data.gstin !== undefined &&
    data.gstin !== null &&
    data.gstin !== "" &&
    (typeof data.gstin !== "string" ||
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
        data.gstin.toUpperCase(),
      ))
  ) {
    errors.push("Invalid GSTIN");
  }

  if (
    data.pan !== undefined &&
    data.pan !== null &&
    data.pan !== "" &&
    (typeof data.pan !== "string" ||
      !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(data.pan.toUpperCase()))
  ) {
    errors.push("Invalid PAN");
  }

  if (data.address !== undefined) {
    if (
      !data.address ||
      typeof data.address !== "object" ||
      Array.isArray(data.address)
    ) {
      errors.push("Invalid address object");
    } else {
      const addressRequired = ["addressLine1", "city", "state", "pincode"];

      addressRequired.forEach((field) => {
        if (!isUpdate && !data.address[field]) {
          errors.push(`Address ${field} is required`);
        }
      });

      if (
        data.address.pincode !== undefined &&
        !/^[1-9][0-9]{5}$/.test(data.address.pincode)
      ) {
        errors.push("Invalid PIN code");
      }
    }
  }

  if (data.dealerDetails !== undefined) {
    const dealer = data.dealerDetails;

    if (!dealer || typeof dealer !== "object" || Array.isArray(dealer)) {
      errors.push("Invalid dealer details");
    } else {
      const dealerRequired = [
        "dealerCode",
        "parentDealerName",
        "parentDealerCode",
      ];

      dealerRequired.forEach((field) => {
        if (!isUpdate && !dealer[field]) {
          errors.push(`Dealer ${field} is required`);
        }
      });

      if (
        dealer.dealerType !== undefined &&
        dealer.dealerType !== "sub_dealer"
      ) {
        errors.push("Only sub_dealer type is supported");
      }

      if (
        dealer.agreementStartDate &&
        dealer.agreementEndDate &&
        new Date(dealer.agreementStartDate) > new Date(dealer.agreementEndDate)
      ) {
        errors.push("Agreement end date cannot be before start date");
      }
    }
  }

  if (data.invoiceSettings !== undefined) {
    const settings = data.invoiceSettings;

    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      errors.push("Invalid invoice settings");
    } else {
      if (
        settings.gstPricing !== undefined &&
        !["exclusive", "inclusive"].includes(settings.gstPricing)
      ) {
        errors.push("Invalid GST pricing configuration");
      }

      if (
        settings.nextInvoiceNumber !== undefined &&
        (!Number.isInteger(settings.nextInvoiceNumber) ||
          settings.nextInvoiceNumber < 1)
      ) {
        errors.push("Invalid next invoice number");
      }
    }
  }

  if (
    data.status !== undefined &&
    !["active", "inactive"].includes(data.status)
  ) {
    errors.push("Invalid business status");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Business validation failed",
      errors,
    });
  }

  next();
};

const validateBrandAuthorization = (req, res, next) => {
  const errors = [];
  const data = req.body;

  const allowedFields = [
    "brandName",
    "brandCode",
    "dealerCode",
    "validFrom",
    "validUntil",
    "status",
  ];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
    });
  }

  Object.keys(data).forEach((key) => {
    if (!allowedFields.includes(key)) {
      errors.push(`Field '${key}' is not allowed`);
    }
  });

  if (req.method === "POST") {
    ["brandName", "brandCode", "dealerCode"].forEach((field) => {
      if (!data[field]) {
        errors.push(`${field} is required`);
      }
    });
  }

  for (const field of ["brandName", "brandCode", "dealerCode"]) {
    if (
      data[field] !== undefined &&
      (typeof data[field] !== "string" || !data[field].trim())
    ) {
      errors.push(`Invalid ${field}`);
    }
  }

  if (
    data.status !== undefined &&
    !["active", "inactive", "expired"].includes(data.status)
  ) {
    errors.push("Invalid brand authorization status");
  }

  for (const field of ["validFrom", "validUntil"]) {
    if (
      data[field] !== undefined &&
      data[field] !== null &&
      Number.isNaN(Date.parse(data[field]))
    ) {
      errors.push(`Invalid ${field}`);
    }
  }

  if (
    data.validFrom &&
    data.validUntil &&
    new Date(data.validFrom) > new Date(data.validUntil)
  ) {
    errors.push("validUntil cannot be before validFrom");
  }

  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: "Brand authorization validation failed",
      errors,
    });
  }

  next();
};

module.exports = {
  validateBusiness,
  validateBrandAuthorization,
};
