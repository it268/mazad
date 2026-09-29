import { useSyncExternalStore } from "react";
import type { AuthRecord } from "pocketbase";
import { getPb } from "./pb";

const subscribe = (cb: () => void) => {
  const pb = getPb();
  return pb.authStore.onChange(cb);
};

/**
 * Auth state from the PocketBase local auth store.
 * SSR sees null (client hydrates the real state after mount).
 */
export function useAuth(): {
  user: AuthRecord | null;
  isAuthed: boolean;
  isAdmin: boolean;
} {
  const getSnapshot = () => getPb().authStore.record;
  const record = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => null as AuthRecord,
  );
  return {
    user: record,
    isAuthed: !!record,
    isAdmin: (record as { role?: string } | null)?.role === "admin",
  };
}
