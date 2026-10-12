import { NextRequest, NextResponse } from "next/server";

const MAX_JSON_BODY_BYTES = 8_192;

type JsonReadFailure = { ok: false; reason: "invalid" | "too-large" | "unsupported" };
type JsonReadResult = { ok: true; value: unknown } | JsonReadFailure;
export type AuthPayloadFormat = "json" | "form";
export type AuthPayloadReadResult =
  | { ok: true; value: unknown; format: AuthPayloadFormat }
  | JsonReadFailure;

type TextReadResult = { ok: true; text: string } | JsonReadFailure;

function firstHeaderValue(value: string | null): string | null {
  const first = value?.split(",", 1)[0]?.trim();
  return first || null;
}

function expectedRequestOrigin(request: NextRequest): string | null {
  const configuredOrigin = process.env.FITAI_APP_ORIGIN?.trim();
  if (configuredOrigin) {
    try {
      const url = new URL(configuredOrigin);
      if ((url.protocol !== "https:" && url.protocol !== "http:") || url.pathname !== "/" || url.search || url.hash) return null;
      return url.origin;
    } catch {
      return null;
    }
  }

  // The preview/production reverse proxy may expose HTTPS while Next receives an
  // internal URL. Prefer proxy forwarding headers, then fall back to the host/url.
  const host = firstHeaderValue(request.headers.get("x-forwarded-host"))
    ?? firstHeaderValue(request.headers.get("host"));
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  const fallbackProtocol = new URL(request.url).protocol.slice(0, -1);
  const protocol = forwardedProto ?? fallbackProtocol;

  if (!host || (protocol !== "https" && protocol !== "http")) return null;
  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return null;
  }
}

export function requireSameOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  try {
    const parsedOrigin = new URL(origin);
    if (
      (parsedOrigin.protocol !== "https:" && parsedOrigin.protocol !== "http:") ||
      parsedOrigin.username || parsedOrigin.password ||
      parsedOrigin.pathname !== "/" || parsedOrigin.search || parsedOrigin.hash
    ) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const expectedOrigin = expectedRequestOrigin(request);
    if (!expectedOrigin || parsedOrigin.origin !== expectedOrigin) {
      return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  return null;
}

async function readBoundedText(request: NextRequest): Promise<TextReadResult> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_JSON_BODY_BYTES) {
    return { ok: false, reason: "too-large" };
  }

  if (!request.body) return { ok: false, reason: "invalid" };
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let byteLength = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > MAX_JSON_BODY_BYTES) {
        try { await reader.cancel(); } catch { /* the size limit still applies */ }
        return { ok: false, reason: "too-large" };
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return { ok: true, text };
  } catch {
    return { ok: false, reason: "invalid" };
  } finally {
    reader.releaseLock();
  }
}

/** Reads small JSON API bodies with a streaming byte cap, not an unbounded request.text(). */
export async function readJson(request: NextRequest): Promise<JsonReadResult> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") return { ok: false, reason: "unsupported" };

  const body = await readBoundedText(request);
  if (!body.ok) return body;
  try {
    return { ok: true, value: JSON.parse(body.text) as unknown };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

/** Reads bounded JSON or URL-encoded auth forms. Duplicate fields are rejected as ambiguous. */
export async function readAuthPayload(request: NextRequest): Promise<AuthPayloadReadResult> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType === "application/json") {
    const body = await readJson(request);
    return body.ok ? { ...body, format: "json" } : body;
  }
  if (contentType !== "application/x-www-form-urlencoded") return { ok: false, reason: "unsupported" };

  const body = await readBoundedText(request);
  if (!body.ok) return body;
  const params = new URLSearchParams(body.text);
  const entries = [...params.entries()];
  const keys = new Set<string>();
  for (const [key] of entries) {
    if (keys.has(key)) return { ok: false, reason: "invalid" };
    keys.add(key);
  }
  return { ok: true, value: Object.fromEntries(entries), format: "form" };
}

export function jsonReadError(
  result: JsonReadFailure,
  unsupportedTypeMessage = "Content-Type must be application/json."
): NextResponse {
  if (result.reason === "too-large") {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }
  if (result.reason === "unsupported") {
    return NextResponse.json({ error: unsupportedTypeMessage }, { status: 415 });
  }
  return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
}
