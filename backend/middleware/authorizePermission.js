const { hasPermission } = require("../config/permissions");

const authorizePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!hasPermission(req.user, requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: `Missing permission: ${requiredPermission}`,
      });
    }

    next();
  };
};

module.exports = authorizePermission;
