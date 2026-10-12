import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

function request(body: string, contentType = "application/json") {
  return new NextRequest("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      host: "localhost:3000",
      "content-type": contentType
    },
    body
  });
}

describe("POST /api/auth/signup", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("redirects a valid native signup form to a safe setup status when credentials are absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const response = await POST(request(
      "name=Asha&email=asha%40example.invalid&password=long-test-password",
      "application/x-www-form-urlencoded"
    ));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/signup?status=setup");
  });

  it("keeps JSON signup as a JSON API response", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const response = await POST(request(JSON.stringify({
      name: "Asha",
      email: "asha@example.invalid",
      password: "long-test-password"
    })));
    expect(response.status).toBe(503);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("not configured") });
  });
});
