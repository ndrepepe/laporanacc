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
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary neon-glow" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-primary/80">AO</span>
          </div>
        </div>
        <p className="mt-6 text-lg font-medium tracking-wider">Loading Command Center...</p>
        <p className="text-sm text-muted-foreground mt-1">Please wait</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;