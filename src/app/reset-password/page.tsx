import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Set new password" };

export default async function Reset({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <div className="wrap section mx-auto max-w-lg">
      <h1 className="h-section mb-6">Choose a new password</h1>
      {token ? <ResetForm token={token} /> : <p className="card">This link is missing its token. <Link href="/forgot-password" className="text-gold underline">Request a new one</Link>.</p>}
    </div>
  );
}
