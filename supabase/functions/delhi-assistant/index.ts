import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const KNOWLEDGE: Record<string, string> = {
  "bharat-mandapam": "Bharat Mandapam (IECC Pragati Maidan) is India's flagship international exhibition-cum-convention centre, venue of the 2023 G20 New Delhi Summit and the annual India International Trade Fair (IITF). It features elliptical conch-shell architecture, a 7,000-seat plenary hall, and the world's tallest 28-foot Ashtadhatu bronze Nataraja statue.",
  "iitf": "The India International Trade Fair (IITF) is South Asia's largest annual mega trade fair held every November (14–27 Nov) at Bharat Mandapam, Pragati Maidan. Organized by ITPO, it showcases handicrafts, state pavilions, international halls, and cuisine. Tickets are available on the DMRC Delhi Metro app and at metro stations.",
  "yashobhoomi": "Yashobhoomi (IICC Dwarka) is one of the world's largest convention and exhibition complexes located in Sector 25, Dwarka, New Delhi. Spanning 8.9 lakh sq metres with an 11,000-seat auditorium, it is directly connected by the Airport Express Line.",
  "red-fort": "Red Fort (Lal Qila) was built by Mughal Emperor Shah Jahan between 1638 and 1648 when he shifted his capital to Shahjahanabad. Notable highlights include Lahori Gate, Diwan-i-Aam, and Diwan-i-Khas.",
  "qutub-minar": "Qutub Minar is a 72.5-metre tapering tower of victory built in 1192 by Qutb-ud-din Aibak, featuring 5 distinct storeys and the rust-resistant 4th-century Iron Pillar.",
  "humayuns-tomb": "Humayun's Tomb was commissioned in 1558 by empress Bega Begum and designed by Mirak Mirza Ghiyas. It is the architectural precursor to the Taj Mahal with a double-dome and charbagh gardens.",
  "india-gate": "India Gate is an 82-metre war memorial triumphal arch designed by Sir Edwin Lutyens, dedicated to 13,300+ Indian soldiers who died in World War I.",
  "markets": "Historic bazaars include Chandni Chowk (food, textiles), Khari Baoli (Asia's largest spice market), Dariba Kalan (silver jewellery), and Dilli Haat (handicrafts from all Indian states).",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ ok: false, error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const q = query.toLowerCase();
    let reply = "Delhi Ki Khoj connects you to 1,000+ years of living heritage across 7 historic cities, verified ASI storytellers, and direct artisan workshops.";

    if (q.includes("mandapam") || q.includes("pragati maidan") || q.includes("iecc") || q.includes("g20")) {
      reply = KNOWLEDGE["bharat-mandapam"];
    } else if (q.includes("iitf") || q.includes("trade fair") || q.includes("exhibition") || q.includes("fair")) {
      reply = KNOWLEDGE["iitf"];
    } else if (q.includes("yashobhoomi") || q.includes("dwarka convention") || q.includes("iicc")) {
      reply = KNOWLEDGE["yashobhoomi"];
    } else if (q.includes("red fort") || q.includes("lal qila")) {
      reply = KNOWLEDGE["red-fort"];
    } else if (q.includes("qutub") || q.includes("minar") || q.includes("iron pillar")) {
      reply = KNOWLEDGE["qutub-minar"];
    } else if (q.includes("humayun") || q.includes("tomb")) {
      reply = KNOWLEDGE["humayuns-tomb"];
    } else if (q.includes("india gate") || q.includes("kartavya")) {
      reply = KNOWLEDGE["india-gate"];
    } else if (q.includes("market") || q.includes("bazaar") || q.includes("spice") || q.includes("craft") || q.includes("silver")) {
      reply = KNOWLEDGE["markets"];
    }

    return new Response(
      JSON.stringify({
        ok: true,
        answer: reply,
        source: "Supabase Edge Tourism Knowledge Base",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
