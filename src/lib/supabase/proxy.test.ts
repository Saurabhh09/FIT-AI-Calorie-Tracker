import { afterEach, describe, expect, it, vi } from "vitest";
import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { refreshSupabaseSession } from "./proxy";

vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));

const mockedCreateServerClient = vi.mocked(createServerClient);

describe("refreshSupabaseSession", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("refreshes the session and forwards rotated cookies plus cache-control headers", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key");

    mockedCreateServerClient.mockImplementation((_url, _key, options) => ({
      auth: {
        getUser: async () => {
          options.cookies.setAll?.(
            [{ name: "sb-access-token", value: "rotated-token", options: { httpOnly: true, path: "/" } }],
            { "Cache-Control": "private, no-cache, no-store, max-age=0" }
          );
          return { data: { user: null }, error: null };
        }
      }
    }) as unknown as ReturnType<typeof createServerClient>);

    const request = new NextRequest("https://fitai.example/dashboard", {
      headers: { cookie: "sb-access-token=expired-token" }
    });
    const response = await refreshSupabaseSession(request);

    expect(mockedCreateServerClient).toHaveBeenCalledOnce();
    expect(request.cookies.get("sb-access-token")?.value).toBe("rotated-token");
    expect(response.cookies.get("sb-access-token")?.value).toBe("rotated-token");
    expect(response.headers.get("Cache-Control")).toBe("private, no-cache, no-store, max-age=0");
  });
});
