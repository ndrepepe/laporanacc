import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import { UserRole } from '@/lib/roles';

const ALLOWED_ROLES: UserRole[] = ['Accounting Manager', 'Senior Manager'];

const SummaryRoute = () => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authorization...</div>;
  }

  // If not authenticated, rely on the parent ProtectedRoute or redirect to login
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user has one of the required roles
  if (!profile.role || !ALLOWED_ROLES.includes(profile.role)) {
    // Redirect unauthorized users to the dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default SummaryRoute;