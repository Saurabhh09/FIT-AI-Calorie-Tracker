import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/features/onboarding/onboarding-wizard";
import { createSupabaseServerClientIfConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClientIfConfigured();
  if (!supabase) {
    return (
      <main className="workspace-shell">
        <section className="workspace-card">
          <span className="workspace-status">Setup required</span>
          <h1>Onboarding needs secure account services.</h1>
          <p>Add the Supabase project URL and anon key to this server environment. No local profile or plan will be created as a substitute.</p>
          <a className="btn btn-light btn-small" href="/">Back to sign in</a>
        </section>
      </main>
    );
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/");

  const displayName = typeof user.user_metadata?.display_name === "string"
    ? user.user_metadata.display_name.slice(0, 80)
    : "";
  return <OnboardingWizard initialName={displayName} />;
}
