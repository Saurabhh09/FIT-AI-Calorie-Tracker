import { NextResponse } from "next/server";
import type { AuthPayloadFormat } from "./request";

/** JSON clients receive the normal API response; native auth forms use a safe same-origin 303. */
export function authSubmissionResponse(
  format: AuthPayloadFormat,
  body: Record<string, unknown>,
  status: number,
  formLocation: string
): NextResponse {
  let response: NextResponse;
  if (format === "form") {
    // Only route-owned, root-relative destinations are passed here; avoid deriving redirects
    // from untrusted request parameters or exposing the internal proxy origin.
    response = new NextResponse(null, { status: 303, headers: { Location: formLocation } });
  } else {
    response = NextResponse.json(body, { status });
  }
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
