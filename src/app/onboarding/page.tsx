import type { Metadata } from "next";
import { OnboardingForm } from "@/components/auth/AuthForms";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Welcome" };

export default async function Onboarding() {
  const user = await requireUser("/onboarding");
  return (
    <div className="wrap section mx-auto max-w-2xl">
      <p className="eyebrow">Welcome, {user.fullName.split(" ")[0]}</p>
      <h1 className="h-section mt-2 mb-6">Personalise your Delhi</h1>
      <OnboardingForm initialLang={user.language} initialInterests={user.interests} />
    </div>
  );
}
