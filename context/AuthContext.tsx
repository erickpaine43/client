"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, AuthContextType, UserRole } from "@/types";
import { useSignIn, useSignUp } from '@niledatabase/react';
import {
  auth
} from '@niledatabase/client';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
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
            console.log
            if ((session as any)?.user) {
              setUser(mapSessionToUser(session as any));
            }
            setAuthError(null);
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
    callbackUrl: "/dashboard/settings"
  });

  const mapSessionToUser = (session: any): User => {
    const userData = session.user;
    const displayName = userData.email.split('@')[0];
    const nameParts = displayName.split('.');
    return {
      uid: userData.id,
      email: userData.email,
      displayName,
      token: userData.id, // Assuming token is not exposed, using id
      claims: {
        name: displayName,
        role: UserRole.USER,
        companyId: "default-company",
        companyName: "Default Company",
        plan: "free",
      },
      profile: {
        firstName: nameParts[0] || displayName,
        lastName: nameParts[1] || "",
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
      // After signup, automatically sign in
      await login(email, password);
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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await auth.getSession();
        if ((session as any)?.user) {
          setUser(mapSessionToUser(session as any));
        }
      } catch (error) {
        console.error("Session get error:", error);
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error: authError, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
