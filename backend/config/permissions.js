const ROLE_PERMISSIONS = {
  super_admin: ["*"],

  admin: [
    "dashboard.read",

    "users.read",
    "users.create",
    "users.update",

    "customers.read",
    "customers.create",
    "customers.update",

    "vehicles.read",
    "vehicles.create",
    "vehicles.update",

    "products.read",
    "products.create",
    "products.update",

    "inventory.read",
    "inventory.update",

    "sales.read",
    "sales.create",

    "service.read",
    "service.create",

    "reports.read",

    "business.read",
    "business.create",
    "business.update",
    "business.brand.update",

    "branches.read",
    "branches.create",
    "branches.update",
    "branches.delete",

    "locations.read",
    "locations.create",
    "locations.update",
    "locations.delete",
  ],

  salesperson: [
    "dashboard.read",
    "customers.read",
    "customers.create",
    "customers.update",
    "vehicles.read",
    "sales.read",
    "sales.create",
    "branches.read",
    "locations.read",
  ],

  mechanic: [
    "dashboard.read",
    "service.read",
    "service.update",
    "jobcards.read",
    "jobcards.update",
    "branches.read",
    "locations.read",
  ],

  cashier: [
    "dashboard.read",
    "sales.read",
    "sales.create",
    "payments.read",
    "payments.create",
    "service.read",
    "service.create",
    "branches.read",
    "locations.read",
  ],
};

const hasPermission = (user, requiredPermission) => {
  if (!user || !user.role) return false;

  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  const allPermissions = [...rolePermissions, ...(user.permissions || [])];

  return (
    allPermissions.includes("*") || allPermissions.includes(requiredPermission)
  );
};

module.exports = {
  ROLE_PERMISSIONS,
  hasPermission,
};
