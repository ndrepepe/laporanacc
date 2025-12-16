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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, role")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setProfile(data as UserProfile);
        }
      } catch (error) {
        console.error("Error refreshing profile:", error);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;
    
    // Timeout darurat untuk mencegah loading tak terbatas
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.error("Auth initialization timeout - forcing completion");
        setIsLoading(false);
      }
    }, 10000); // 10 detik timeout

    const initializeAuth = async () => {
      try {
        // Fetch initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session fetch error:", sessionError);
        }

        if (!isMounted) return;

        const currentSession = initialSession || null;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Fetch profile if user exists
        if (currentSession?.user) {
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("id, first_name, last_name, role")
              .eq("id", currentSession.user.id)
              .single();

            if (!isMounted) return;

            if (!error && data) {
              setProfile(data as UserProfile);
            } else if (error) {
              console.error("Profile fetch error:", error);
            }
          } catch (profileError) {
            console.error("Unexpected error fetching profile:", profileError);
          }
        }
      } catch (error) {
        console.error("Error during initial auth setup:", error);
      } finally {
        // CRITICAL: Always set isLoading to false after initialization attempt
        if (isMounted) {
          clearTimeout(timeoutId);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up real-time listener for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("id, first_name, last_name, role")
              .eq("id", currentSession.user.id)
              .single();

            if (!isMounted) return;

            if (!error && data) {
              setProfile(data as UserProfile);
            } else if (error) {
              console.error("Profile fetch error on auth change:", error);
            }
          } catch (profileError) {
            console.error("Unexpected error fetching profile on auth change:", profileError);
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
  }, []);

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