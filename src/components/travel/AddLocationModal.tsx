"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const DELHI_LOCALITY_PRESETS = [
  { name: "Old Delhi (Shahjahanabad)", lat: 28.6507, lng: 77.2334 },
  { name: "Mehrauli Archaeological Ridge", lat: 28.5244, lng: 77.1855 },
  { name: "Nizamuddin & Sunder Nursery", lat: 28.5912, lng: 77.2435 },
  { name: "Connaught Place & Janpath", lat: 28.6289, lng: 77.2195 },
  { name: "Hauz Khas & Siri", lat: 28.5529, lng: 77.1945 },
  { name: "Tughlaqabad Fort Area", lat: 28.5144, lng: 77.2604 },
  { name: "Lodhi Road & Khan Market", lat: 28.5882, lng: 77.2285 },
];

export default function AddLocationModal({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [category, setCategory] = useState("monument");
  const [era, setEra] = useState("Delhi Sultanate (1206–1526)");
  const [locality, setLocality] = useState("Mehrauli");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("28.5244");
  const [lng, setLng] = useState("77.1855");
  const [summary, setSummary] = useState("");
  const [whyVisit, setWhyVisit] = useState("");
  const [hours, setHours] = useState("Sunrise to Sunset");
  const [fee, setFee] = useState("Free Entry / Nominal ASI rate");
  const [image, setImage] = useState("");
  const [unesco, setUnesco] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [createdDestination, setCreatedDestination] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const router = useRouter();

  function handleLocalityChange(presetName: string) {
    setLocality(presetName);
    const match = DELHI_LOCALITY_PRESETS.find((p) => p.name === presetName);
    if (match) {
      setLat(String(match.lat));
      setLng(String(match.lng));
    }
  }

  function detectGPS() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(5));
        setLng(pos.coords.longitude.toFixed(5));
        setGpsLoading(false);
      },
      () => {
        alert("Could not detect GPS location. Using selected Delhi locality coordinates.");
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nameHi,
          category,
          era,
          locality,
          address: address.trim() || `${name}, ${locality}, Delhi`,
          lat: Number(lat),
          lng: Number(lng),
          summary,
          whyVisit: whyVisit || `Historical monument in ${locality} with remarkable architecture and heritage value.`,
          hours,
          fee,
          image: image.trim() || "/assets/hero/delhi-hero-panoramic.jpg",
          unesco,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to add new location.");
      }

      setCreatedDestination(data.destination);
      if (onCreated) onCreated();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while submitting location.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setOpen(false);
    setCreatedDestination(null);
    setName("");
    setNameHi("");
    setSummary("");
    setWhyVisit("");
    setImage("");
    setErrorMsg(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-gold text-xs sm:text-sm !min-h-10 px-4 sm:px-5 font-semibold flex items-center gap-1.5 shadow-lg shadow-gold/20"
      >
        <span>+ Add Heritage Location</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/80 backdrop-blur-md overflow-y-auto">
          <div className="card w-full max-w-2xl max-h-[92vh] overflow-y-auto border-gold/40 bg-ink shadow-2xl p-5 sm:p-7 space-y-4 my-auto">
            <div className="flex items-start justify-between border-b border-ivory/10 pb-3">
              <div>
                <span className="tag-verified text-[10px]">Community & Heritage Registry</span>
                <h3 className="font-serif text-2xl text-ivory mt-1">Add / Suggest New Heritage Location</h3>
                <p className="text-xs text-ivory/60">
                  Add unexplored monuments, stepwells, havelis, and historic sites to Delhi Ki Khoj.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="text-ivory/60 hover:text-ivory p-1 text-lg"
              >
                ✕
              </button>
            </div>

            {createdDestination ? (
              <div className="space-y-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center">
                <span className="text-4xl">🏛️</span>
                <h4 className="font-serif text-2xl font-bold text-ivory">
                  &ldquo;{createdDestination.name}&rdquo; Added Successfully!
                </h4>
                <p className="text-sm text-ivory/80 max-w-md mx-auto">
                  Your new heritage location is now live on Delhi Ki Khoj. It is displayed in Destinations, mapped on the GIS Interactive Explorer, and searchable in the trip planner.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
                  <Link
                    href={`/destination/${createdDestination.slug}`}
                    className="btn btn-gold text-xs"
                    onClick={resetForm}
                  >
                    View Destination Live Page →
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedDestination(null);
                      setName("");
                      setSummary("");
                    }}
                    className="btn btn-ghost text-xs"
                  >
                    Add Another Location
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="rounded-xl bg-red-500/20 p-3 text-xs text-red-200">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs" htmlFor="loc-name">
                      Location / Monument Name *
                    </label>
                    <input
                      id="loc-name"
                      type="text"
                      required
                      placeholder="e.g. Agrasen Ki Baoli, Chor Minar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input !py-1.5 !text-sm"
                    />
                  </div>
                  <div>
                    <label className="label text-xs" htmlFor="loc-name-hi">
                      Hindi Name (optional)
                    </label>
                    <input
                      id="loc-name-hi"
                      type="text"
                      placeholder="e.g. अग्रसेन की बावली"
                      value={nameHi}
                      onChange={(e) => setNameHi(e.target.value)}
                      className="input !py-1.5 !text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="label text-xs" htmlFor="loc-cat">
                      Category
                    </label>
                    <select
                      id="loc-cat"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input !py-1.5 !text-sm capitalize"
                    >
                      <option value="monument">Monument / Fort</option>
                      <option value="stepwell">Stepwell / Baoli</option>
                      <option value="tomb">Mughal / Sultanate Tomb</option>
                      <option value="garden">Heritage Garden</option>
                      <option value="mosque">Historic Mosque</option>
                      <option value="temple">Ancient Temple</option>
                      <option value="museum">Museum / Gallery</option>
                      <option value="hidden-gem">Hidden Gem</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs" htmlFor="loc-era">
                      Historical Era
                    </label>
                    <select
                      id="loc-era"
                      value={era}
                      onChange={(e) => setEra(e.target.value)}
                      className="input !py-1.5 !text-sm"
                    >
                      <option>Delhi Sultanate (1206–1526)</option>
                      <option>Mughal Empire (1526–1857)</option>
                      <option>Colonial New Delhi (1911–1947)</option>
                      <option>Ancient / Pre-Sultanate (Pre-1200)</option>
                      <option>Post-Independence Modern</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs" htmlFor="loc-preset">
                      Delhi Locality
                    </label>
                    <select
                      id="loc-preset"
                      value={locality}
                      onChange={(e) => handleLocalityChange(e.target.value)}
                      className="input !py-1.5 !text-sm"
                    >
                      {DELHI_LOCALITY_PRESETS.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Coordinates & GPS */}
                <div className="rounded-xl bg-charcoal/40 p-3 border border-ivory/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ivory">📍 Map Coordinates (Delhi GIS)</span>
                    <button
                      type="button"
                      onClick={detectGPS}
                      disabled={gpsLoading}
                      className="chip text-[10px] text-gold border-gold/40 hover:bg-gold/10"
                    >
                      {gpsLoading ? "⏳ Detecting GPS..." : "📍 Use My Current Location"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-ivory/60 block" htmlFor="loc-lat">Latitude</label>
                      <input
                        id="loc-lat"
                        type="number"
                        step="any"
                        required
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="input !py-1 !text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-ivory/60 block" htmlFor="loc-lng">Longitude</label>
                      <input
                        id="loc-lng"
                        type="number"
                        step="any"
                        required
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="input !py-1 !text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label text-xs" htmlFor="loc-sum">
                    Summary & History *
                  </label>
                  <textarea
                    id="loc-sum"
                    required
                    rows={2}
                    placeholder="Brief historical overview and why travellers should discover this place..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="input !py-1.5 !text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs" htmlFor="loc-hours">
                      Visiting Hours
                    </label>
                    <input
                      id="loc-hours"
                      type="text"
                      placeholder="e.g. 9:00 AM – 5:30 PM (Daily)"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="input !py-1.5 !text-sm"
                    />
                  </div>
                  <div>
                    <label className="label text-xs" htmlFor="loc-fee">
                      Entry Fee
                    </label>
                    <input
                      id="loc-fee"
                      type="text"
                      placeholder="e.g. Free Entry or ₹50 ASI"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      className="input !py-1.5 !text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-xs" htmlFor="loc-img">
                    Photo URL (optional)
                  </label>
                  <input
                    id="loc-img"
                    type="url"
                    placeholder="https://... or leave empty for default panoramic view"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="input !py-1.5 !text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="loc-unesco"
                    type="checkbox"
                    checked={unesco}
                    onChange={(e) => setUnesco(e.target.checked)}
                    className="rounded accent-gold h-4 w-4"
                  />
                  <label htmlFor="loc-unesco" className="text-xs text-ivory/80 cursor-pointer">
                    Officially designated UNESCO World Heritage Site
                  </label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-ivory/10">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-ghost w-full sm:w-auto text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-gold w-full sm:w-auto text-xs font-semibold"
                  >
                    {submitting ? "Publishing Location..." : "Publish Location Live"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
