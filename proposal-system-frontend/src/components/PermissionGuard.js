import { usePermission } from '../hooks/usePermission';

const PermissionGuard = ({ permission, children, fallback = null }) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return children;
};

export default PermissionGuard;
