import { NextResponse } from "next/server";
import { hasSupabaseConfiguration } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "fitai",
    dependencies: {
      supabaseAuth: hasSupabaseConfiguration() ? "credentials-present" : "not-configured",
      usdaFoodDataCentral: process.env.USDA_FDC_API_KEY?.trim() ? "key-present" : "not-configured",
      ai: "not-implemented"
    }
  });
}
