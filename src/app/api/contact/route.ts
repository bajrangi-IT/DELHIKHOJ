import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { fail, ok, parseBody, rateLimited, z } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  subject: z.string().trim().min(3, "Add a subject").max(120),
  message: z.string().trim().min(10, "Write at least 10 characters").max(1500),
});

export async function POST(req: Request) {
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  if (rateLimited(`contact:${p.data.email}`, 4, 300_000)) return fail("Too many messages. Please wait a few minutes.", 429);
  await db.insert(contactMessages).values(p.data);
  return ok({ message: "Thank you — your message has been recorded." }, 201);
}
