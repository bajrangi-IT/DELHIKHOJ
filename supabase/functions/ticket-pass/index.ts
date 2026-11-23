import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const OFFICIAL_FEES: Record<string, { indian: number; foreigner: number }> = {
  "red-fort": { indian: 50, foreigner: 550 },
  "qutub-minar": { indian: 50, foreigner: 550 },
  "humayuns-tomb": { indian: 50, foreigner: 550 },
  "safdarjungs-tomb": { indian: 25, foreigner: 300 },
  "jantar-mantar": { indian: 25, foreigner: 300 },
  "purana-qila": { indian: 25, foreigner: 300 },
  "tughlaqabad-fort": { indian: 25, foreigner: 300 },
  "hauz-khas-complex": { indian: 25, foreigner: 300 },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
      userId = "d3bd4906-e4c9-4e7f-a34a-cb75b04f2363",
    } = body;

    if (!destinationSlug || !destinationName || !visitDate || !contactEmail || !contactPhone) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing required fields (destination, date, email, phone)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rates = OFFICIAL_FEES[destinationSlug] || { indian: 35, foreigner: 350 };
    const guideFee = includeGuide ? 850 : 0;
    const totalPriceInr = adults * rates.indian + foreignerCount * rates.foreigner + guideFee;

    const prefix = destinationSlug.slice(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `TKT-${prefix}-${year}-${rand}`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("ticket_bookings")
      .insert({
        destination_slug: destinationSlug,
        destination_name: destinationName,
        visit_date: visitDate,
        slot_time: slotTime,
        adults: Math.max(1, adults),
        children: Math.max(0, children),
        foreigner_count: Math.max(0, foreignerCount),
        include_guide: Boolean(includeGuide),
        total_price_inr: totalPriceInr,
        status: "confirmed",
        booking_ref: bookingRef,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        booking: {
          id: data.id,
          bookingRef: data.booking_ref,
          destinationSlug: data.destination_slug,
          destinationName: data.destination_name,
          visitDate: data.visit_date,
          slotTime: data.slot_time,
          adults: data.adults,
          children: data.children,
          foreignerCount: data.foreigner_count,
          includeGuide: data.include_guide,
          totalPriceInr: data.total_price_inr,
          status: data.status,
          contactEmail: data.contact_email,
          contactPhone: data.contact_phone,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message || "Failed to issue pass." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
