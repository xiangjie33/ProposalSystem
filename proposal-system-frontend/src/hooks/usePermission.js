import { authService } from '../services/auth';

export const usePermission = () => {
  const user = authService.getCurrentUser();
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');

  const hasPermission = (permission) => {
    if (!user) return false;
    return permissions.includes(permission);
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.some(r => r.name === role);
  };

  const hasAnyRole = (roles) => {
    if (!user || !user.roles) return false;
    return user.roles.some(r => roles.includes(r.name));
  };

  const canManageUser = (targetUser) => {
    if (!targetUser) return false;
    
    // 超级管理员可以管理所有用户
    if (hasRole('super_admin')) {
      return true;
    }

    // 管理员只能管理非管理员用户
    if (hasRole('admin')) {
      const targetRoles = targetUser.roles?.map(r => r.name) || [];
      return !targetRoles.some(r => ['super_admin', 'admin'].includes(r));
    }

    return false;
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    canManageUser,
    isSuperAdmin: hasRole('super_admin'),
    isAdmin: hasAnyRole(['super_admin', 'admin']),
    user,
    permissions,
  };
};
