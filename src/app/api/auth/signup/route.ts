import { NextRequest } from "next/server";
import { z } from "zod";
import { authSubmissionResponse } from "@/lib/api/auth-response";
import { jsonReadError, readAuthPayload, requireSameOrigin } from "@/lib/api/request";
import { createSupabaseServerClient, isSupabaseConfigurationError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const signupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email().trim().max(254),
  password: z.string().min(12).max(128)
}).strict();

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const body = await readAuthPayload(request);
  if (!body.ok) return jsonReadError(body, "Content-Type must be application/json or application/x-www-form-urlencoded.");
  const parsed = signupSchema.safeParse(body.value);
  if (!parsed.success) {
    return authSubmissionResponse(
      body.format,
      { error: "Enter a valid name, email address, and password of at least 12 characters." },
      422,
      "/signup?status=invalid"
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      options: { data: { display_name: parsed.data.name } }
    });

    if (error) {
      return authSubmissionResponse(
        body.format,
        { error: "We couldn't create the account. Check the details and try again." },
        400,
        "/signup?status=unavailable"
      );
    }

    if (!data.session) {
      return authSubmissionResponse(
        body.format,
        {
          ok: true,
          requiresEmailConfirmation: true,
          message: "If the address can be registered, a confirmation email will be sent. Follow its link before signing in."
        },
        201,
        "/signup?status=confirmation"
      );
    }

    return authSubmissionResponse(body.format, { ok: true, requiresEmailConfirmation: false }, 201, "/onboarding");
  } catch (error) {
    if (isSupabaseConfigurationError(error)) {
      return authSubmissionResponse(
        body.format,
        { error: "Authentication is not configured on this environment. Add the Supabase URL and anon key, then restart the app." },
        503,
        "/signup?status=setup"
      );
    }
    console.error("FITAI signup service unavailable");
    return authSubmissionResponse(
      body.format,
      { error: "Authentication is temporarily unavailable. Please try again later." },
      503,
      "/signup?status=unavailable"
    );
  }
}
