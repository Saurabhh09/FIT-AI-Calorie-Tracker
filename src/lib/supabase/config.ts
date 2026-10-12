export type SupabasePublicConfig = Readonly<{
  url: string;
  anonKey: string;
}>;

/** Shared validation for server clients and Next Proxy; the public anon key is not a secret. */
export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;

  try {
    const parsed = new URL(url);
    if (
      (parsed.protocol !== "https:" && parsed.protocol !== "http:") ||
      (parsed.protocol === "http:" && process.env.NODE_ENV === "production") ||
      parsed.username || parsed.password || parsed.search || parsed.hash
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return { url, anonKey };
}

export function hasSupabasePublicConfig(): boolean {
  return getSupabasePublicConfig() !== null;
}

export function supabaseCookieOptions() {
  return {
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true
  };
}
