import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

function request(body: string, contentType = "application/json") {
  return new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      host: "localhost:3000",
      "content-type": contentType
    },
    body
  });
}

describe("POST /api/auth/login", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("passes the strict login schema with only email and password", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const response = await POST(request(JSON.stringify({ email: "audit@example.invalid", password: "audit-only-password" })));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("not configured") });
  });

  it("continues rejecting unexpected fields in strict JSON login requests", async () => {
    const response = await POST(request(JSON.stringify({ name: "", email: "audit@example.invalid", password: "audit-only-password" })));
    expect(response.status).toBe(422);
  });

  it("redirects native URL-encoded forms back to login with a safe setup status", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const response = await POST(request("email=audit%40example.invalid&password=audit-only-password", "application/x-www-form-urlencoded"));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/login?status=setup");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
});
