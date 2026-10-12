import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSameOrigin } from "@/lib/api/request";
import { createSupabaseServerClient, isSupabaseConfigurationError } from "@/lib/supabase/server";
import { FdcConfigurationError, FdcProviderError, searchUsdaFoods } from "@/services/food-data/usda-fdc";

export const dynamic = "force-dynamic";

const querySchema = z.string().trim().min(2).max(120);
const pageSizeSchema = z.coerce.number().int().min(1).max(25);

export async function GET(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const queryResult = querySchema.safeParse(request.nextUrl.searchParams.get("q"));
  const pageSizeResult = pageSizeSchema.safeParse(request.nextUrl.searchParams.get("limit") ?? "15");
  if (!queryResult.success || !pageSizeResult.success) {
    return NextResponse.json({ error: "Search text must be 2–120 characters; limit must be 1–25." }, { status: 422 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Sign in to search foods." }, { status: 401 });
  } catch (error) {
    if (isSupabaseConfigurationError(error)) {
      return NextResponse.json({ error: "Authentication is not configured on this environment." }, { status: 503 });
    }
    return NextResponse.json({ error: "Could not verify the session." }, { status: 503 });
  }

  try {
    const foods = await searchUsdaFoods(queryResult.data, pageSizeResult.data);
    return NextResponse.json({ source: "USDA FoodData Central", foods });
  } catch (error) {
    if (error instanceof FdcConfigurationError) {
      return NextResponse.json({ error: "USDA FoodData Central is not configured on this server." }, { status: 503 });
    }
    if (error instanceof FdcProviderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("FITAI food search failed");
    return NextResponse.json({ error: "Food search is temporarily unavailable." }, { status: 502 });
  }
}
