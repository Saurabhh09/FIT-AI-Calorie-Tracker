import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";
import type { AuthMode } from "@/features/auth/auth-payload";

function Brand() {
  return (
    <Link className="brand" href="/" aria-label="FITAI home">
      <span className="brand-mark" aria-hidden="true">
        <svg className="icon" viewBox="0 0 24 24" fill="none">
          <path d="M5 15.5c5.7 0 9.7-3.2 13.5-10C19.8 14.7 15.3 20 8.5 20 6.6 20 5 18.4 5 16.5v-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 20c2.6-4 5.5-6.6 9.5-8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </span>
      <span>FITAI</span>
    </Link>
  );
}

function BrandStory() {
  return (
    <aside className="auth-visual">
      <div><Brand /></div>
      <div className="visual-copy">
        <p className="eyebrow">PERSONAL NUTRITION, MADE SIMPLE</p>
        <h1>Make your next meal <em>your best one.</em></h1>
        <p>A calmer way to understand what you eat. Start with your goals, build a practical routine, and track meals without losing sight of real life.</p>
        <div className="auth-visual-note" aria-label="FITAI approach">
          <strong>Clear guidance, grounded in real food data.</strong>
          <p>Your numbers should come from verified nutrition records and transparent calculations—not guesses. Missing information stays visible.</p>
          <div className="note-points"><span>Evidence-aware</span><span>Flexible</span><span>Built around you</span></div>
        </div>
      </div>
      <div className="auth-visual-footer">Thoughtful nutrition tracking, without the all-or-nothing.</div>
    </aside>
  );
}

function statusMessages(mode: AuthMode, status?: string): { error?: string; success?: string } {
  if (mode === "signup") {
    if (status === "confirmation") {
      return { success: "If the address can be registered, a confirmation email will be sent. Follow its link before signing in." };
    }
    if (status === "invalid") return { error: "Enter a valid name, email address, and password of at least 12 characters." };
    if (status === "setup") return { error: "Authentication is not configured on this environment. Please try again after setup." };
    if (status === "unavailable") return { error: "We couldn't create the account. Check the details and try again." };
    return {};
  }

  if (status === "invalid") return { error: "Enter a valid email address and password." };
  if (status === "credentials") return { error: "Email or password is incorrect." };
  if (status === "setup") return { error: "Authentication is not configured on this environment. Please try again after setup." };
  if (status === "unavailable") return { error: "Authentication is temporarily unavailable. Please try again later." };
  return {};
}

export function AuthPage({ mode, authConfigured, status }: { mode: AuthMode; authConfigured: boolean; status?: string }) {
  const messages = statusMessages(mode, status);
  return (
    <div className="auth-layout">
      <BrandStory />
      <main className="auth-main">
        <div className="auth-main-inner">
          <div className="auth-mobile-brand"><Brand /></div>
          <AuthForm key={mode} authConfigured={authConfigured} initialMode={mode} initialError={messages.error} initialSuccess={messages.success} />
        </div>
      </main>
    </div>
  );
}
