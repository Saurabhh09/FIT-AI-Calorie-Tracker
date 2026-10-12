import { AuthPage } from "@/features/auth/auth-page";
import { hasSupabaseConfiguration } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <AuthPage mode="login" authConfigured={hasSupabaseConfiguration()} />;
}
