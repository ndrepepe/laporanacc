import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';

const ProtectedRoute = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    // Optionally show a spinner or loading screen
    return <div className="min-h-screen flex items-center justify-center">Loading application...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;