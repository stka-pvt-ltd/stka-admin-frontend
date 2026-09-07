import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { adminAuthApi } from "@/services/admin-api";
import { getAdminToken, setAdminToken, removeAdminToken } from "@/lib/api-client";
import type { UserResponse, LoginRequest } from "@/types/api";

const USER_KEY = "stka_admin_user";

interface AdminAuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<UserResponse>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = getAdminToken();
      const storedUserJson = localStorage.getItem(USER_KEY);
      if (storedToken && storedUserJson) {
        const parsedUser = JSON.parse(storedUserJson) as UserResponse;
        setToken(storedToken);
        setUser(parsedUser);
      }
    } catch {
      removeAdminToken();
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginRequest): Promise<UserResponse> => {
    const response = await adminAuthApi.login(credentials);
    if (response.jwtToken) {
      setAdminToken(response.jwtToken);
      setToken(response.jwtToken);
    }
    setUser(response);
    localStorage.setItem(USER_KEY, JSON.stringify(response));
    return response;
  };

  const logout = useCallback(() => {
    removeAdminToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  }, []);

  // Immediately clear auth state when the API client detects a genuine 401.
  // Without this listener, removeAdminToken() only clears localStorage but leaves
  // React state (token/user) set, so isAuthenticated stays true until the next
  // browser reload — causing an unexpected redirect on the next navigation.
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener("stka:auth:expired", handleAuthExpired);
    return () => {
      window.removeEventListener("stka:auth:expired", handleAuthExpired);
    };
  }, [logout]);

  const isAuthenticated = Boolean(user || token);
  const isAdmin = Boolean(
    user?.roles?.some((role) => role === "ROLE_ADMIN" || role === "ADMIN")
  );

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
