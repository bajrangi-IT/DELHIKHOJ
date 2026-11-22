import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/AuthForms";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create account" };

export default async function Signup() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <div className="wrap section mx-auto max-w-2xl">
      <p className="eyebrow">Join the journey</p>
      <h1 className="h-section mt-2 mb-6">Create your account</h1>
      <SignupForm />
    </div>
  );
}
