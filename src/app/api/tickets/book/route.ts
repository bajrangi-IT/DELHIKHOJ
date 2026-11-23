import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { invokeEdgeFunction } from "@/lib/supabase";
import { db } from "@/db";
import { ticketBookings, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      destinationSlug,
      destinationName,
      visitDate,
      slotTime = "Morning (9 AM - 12 PM)",
      adults = 1,
      children = 0,
      foreignerCount = 0,
      includeGuide = false,
      contactEmail,
      contactPhone,
    } = body;

    if (!destinationSlug || !visitDate || !contactEmail || !contactPhone) {
      return NextResponse.json({ ok: false, error: "Missing required booking details (date, email, phone)." }, { status: 400 });
    }

    // Resolve or fallback user
    let userId = user?.id;
    if (!userId) {
      // Find or create demo/guest user
      const [existingUser] = await db.select().from(users).where(eq(users.email, contactEmail)).limit(1);
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const [demoUser] = await db.select().from(users).where(eq(users.role, "tourist")).limit(1);
        userId = demoUser?.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Please log in to confirm your ticket booking." }, { status: 401 });
    }

    // 1. Primary: Delegate pass generation to live Supabase Edge Function
    const { data: edgeData, error: edgeError } = await invokeEdgeFunction<{ ok: boolean; booking: any }>(
      "ticket-pass",
      {
        body: {
          destinationSlug,
          destinationName,
          visitDate,
          slotTime,
          adults: Number(adults),
          children: Number(children),
          foreignerCount: Number(foreignerCount),
          includeGuide: Boolean(includeGuide),
          contactEmail,
          contactPhone,
          userId,
        },
      }
    );

    if (!edgeError && edgeData?.ok && edgeData.booking) {
      return NextResponse.json(edgeData);
    }

    // 2. Direct Supabase DB fallback
    const adultPrice = 50;
    const foreignerPrice = 550;
    const guideFee = includeGuide ? 850 : 0;
    const total = (Number(adults) * adultPrice) + (Number(foreignerCount) * foreignerPrice) + guideFee;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = destinationSlug.slice(0, 3).toUpperCase();
    const bookingRef = `TKT-${prefix}-${new Date().getFullYear()}-${randomNum}`;

    const [booking] = await db
      .insert(ticketBookings)
      .values({
        bookingRef,
        userId,
        destinationSlug,
        destinationName: destinationName || destinationSlug,
        visitDate,
        slotTime,
        adults: Number(adults),
        children: Number(children),
        foreignerCount: Number(foreignerCount),
        includeGuide: Boolean(includeGuide),
        totalPriceInr: total,
        status: "confirmed",
        contactEmail,
        contactPhone,
      })
      .returning();

    return NextResponse.json({ ok: true, booking });
  } catch (err: any) {
    console.error("Ticket booking error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Failed to process ticket booking." }, { status: 500 });
  }
}
