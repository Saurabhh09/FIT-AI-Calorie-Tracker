export type AuthMode = "login" | "signup";

export function buildAuthPayload(mode: AuthMode, form: FormData): Record<string, string> {
  const payload: Record<string, string> = {
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? "")
  };
  if (mode === "signup") payload.name = String(form.get("name") ?? "").trim();
  return payload;
}
