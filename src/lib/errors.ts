import { ClientResponseError } from "pocketbase";

const arErrors: Record<string, string> = {
  "Failed to authenticate.": "رقم الجوال أو كلمة المرور غير صحيحة.",
};

/** Translate common PocketBase errors to Arabic. */
export function arError(e: unknown, fallback: string): string {
  if (e instanceof ClientResponseError) {
    if (arErrors[e.message]) return arErrors[e.message];
    const data: any = e.response?.data;
    if (data && typeof data === "object") {
      const first = Object.values(data)[0] as any;
      if (first?.message) return first.message;
    }
    return e.message || fallback;
  }
  return fallback;
}
