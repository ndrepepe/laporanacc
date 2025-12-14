import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import { UserRole } from '@/lib/roles';

const ADMIN_ROLE: UserRole = 'Senior Manager';

const AdminRoute = () => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authorization...</div>;
  }

  // If not authenticated, ProtectedRoute should handle redirecting to /login, but we check explicitly here for clarity.
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user has the required admin role
  if (profile.role !== ADMIN_ROLE) {
    // Redirect non-admin users to the dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;