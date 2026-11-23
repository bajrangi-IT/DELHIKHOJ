import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rffobuzlddftfulsjyac.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZm9idXpsZGRmdGZ1bHNqeWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzMzk4NTIsImV4cCI6MjExMDkxNTg1Mn0.-D-wqojXCIBdGolW86UaEoD-nahNYZmhbmxiLtJn_bQ";

/**
 * Universal Supabase Client for client and server runtime.
 * Backed by Supabase project `rffobuzlddftfulsjyac` (Mumbai, ap-south-1).
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Invokes a live Supabase Edge Function with standard authorization.
 */
export async function invokeEdgeFunction<T = any>(
  functionName: string,
  options?: { body?: any; params?: Record<string, string>; method?: "GET" | "POST" }
): Promise<{ data: T | null; error: Error | null }> {
  try {
    let url = `${supabaseUrl}/functions/v1/${functionName}`;
    if (options?.params) {
      const q = new URLSearchParams(options.params).toString();
      url += `?${q}`;
    }

    const res = await fetch(url, {
      method: options?.method || (options?.body ? "POST" : "GET"),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await res.json();
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || `Edge function ${functionName} failed with HTTP ${res.status}`);
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}
