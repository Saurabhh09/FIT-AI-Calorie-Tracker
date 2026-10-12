import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jsonReadError, requireSameOrigin, readJson } from "@/lib/api/request";
import { createSupabaseServerClient, isSupabaseConfigurationError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const onboardingSchema = z.object({
  ageBand: z.enum(["under_13", "13_17", "18_29", "30_49", "50_69", "70_plus", "prefer_not_to_say"]),
  goal: z.enum(["lose_weight", "maintain", "gain_weight", "improve_energy", "habit_consistency", "sports_performance"]),
  sexForReference: z.enum(["female", "male", "unspecified"]).nullable(),
  countryCode: z.string().regex(/^[A-Z]{2}$/).nullable(),
  displayName: z.string().trim().max(80).nullable()
}).strict();

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const body = await readJson(request);
  if (!body.ok) return jsonReadError(body);
  const parsed = onboardingSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: "Select a goal and age range, then review your answers." }, { status: 422 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Sign in to save onboarding." }, { status: 401 });

    const { error } = await supabase.rpc("complete_onboarding", {
      p_age_band: parsed.data.ageBand,
      p_goal: parsed.data.goal,
      p_sex_for_reference: parsed.data.sexForReference,
      p_country_code: parsed.data.countryCode,
      p_display_name: parsed.data.displayName
    });

    if (error) {
      if (error.code === "23514") {
        return NextResponse.json({ error: "That goal is not available for this age range. Choose a non-weight-loss goal to continue." }, { status: 422 });
      }
      if (error.code === "PGRST202" || error.code === "42883") {
        return NextResponse.json({ error: "The database migration is not installed yet. No onboarding data was saved." }, { status: 503 });
      }
      console.error("FITAI onboarding persistence failed", error.code ?? "unknown");
      return NextResponse.json({ error: "Onboarding could not be saved. Please try again later." }, { status: 503 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isSupabaseConfigurationError(error)) {
      return NextResponse.json({ error: "Authentication is not configured on this environment." }, { status: 503 });
    }
    console.error("FITAI onboarding service unavailable");
    return NextResponse.json({ error: "Onboarding could not be saved. Please try again later." }, { status: 503 });
  }
}
