"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, AuthContextType, UserRole } from "@/types";
import { useSignIn, useSignUp } from '@niledatabase/react';
import {
  auth
} from '@niledatabase/client';
import { getUserProfile, ProfileActionResponse } from "@/lib/actions/profileActions";
import { NileUser, mapNileUserToFormData } from "@/lib/utils";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => { },
  signup: async () => { },
  logout: async () => { },
  updateUser: () => { },
  refreshUserData: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  const signInHook = useSignIn({
    onSuccess: (data) => {
      if (data?.ok) {
        const getUserFromSession = async () => {
          try {
            const session = await auth.getSession();
            if ((session as any)?.user) {
              console.log("[AuthContext] Session retrieved after login:", (session as any)?.user?.id);
              // Set basic user data from session first (fast)
              const basicUser = mapSessionToUser(session as any);
              setUser(basicUser);
              setAuthError(null);

              // Fetch full user profile in background without blocking UI
              try {
                const profileResponse: ProfileActionResponse<NileUser> = await getUserProfile();
                if (profileResponse.success && profileResponse.data) {
                  const fullUser = mapNileUserToUser(profileResponse.data);
                  setUser(fullUser);
                } else if (profileResponse.error) {
                  console.warn("Failed to fetch full profile after login:", profileResponse.error.message);
                }
              } catch (profileError) {
                console.warn("Profile fetch error after login:", profileError);
              }
            }
          } catch (error) {
            console.error("Failed to get session after login:", error);
            setAuthError(error as Error);
          }
        };
        getUserFromSession();
      }
    },
    onError: (error: Error) => {
      console.error("SignIn error:", error);
      setAuthError(error);
    },
    callbackUrl: "/dashboard"
  });

  const signUpHook = useSignUp({
    onSuccess: (data) => {
      const { ok } = data;
      if (ok) {
        // After signup, we might need to sign in immediately
        // But since useSignUp doesn't automatically populate session, we'll handle in signup
        setAuthError(null);
      } else {
        setAuthError(new Error("Signup failed."));
      }
    },
    onError: (error) => {
      console.error("SignUp error:", error);
      setAuthError(error);
    },
    createTenant: true,
    callbackUrl: "/dashboard/settings"
  });

  const mapSessionToUser = (session: any): User => {
    const userData = session.user;
    // Map NileDB fields: name, givenName, familyName, picture
    const displayName = userData.name || userData.email.split('@')[0];
    const givenName = userData.givenName;
    const familyName = userData.familyName;

    return {
      uid: userData.id,
      email: userData.email,
      displayName,
      photoURL: userData.picture,
      token: userData.id, // Assuming token is not exposed, using id
      claims: {
        name: displayName,
        role: UserRole.USER,
        companyId: "default-company",
        companyName: "Default Company",
        plan: "free",
      },
      profile: {
        firstName: givenName || "",
        lastName: familyName || "",
        avatar: userData.picture,
        timezone: "UTC",
        language: "en",
      }
    };
  };

  const mapNileUserToUser = (nileUser: NileUser): User => {
    const formData = mapNileUserToFormData(nileUser);

    return {
      uid: nileUser.id,
      email: nileUser.email,
      displayName: formData.name || nileUser.email.split('@')[0],
      photoURL: formData.avatarUrl,
      token: nileUser.id,
      claims: {
        name: formData.name || nileUser.email.split('@')[0],
        role: UserRole.USER,
        companyId: "default-company",
        companyName: "Default Company",
        plan: "free",
      },
      profile: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatar: formData.avatarUrl,
        timezone: "UTC",
        language: "en",
      }
    };
  };

  const login = async (email: string, password: string): Promise<void> => {
    setAuthError(null);
    try {
      await signInHook({ provider: "credentials", email, password });
      // The user state will be updated asynchronously in the onSuccess callback
    } catch (error) {
      setAuthError(error as Error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, firstName?: string, lastName?: string, companyName?: string): Promise<void> => {
    setAuthError(null);
    try {
      await signUpHook({ email, password });
    } catch (error) {
      setAuthError(error as Error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateUser = (userUpdate: Partial<User>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...userUpdate,
      profile: {
        ...user.profile,
        ...userUpdate.profile
      }
    };

    setUser(updatedUser);
  };

  const refreshUserData = async () => {
    try {
      const profileResponse: ProfileActionResponse<NileUser> = await getUserProfile();
      if (profileResponse.success && profileResponse.data) {
        const fullUser = mapNileUserToUser(profileResponse.data);
        setUser(fullUser);
        setAuthError(null);
      } else if (profileResponse.error) {
        console.warn("Failed to refresh user profile:", profileResponse.error.message);
        throw new Error(profileResponse.error.message);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await auth.getSession();
        if ((session as any)?.user) {
          // Set basic user data from session first (fast)
          const basicUser = mapSessionToUser(session as any);
          setUser(basicUser);
          setLoading(false);

          // Fetch full user profile in background without blocking UI
          try {
            const profileResponse: ProfileActionResponse<NileUser> = await getUserProfile();
            if (profileResponse.success && profileResponse.data) {
              const fullUser = mapNileUserToUser(profileResponse.data);
              setUser(fullUser);
              setAuthError(null);
            } else if (profileResponse.error) {
              console.warn("Failed to fetch full profile:", profileResponse.error.message);
              // Keep basic user data, don't show error to user as they can proceed
            }
          } catch (profileError) {
            console.warn("Profile fetch error (continuing with basic data):", profileError);
            // Keep basic user data, don't affect loading state
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Session get error:", error);
        setAuthError(error as Error);
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error: authError, login, signup, logout, updateUser, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
