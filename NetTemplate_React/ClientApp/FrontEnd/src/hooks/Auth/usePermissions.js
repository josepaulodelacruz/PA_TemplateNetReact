import useAuth from '~/hooks/Auth/useAuth';

/**
 * Permission helpers backed by the logged-in user's permissions
 * (loaded at login, shape: { name, create, read, update, delete }).
 *
 * Deny-by-default: a module missing from the user's permission list
 * is treated as no access.
 */
const usePermissions = () => {
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];

  const hasPermission = (moduleName, action = 'read') => {
    const module = permissions.find((itm) => itm.name === moduleName);
    return module ? module[action] === true : false;
  };

  return {
    permissions,
    hasPermission,
    canCreate: (moduleName) => hasPermission(moduleName, 'create'),
    canRead: (moduleName) => hasPermission(moduleName, 'read'),
    canUpdate: (moduleName) => hasPermission(moduleName, 'update'),
    canDelete: (moduleName) => hasPermission(moduleName, 'delete'),
  };
};

export default usePermissions;
