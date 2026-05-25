export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

export const isSuperAdmin = (role) => role === ROLES.SUPERADMIN;

export const isAdminRole = (role) =>
  role === ROLES.ADMIN || role === ROLES.SUPERADMIN;

export const roleLabel = (role) => {
  if (role === ROLES.SUPERADMIN) return 'Super Administrador';
  if (role === ROLES.ADMIN) return 'Administrador';
  return 'Usuário';
};
