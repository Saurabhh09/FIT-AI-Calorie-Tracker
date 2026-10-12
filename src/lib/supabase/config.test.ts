import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabasePublicConfig, hasSupabasePublicConfig } from "./config";

describe("Supabase public configuration validation", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("accepts a configured HTTPS project URL and non-empty public key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", " https://project.supabase.co ");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", " public-anon-key ");
    expect(getSupabasePublicConfig()).toEqual({ url: "https://project.supabase.co", anonKey: "public-anon-key" });
    expect(hasSupabasePublicConfig()).toBe(true);
  });

  it("allows HTTP for local development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "local-anon-key");
    expect(hasSupabasePublicConfig()).toBe(true);
  });

  it("requires HTTPS in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "local-anon-key");
    expect(hasSupabasePublicConfig()).toBe(false);
  });

  it.each(["ftp://project.supabase.co", "not-a-url", "https://user:pass@project.supabase.co", "https://project.supabase.co?key=x"]) (
    "rejects invalid or non-HTTP Supabase URL %s",
    (url) => {
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key");
      expect(getSupabasePublicConfig()).toBeNull();
      expect(hasSupabasePublicConfig()).toBe(false);
    }
  );
});
