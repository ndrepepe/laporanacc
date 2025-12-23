import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { session, isLoading } = useAuth();

  // Tampilkan loading state saat memeriksa autentikasi
  // JANGAN redirect ke login saat loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary neon-glow" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-primary/80">AO</span>
          </div>
        </div>
        <p className="mt-6 text-lg font-medium tracking-wider">Memverifikasi Akses...</p>
        <p className="text-sm text-muted-foreground mt-1">Mohon tunggu sebentar</p>
      </div>
    );
  }

  // Hanya redirect jika TIDAK ada session (benar-benar tidak terautentikasi)
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada session, izinkan akses (role akan dimuat di halaman yang relevan)
  return <Outlet />;
};

export default ProtectedRoute;