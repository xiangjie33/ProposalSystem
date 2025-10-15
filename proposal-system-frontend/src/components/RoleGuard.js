import { usePermission } from '../hooks/usePermission';

const RoleGuard = ({ roles, children, fallback = null }) => {
  const { hasAnyRole } = usePermission();

  if (!hasAnyRole(Array.isArray(roles) ? roles : [roles])) {
    return fallback;
  }

  return children;
};

export default RoleGuard;
