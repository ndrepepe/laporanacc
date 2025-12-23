"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card';
import { ScrollArea } from '@/components/ui/scroll-area';

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!isLoading && session) {
      navigate('/');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const logoUrl = "https://madymngifviixpttjpvp.supabase.co/storage/v1/object/public/public-assets/pasted-image-2025-12-23T15-19-06-152Z.png";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md dark:neon-glow overflow-hidden border-border/40">
        <CardHeader className="pb-2">
          {/* Container Logo */}
          <div className="flex justify-center mb-6 bg-white p-4 rounded-2xl shadow-inner border border-slate-100 min-h-[100px] items-center">
            {!imageError ? (
              <img 
                src={logoUrl} 
                alt="Penerbit Andi Logo" 
                className="h-20 w-auto object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <span className="text-4xl font-black tracking-tighter text-slate-800">ANDI</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] -mt-1">Penerbit</span>
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl sm:text-3xl text-center tracking-widest text-gradient font-black">
            AO DAILY REPORTS
          </CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm font-semibold text-muted-foreground mt-2 border-t pt-2 border-border/30">
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
                  button: {
                    borderRadius: 'var(--radius)',
                    fontWeight: '700',
                    letterSpacing: '0.05em',
                  },
                  input: {
                    borderRadius: 'var(--radius)',
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