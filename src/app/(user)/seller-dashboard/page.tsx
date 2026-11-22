import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, orders, products, sellers } from "@/db/schema";
import { ActionButton, ProductForm } from "@/components/account/AccountForms";
import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Seller dashboard" };

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
      <div>
        <h1 className="h-section">Seller dashboard</h1>
        <p className="card mt-6">
          No seller profile linked yet. <Link href="/become-seller" className="text-gold underline">Create or register your artisan profile</Link>.
        </p>
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

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-5">
        <div>
          <span className="tag-verified">Artisan Workshop Portal</span>
          <h1 className="h-section mt-2 !text-4xl">{s.businessName}</h1>
          <p className="mt-1 text-sm text-ivory/70">
            {s.locality} · Profile Status:{" "}
            <span className="chip capitalize font-semibold">{s.status}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/local-products" className="btn btn-ghost text-xs">
            View Marketplace →
          </Link>
        </div>
      </div>

      {/* Incoming Orders Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl text-ivory">Incoming Orders</h2>
            <p className="text-xs text-ivory/60">
              Orders placed by travellers for your authentic heritage products.
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
              When tourists and travellers order your craft items, they will appear here with delivery details.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ords.map(({ o, p }) => (
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
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-ivory/50">{o.paymentMethod}</span>
                    <p className="font-serif text-2xl font-bold text-gold">
                      ₹{o.totalPriceInr.toLocaleString("en-IN")}
                    </p>
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
            ))}
          </div>
        )}
      </section>

      {/* Product Management Section */}
      <section className="space-y-4">
        <h2 className="font-serif text-3xl text-ivory">Product Inventory</h2>
        {s.status !== "approved" ? (
          <p className="card">
            Product management unlocks once an administrator reviews and approves your artisan profile.
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
        <h2 className="font-serif text-3xl text-ivory">Artisan Enquiries</h2>
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
