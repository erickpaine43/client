"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User,
  AuthContextType,
  UserRole,
  NileDBUser,
  Tenant,
  mapTenantInfoToTenant,
} from "@/types";
import { CompanyInfo } from "@/types/company";
import { useSignIn, useSignUp } from "@niledatabase/react";
import { auth } from "@niledatabase/client";
import { toast } from "sonner";
import {
  AuthenticationError,
  InvalidCredentialsError,
} from "@/lib/niledb/errors";
import { mockUserSettings } from "@/lib/data/settings.mock";

interface EnhancedAuthContextType extends AuthContextType {
  // Enhanced user data
  nileUser: NileDBUser | null;
  userTenants: Tenant[];
  userCompanies: CompanyInfo[];
  isStaff: boolean;

  // Tenant and company management
  selectedTenantId: string | null;
  selectedCompanyId: string | null;
  setSelectedTenant: (tenantId: string | null) => void;
  setSelectedCompany: (companyId: string | null) => void;

  // Enhanced data fetching
  refreshTenants: () => Promise<void>;
  refreshCompanies: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Error handling
  clearError: () => void;

  // System health (for staff users)
  systemHealth: {
    status: "healthy" | "degraded" | "unhealthy" | "unknown";
    lastCheck?: Date;
  };
  checkSystemHealth: () => Promise<void>;
}

