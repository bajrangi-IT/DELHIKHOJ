import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

const links = [["/admin", "Overview"], ["/admin/destinations", "Destinations"], ["/admin/events", "Events"], ["/admin/guides", "Guides"], ["/admin/sellers", "Sellers"], ["/admin/products", "Products"], ["/admin/users", "Users"], ["/admin/content", "Content & logs"]];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="wrap grid gap-8 py-10 lg:grid-cols-[200px_1fr]">
      <nav aria-label="Admin" className="lg:sticky lg:top-24 lg:h-fit">
        <p className="eyebrow mb-3">Admin</p>
        <ul className="flex gap-2 overflow-x-auto lg:flex-col">{links.map(([h, l]) => <li key={h}><Link href={h} className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm text-ivory/80 hover:bg-charcoal hover:text-gold">{l}</Link></li>)}</ul>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
