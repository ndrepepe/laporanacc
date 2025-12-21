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
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to fetch profile with better error handling
  const fetchProfile = useCallback(async (currentUser: User): Promise<UserProfile | null> => {
    try {
      console.log("Fetching profile for user:", currentUser.id);
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, role, updated_at")
        .eq("id", currentUser.id)
        .single();

      if (fetchError) {
        console.error("Profile fetch error:", fetchError);
        // Handle specific error codes
        if (fetchError.code === 'PGRST116') {
          console.warn(`Profile not found for user ${currentUser.id}. Attempting to create.`);
          // Try to create profile from metadata
          const metadata = currentUser.user_metadata || {};
          const newProfilePayload = {
            id: currentUser.id,
            first_name: metadata.first_name || null,
            last_name: metadata.last_name || null,
            role: metadata.role || null,
          };
          
          console.log("Creating new profile with payload:", newProfilePayload);
          const { data: newProfileData, error: insertError } = await supabase
            .from("profiles")
            .insert([newProfilePayload])
            .select("id, first_name, last_name, role, updated_at")
            .single();

          if (insertError) {
            console.error("Failed to create profile:", insertError);
            throw new Error(`Failed to create profile: ${insertError.message}`);
          }
          
          console.log("Successfully created new profile:", newProfileData);
          return newProfileData as UserProfile;
        } else {
          throw new Error(`Failed to load profile: ${fetchError.message}`);
        }
      }

      if (existingProfile) {
        console.log("Found existing profile:", existingProfile);
        return existingProfile as UserProfile;
      }
      
      return null;
    } catch (err: any) {
      console.error("Error in fetchProfile:", err);
      throw err;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      console.log("Refreshing profile...");
      setError(null);
      
      const { data: { user: refreshedUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error refreshing user session:", userError);
        setError(`Session refresh failed: ${userError.message}`);
        return;
      }
      
      if (refreshedUser) {
        setUser(refreshedUser);
        const updatedProfile = await fetchProfile(refreshedUser);
        setProfile(updatedProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err: any) {
      console.error("Error in refreshProfile:", err);
      setError(`Profile refresh failed: ${err.message}`);
    }
  }, [fetchProfile]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        
        // Set timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted && !isInitialized) {
            console.warn("Auth initialization timeout - forcing completion");
            setIsLoading(false);
            setIsInitialized(true);
            setError("Auth initialization timed out. Please refresh the page.");
          }
        }, 15000); // 15 second timeout

        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session fetch error:", sessionError);
          setError(`Authentication error: ${sessionError.message}`);
        }
        
        const currentSession = initialSession || null;
        const currentUser = currentSession?.user ?? null;
        
        console.log("Session loaded:", { hasSession: !!currentSession, hasUser: !!currentUser });
        setSession(currentSession);
        setUser(currentUser);
        
        // Set loading to false immediately after session check
        setIsLoading(false);
        setIsInitialized(true);
        
        // Fetch profile if user exists
        if (currentUser) {
          try {
            const initialProfile = await fetchProfile(currentUser);
            if (isMounted) {
              setProfile(initialProfile);
            }
          } catch (profileError: any) {
            console.error("Profile loading error:", profileError);
            if (isMounted) {
              setError(`Failed to load profile: ${profileError.message}`);
            }
          }
        } else {
          setProfile(null);
        }
        
        clearTimeout(timeoutId);
      } catch (error: any) {
        console.error("Error during initial auth setup:", error);
        if (isMounted) {
          setError(`Initialization error: ${error.message}`);
          setIsLoading(false);
          setIsInitialized(true);
          // Try to clear corrupted data
          try {
            await supabase.auth.signOut();
            console.log("Cleared corrupted session");
          } catch (signOutError) {
            console.error("Failed to sign out:", signOutError);
          }
        }
        clearTimeout(timeoutId);
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
          try {
            const updatedProfile = await fetchProfile(currentSession.user);
            if (isMounted) {
              setProfile(updatedProfile);
            }
          } catch (profileError: any) {
            console.error("Profile update error:", profileError);
            if (isMounted) {
              setError(`Profile update failed: ${profileError.message}`);
            }
          }
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
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, refreshProfile, error }}>
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