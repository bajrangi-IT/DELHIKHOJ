import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Use", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <div className="wrap section mx-auto max-w-3xl space-y-4 text-ivory/80">
      <h1 className="h-section">Terms of Use</h1>
      <p className="text-sm text-ivory/50">Project terms summary — have it reviewed by a qualified professional before public launch.</p>
      <ul className="list-disc space-y-3 pl-6">
        <li><strong>Information:</strong> Provided for general guidance. Verify opening hours, fees, rules and tickets with the official provider before travelling.</li>
        <li><strong>No payments:</strong> We do not take payments or confirm bookings. Ticket links open external providers who are solely responsible for their service.</li>
        <li><strong>Guides & sellers:</strong> Independent third parties. Admin approval is a content review, not a licence or quality guarantee. Agree prices and arrangements directly.</li>
        <li><strong>Your content:</strong> Don&apos;t submit false, unlawful or misleading material. We may remove listings.</li>
        <li><strong>Demonstration data:</strong> Entries labelled DEMO are samples and not real offers.</li>
        <li><strong>Independence:</strong> This project is not affiliated with any government or tourism authority.</li>
      </ul>
    </div>
  );
}