const AuthContext = createContext<EnhancedAuthContextType>({
  user: null,
  nileUser: null,
  userTenants: [],
  userCompanies: [],
  isStaff: false,
  selectedTenantId: null,
  selectedCompanyId: null,
  loading: true,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateUser: () => {},
  refreshUserData: async () => {},
  setSelectedTenant: () => {},
  setSelectedCompany: () => {},
  refreshTenants: async () => {},
  refreshCompanies: async () => {},
  refreshProfile: async () => {},
  clearError: () => {},
  systemHealth: { status: "unknown" },
  checkSystemHealth: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Core auth state
  const [user, setUser] = useState<User | null>(null);
  const [nileUser, setNileUser] = useState<NileDBUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Enhanced state
  const [userTenants, setUserTenants] = useState<Tenant[]>([]);
  const [userCompanies, setUserCompanies] = useState<CompanyInfo[]>([]);
  const [isStaff, setIsStaff] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );
  const [systemHealth, setSystemHealth] = useState<{
    status: "healthy" | "degraded" | "unhealthy" | "unknown";
    lastCheck?: Date;
  }>({ status: "unknown" });

  // API helper functions using the completed Task 8 API routes
  const fetchProfile = useCallback(async (): Promise<NileDBUser | null> => {
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthenticationError("Authentication required");
        }
        throw new Error(`Profile fetch failed: ${response.status}`);
      }

      const data = (await response.json()) as { profile: NileDBUser };
      return data.profile;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      if (error instanceof AuthenticationError) {
        throw error;
      }
      return null;
    }
  }, []);

  const fetchUserTenants = useCallback(async (): Promise<Tenant[]> => {
    try {
      const response = await fetch("/api/user/tenants", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          return [];
        }
        throw new Error(`Tenants fetch failed: ${response.status}`);
      }

      const data = (await response.json()) as {
        tenants: {
          id: string;
          name: string;
          created: string;
          updated?: string;
        }[];
      };
      return data.tenants?.map(mapTenantInfoToTenant) || [];
    } catch (error) {
      console.error("Failed to fetch user tenants:", error);
      return [];
    }
  }, []);

  const fetchUserCompanies = useCallback(
    async (userId: string): Promise<CompanyInfo[]> => {
      try {
        // In development/non-production uses, we allow mock-ups to facilitate local testing
        if (process.env.NODE_ENV !== "production") {
          return Array.isArray(mockUserSettings.companyInfo)
            ? mockUserSettings.companyInfo
            : [mockUserSettings.companyInfo];
        }

        // In production we always use the real API
        const response = await fetch(`/api/users/${userId}/companies`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            return [];
          }
          throw new Error(`Companies fetch failed: ${response.status}`);
        }

        const data = (await response.json()) as {
          companies: CompanyInfo[];
        };

        return data.companies || [];
      } catch (error) {
        console.error("Failed to fetch user companies:", error);
        return [];
      }
    },
    []
  );

  const testAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/test/auth", {
        method: "GET",
        credentials: "include",
      });

      return response.ok;
    } catch (error) {
      console.error("Authentication test failed:", error);
      return false;
    }
  }, []);

  const checkSystemHealthStatus = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/health/niledb", {
        method: "GET",
        credentials: "include",
      });

      setSystemHealth({
        status: response.ok ? "healthy" : "degraded",
        lastCheck: new Date(),
      });
    } catch (error) {
      console.error("System health check failed:", error);
      setSystemHealth({
        status: "unhealthy",
        lastCheck: new Date(),
      });
    }
  }, []);

  const signInHook = useSignIn({
    onSuccess: (data) => {
      console.log("[AuthContext] User signed in:", data);
      if (data?.ok) {
        const initializeUserSession = async () => {
          try {

            const isAuthenticated = await testAuthentication();
            if (!isAuthenticated) {
              throw new AuthenticationError("Authentication validation failed");
            }

            const profileData = await fetchProfile();

            if (profileData) {
              setNileUser(profileData);
              setIsStaff(profileData.profile?.isPenguinMailsStaff || false);

              // Map to legacy User format for backward compatibility
              const legacyUser = mapNileUserToLegacyUser(
                profileData,
                userCompanies,
                selectedTenantId,
                selectedCompanyId
              );
              setUser(legacyUser);

              // Fetch tenants and companies in parallel
              const [tenants, companies] = await Promise.all([
                fetchUserTenants(),
                fetchUserCompanies(profileData.id),
              ]);

              setUserTenants(tenants);
              setUserCompanies(companies);

              // Auto-select first tenant if available
              if (tenants.length > 0 && !selectedTenantId) {
                setSelectedTenantId(tenants[0].id);
              }

              // Auto-select first company if available
              if (companies.length > 0 && !selectedCompanyId) {
                setSelectedCompanyId(companies[0].id);
              }

              setAuthError(null);
              toast.success("Successfully signed in!");
            } else {
              throw new AuthenticationError("Failed to load user profile");
            }
          } catch (error) {
            console.error("Failed to initialize user session:", error);
            setAuthError(error as Error);
            if (error instanceof AuthenticationError) {
              toast.error(error.message);
            } else {
              toast.error("Failed to complete sign in");
            }
          } finally {
            setLoading(false);
          }
        };
        initializeUserSession();
      } else {
        if (data?.status === 401) {
            setAuthError(new InvalidCredentialsError("Invalid email or password."));
            toast.error("Invalid email or password.");
        } else {
            setAuthError(new Error("Login failed."));
            toast.error("Login failed.");
        }
        setUser(null);
        setNileUser(null);
        setLoading(false);
      }
    },
    onError: (error: Error) => {
      console.error("SignIn error:", error);
      setAuthError(error);
    },
    callbackUrl:
      typeof window !== "undefined"
        ? window.location.origin + "/email-confirmation"
        : "/email-confirmation",
  });

  const signUpHook = useSignUp({
    onSuccess: (data) => {
      const { ok } = data;
      if (ok) {
        // Success is handled in the SignUpFormView component
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
    callbackUrl: "/email-confirmation",
  });

  // Enhanced mapping function for NileDB user to legacy User format
  const mapNileUserToLegacyUser = useCallback(
    (
      nileUser: NileDBUser,
      userCompanies: CompanyInfo[],
      selectedTenantId: string | null,
      selectedCompanyId: string | null
    ): User => {
      const displayName = nileUser.name || nileUser.email.split("@")[0];
      let role = UserRole.USER;
      if (nileUser.profile?.role === "super_admin") role = UserRole.SUPER_ADMIN;
      else if (nileUser.profile?.role === "admin") role = UserRole.ADMIN;

      const selectedCompany = userCompanies.find(
        (c) => c.id === selectedCompanyId
      );

      return {
        id: nileUser.id,
        tenantId: selectedTenantId || nileUser.tenants?.[0] || "",
        email: nileUser.email,
        displayName,
        photoURL: nileUser.picture,
        uid: nileUser.id,
        token: nileUser.id,
        claims: {
          role,
          tenantId: selectedTenantId || nileUser.tenants?.[0] || "",
          companyId: selectedCompany?.id,
          permissions: [],
        },
        profile: {
          timezone:
            (nileUser.profile?.preferences?.timezone as string) || "UTC",
          language:
            (nileUser.profile?.preferences?.language as string) || "en",
          firstName: nileUser.givenName,
          lastName: nileUser.familyName,
          avatar: nileUser.picture,
          lastLogin: nileUser.profile?.lastLoginAt,
          createdAt: nileUser.created ? new Date(nileUser.created) : undefined,
          updatedAt: nileUser.updated ? new Date(nileUser.updated) : undefined,
        },
      };
    },
    []
  );

  const login = async (email: string, password: string): Promise<void> => {
    setAuthError(null);
    setLoading(true);

    try {
      await signInHook({ provider: "credentials", email, password });
      // The user state will be updated asynchronously in the onSuccess callback
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    _firstName?: string,
    _lastName?: string,
    _companyName?: string
  ): Promise<void> => {
    setAuthError(null);
    setLoading(true);

    try {
      const data = { email, password, name };
      await signUpHook(data);
    } catch (error) {
      console.error("Signup error:", error);
      setLoading(false);
      
      // Generic error handling - signup now uses custom API endpoint directly
      setAuthError(error as Error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();

      // Clear all state
      setUser(null);
      setNileUser(null);
      setUserTenants([]);
      setUserCompanies([]);
      setIsStaff(false);
      setSelectedTenantId(null);
      setSelectedCompanyId(null);
      setAuthError(null);
      setSystemHealth({ status: "unknown" });

      toast.success("Successfully signed out");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out");
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
        ...userUpdate.profile,
      },
    };

    setUser(updatedUser);
  };

  const refreshUserData = async () => {
    try {
      const profileData = await fetchProfile();
      if (profileData) {
        setNileUser(profileData);
        setIsStaff(profileData.profile?.isPenguinMailsStaff || false);

        const legacyUser = mapNileUserToLegacyUser(
          profileData,
          userCompanies,
          selectedTenantId,
          selectedCompanyId
        );
        setUser(legacyUser);
        setAuthError(null);
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setAuthError(error as Error);
      throw error;
    }
  };

  // Enhanced functions
  const refreshTenants = async () => {
    try {
      const tenants = await fetchUserTenants();
      setUserTenants(tenants);
    } catch (error) {
      console.error("Failed to refresh tenants:", error);
      toast.error("Failed to refresh tenants");
    }
  };

  const refreshCompanies = async () => {
    if (!nileUser) return;

    try {
      const companies = await fetchUserCompanies(nileUser.id);
      setUserCompanies(companies);
    } catch (error) {
      console.error("Failed to refresh companies:", error);
      toast.error("Failed to refresh companies");
    }
  };

  const refreshProfile = async () => {
    await refreshUserData();
  };

  const clearError = () => {
    setAuthError(null);
  };

  const setSelectedTenant = (tenantId: string | null) => {
    setSelectedTenantId(tenantId);
    // Clear selected company when changing tenant
    setSelectedCompanyId(null);

    // Update legacy user claims
    if (user && tenantId) {
      const tenant = userTenants.find((t) => t.id === tenantId);
      if (tenant) {
        updateUser({
          claims: {
            ...user.claims,
            companyId: "no-company",
            companyName: "No Company Selected",
          },
        });
      }
    }
  };

  const setSelectedCompany = (companyId: string | null) => {
    setSelectedCompanyId(companyId);

    // Update legacy user claims
    if (user && companyId) {
      const company = userCompanies.find((c) => c.id === companyId);
      if (company) {
        updateUser({
          claims: {
            ...user.claims,
            companyId: company.id,
            companyName: company.name,
          },
        });
      }
    }
  };

  const checkSystemHealth = async () => {
    if (!isStaff) return;
    await checkSystemHealthStatus();
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Test authentication with real session
        const isAuthenticated = await testAuthentication();

        if (isAuthenticated) {
          // User is authenticated, fetch real profile data
          const profileData = await fetchProfile();

          if (profileData) {
            setNileUser(profileData);
            setIsStaff(profileData.profile?.isPenguinMailsStaff || false);

            try {
              // Fetch tenants and companies in parallel
              const [tenants, companies] = await Promise.all([
                fetchUserTenants(),
                fetchUserCompanies(profileData.id),
              ]);

              setUserTenants(tenants);
              setUserCompanies(companies);

              // Auto-select first tenant/company if none selected yet
              const tenantId =
                selectedTenantId ||
                tenants[0]?.id ||
                profileData.tenants?.[0] ||
                null;
              const companyId = selectedCompanyId || companies[0]?.id || null;

              setSelectedTenantId(tenantId);
              setSelectedCompanyId(companyId);

              // Map to legacy User format
              const legacyUser = mapNileUserToLegacyUser(
                profileData,
                companies,
                tenantId,
                companyId
              );
              setUser(legacyUser);

              // Check system health for staff users
              if (profileData.profile?.isPenguinMailsStaff) {
                checkSystemHealthStatus();
              }

              setAuthError(null);
            } catch (error) {
              console.warn("Failed to fetch additional user data:", error);
              // Don't fail initialization for this
            }
          } else {
            // Profile data fetch failed, clear any existing state
            setNileUser(null);
            setUser(null);
            setUserTenants([]);
            setUserCompanies([]);
            setIsStaff(false);
            setAuthError(null);
          }
        } else {
          // User is not authenticated, clear state
          setNileUser(null);
          setUser(null);
          setUserTenants([]);
          setUserCompanies([]);
          setIsStaff(false);
          setAuthError(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (error instanceof AuthenticationError) {
          // Expected for unauthenticated users
          setAuthError(null);
        } else {
          setAuthError(error as Error);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [
    fetchProfile,
    fetchUserTenants,
    fetchUserCompanies,
    testAuthentication,
    checkSystemHealthStatus,
    mapNileUserToLegacyUser,
    selectedTenantId,
    selectedCompanyId,
  ]);

  return (
    <AuthContext.Provider
      value={{
        // Core auth state
        user,
        nileUser,
        loading,
        error: authError,

        // Enhanced state
        userTenants,
        userCompanies,
        isStaff,
        selectedTenantId,
        selectedCompanyId,
        systemHealth,

        // Core auth functions
        login,
        signup,
        logout,
        updateUser,
        refreshUserData,

        // Enhanced functions
        setSelectedTenant,
        setSelectedCompany,
        refreshTenants,
        refreshCompanies,
        refreshProfile,
        clearError,
        checkSystemHealth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): EnhancedAuthContextType => useContext(AuthContext);
