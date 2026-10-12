import "server-only";

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig, supabaseCookieOptions } from "./config";
import { applySupabaseCookieUpdates } from "./proxy-cookies";

/** Refreshes expiring sessions before protected pages render; page-level getUser remains authoritative. */
export async function refreshSupabaseSession(request: NextRequest): Promise<NextResponse> {
  const config = getSupabasePublicConfig();
  if (!config) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        response = applySupabaseCookieUpdates(request, cookiesToSet, headers);
      }
    },
    cookieOptions: supabaseCookieOptions()
  });

  // getUser validates the token with Supabase and triggers cookie rotation when needed.
  // Authorization is still checked in each protected page/API; Proxy is session maintenance only.
  await supabase.auth.getUser();
  return response;
}
