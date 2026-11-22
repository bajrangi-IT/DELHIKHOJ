import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/AuthForms";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Log in" };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const { next, reset } = await searchParams;
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <div className="wrap section mx-auto max-w-lg">
      <p className="eyebrow">Welcome back</p>
      <h1 className="h-section mt-2 mb-6">Log in</h1>
      <LoginForm next={next} notice={reset ? "Password updated. Please log in." : undefined} />
      <div className="card mt-6 border-gold/30 text-sm">
        <span className="tag-demo">Demo mode accounts</span>
        <p className="mt-2 text-ivory/70">Sample accounts for testing this build (not real people). Authentication itself is real: hashed passwords, server-side sessions. Google sign-in is not configured.</p>
        <ul className="mt-2 space-y-1 font-mono text-xs text-ivory/80">
          <li>Traveller — demo@delhikikhoj.test / Demo@1234</li><li>Admin — admin@delhikikhoj.test / Admin@1234</li><li>Guide — guide@delhikikhoj.test / Guide@1234</li><li>Seller — seller@delhikikhoj.test / Seller@1234</li>
        </ul>
      </div>
    </div>
  );
}
