import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig, hasSupabasePublicConfig, supabaseCookieOptions } from "./config";

export class SupabaseConfigurationError extends Error {
  readonly code = "SUPABASE_NOT_CONFIGURED";

  constructor() {
    super("Supabase Auth is not configured for this environment.");
    this.name = "SupabaseConfigurationError";
  }
}

export function isSupabaseConfigurationError(error: unknown): error is SupabaseConfigurationError {
  return error instanceof SupabaseConfigurationError;
}

export function hasSupabaseConfiguration(): boolean {
  return hasSupabasePublicConfig();
}

export async function createSupabaseServerClient() {
  const config = getSupabasePublicConfig();
  if (!config) throw new SupabaseConfigurationError();
  const cookieStore = await cookies();

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies. The Next Proxy refreshes sessions
          // before protected pages render; route handlers/actions can write their own.
        }
      }
    },
    cookieOptions: supabaseCookieOptions()
  });
}

export async function createSupabaseServerClientIfConfigured() {
  try {
    return await createSupabaseServerClient();
  } catch (error) {
    if (isSupabaseConfigurationError(error)) return null;
    throw error;
  }
}
