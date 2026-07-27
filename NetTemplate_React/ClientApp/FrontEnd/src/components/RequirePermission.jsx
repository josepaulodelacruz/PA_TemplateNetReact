import { Outlet } from 'react-router';
import usePermissions from '~/hooks/Auth/usePermissions';
import Forbidden from '~/components/Forbidden';

/**
 * Route guard. Use as a pathless layout route:
 *   { element: <RequirePermission module={ModuleNames.users} />, children: [...] }
 * or wrap a single element:
 *   <RequirePermission module={ModuleNames.users}><User /></RequirePermission>
 */
const RequirePermission = ({ module, action = 'read', children }) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(module, action)) {
    return <Forbidden />;
  }

  return children ?? <Outlet />;
};

export default RequirePermission;
