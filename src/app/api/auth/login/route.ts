import { NextRequest } from "next/server";
import { z } from "zod";
import { authSubmissionResponse } from "@/lib/api/auth-response";
import { jsonReadError, readAuthPayload, requireSameOrigin } from "@/lib/api/request";
import { createSupabaseServerClient, isSupabaseConfigurationError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.email().trim().max(254),
  password: z.string().min(1).max(128)
}).strict();

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const body = await readAuthPayload(request);
  if (!body.ok) return jsonReadError(body, "Content-Type must be application/json or application/x-www-form-urlencoded.");
  const parsed = loginSchema.safeParse(body.value);
  if (!parsed.success) {
    return authSubmissionResponse(body.format, { error: "Enter a valid email address and password." }, 422, "/login?status=invalid");
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password
    });

    if (error) {
      return authSubmissionResponse(body.format, { error: "Email or password is incorrect." }, 401, "/login?status=credentials");
    }
    return authSubmissionResponse(body.format, { ok: true }, 200, "/dashboard");
  } catch (error) {
    if (isSupabaseConfigurationError(error)) {
      return authSubmissionResponse(
        body.format,
        { error: "Authentication is not configured on this environment. Add the Supabase URL and anon key, then restart the app." },
        503,
        "/login?status=setup"
      );
    }
    console.error("FITAI login service unavailable");
    return authSubmissionResponse(
      body.format,
      { error: "Authentication is temporarily unavailable. Please try again later." },
      503,
      "/login?status=unavailable"
    );
  }
}
