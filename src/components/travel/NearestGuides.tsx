"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface GuideItem {
  id: string;
  name: string;
  bio: string;
  image?: string | null;
  languages: string[];
  specialities: string[];
  areas: string[];
  experienceYears?: number;
  hourlyRate?: number;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  verified?: boolean;
}

interface NearestGuidesProps {
  destinationName: string;
  locality?: string | null;
  initialGuides?: GuideItem[];
}

export default function NearestGuides({ destinationName, locality, initialGuides = [] }: NearestGuidesProps) {
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [slot, setSlot] = useState("morning");
  const [groupSize, setGroupSize] = useState(2);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGuide) return;
    setSubmitting(true);
    setBookingError(null);

    try {
      const res = await fetch("/api/guide-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: selectedGuide.id,
          tourDate: date,
          timeSlot: slot,
          groupSize,
          destination: destinationName,
          message: message.trim() || `Tour request for ${destinationName} on ${date}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to submit guide request.");
      }

      setBookingSuccess(`Your booking request has been sent to ${selectedGuide.name}! They will confirm via your email.`);
      setSelectedGuide(null);
    } catch (err: any) {
      setBookingError(err.message || "Failed to book guide. Please make sure you are logged in.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!initialGuides || initialGuides.length === 0) {
    return (
      <div className="card text-center">
        <p className="font-serif text-2xl">Verified Local Heritage Guides</p>
        <p className="mt-2 text-sm text-ivory/70">
          Explore {destinationName} with certified storytellers and ASI licensed guides.
        </p>
        <div className="mt-4">
          <Link href="/guides" className="btn btn-gold">
            Browse All Guides
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ivory/10 pb-4">
        <div>
          <span className="tag-verified">Licensed & Verified Guides</span>
          <h3 className="h-section mt-2 text-xl sm:text-2xl lg:text-3xl">Nearest Guides for {destinationName}</h3>
          <p className="mt-1 text-sm text-ivory/70">
            Top-rated local experts covering {locality || "this monument"}. Book directly for personalized storytelling.
          </p>
        </div>
        <Link href="/guides" className="text-xs uppercase tracking-widest text-gold hover:underline">
          View All Delhi Guides →
        </Link>
      </div>

      {bookingSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <p className="font-semibold">✓ Request Submitted Successfully!</p>
          <p className="mt-1">{bookingSuccess}</p>
          <div className="mt-2">
            <Link href="/my-bookings" className="text-gold underline">
              View in My Bookings →
            </Link>
          </div>
        </div>
      )}

      {bookingError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <p>{bookingError}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {initialGuides.map((guide) => (
          <div
            key={guide.id}
            className="card flex flex-col justify-between border-ivory/10 transition-all hover:border-gold/50 hover:shadow-xl"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-serif text-xl font-bold text-ivory">
                    <Link href={`/guides/${guide.id}`} className="hover:text-gold">
                      {guide.name}
                    </Link>
                  </h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="flex items-center text-xs font-semibold text-gold">
                      ★ {guide.rating ? guide.rating.toFixed(1) : "4.9"}
                    </span>
                    <span className="text-xs text-ivory/60">
                      ({guide.reviewsCount || 48} reviews)
                    </span>
                  </div>
                </div>
                <span className="tag-verified text-[11px] whitespace-nowrap">
                  {guide.badge || "ASI Licensed"}
                </span>
              </div>

              <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ivory/70">
                {guide.bio}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {guide.languages.slice(0, 3).map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full bg-sand/10 px-2 py-0.5 text-[11px] text-sand"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-ivory/10 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-ivory/50">Rates from</span>
                  <p className="font-semibold text-gold">
                    ₹{guide.hourlyRate || 800} <span className="text-xs font-normal text-ivory/60">/ hour</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGuide(guide);
                    setBookingError(null);
                    setBookingSuccess(null);
                  }}
                  className="btn btn-gold !min-h-9 !py-1.5 !px-3 text-xs"
                >
                  Hire Guide
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-lg max-h-[92vh] overflow-y-auto border-gold/40 shadow-2xl p-4 sm:p-6 my-auto">
            <div className="flex items-start justify-between border-b border-ivory/10 pb-3">
              <div>
                <span className="eyebrow !text-gold">Direct Tour Booking</span>
                <h3 className="font-serif text-2xl text-ivory">Hire {selectedGuide.name}</h3>
                <p className="text-xs text-ivory/60">
                  {selectedGuide.badge || "ASI Certified"} · ₹{selectedGuide.hourlyRate || 800}/hr
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="text-ivory/60 hover:text-ivory p-1 text-lg"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBook} className="mt-4 space-y-4">
              <div>
                <label className="label">Visiting Monument</label>
                <input
                  type="text"
                  readOnly
                  value={destinationName}
                  className="input bg-charcoal/50 text-ivory/70"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="guide-date">
                    Tour Date
                  </label>
                  <input
                    id="guide-date"
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="guide-group">
                    Group Size
                  </label>
                  <input
                    id="guide-group"
                    type="number"
                    min={1}
                    max={20}
                    value={groupSize}
                    onChange={(e) => setGroupSize(Math.max(1, Number(e.target.value)))}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="guide-slot">
                  Preferred Time Slot
                </label>
                <select
                  id="guide-slot"
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="input"
                >
                  <option value="morning">Morning (9 AM - 1 PM)</option>
                  <option value="afternoon">Afternoon (1 PM - 5 PM)</option>
                  <option value="evening">Sunset / Evening (4 PM - 7 PM)</option>
                  <option value="full-day">Full Day Heritage Walk (9 AM - 5 PM)</option>
                </select>
              </div>

              <div>
                <label className="label" htmlFor="guide-msg">
                  Special Requirements / Languages
                </label>
                <textarea
                  id="guide-msg"
                  rows={2}
                  placeholder="e.g. Photography tour, English/Hindi language, travelling with senior citizens..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input"
                />
              </div>

              <div className="rounded-xl border border-ivory/10 bg-charcoal/30 p-3 text-xs text-ivory/70">
                <p>
                  <strong>💡 How it works:</strong> The guide receives your request directly. Once accepted, their direct phone/WhatsApp details unlock in your{" "}
                  <strong className="text-gold">My Bookings</strong> dashboard. Fee is settled directly with the guide.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedGuide(null)}
                  className="btn btn-ghost w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-gold w-full sm:w-auto">
                  {submitting ? "Sending Request..." : "Confirm & Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
