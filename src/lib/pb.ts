import PocketBase from "pocketbase";

/**
 * Browser talks to the public PocketBase domain; SSR loaders may use an
 * internal docker-network URL when available (PB_INTERNAL_URL).
 */
const PUBLIC_PB_URL: string =
  import.meta.env.VITE_PB_URL || "https://mazad-api.alfrusiyaar.com";
const SERVER_PB_URL: string =
  process.env.PB_INTERNAL_URL || process.env.VITE_PB_URL || PUBLIC_PB_URL;

export const pbUrl =
  typeof window === "undefined" ? SERVER_PB_URL : PUBLIC_PB_URL;

let singleton: PocketBase | null = null;

export function getPb(): PocketBase {
  if (!singleton) {
    singleton = new PocketBase(pbUrl);
    singleton.autoCancellation(false);
  }
  return singleton;
}

/** Public base URL of a PB file attachment. */
export function fileUrl(
  record: { id: string; collectionId: string },
  filename: string,
  thumb?: string,
): string {
  const base = typeof window === "undefined" ? PUBLIC_PB_URL : pbUrl;
  const q = thumb ? `?thumb=${thumb}` : "";
  return `${base}/api/files/${record.collectionId}/${record.id}/${encodeURIComponent(filename)}${q}`;
}

/** Expand helper: PB expands come through as nested records. */
export function expand<T = Record<string, any>>(
  record: { expand?: Record<string, any> },
  key: string,
): T | undefined {
  return record.expand?.[key] as T | undefined;
}
