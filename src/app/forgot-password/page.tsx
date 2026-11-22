import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Forgot password" };

export default function Forgot() {
  return (
    <div className="wrap section mx-auto max-w-lg">
      <p className="eyebrow">Account recovery</p>
      <h1 className="h-section mt-2 mb-6">Reset your password</h1>
      <ForgotForm />
    </div>
  );
}
