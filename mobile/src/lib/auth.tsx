import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { pb, authStore } from "./pb";

type AuthState = {
  ready: boolean;
  user: Record<string, any> | null;
  isAuthed: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthState>({
  ready: false,
  user: null,
  isAuthed: false,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<Record<string, any> | null>(
    authStore.record as any,
  );

  useEffect(() => {
    authStore
      .load()
      .then(() => setUser((authStore.record as any) || null))
      .finally(() => setReady(true));
    const unsub = authStore.onChange(() => {
      setUser((authStore.record as any) || null);
    });
    return unsub;
  }, []);

  const value = useMemo(
    () => ({
      ready,
      user,
      isAuthed: !!user,
      isAdmin: user?.role === "admin",
    }),
    [ready, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
