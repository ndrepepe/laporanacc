import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card'; // Use custom Card

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && session) {
      // Redirect authenticated users to the main dashboard
      navigate('/');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md dark:neon-glow">
        <CardHeader>
          <CardTitle className="text-3xl text-center tracking-wider text-gradient">AI Daily Reports</CardTitle>
          <CardDescription className="text-center text-sm">Accounting - Cashier - Consignment</CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    // Use primary color for brand identity
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--accent))',
                    defaultButtonBackground: 'hsl(var(--secondary))',
                    defaultButtonBackgroundHover: 'hsl(var(--secondary)/0.8)',
                    inputBackground: 'hsl(var(--input))',
                    inputBorder: 'hsl(var(--border))',
                    inputBorderHover: 'hsl(var(--primary))',
                    inputBorderFocus: 'hsl(var(--primary))',
                  },
                },
              },
            }}
            theme="dark" // Default to dark theme for futuristic look
            redirectTo={window.location.origin + '/'}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;