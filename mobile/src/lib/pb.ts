import AsyncStorage from "@react-native-async-storage/async-storage";
import RNEventSource from "react-native-sse";
import PocketBase, { BaseAuthStore } from "pocketbase";

// PocketBase realtime uses the browser EventSource — polyfill for RN.
const g = globalThis as any;
if (!g.EventSource) {
  g.EventSource = RNEventSource;
}

const PB_URL =
  process.env.EXPO_PUBLIC_PB_URL || "https://mazad-api.alfrusiyaar.com";

/** Auth store persisted with AsyncStorage (PocketBase React Native recipe). */
class AsyncAuthStore extends BaseAuthStore {
  private loaded = false;

  async load() {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const raw = await AsyncStorage.getItem("pb_auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        super.save(parsed.token || "", parsed.record || null);
      }
    } catch {
      // corrupted storage — start clean
    }
  }

  save(token: string, record: any) {
    super.save(token, record);
    AsyncStorage.setItem("pb_auth", JSON.stringify({ token, record })).catch(
      () => {},
    );
  }

  clear() {
    super.clear();
    AsyncStorage.removeItem("pb_auth").catch(() => {});
  }
}

export const authStore = new AsyncAuthStore();

export const pb = new PocketBase(PB_URL, authStore);
pb.autoCancellation(false);

export const pbUrl = PB_URL;

/** Public URL for a PB file attachment. */
export function fileUrl(
  record: { id: string; collectionId: string },
  filename: string,
  thumb?: string,
): string {
  const q = thumb ? `?thumb=${thumb}` : "";
  return `${PB_URL}/api/files/${record.collectionId}/${record.id}/${encodeURIComponent(filename)}${q}`;
}
