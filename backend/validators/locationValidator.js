const allowedFields = [
  "branch",
  "locationCode",
  "locationName",
  "locationType",
  "isDefault",
  "address",
  "allowNegativeStock",
  "status",
];

const validateLocation = (req, res, next) => {
  const data = req.body;
  const errors = [];
  const isUpdate = req.method === "PATCH";

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
    });
  }

  Object.keys(data).forEach((field) => {
    if (!allowedFields.includes(field)) {
      errors.push(`Field '${field}' is not allowed`);
    }
  });

  ["branch", "locationCode", "locationName", "locationType"].forEach(
    (field) => {
      if (!isUpdate && !data[field]) {
        errors.push(`${field} is required`);
      }
    },
  );

  if (
    data.locationType !== undefined &&
    ![
      "showroom",
      "service_center",
      "warehouse",
      "spare_parts_store",
      "yard",
      "other",
    ].includes(data.locationType)
  ) {
    errors.push("Invalid location type");
  }

  if (data.isDefault !== undefined && typeof data.isDefault !== "boolean") {
    errors.push("isDefault must be boolean");
  }

  if (
    data.allowNegativeStock !== undefined &&
    typeof data.allowNegativeStock !== "boolean"
  ) {
    errors.push("allowNegativeStock must be boolean");
  }

  if (
    data.status !== undefined &&
    !["active", "inactive"].includes(data.status)
  ) {
    errors.push("Invalid location status");
  }

  ["branch", "locationCode", "locationName"].forEach((field) => {
    if (
      data[field] !== undefined &&
      (typeof data[field] !== "string" || !data[field].trim())
    ) {
      errors.push(`Invalid ${field}`);
    }
  });

  if (data.address !== undefined) {
    const address = data.address;
    const required = ["addressLine1", "city", "state", "pinCode"];

    if (!address || typeof address !== "object" || Array.isArray(address)) {
      errors.push("Invalid address object");
    } else {
      required.forEach((field) => {
        if (!isUpdate && !address[field]) {
          errors.push(`Address ${field} is required`);
        }
      });

      if (
        address.pinCode !== undefined &&
        !/^[1-9][0-9]{5}$/.test(address.pinCode)
      ) {
        errors.push("Invalid PIN code");
      }
    }
  } else if (!isUpdate) {
    errors.push("Address is required");
  }

  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: "Location validation failed",
      errors,
    });
  }

  next();
};

module.exports = { validateLocation };
