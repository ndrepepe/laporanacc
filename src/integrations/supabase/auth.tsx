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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const handleInitialSession = async () => {
      try {
        // Attempt to get the initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.error("Error fetching initial session:", error);
          // CRITICAL FIX: If session fetch fails (e.g., corrupted local storage), 
          // force sign out to clear the bad state and prompt re-login.
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
          showError("Session error detected. Please log in again.");
        } else if (session) {
          setSession(session);
          setUser(session.user);
          const userProfile = await fetchUserProfile(session.user.id);
          if (isMounted) {
            setProfile(userProfile);
          }
        }
      } catch (e) {
        console.error("Unexpected error during initial session fetch:", e);
        // Fallback: force sign out on unexpected exceptions too
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        showError("A critical error occurred during startup. Please log in.");
      } finally {
        // CRITICAL FIX: Ensure isLoading is set to false unconditionally 
        // to prevent perpetual loading screen in Strict Mode/late resolution scenarios.
        setIsLoading(false);
      }
    };

    handleInitialSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, currentSession) => {
        if (!isMounted) return;
        
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
  }, []);

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