"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildAuthPayload, type AuthMode } from "./auth-payload";

type AuthResponse = {
  error?: string;
  message?: string;
  requiresEmailConfirmation?: boolean;
};

export function AuthForm({ authConfigured, initialMode, initialError = "", initialSuccess = "" }: {
  authConfigured: boolean;
  initialMode: AuthMode;
  initialError?: string;
  initialSuccess?: string;
}) {
  const router = useRouter();
  const mode = initialMode;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState(initialSuccess);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setSuccess("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = buildAuthPayload(mode, form);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin"
      });
      const data = (await response.json().catch(() => ({}))) as AuthResponse;
      if (!response.ok) {
        setError(data.error || "We couldn't complete that request. Please try again.");
        return;
      }

      if (mode === "signup" && data.requiresEmailConfirmation) {
        setSuccess(data.message || "Check your email for a confirmation link before signing in.");
        formElement.reset();
        return;
      }

      if (mode === "signup") {
        router.replace("/onboarding");
        router.refresh();
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("The service couldn't be reached. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <>
      {!authConfigured && (
        <div className="setup-notice" role="note">
          Secure account services are not configured in this environment. Sign-in and signup will remain unavailable until Supabase is set up.
        </div>
      )}
      <nav className="auth-switch" aria-label="Account access">
        <Link href="/login" aria-current={!isSignup ? "page" : undefined} className={!isSignup ? "active" : ""}>Log in</Link>
        <Link href="/signup" aria-current={isSignup ? "page" : undefined} className={isSignup ? "active" : ""}>Sign up</Link>
      </nav>

      <div className="auth-form-heading">
        <p className="eyebrow">WELCOME TO FITAI</p>
        <h2>{isSignup ? "Build a plan around you." : "Good to see you again."}</h2>
        <p>{isSignup ? "Create your secure account, then answer a few quick questions. No typing through the plan." : "Log in to continue with your nutrition routine."}</p>
      </div>

      <form className="auth-form" method="post" action={`/api/auth/${mode}`} onSubmit={handleSubmit}>
        {isSignup && (
          <div className="field">
            <label className="field-label" htmlFor="signup-name">Your name</label>
            <input className="text-input" id="signup-name" name="name" type="text" placeholder="First name" autoComplete="given-name" maxLength={80} required />
          </div>
        )}
        <div className="field">
          <label className="field-label" htmlFor="auth-email">Email address</label>
          <input className="text-input" id="auth-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" maxLength={254} required />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="auth-password">Password</label>
          <input className="text-input" id="auth-password" name="password" type="password" placeholder={isSignup ? "At least 12 characters" : "Your password"} minLength={isSignup ? 12 : 1} autoComplete={isSignup ? "new-password" : "current-password"} maxLength={128} required />
        </div>
        <p className="auth-error" role="alert" aria-live="polite">{error}</p>
        <p className="auth-success" role="status" aria-live="polite">{success}</p>
        <button className="btn full-width" type="submit" disabled={busy}>
          {busy ? "Please wait…" : isSignup ? "Create my account" : "Log in"}
          {!busy && <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </button>
      </form>

      <p className="form-note">When configured, accounts use managed authentication. This app does not simulate sign-in or save passwords and nutrition data in local storage.</p>
    </>
  );
}
