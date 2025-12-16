import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, role")
      .eq("id", userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    return data as UserProfile | null;
  } catch (error) {
    console.error("Unexpected error fetching profile:", error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    }
  }, [user?.id]);

  // Fungsi untuk menginisialisasi autentikasi dengan mekanisme polling
  const initializeAuth = useCallback(async () => {
    try {
      // Fetch initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      // Fetch profile if user exists
      if (initialSession?.user) {
        const userProfile = await fetchUserProfile(initialSession.user.id);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Error during initial auth setup:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fungsi polling untuk memastikan profil dimuat
  const pollForProfile = useCallback(async () => {
    if (user?.id && !profile && retryCount < 3) {
      const userProfile = await fetchUserProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
      } else {
        setRetryCount(prev => prev + 1);
        // Coba lagi setelah 1 detik
        setTimeout(pollForProfile, 1000);
      }
    }
  }, [user?.id, profile, retryCount]);

  useEffect(() => {
    let isMounted = true;
    
    // Timeout darurat untuk mencegah loading tak terbatas
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.error("Auth initialization timeout - forcing completion");
        setIsLoading(false);
      }
    }, 15000); // 15 detik timeout

    initializeAuth().then(() => {
      if (isMounted) {
        clearTimeout(timeoutId);
        // Mulai polling jika profil belum dimuat
        if (user?.id && !profile) {
          setTimeout(pollForProfile, 1000);
        }
      }
    });

    // Set up real-time listener for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Reset retry count saat sesi berubah
          setRetryCount(0);
          const userProfile = await fetchUserProfile(currentSession.user.id);
          if (isMounted) {
            setProfile(userProfile);
            // Jika profil tidak dimuat, mulai polling
            if (!userProfile) {
              setTimeout(pollForProfile, 1000);
            }
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      listener.subscription.unsubscribe();
    };
  }, [initializeAuth, pollForProfile, user?.id, profile]);

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};