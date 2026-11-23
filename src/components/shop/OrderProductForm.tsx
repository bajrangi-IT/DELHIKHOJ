"use client";

import React, { useState } from "react";
import Link from "next/link";

interface OrderProductFormProps {
  productId: string;
  productName: string;
  sellerId: string;
  sellerName: string;
  priceInr: number;
  defaultName?: string;
  defaultEmail?: string;
}

export default function OrderProductForm({
  productId,
  productName,
  sellerId,
  sellerName,
  priceInr,
  defaultName = "",
  defaultEmail = "",
}: OrderProductFormProps) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(defaultName || "Demo Traveller");
  const [customerEmail, setCustomerEmail] = useState(defaultEmail || "demo@delhikikhoj.test");
  const [customerPhone, setCustomerPhone] = useState("+91 98765 43210");
  const [deliveryAddress, setDeliveryAddress] = useState("Room 304, The Imperial, Janpath, Connaught Place, New Delhi 110001");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const unitPrice = priceInr || 1200;
  const totalPrice = unitPrice * quantity;

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          sellerId,
          quantity,
          deliveryAddress,
          customerName,
          customerEmail,
          customerPhone,
          paymentMethod,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      setConfirmedOrder(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedOrder) {
    return (
      <div className="card space-y-4 border-emerald-500/50 bg-emerald-500/10 p-6">
        <div className="flex items-center justify-between">
          <span className="tag-verified">Order Placed Successfully</span>
          <span className="font-mono text-xs font-bold text-gold">{confirmedOrder.orderNumber}</span>
        </div>
        <div>
          <h3 className="font-serif text-2xl font-bold text-ivory">Thank you for supporting Delhi Artisans!</h3>
          <p className="mt-1 text-sm text-ivory/70">
            Your order for <strong className="text-gold">{quantity}x {productName}</strong> has been sent to {sellerName}.
          </p>
          <div className="mt-3 rounded-xl bg-charcoal/80 p-3 text-xs text-ivory/80 space-y-1">
            <p><strong>Total Amount:</strong> ₹{confirmedOrder.totalPriceInr?.toLocaleString("en-IN")}</p>
            <p><strong>Delivery Address:</strong> {confirmedOrder.deliveryAddress}</p>
            <p><strong>Payment Method:</strong> {confirmedOrder.paymentMethod}</p>
            <p><strong>Status:</strong> <span className="text-emerald-300 font-semibold capitalize">{confirmedOrder.status}</span></p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/my-bookings" className="btn btn-gold text-xs">
            Track Order in My Bookings →
          </Link>
          <button
            type="button"
            onClick={() => {
              setConfirmedOrder(null);
              setOpen(false);
            }}
            className="btn btn-ghost text-xs"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <div className="card border-gold/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="eyebrow !text-gold">Authentic Delhi Heritage Craft</span>
            <p className="font-serif text-xl font-bold text-ivory">
              {priceInr ? `₹${priceInr.toLocaleString("en-IN")}` : "Price on Request"}
            </p>
            <p className="text-xs text-ivory/60">Delivered directly to your hotel or residence in Delhi</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn btn-gold !min-h-11 px-6 font-semibold w-full sm:w-auto"
          >
            🛍️ Buy Directly from Artisan
          </button>
        </div>
      ) : (
        <div className="card space-y-4 border-gold/50 shadow-2xl">
          <div className="flex items-start justify-between border-b border-ivory/10 pb-3">
            <div>
              <span className="tag-verified">Direct Artisan Purchase</span>
              <h3 className="font-serif text-2xl text-ivory">Order {productName}</h3>
              <p className="text-xs text-ivory/60">Sold and handcrafted by {sellerName}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-ivory/60 hover:text-ivory text-lg"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleOrder} className="space-y-4">
            {errorMsg && (
              <div className="rounded-xl bg-red-500/20 p-3 text-xs text-red-200">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl bg-charcoal/40 p-3 text-sm">
              <div>
                <p className="font-semibold text-ivory">Quantity</p>
                <p className="text-xs text-ivory/60">₹{unitPrice} per item</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-9 w-9 rounded-lg bg-ivory/10 text-base font-bold hover:bg-ivory/20"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-gold text-base">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-9 w-9 rounded-lg bg-ivory/10 text-base font-bold hover:bg-ivory/20"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label text-xs" htmlFor="ord-name">
                  Your Full Name
                </label>
                <input
                  id="ord-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input !py-1.5 !text-sm"
                />
              </div>
              <div>
                <label className="label text-xs" htmlFor="ord-phone">
                  Phone / WhatsApp
                </label>
                <input
                  id="ord-phone"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="input !py-1.5 !text-sm"
                />
              </div>
            </div>

            <div>
              <label className="label text-xs" htmlFor="ord-email">
                Email Address
              </label>
              <input
                id="ord-email"
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="input !py-1.5 !text-sm"
              />
            </div>

            <div>
              <label className="label text-xs" htmlFor="ord-addr">
                Delivery Address (Hotel, Room No. or Local Address in Delhi)
              </label>
              <textarea
                id="ord-addr"
                rows={2}
                required
                placeholder="e.g. Hotel Room 304, The Imperial, Janpath, Connaught Place, New Delhi"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="input !py-1.5 !text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label text-xs" htmlFor="ord-pay">
                  Payment Method
                </label>
                <select
                  id="ord-pay"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input !py-1.5 !text-sm"
                >
                  <option>Cash on Delivery</option>
                  <option>UPI / QR on Delivery</option>
                  <option>Hotel Concierge Payment</option>
                </select>
              </div>
              <div>
                <label className="label text-xs" htmlFor="ord-notes">
                  Delivery Notes
                </label>
                <input
                  id="ord-notes"
                  type="text"
                  placeholder="e.g. Call before arrival"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input !py-1.5 !text-sm"
                />
              </div>
            </div>

            {/* Itemized Price Breakdown */}
            <div className="rounded-xl bg-charcoal/60 p-3 space-y-1 text-xs text-ivory/80 border border-ivory/10">
              <div className="flex justify-between">
                <span>Handcrafted Item ({quantity}x)</span>
                <span className="font-mono">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-emerald-300">
                <span>Verified Artisan Certificate</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between text-emerald-300">
                <span>Hotel / Local Delhi Delivery</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between text-[11px] text-ivory/50 pt-1 border-t border-ivory/10">
                <span>Direct Artisan Support</span>
                <span>90% goes directly to craftsman</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-ivory/10 pt-3 gap-3">
              <div>
                <span className="text-xs text-ivory/50">Total Payable ({quantity} item{quantity > 1 ? "s" : ""})</span>
                <p className="font-serif text-2xl font-bold text-gold">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn btn-ghost !min-h-10 text-xs flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-gold !min-h-10 text-xs font-semibold px-5 flex-1 sm:flex-none"
                >
                  {submitting ? "Placing Order..." : "Confirm & Place Order"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
