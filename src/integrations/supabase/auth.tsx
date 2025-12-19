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
import { showError } from "@/utils/toast";

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
  const [isInitialized, setIsInitialized] = useState(false);

  // Comprehensive function to fetch profile, or create a basic one if missing.
  const ensureProfileExists = useCallback(async (currentUser: User): Promise<UserProfile | null> => {
    try {
      // 1. Try to fetch existing profile with explicit single() to force fresh read
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, role")
        .eq("id", currentUser.id)
        .single(); // Use single() to get one row or throw error

      if (fetchError) {
        // Handle specific error codes
        if (fetchError.code === 'PGRST116') { // No rows found
          console.warn(`Profile not found for user ${currentUser.id}. Attempting to create.`);
        } else {
          console.error("Profile fetch error:", fetchError);
          showError(`Failed to load profile: ${fetchError.message}`);
          return null;
        }
      }

      if (existingProfile) {
        return existingProfile as UserProfile;
      }

      // 2. If no profile found (PGRST116), attempt to create a basic one using user metadata
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
        showError(`Failed to create profile: ${insertError.message}`);
        return null;
      }
      
      console.log("Successfully created missing profile.");
      return newProfileData as UserProfile;

    } catch (error: any) {
      console.error("Unexpected error in ensureProfileExists:", error);
      showError(`Unexpected error loading profile: ${error.message}`);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      // 1. Force refresh user session data (in case metadata changed)
      const { data: { user: refreshedUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error refreshing user session:", userError);
        showError(`Session refresh failed: ${userError.message}`);
        return; // Don't proceed if we can't get user
      }

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
    } catch (error: any) {
      console.error("Error in refreshProfile:", error);
      showError(`Profile refresh failed: ${error.message}`);
    }
  }, [ensureProfileExists]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const initializeAuth = async () => {
      try {
        // Add timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted && !isInitialized) {
            console.warn("Auth initialization timeout - forcing completion");
            setIsLoading(false);
            setIsInitialized(true);
          }
        }, 10000); // 10 second timeout

        // 1. Fetch initial session with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error("Session fetch error:", sessionError);
              if (retryCount === maxRetries - 1) {
                showError(`Authentication error: ${sessionError.message}`);
              }
            } else {
              // Retry after a short delay
              await new Promise(resolve => setTimeout(resolve, 1000));
              retryCount++;
              continue;
            }

            if (!isMounted) return;

            const currentSession = initialSession || null;
            const currentUser = currentSession?.user ?? null;
            
            setSession(currentSession);
            setUser(currentUser);

            // 2. CRITICAL: Set isLoading to false immediately after session check
            // This allows app to render and ProtectedRoute to decide navigation
            setIsLoading(false);
            setIsInitialized(true);

            // 3. Fetch or create profile if user exists (non-blocking)
            if (currentUser) {
              const initialProfile = await ensureProfileExists(currentUser);
              if (!isMounted) return;
              setProfile(initialProfile);
            } else {
              setProfile(null);
            }
            
            // Clear timeout since we succeeded
            clearTimeout(timeoutId);
            break;
          } catch (retryError: any) {
            console.error(`Retry ${retryCount + 1} failed:`, retryError);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
      } catch (error: any) {
        // This block catches unexpected errors, often caused by corrupted local storage/cookies.
        console.error("Error during initial auth setup (likely corrupted cache):", error);
        showError(`Initialization error: ${error.message}. Attempting to clear local session.`);
        
        // Self-healing: Force sign out to clear corrupted local storage state
        await supabase.auth.signOut(); 
        
        if (isMounted) {
          // Ensure we stop loading and allow ProtectedRoute to redirect to /login
          setIsLoading(false);
          setIsInitialized(true);
          setSession(null);
          setUser(null);
          setProfile(null);
          clearTimeout(timeoutId);
        }
      }
    };

    initializeAuth();

    // Set up real-time listener for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;
        
        console.log("Auth state changed:", _event);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use new comprehensive function to fetch or create profile on change
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
      if (timeoutId) clearTimeout(timeoutId);
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