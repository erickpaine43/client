"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Claims = {
  name: string;
  role: string;
  companyId: string;
  companyName: string;
  plan: string;
};

type User = {
  uid: string;
  email: string;
  displayName: string;
  token: string;
  claims: Claims;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser({
      uid: "test-uid",
      email: "test@example.com",
      displayName: "Test User",
      token: "test-token",
      claims: {
        name: "Test User",
        role: "user",
        companyId: "test-company-id",
        companyName: "Test Company",
        plan: "free",
      },
    });
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
