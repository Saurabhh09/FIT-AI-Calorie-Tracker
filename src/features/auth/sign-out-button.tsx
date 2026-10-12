"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        setError(data.error || "Could not sign out. Please retry.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("The service couldn't be reached. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="btn btn-light btn-small" type="button" onClick={signOut} disabled={busy}>
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
