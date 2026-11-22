import Link from "next/link";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const links = [
    ["/dashboard", "Dashboard"], ["/my-trips", "My trips"], ["/saved-places", "Saved places"], ["/my-bookings", "My bookings"], ["/my-guide-requests", "Guide requests"], ["/profile", "Profile"], ["/settings", "Settings"],
    ...(user.role === "guide" ? [["/guide-dashboard", "Guide dashboard"]] : [["/become-guide", "Become a guide"]]),
    ...(user.role === "seller" ? [["/seller-dashboard", "Seller dashboard"]] : [["/become-seller", "Become a seller"]]),
  ];
  return (
    <div className="wrap grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Account" className="lg:sticky lg:top-24 lg:h-fit">
        <ul className="flex gap-2 overflow-x-auto lg:flex-col">{links.map(([h, l]) => <li key={h}><Link href={h} className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm text-ivory/80 hover:bg-charcoal hover:text-gold">{l}</Link></li>)}</ul>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
