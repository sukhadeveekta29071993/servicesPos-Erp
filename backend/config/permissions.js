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
  ],

  salesperson: [
    "dashboard.read",
    "customers.read",
    "customers.create",
    "customers.update",
    "vehicles.read",
    "sales.read",
    "sales.create",
  ],

  mechanic: [
    "dashboard.read",
    "service.read",
    "service.update",
    "jobcards.read",
    "jobcards.update",
  ],

  cashier: [
    "dashboard.read",
    "sales.read",
    "sales.create",
    "payments.read",
    "payments.create",
    "service.read",
    "service.create",
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
