import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { hasRoleAccess, normalizeRole, ROLE_ROUTES } from '../utils/helpers';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const normalizedRole = normalizeRole(user?.role);

  console.log('[ProtectedRoute]', {
    pathname: location.pathname,
    user,
    role: user?.role,
    normalizedRole,
    requiredRoles: roles,
    isAuthenticated,
    loading,
  });

  if (loading) {
    console.log('[ProtectedRoute] decision: show loading spinner');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] decision: redirect to /login (not authenticated)');
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRoleAccess(user?.role, roles)) {
    const redirectTo = ROLE_ROUTES[normalizedRole] || '/dashboard';
    console.log('[ProtectedRoute] decision: role denied, redirect to', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  console.log('[ProtectedRoute] decision: render children');
  return children;
};

export default ProtectedRoute;
