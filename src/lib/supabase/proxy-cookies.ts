import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type RefreshedCookie = { name: string; value: string; options: CookieOptions };

/** Mirrors refreshed Supabase cookies into the forwarded request and browser response. */
export function applySupabaseCookieUpdates(
  request: NextRequest,
  cookiesToSet: readonly RefreshedCookie[],
  headers: Readonly<Record<string, string>> = {}
): NextResponse {
  for (const { name, value } of cookiesToSet) request.cookies.set(name, value);

  const response = NextResponse.next({ request });
  for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
  for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
  return response;
}
