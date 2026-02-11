import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, ApiClient } from "@/integrations/api/client";

type AppRole = "admin" | "staff" | "driver";

interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  isActive: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  userRole: AppRole | null;
  isStaff: boolean;
  isDriver: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  useEffect(() => {
    // Check if user is already logged in (via cookies set by server)
    const storedUser = localStorage.getItem("currentUser");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AppUser;
        setUser(parsedUser);
        const role = parsedUser.role || "driver";
        setUserRole(role as AppRole);
      } catch (error) {
        localStorage.removeItem("currentUser");
      }
    }

    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.signIn(email, password);
      setUser(response.user);
      const role = response.user?.role || "driver"; // Default to driver if role is missing
      setUserRole(role as AppRole);
      localStorage.setItem("currentUser", JSON.stringify(response.user));
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await authApi.signUp(email, password, fullName);
      setUser(response.user);
      const role = response.user?.role || "driver"; // Default to driver if role is missing
      setUserRole(role as AppRole);
      localStorage.setItem("currentUser", JSON.stringify(response.user));
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await authApi.signOut();
    } catch (error) {
      // Silent fail
    } finally {
      setUser(null);
      setUserRole(null);
      localStorage.removeItem("currentUser");
      // HTTP-only cookies are cleared by backend
    }
  };

  const isStaff = userRole === "admin" || userRole === "staff";
  const isDriver = userRole === "driver";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        userRole,
        isStaff,
        isDriver,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
