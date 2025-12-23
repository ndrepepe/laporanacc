import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
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
  const isInitialLoad = useRef(true);

  const fetchProfile = useCallback(async (currentUser: User): Promise<UserProfile | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      return data as UserProfile;
    } catch (err: any) {
      console.error("Error fetching profile:", err);
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
        // 1. Dapatkan sesi yang tersimpan (Persistence)
        const { data: { session: initSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (initSession) {
          setSession(initSession);
          setUser(initSession.user);
          // 2. Muat profil secara sinkron sebelum menghentikan loading
          const p = await fetchProfile(initSession.user);
          if (mounted) setProfile(p);
        }
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) {
          setIsLoading(false);
          isInitialLoad.current = false;
        }
      }
    };

    initializeAuth();

    // 3. Pantau perubahan status auth (login/logout/refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!mounted) return;
      
      // Jangan jalankan logika di sini jika sedang initial load untuk mencegah double fetching
      if (isInitialLoad.current) return;

      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const p = await fetchProfile(currentUser);
        if (mounted) setProfile(p);
      } else {
        setProfile(null);
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