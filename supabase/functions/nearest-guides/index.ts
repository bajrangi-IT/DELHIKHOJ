import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const locality = url.searchParams.get("locality") || "";
    const language = url.searchParams.get("language") || "";
    const limit = parseInt(url.searchParams.get("limit") || "6", 10);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from("guides")
      .select("id, name, bio, image, languages, specialities, areas, experience_years, hourly_rate, rating, reviews_count, badge, verified")
      .eq("status", "approved");

    if (language) {
      query = query.contains("languages", [language]);
    }

    const { data: guides, error } = await query.limit(limit);

    if (error) {
      throw error;
    }

    const ranked = (guides || []).sort((a: any, b: any) => {
      const aLoc = locality && a.areas?.some((ar: string) => ar.toLowerCase().includes(locality.toLowerCase()));
      const bLoc = locality && b.areas?.some((ar: string) => ar.toLowerCase().includes(locality.toLowerCase()));
      if (aLoc && !bLoc) return -1;
      if (!aLoc && bLoc) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });

    const formatted = ranked.map((g: any) => ({
      id: g.id,
      name: g.name,
      bio: g.bio,
      image: g.image,
      languages: g.languages || [],
      specialities: g.specialities || [],
      areas: g.areas || [],
      experienceYears: g.experience_years,
      hourlyRate: g.hourly_rate || 800,
      rating: g.rating || 4.9,
      reviewsCount: g.reviews_count || 48,
      badge: g.badge || "ASI Licensed",
      verified: g.verified !== false,
    }));

    return new Response(JSON.stringify({ ok: true, guides: formatted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message || "Failed to fetch guides" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
