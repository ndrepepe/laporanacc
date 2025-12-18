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

  // Comprehensive function to fetch the profile, or create a basic one if missing.
  const ensureProfileExists = useCallback(async (currentUser: User): Promise<UserProfile | null> => {
    try {
      // 1. Try to fetch existing profile, forcing a fresh read by using single()
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, role")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (fetchError && fetchError.code) { 
        console.error("Profile fetch error:", fetchError);
        return null;
      }

      if (existingProfile) {
        return existingProfile as UserProfile;
      }

      // 2. If no profile found, attempt to create a basic one using user metadata
      console.warn(`Profile missing for user ${currentUser.id}. Attempting to create basic profile.`);
      
      const metadata = currentUser.user_metadata;
      
      const newProfilePayload = {
        id: currentUser.id,
        first_name: metadata.first_name || null,
        last_name: metadata.last_name || null,
        role: metadata.role || null, 
      };

      const { data: newProfileData, error: insertError } = await supabase
        .from("profiles")
        .insert([newProfilePayload])
        .select("id, first_name, last_name, role")
        .single();

      if (insertError) {
        console.error("Failed to create missing profile:", insertError);
        return null;
      }
      
      console.log("Successfully created missing profile.");
      return newProfileData as UserProfile;

    } catch (error) {
      console.error("Unexpected error in ensureProfileExists:", error);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    // 1. Force refresh user session data (in case metadata changed)
    const { data: { user: refreshedUser } } = await supabase.auth.getUser();
    
    if (refreshedUser) {
      setUser(refreshedUser);
      // 2. Fetch fresh profile data
      const updatedProfile = await ensureProfileExists(refreshedUser);
      setProfile(updatedProfile);
    } else {
      // If user is no longer authenticated, clear state
      setUser(null);
      setProfile(null);
    }
  }, [ensureProfileExists]);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // 1. Fetch initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session fetch error:", sessionError);
        }

        if (!isMounted) return;

        const currentSession = initialSession || null;
        const currentUser = currentSession?.user ?? null;
        
        setSession(currentSession);
        setUser(currentUser);

        // 2. Set isLoading to false immediately after session check
        setIsLoading(false); 

        // 3. Fetch or create profile if user exists (non-blocking)
        if (currentUser) {
          const initialProfile = await ensureProfileExists(currentUser);
          if (!isMounted) return;
          setProfile(initialProfile);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error during initial auth setup:", error);
        if (isMounted) {
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
          // Use the new comprehensive function to fetch or create the profile on change
          const updatedProfile = await ensureProfileExists(currentSession.user);
          if (!isMounted) return;
          setProfile(updatedProfile);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [ensureProfileExists]);

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