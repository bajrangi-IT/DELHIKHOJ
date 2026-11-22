import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/AccountForms";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile" };

export default async function Profile() {
  const user = await requireUser("/profile");
  return <div><h1 className="h-section mb-6">Profile</h1><ProfileForm user={{ fullName: user.fullName, phone: user.phone, language: user.language, interests: user.interests, email: user.email }} /></div>;
}
