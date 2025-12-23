import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./client";
import { Profile } from "@/lib/types";

export type UserProfile = Profile;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (currentUser: User): Promise<UserProfile | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (fetchError) {
        console.error("Error fetching profile from DB:", fetchError);
        // Jika error, coba gunakan metadata dari user sebagai fallback
        if (currentUser.user_metadata) {
          return {
            id: currentUser.id,
            first_name: currentUser.user_metadata.first_name || null,
            last_name: currentUser.user_metadata.last_name || null,
            role: currentUser.user_metadata.role || null,
            avatar_url: null,
            updated_at: null
          } as UserProfile;
        }
        return null;
      }

      return data as UserProfile;
    } catch (err: any) {
      console.error("Exception in fetchProfile:", err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const p = await fetchProfile(currentUser);
        setProfile(p);
        setUser(currentUser);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Dapatkan sesi yang ada (persisted)
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Selalu fetch profil dari backend
          const p = await fetchProfile(currentSession.user);
          if (mounted) setProfile(p);
        }
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listener untuk perubahan auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const p = await fetchProfile(currentUser);
        if (mounted) setProfile(p);
      } else {
        setProfile(null);
      }

      // Hanya set loading false untuk event SIGN_IN/SIGN_OUT
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, refreshProfile, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};