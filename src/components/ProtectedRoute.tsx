import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { session, isLoading } = useAuth();

  // Logika timeout darurat telah dipindahkan ke AuthProvider untuk resolusi yang lebih cepat.
  // Kita hanya perlu menampilkan status loading.

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading application...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;