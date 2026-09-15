// ============================================================
// Campus Care — RoleRoute Guard
// ============================================================

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from '../pages/LoadingScreen';

interface RoleRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

export default function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { profile, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !profile) {
    return <Navigate to="/login" replace />;
  }

  // Check role match:
  // Direct match with profile.role (e.g. 'admin', 'student', 'teacher', 'faculty', 'worker')
  // Or department match for workers (e.g. allowedRoles contains 'medical' and profile.worker_department === 'medical')
  const hasRole =
    allowedRoles.includes(profile.role) ||
    (profile.role === 'worker' &&
      profile.worker_department &&
      allowedRoles.includes(profile.worker_department));

  if (!hasRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
