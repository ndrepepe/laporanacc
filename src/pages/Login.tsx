"use client";

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
      <Card className="w-full max-w-md dark:neon-glow overflow-hidden border-border/40 bg-black/60 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl sm:text-3xl text-center tracking-widest text-gradient font-black">
            AO DAILY REPORTS
          </CardTitle>
          {/* Meningkatkan kontras deskripsi dengan text-foreground/90 */}
          <CardDescription className="text-center text-xs sm:text-sm font-bold text-foreground/90 mt-2 border-t pt-2 border-border/30">
            ACCOUNTING • CASHIER • CONSIGNMENT
          </CardDescription>
        </CardHeader>
        
        <ScrollArea className="max-h-[80vh]">
          <CardContent className="pt-6">
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
                      inputBackground: 'rgba(255,255,255,0.05)', 
                      inputBorder: 'hsl(var(--border)/0.5)',
                      inputBorderHover: 'hsl(var(--primary))',
                      inputBorderFocus: 'hsl(var(--primary))',
                      // Menambahkan warna teks label dan input agar lebih kontras
                      inputText: '#ffffff',
                      inputLabelText: '#f8fafc', 
                      inputPlaceholder: '#94a3b8',
                    },
                  },
                },
                style: {
                  anchor: {
                    display: 'none',
                  },
                  button: {
                    borderRadius: 'var(--radius)',
                    fontWeight: '700',
                    letterSpacing: '0.05em',
                  },
                  input: {
                    borderRadius: 'var(--radius)',
                    color: 'white',
                  },
                  label: {
                    color: '#f1f5f9', // Warna putih tulang yang sangat jelas
                    fontWeight: '600',
                    marginBottom: '4px',
                  }
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