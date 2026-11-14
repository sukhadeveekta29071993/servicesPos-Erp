const allowedFields = [
  "branchCode",
  "branchName",
  "branchType",
  "isMain",
  "email",
  "phone",
  "alternatePhone",
  "address",
  "status",
];

const validateBranch = (req, res, next) => {
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

  ["branchCode", "branchName", "phone"].forEach((field) => {
    if (!isUpdate && !data[field]) {
      errors.push(`${field} is required`);
    }

    if (
      data[field] !== undefined &&
      (typeof data[field] !== "string" || !data[field].trim())
    ) {
      errors.push(`Invalid ${field}`);
    }
  });

  if (
    data.branchType !== undefined &&
    !["head_office", "branch"].includes(data.branchType)
  ) {
    errors.push("Invalid branch type");
  }

  if (data.isMain !== undefined && typeof data.isMain !== "boolean") {
    errors.push("isMain must be boolean");
  }

  if (
    data.status !== undefined &&
    !["active", "inactive"].includes(data.status)
  ) {
    errors.push("Invalid branch status");
  }

  if (
    data.email !== undefined &&
    data.email !== "" &&
    (typeof data.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
  ) {
    errors.push("Invalid email address");
  }

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
      message: "Branch validation failed",
      errors,
    });
  }

  next();
};

module.exports = { validateBranch };
