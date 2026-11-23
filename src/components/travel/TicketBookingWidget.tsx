"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getEssentialsForDestination } from "@/lib/tourist-essentials";

interface TicketBookingWidgetProps {
  destinationSlug: string;
  destinationName: string;
  officialTicketUrl?: string | null;
  officialProvider?: string | null;
  defaultEmail?: string;
  defaultPhone?: string;
}

export default function TicketBookingWidget({
  destinationSlug,
  destinationName,
  officialTicketUrl,
  officialProvider = "ASI e-ticketing",
  defaultEmail = "",
  defaultPhone = "",
}: TicketBookingWidgetProps) {
  const essentials = getEssentialsForDestination(destinationSlug, destinationName);

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [slot, setSlot] = useState("Morning (9 AM - 12 PM)");
  const [adults, setAdults] = useState(1);
  const [foreigners, setForeigners] = useState(0);
  const [children, setChildren] = useState(0);
  const [includeGuide, setIncludeGuide] = useState(false);
  const [email, setEmail] = useState(defaultEmail || "demo@delhikikhoj.test");
  const [phone, setPhone] = useState(defaultPhone || "+91 98765 43210");
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const indianFee = essentials.fees.indian;
  const foreignerFee = essentials.fees.foreigner;
  const guideFee = includeGuide ? 850 : 0;
  const totalAmount = adults * indianFee + foreigners * foreignerFee + guideFee;

  async function handleBookPass(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/tickets/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationSlug,
          destinationName,
          visitDate: date,
          slotTime: slot,
          adults,
          children,
          foreignerCount: foreigners,
          includeGuide,
          contactEmail: email,
          contactPhone: phone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not generate digital pass.");
      }

      setConfirmedBooking(data.booking);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while booking. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-4 border-gold/40 shadow-xl">
      <div className="flex items-start justify-between border-b border-ivory/10 pb-3">
        <div>
          <span className="tag-verified">Fast-Track Pass & Ticketing</span>
          <h3 className="font-serif text-2xl text-ivory">Book Monument Pass</h3>
          <p className="text-xs text-ivory/60">Official rates synced with ASI Delhi</p>
        </div>
        <span className="text-2xl">🎟️</span>
      </div>

      {confirmedBooking ? (
        <div className="space-y-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
          <div className="flex items-center justify-between">
            <span className="tag-verified text-xs">Pass Confirmed</span>
            <span className="font-mono text-xs font-bold text-gold">{confirmedBooking.bookingRef}</span>
          </div>
          <div>
            <h4 className="font-serif text-xl font-bold text-ivory">{destinationName}</h4>
            <p className="text-xs text-ivory/70">
              📅 {confirmedBooking.visitDate} · {confirmedBooking.slotTime}
            </p>
            <p className="mt-1 text-xs text-ivory/70">
              👥 {confirmedBooking.adults} Indian, {confirmedBooking.foreignerCount} Foreigner, {confirmedBooking.children} Kids
              {confirmedBooking.includeGuide && " · Includes Licensed Guide"}
            </p>
          </div>

          <div className="rounded-lg bg-charcoal/80 p-3 text-center">
            <p className="text-[11px] uppercase tracking-wider text-ivory/50">Digital E-Ticket Reference</p>
            <p className="font-mono text-base font-bold text-gold">{confirmedBooking.bookingRef}</p>
            <p className="mt-1 text-[11px] text-emerald-300">
              ✓ Digital Pass ready to show at security gate
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/my-bookings" className="btn btn-gold w-full text-center text-xs">
              View in My Bookings →
            </Link>
            <button
              type="button"
              onClick={() => setConfirmedBooking(null)}
              className="btn btn-ghost text-xs"
            >
              Book Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBookPass} className="space-y-3">
          {errorMsg && (
            <div className="rounded-lg bg-red-500/20 p-2.5 text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label text-xs" htmlFor="tkt-date">
                Visit Date
              </label>
              <input
                id="tkt-date"
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input !py-1.5 !text-sm"
              />
            </div>
            <div>
              <label className="label text-xs" htmlFor="tkt-slot">
                Time Slot
              </label>
              <select
                id="tkt-slot"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="input !py-1.5 !text-sm"
              >
                <option>Morning (9 AM - 12 PM)</option>
                <option>Afternoon (12 PM - 3 PM)</option>
                <option>Sunset (3 PM - 6 PM)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 rounded-xl bg-charcoal/40 p-3 text-xs">
            <p className="font-semibold text-ivory/90">Select Visitors</p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-ivory">Indian / SAARC Citizens</span>
                <span className="ml-1 text-[11px] text-ivory/50">
                  ({indianFee === 0 ? "Free" : `₹${indianFee}`})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdults((a) => Math.max(0, a - 1))}
                  className="h-7 w-7 rounded-lg bg-ivory/15 hover:bg-ivory/25 text-sm font-bold flex items-center justify-center cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-gold text-sm">{adults}</span>
                <button
                  type="button"
                  onClick={() => setAdults((a) => a + 1)}
                  className="h-7 w-7 rounded-lg bg-ivory/15 hover:bg-ivory/25 text-sm font-bold flex items-center justify-center cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-ivory">Foreign Visitors</span>
                <span className="ml-1 text-[11px] text-ivory/50">
                  ({foreignerFee === 0 ? "Free" : `₹${foreignerFee}`})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForeigners((f) => Math.max(0, f - 1))}
                  className="h-7 w-7 rounded-lg bg-ivory/15 hover:bg-ivory/25 text-sm font-bold flex items-center justify-center cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-gold text-sm">{foreigners}</span>
                <button
                  type="button"
                  onClick={() => setForeigners((f) => f + 1)}
                  className="h-7 w-7 rounded-lg bg-ivory/15 hover:bg-ivory/25 text-sm font-bold flex items-center justify-center cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-ivory">Children under 15</span>
                <span className="ml-1 text-[11px] text-ivory/50">(Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChildren((c) => Math.max(0, c - 1))}
                  className="h-7 w-7 rounded-lg bg-ivory/15 hover:bg-ivory/25 text-sm font-bold flex items-center justify-center cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-ivory text-sm">{children}</span>
                <button
                  type="button"
                  onClick={() => setChildren((c) => c + 1)}
                  className="h-7 w-7 rounded-lg bg-ivory/15 hover:bg-ivory/25 text-sm font-bold flex items-center justify-center cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/5 p-2.5 text-xs text-ivory cursor-pointer">
            <input
              type="checkbox"
              checked={includeGuide}
              onChange={(e) => setIncludeGuide(e.target.checked)}
              className="accent-gold h-4 w-4"
            />
            <div>
              <span className="font-semibold text-gold">Add ASI Licensed Guide Support</span>
              <p className="text-[11px] text-ivory/60">Dedicated storyteller for your group (+ ₹850)</p>
            </div>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label text-[11px]" htmlFor="tkt-email">
                Contact Email
              </label>
              <input
                id="tkt-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input !py-1 !text-xs"
              />
            </div>
            <div>
              <label className="label text-[11px]" htmlFor="tkt-phone">
                Phone Number
              </label>
              <input
                id="tkt-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input !py-1 !text-xs"
              />
            </div>
          </div>

          <div className="border-t border-ivory/10 pt-2 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-ivory/50">Total Pass Amount (Official ASI Entry + Digital Pass)</span>
              <p className="font-serif text-2xl font-bold text-gold">
                {totalAmount === 0 ? "Free Entry" : `₹${totalAmount}`}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold !min-h-10 !py-2 !px-4 text-xs font-semibold"
            >
              {loading ? "Generating Pass..." : "Get Digital Pass"}
            </button>
          </div>

          {officialTicketUrl && (
            <div className="pt-2 text-center">
              <a
                href={officialTicketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-ivory/50 hover:text-gold underline"
              >
                Or visit official {officialProvider} site ↗
              </a>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
