import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card';
import { ScrollArea } from '@/components/ui/scroll-area';

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && session) {
      navigate('/');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md dark:neon-glow">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl sm:text-3xl text-center tracking-wider text-gradient">AO Daily Reports</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm">Accounting - Cashier - Consignment</CardDescription>
        </CardHeader>
        <ScrollArea className="max-h-[80vh]">
          <CardContent>
            <Auth
              supabaseClient={supabase}
              providers={[]}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
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
                style: {
                  anchor: {
                    display: 'none',
                  },
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    sign_up_link: '',
                    no_account_text: '',
                  },
                },
              } as any}
              theme="dark"
              redirectTo={window.location.origin + '/'}
              view="sign_in"
            />
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Login;