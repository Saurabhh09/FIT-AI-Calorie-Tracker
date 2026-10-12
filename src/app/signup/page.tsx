import { AuthPage } from "@/features/auth/auth-page";
import { hasSupabaseConfiguration } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SignupPageProps = { searchParams: Promise<{ status?: string | string[] }> };

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { status } = await searchParams;
  return <AuthPage mode="signup" authConfigured={hasSupabaseConfiguration()} status={Array.isArray(status) ? status[0] : status} />;
}
