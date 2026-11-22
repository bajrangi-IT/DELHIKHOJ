import type { Metadata } from "next";
import EnquiryForm from "@/components/EnquiryForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };

export default async function Contact() {
  const u = await getCurrentUser();
  return (
    <div className="wrap section mx-auto max-w-2xl">
      <p className="eyebrow">Contact</p>
      <h1 className="h-section mt-2">Talk to us</h1>
      <p className="lead mt-3 mb-8">Corrections to heritage information, partnership ideas, or help with your account.</p>
      <EnquiryForm mode="contact" defaultName={u?.fullName} defaultEmail={u?.email} />
    </div>
  );
}
