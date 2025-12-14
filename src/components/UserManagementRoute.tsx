import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import { UserRole } from '@/lib/roles';

const ALLOWED_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager'];

const UserManagementRoute = () => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authorization...</div>;
  }

  if (!profile || !profile.role || !ALLOWED_ROLES.includes(profile.role)) {
    // Redirect unauthorized users to the dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default UserManagementRoute;