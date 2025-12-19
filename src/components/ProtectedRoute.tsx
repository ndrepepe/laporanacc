import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { session, isLoading } = useAuth();
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("ProtectedRoute timeout - forcing redirect to login");
        setHasTimedOut(true);
        setShowTimeoutMessage(true);
        
        // After showing message for 3 seconds, redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Show timeout message if we've waited too long
  if (hasTimedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary neon-glow mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-destructive">Loading Timeout</h2>
            <p className="text-muted-foreground max-w-md">
              The application is taking too long to load. This might be due to:
            </p>
            <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-1">
              <li>• Network connectivity issues</li>
              <li>• Browser storage/cookie problems</li>
              <li>• Server maintenance</li>
            </ul>
            <p className="text-sm text-primary">
              Redirecting to login page in a few seconds...
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show timeout warning after 10 seconds
  useEffect(() => {
    const warningTimeout = setTimeout(() => {
      if (isLoading && !hasTimedOut) {
        setShowTimeoutMessage(true);
      }
    }, 10000);

    return () => clearTimeout(warningTimeout);
  }, [isLoading, hasTimedOut]);

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
        
        {showTimeoutMessage && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg max-w-md">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              This is taking longer than expected. If this continues, the page will redirect automatically.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;