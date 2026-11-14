const express = require("express");
const router = express.Router();

const {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deactivateBranch,
} = require("../controllers/branchController");

const { protect } = require("../middleware/authMiddleware");
const authorizePermission = require("../middleware/authorizePermission");
const { validateBranch } = require("../validators/branchValidator");

router.use(protect);

router.get("/", authorizePermission("branches.read"), getBranches);

router.get("/:branchId", authorizePermission("branches.read"), getBranchById);

router.post(
  "/",
  authorizePermission("branches.create"),
  validateBranch,
  createBranch,
);

router.patch(
  "/:branchId",
  authorizePermission("branches.update"),
  validateBranch,
  updateBranch,
);

router.delete(
  "/:branchId",
  authorizePermission("branches.delete"),
  deactivateBranch,
);

module.exports = router;
