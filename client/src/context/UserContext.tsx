import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiFetch } from "../api/client";

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface UserContextValue {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, displayName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const STORAGE_KEY = "crickmind_user";

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.email === "string" &&
      typeof parsed.displayName === "string"
    ) {
      return { id: parsed.id, email: parsed.email, displayName: parsed.displayName };
    }
    return null;
  } catch {
    return null;
  }
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = readStoredUser();
    if (stored) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  async function login(email: string, displayName: string): Promise<void> {
    const result = await apiFetch<{ id: string; email: string; displayName: string; isNew: boolean }>(
      "/users",
      {
        method: "POST",
        body: JSON.stringify({ email, displayName }),
      }
    );
    const newUser: User = { id: result.id, email: result.email, displayName: result.displayName };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }

  function logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  const value: UserContextValue = {
    user,
    isLoggedIn: user !== null,
    login,
    logout,
    loading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}
