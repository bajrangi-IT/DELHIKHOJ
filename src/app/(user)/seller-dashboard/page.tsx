import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, orders, products, sellers } from "@/db/schema";
import { ActionButton, ProductForm } from "@/components/account/AccountForms";
import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Artisan Seller Dashboard" };

const statusColor: Record<string, string> = {
  pending: "bg-gold/20 text-gold border-gold/40",
  confirmed: "bg-blue-500/20 text-blue-200 border-blue-500/40",
  shipped: "bg-purple-500/20 text-purple-200 border-purple-500/40",
  delivered: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/40",
};

export default async function SellerDashboard() {
  const user = await requireUser("/seller-dashboard");
  const [s] = await db.select().from(sellers).where(eq(sellers.userId, user.id));

  if (!s) {
    return (
      <div className="space-y-6">
        <header className="border-b border-ivory/10 pb-4">
          <span className="tag-verified">Artisan Workshop Portal</span>
          <h1 className="h-section mt-1">Artisan Seller Dashboard</h1>
          <p className="mt-1 text-sm text-ivory/60">
            You are currently signed in as <strong className="text-gold">{user.fullName}</strong> ({user.role}).
          </p>
        </header>

        <div className="card max-w-2xl space-y-4 border-gold/30 p-8 text-center">
          <span className="text-4xl">🏺</span>
          <h2 className="font-serif text-2xl text-ivory">Register Your Craft Workshop</h2>
          <p className="text-sm text-ivory/70 leading-relaxed">
            Sell authentic Delhi handicrafts, textiles, brassware, and heritage products directly to domestic & international travellers. Zero upfront fees — keep 90% of every sale with prompt weekly payouts.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/become-seller" className="btn btn-gold text-xs">
              Register as an Artisan Seller →
            </Link>
            <Link href="/dashboard" className="btn btn-ghost text-xs">
              Go to Traveller Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [ps, en, ords] = await Promise.all([
    db.select().from(products).where(eq(products.sellerId, s.id)).orderBy(desc(products.createdAt)),
    db.select().from(enquiries).where(eq(enquiries.sellerId, s.id)).orderBy(desc(enquiries.createdAt)),
    db
      .select({
        o: orders,
        p: products,
      })
      .from(orders)
      .innerJoin(products, eq(products.id, orders.productId))
      .where(eq(orders.sellerId, s.id))
      .orderBy(desc(orders.createdAt)),
  ]);

  // Financial calculations for Platform Commission & Net Artisan Payout
  const totalGrossSales = ords.reduce((sum, { o }) => sum + (o.totalPriceInr || 0), 0);
  const platformCommissionRate = 0.10; // 10% platform facilitation fee
  const totalPlatformCommission = Math.round(totalGrossSales * platformCommissionRate);
  const totalNetPayout = totalGrossSales - totalPlatformCommission;

  const deliveredCount = ords.filter(({ o }) => o.status === "delivered").length;
  const inProgressCount = ords.filter(({ o }) => o.status === "pending" || o.status === "confirmed" || o.status === "shipped").length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-5">
        <div>
          <span className="tag-verified">Artisan Workshop Portal</span>
          <h1 className="h-section mt-2 !text-4xl">{s.businessName}</h1>
          <p className="mt-1 text-sm text-ivory/70">
            {s.locality} · Workshop Status:{" "}
            <span className={`chip capitalize font-semibold ${s.status === "approved" ? "chip-on" : ""}`}>{s.status}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/local-products" className="btn btn-ghost text-xs whitespace-nowrap">
            View Marketplace →
          </Link>
          <Link href="/local-products" className="btn btn-gold text-xs whitespace-nowrap">
            Catalog Preview
          </Link>
        </div>
      </div>

      {/* Business Model & Revenue Summary Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-ivory">Earnings & Platform Commission</h2>
          <span className="text-xs text-ivory/50">10% Platform Facilitation Fee · 90% Artisan Payout</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card border-ivory/15 bg-charcoal/60">
            <span className="text-xs uppercase tracking-wider text-ivory/50">Gross Merchandise Value</span>
            <p className="font-serif text-3xl font-bold text-ivory mt-1">
              ₹{totalGrossSales.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-ivory/60 mt-1">Total revenue from customer orders</p>
          </div>

          <div className="card border-gold/30 bg-gold/5">
            <span className="text-xs uppercase tracking-wider text-gold">Platform Fee (10%)</span>
            <p className="font-serif text-3xl font-bold text-gold mt-1">
              -₹{totalPlatformCommission.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-gold/80 mt-1">Marketplace discovery & payment processing</p>
          </div>

          <div className="card border-emerald-500/40 bg-emerald-500/10">
            <span className="text-xs uppercase tracking-wider text-emerald-300">Net Artisan Payout (90%)</span>
            <p className="font-serif text-3xl font-bold text-emerald-300 mt-1">
              ₹{totalNetPayout.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-emerald-200/70 mt-1">Disbursed directly via UPI / Bank</p>
          </div>

          <div className="card border-ivory/15 bg-charcoal/60">
            <span className="text-xs uppercase tracking-wider text-ivory/50">Orders Pipeline</span>
            <p className="font-serif text-3xl font-bold text-ivory mt-1">
              {ords.length}
            </p>
            <p className="text-[11px] text-ivory/60 mt-1">
              {deliveredCount} delivered · {inProgressCount} active
            </p>
          </div>
        </div>
      </section>

      {/* Incoming Orders Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl text-ivory">Incoming Tourist Orders</h2>
            <p className="text-xs text-ivory/60">
              Direct orders placed by travellers with commission and net payout breakdown.
            </p>
          </div>
          <span className="rounded-full bg-gold/20 px-3 py-1 font-mono text-xs font-bold text-gold">
            {ords.length} Order{ords.length === 1 ? "" : "s"}
          </span>
        </div>

        {!ords.length ? (
          <div className="card text-center p-8">
            <p className="font-serif text-xl text-ivory">No orders received yet</p>
            <p className="mt-1 text-sm text-ivory/60">
              When tourists and travellers order your craft items, they will appear here with delivery details and instant revenue breakdown.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ords.map(({ o, p }) => {
              const gross = o.totalPriceInr || 0;
              const comm = Math.round(gross * 0.10);
              const net = gross - comm;

              return (
                <div
                  key={o.id}
                  className="card flex flex-col justify-between gap-4 border-ivory/10 md:flex-row md:items-center"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-gold">{o.orderNumber}</span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          statusColor[o.status] || "bg-ivory/10 text-ivory border-ivory/20"
                        }`}
                      >
                        {o.status}
                      </span>
                      <span className="text-xs text-ivory/50">{fmtDate(o.createdAt)}</span>
                    </div>

                    <h3 className="font-serif text-2xl text-ivory">
                      {o.quantity}x {p.name}
                    </h3>

                    <div className="grid gap-1 text-xs text-ivory/70 sm:grid-cols-2">
                      <p>
                        <strong>Customer:</strong> {o.customerName} ({o.customerPhone})
                      </p>
                      <p>
                        <strong>Email:</strong> {o.customerEmail}
                      </p>
                      <p className="sm:col-span-2">
                        <strong>Delivery to:</strong> {o.deliveryAddress}
                      </p>
                      {o.notes && (
                        <p className="sm:col-span-2 text-sand/80">
                          <strong>Notes:</strong> &ldquo;{o.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col sm:items-center md:items-end justify-between gap-3 border-t border-ivory/10 pt-3 md:border-t-0 md:pt-0">
                    <div className="text-left sm:text-right space-y-1">
                      <span className="text-[11px] text-ivory/50">{o.paymentMethod}</span>
                      <p className="font-serif text-2xl font-bold text-gold">
                        ₹{gross.toLocaleString("en-IN")}
                      </p>
                      <div className="text-[11px] text-ivory/60 space-x-2">
                        <span>Platform Fee (10%): <strong className="text-gold">-₹{comm}</strong></span>
                        <span>· Net Payout: <strong className="text-emerald-300">₹{net}</strong></span>
                      </div>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {o.status === "pending" && (
                        <ActionButton
                          url={`/api/seller/orders/${o.id}`}
                          method="PATCH"
                          body={{ status: "confirmed" }}
                          label="Accept & Confirm"
                          variant="gold"
                        />
                      )}
                      {o.status === "confirmed" && (
                        <ActionButton
                          url={`/api/seller/orders/${o.id}`}
                          method="PATCH"
                          body={{ status: "shipped" }}
                          label="Mark as Shipped"
                          variant="gold"
                        />
                      )}
                      {o.status === "shipped" && (
                        <ActionButton
                          url={`/api/seller/orders/${o.id}`}
                          method="PATCH"
                          body={{ status: "delivered" }}
                          label="Mark Delivered"
                          variant="gold"
                        />
                      )}
                      {o.status !== "delivered" && o.status !== "cancelled" && (
                        <ActionButton
                          url={`/api/seller/orders/${o.id}`}
                          method="PATCH"
                          body={{ status: "cancelled" }}
                          label="Cancel"
                          variant="danger"
                          confirmText="Cancel this customer order?"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Product Management Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl text-ivory">Product Catalog & Inventory</h2>
            <p className="text-xs text-ivory/60">
              List your authentic handmade heritage products for travellers.
            </p>
          </div>
          <span className="rounded-full bg-gold/20 px-3 py-1 font-mono text-xs font-bold text-gold">
            {ps.length} Product{ps.length === 1 ? "" : "s"}
          </span>
        </div>

        {s.status !== "approved" ? (
          <p className="card border-gold/30">
            Product listing unlocks once an administrator reviews and approves your artisan profile.
          </p>
        ) : (
          <ProductForm />
        )}

        <ul className="mt-3 space-y-2">
          {ps.map((p) => (
            <li key={p.id} className="card !p-4 flex items-center justify-between gap-3">
              <span>
                <strong className="text-ivory">{p.name}</strong>{" "}
                <span className="text-xs text-ivory/50">
                  · {p.category} · {p.priceInr ? `₹${p.priceInr.toLocaleString("en-IN")}` : "Price on enquiry"}
                </span>
              </span>
              <ActionButton
                url={`/api/seller/products?id=${p.id}`}
                method="DELETE"
                label="Delete"
                variant="danger"
                confirmText="Delete this product from catalog?"
              />
            </li>
          ))}
          {!ps.length && <li className="card">No products listed in catalog yet.</li>}
        </ul>
      </section>

      {/* Customer Enquiries Section */}
      <section className="space-y-4">
        <h2 className="font-serif text-3xl text-ivory">Artisan Enquiries & Custom Requests</h2>
        <ul className="mt-3 space-y-2">
          {en.map((e) => (
            <li key={e.id} className="card !p-4">
              <p className="text-xs text-ivory/50">
                {e.name} · {e.email} · {fmtDate(e.createdAt)}
              </p>
              <p className="mt-1 text-sm text-ivory/90">{e.message}</p>
            </li>
          ))}
          {!en.length && <li className="card">No customer enquiries yet.</li>}
        </ul>
      </section>
    </div>
  );
}
