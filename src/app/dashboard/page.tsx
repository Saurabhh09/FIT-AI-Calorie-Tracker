import { redirect } from "next/navigation";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { createSupabaseServerClientIfConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClientIfConfigured();
  if (!supabase) {
    return (
      <main className="workspace-shell">
        <section className="workspace-card">
          <span className="workspace-status">Setup required</span>
          <h1>Secure sign-in is not configured yet.</h1>
          <p>Add the Supabase project URL and anon key to the server environment, then restart the application. FITAI will not create a local or simulated session.</p>
          <a className="btn btn-light btn-small" href="/">Back to sign in</a>
        </section>
      </main>
    );
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/");

  return (
    <main className="workspace-shell">
      <section className="workspace-card">
        <a className="brand" href="/" aria-label="FITAI home">
          <span className="brand-mark" aria-hidden="true">F</span><span>FITAI</span>
        </a>
        <h1>Welcome to FITAI.</h1>
        <p>Your account is authenticated. The personalized nutrition workspace is the next migration slice; no sample calories, meal history, or goals are shown as if they were yours.</p>
        <div className="setup-notice" role="status">Nutrition profile and tracking persistence are not connected yet. The existing prototype remains a visual reference; its data stays local to that prototype.</div>
        <p className="workspace-footnote">Signed in as {user.email ?? "your account"}.</p>
        <SignOutButton />
      </section>
    </main>
  );
}
