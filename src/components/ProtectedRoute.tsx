import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { session, isLoading } = useAuth();

  // ATURAN: Tunggu sampai pemuatan sesi dan profil selesai
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary neon-glow" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-primary/80">AO</span>
          </div>
        </div>
        <p className="mt-6 text-lg font-medium tracking-wider">Verifikasi Akses...</p>
        <p className="text-sm text-muted-foreground mt-1">Mohon tunggu sebentar</p>
      </div>
    );
  }

  // ATURAN: Hanya arahkan ke login jika loading sudah selesai dan tidak ada sesi
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;