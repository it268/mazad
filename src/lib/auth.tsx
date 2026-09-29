import { useSyncExternalStore } from "react";
import type { AuthRecord } from "pocketbase";
import { getPb } from "./pb";

const subscribe = (cb: () => void) => {
  const pb = getPb();
  return pb.authStore.onChange(cb);
};

// LocalAuthStore.record re-parses localStorage on every access (new object
// identity each time), so cache the snapshot and only refresh it when the
// serialized auth state actually changes — otherwise useSyncExternalStore
// loops forever ("Maximum update depth exceeded") for logged-in users.
let cachedRecord: AuthRecord | null = null;
let cachedRaw = "";

const getSnapshot = (): AuthRecord | null => {
  const pb = getPb();
  const record = pb.authStore.record;
  const raw = JSON.stringify([pb.authStore.token, record]);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedRecord = record;
  }
  return cachedRecord;
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
