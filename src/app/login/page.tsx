import { AuthPage } from "@/features/auth/auth-page";
import { hasSupabaseConfiguration } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type LoginPageProps = { searchParams: Promise<{ status?: string | string[] }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { status } = await searchParams;
  return <AuthPage mode="login" authConfigured={hasSupabaseConfiguration()} status={Array.isArray(status) ? status[0] : status} />;
}
