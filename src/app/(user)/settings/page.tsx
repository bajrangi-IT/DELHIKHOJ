import type { Metadata } from "next";
import { LanguageForm, PasswordForm } from "@/components/account/AccountForms";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function Settings() {
  const user = await requireUser("/settings");
  return (
    <div className="space-y-8"><h1 className="h-section">Settings</h1>
      <LanguageForm language={user.language} />
      {user.isDemo ? <p className="card max-w-xl text-sm text-ivory/70">Demo accounts can&apos;t change their password.</p> : <PasswordForm />}
      <p className="text-sm text-ivory/60">Use the <strong>Log out</strong> button in the top bar to sign out. Motion can be switched off from the top bar too.</p>
    </div>
  );
}
