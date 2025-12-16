import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./client";
import { showError } from "@/utils/toast";
import { Profile } from "@/lib/types"; // Import Profile type

// Define the structure for the user profile (matching the DB schema)
export type UserProfile = Profile; // Use Profile from types.ts

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role")
    .eq("id", userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found (new user)
    console.error("Error fetching profile:", error);
    showError("Failed to load user profile.");
    return null;
  }
  
  return data as UserProfile | null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch initial session immediately and resolve loading state
    const loadInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (isMounted) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const userProfile = await fetchUserProfile(initialSession.user.id);
          if (isMounted) {
            setProfile(userProfile);
          }
        }
        
        // Resolve loading state immediately after fetching initial data
        setIsLoading(false);
      }
    };

    loadInitialSession();

    // 2. Set up listener for subsequent changes (sign in/out/update)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;
        
        // Update session/user/profile based on real-time events
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const userProfile = await fetchUserProfile(currentSession.user.id);
          if (isMounted) {
            setProfile(userProfile);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading }}>
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