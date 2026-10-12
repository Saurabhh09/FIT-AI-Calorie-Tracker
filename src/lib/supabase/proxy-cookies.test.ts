import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { applySupabaseCookieUpdates } from "./proxy-cookies";

describe("Supabase Proxy cookie propagation", () => {
  it("updates forwarded request cookies and returns refreshed cookies and cache headers", () => {
    const request = new NextRequest("https://fitai.example/dashboard", {
      headers: { cookie: "sb-access-token=old-token" }
    });

    const response = applySupabaseCookieUpdates(
      request,
      [{ name: "sb-access-token", value: "new-token", options: { httpOnly: true, secure: true, sameSite: "lax", path: "/" } }],
      { "Cache-Control": "private, no-cache, no-store, max-age=0", Pragma: "no-cache" }
    );

    expect(request.cookies.get("sb-access-token")?.value).toBe("new-token");
    expect(response.cookies.get("sb-access-token")?.value).toBe("new-token");
    expect(response.cookies.get("sb-access-token")?.httpOnly).toBe(true);
    expect(response.headers.get("Cache-Control")).toBe("private, no-cache, no-store, max-age=0");
    expect(response.headers.get("Pragma")).toBe("no-cache");
  });
});
