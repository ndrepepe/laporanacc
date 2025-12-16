import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { session, isLoading } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    // Timeout darurat untuk mencegah loading tak terbatas
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setShowTimeout(true);
        console.error("ProtectedRoute timeout - forcing completion");
      }
    }, 15000); // 15 detik timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  if (showTimeout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Loading Timeout</h2>
        <p className="text-center mb-4">
          The application is taking longer than expected to load. Please try refreshing the page.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Reload Page
        </button>
      </div>
    );
  }

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