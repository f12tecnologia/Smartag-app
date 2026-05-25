export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

export const isSuperAdmin = (role) => role === ROLES.SUPERADMIN;

export const isAdminRole = (role) =>
  role === ROLES.ADMIN || role === ROLES.SUPERADMIN;

export const canManageUsers = (role) => isAdminRole(role);

export const assignableRoles = (actorRole) => {
  if (isSuperAdmin(actorRole)) {
    return [ROLES.USER, ROLES.ADMIN, ROLES.SUPERADMIN];
  }
  if (actorRole === ROLES.ADMIN) {
    return [ROLES.USER, ROLES.ADMIN];
  }
  return [];
};
