import "server-only";

import { normalizeFdcSearchResponse, type FoodSearchResult } from "./normalize";

const FDC_API_BASE = "https://api.nal.usda.gov/fdc/v1";
const REQUEST_TIMEOUT_MS = 8_000;

export class FdcConfigurationError extends Error {
  constructor() {
    super("USDA FoodData Central is not configured.");
    this.name = "FdcConfigurationError";
  }
}

export class FdcProviderError extends Error {
  readonly status: number;
  readonly code: "rate-limited" | "timeout" | "upstream" | "invalid-response";

  constructor(code: FdcProviderError["code"], status: number, message: string) {
    super(message);
    this.name = "FdcProviderError";
    this.code = code;
    this.status = status;
  }
}

export async function searchUsdaFoods(query: string, pageSize = 15): Promise<FoodSearchResult[]> {
  const apiKey = process.env.USDA_FDC_API_KEY?.trim();
  if (!apiKey) throw new FdcConfigurationError();

  const url = new URL(`${FDC_API_BASE}/foods/search`);
  url.searchParams.set("api_key", apiKey);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, pageSize }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new FdcProviderError("timeout", 504, "USDA FoodData Central did not respond in time.");
    }
    throw new FdcProviderError("upstream", 502, "Could not contact USDA FoodData Central.");
  }

  if (response.status === 429) {
    throw new FdcProviderError("rate-limited", 429, "USDA FoodData Central rate limit reached.");
  }
  if (!response.ok) {
    throw new FdcProviderError("upstream", 502, "USDA FoodData Central returned an error.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new FdcProviderError("invalid-response", 502, "USDA FoodData Central returned invalid data.");
  }

  try {
    return normalizeFdcSearchResponse(payload).slice(0, pageSize);
  } catch {
    throw new FdcProviderError("invalid-response", 502, "USDA FoodData Central returned an unrecognized search response.");
  }
}
