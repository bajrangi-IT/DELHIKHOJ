import { z } from "zod";

export const stopSchema = z.object({
  id: z.string(),
  kind: z.enum(["destination", "market", "attraction"]),
  slug: z.string(),
  name: z.string().max(120),
  lat: z.number(),
  lng: z.number(),
  minutes: z.number().int().min(5).max(600),
  note: z.string().max(200).optional(),
});
