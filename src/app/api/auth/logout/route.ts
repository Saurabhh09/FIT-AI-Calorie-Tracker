import { NextRequest, NextResponse } from "next/server";
import { requireSameOrigin } from "@/lib/api/request";
import { createSupabaseServerClient, isSupabaseConfigurationError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) return NextResponse.json({ error: "Could not sign out. Please retry." }, { status: 503 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isSupabaseConfigurationError(error)) {
      return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
    }
    console.error("FITAI logout service unavailable");
    return NextResponse.json({ error: "Could not sign out. Please retry." }, { status: 503 });
  }
}
