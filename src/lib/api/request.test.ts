import { describe, expect, it, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { readAuthPayload, requireSameOrigin } from "./request";

function postRequest(headers: Record<string, string>, url = "http://localhost:3000/api/auth/signup", body = "{}") {
  return new NextRequest(url, { method: "POST", headers, body });
}

describe("requireSameOrigin", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("accepts a public HTTPS origin forwarded to the internal Next server", () => {
    const request = postRequest({
      origin: "https://3000-preview.e2b.app",
      host: "localhost:3000",
      "x-forwarded-host": "3000-preview.e2b.app",
      "x-forwarded-proto": "https"
    });
    expect(requireSameOrigin(request)).toBeNull();
  });

  it("rejects a mismatched origin even when the proxy host is trusted", async () => {
    const request = postRequest({
      origin: "https://attacker.example",
      host: "localhost:3000",
      "x-forwarded-host": "3000-preview.e2b.app",
      "x-forwarded-proto": "https"
    });
    const response = requireSameOrigin(request);
    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toMatchObject({ error: "Cross-origin request rejected." });
  });

  it("uses an explicitly configured canonical origin when provided", () => {
    vi.stubEnv("FITAI_APP_ORIGIN", "https://fitai.example");
    const request = postRequest({ origin: "https://fitai.example", host: "internal:3000" });
    expect(requireSameOrigin(request)).toBeNull();
  });
});

describe("readAuthPayload", () => {
  it("parses bounded JSON auth requests", async () => {
    const request = postRequest({ "content-type": "application/json" }, undefined, '{"email":"user@example.com"}');
    await expect(readAuthPayload(request)).resolves.toEqual({
      ok: true,
      value: { email: "user@example.com" },
      format: "json"
    });
  });

  it("parses URL-encoded auth form submissions", async () => {
    const request = postRequest(
      { "content-type": "application/x-www-form-urlencoded" },
      "http://localhost:3000/api/auth/login",
      "email=user%40example.com&password=long%2Bpassword"
    );
    await expect(readAuthPayload(request)).resolves.toEqual({
      ok: true,
      value: { email: "user@example.com", password: "long+password" },
      format: "form"
    });
  });

  it("rejects ambiguous duplicate URL-encoded fields", async () => {
    const request = postRequest(
      { "content-type": "application/x-www-form-urlencoded" },
      "http://localhost:3000/api/auth/login",
      "email=first%40example.com&email=second%40example.com&password=long-password"
    );
    await expect(readAuthPayload(request)).resolves.toEqual({ ok: false, reason: "invalid" });
  });

  it("enforces the streaming size cap for URL-encoded forms", async () => {
    const request = postRequest(
      { "content-type": "application/x-www-form-urlencoded" },
      "http://localhost:3000/api/auth/login",
      `email=${"a".repeat(8_200)}`
    );
    await expect(readAuthPayload(request)).resolves.toEqual({ ok: false, reason: "too-large" });
  });
});
