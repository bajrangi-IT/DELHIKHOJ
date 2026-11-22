import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  console.log("Connecting to Supabase PostgreSQL...");
  const client = await pool.connect();
  try {
    console.log("Connected successfully!");

    // 1. Add columns to guides table
    await client.query(`
      ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "rating" double precision NOT NULL DEFAULT 4.9;
      ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "reviews_count" integer NOT NULL DEFAULT 48;
      ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "badge" text NOT NULL DEFAULT 'ASI Licensed';
      ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "hourly_rate" integer NOT NULL DEFAULT 800;
      ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "verified" boolean NOT NULL DEFAULT true;
    `);
    console.log("✓ Guides columns ensured (rating, reviews_count, badge, hourly_rate, verified).");

    // 2. Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "order_number" text NOT NULL UNIQUE,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "seller_id" uuid NOT NULL REFERENCES "sellers"("id") ON DELETE CASCADE,
        "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "quantity" integer DEFAULT 1 NOT NULL,
        "unit_price_inr" integer NOT NULL,
        "total_price_inr" integer NOT NULL,
        "customer_name" text NOT NULL,
        "customer_email" text NOT NULL,
        "customer_phone" text NOT NULL,
        "delivery_address" text NOT NULL,
        "payment_method" text DEFAULT 'Cash on Delivery' NOT NULL,
        "status" text DEFAULT 'pending' NOT NULL,
        "notes" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "orders_user_idx" ON "orders" ("user_id");
      CREATE INDEX IF NOT EXISTS "orders_seller_idx" ON "orders" ("seller_id");
    `);
    console.log("✓ Orders table ensured.");

    // 3. Create ticket_bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "ticket_bookings" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "booking_ref" text NOT NULL UNIQUE,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "destination_slug" text NOT NULL,
        "destination_name" text NOT NULL,
        "visit_date" text NOT NULL,
        "slot_time" text DEFAULT 'Morning (9 AM - 12 PM)' NOT NULL,
        "adults" integer DEFAULT 1 NOT NULL,
        "children" integer DEFAULT 0 NOT NULL,
        "foreigner_count" integer DEFAULT 0 NOT NULL,
        "include_guide" boolean DEFAULT false NOT NULL,
        "total_price_inr" integer DEFAULT 50 NOT NULL,
        "status" text DEFAULT 'confirmed' NOT NULL,
        "contact_email" text NOT NULL,
        "contact_phone" text NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "tkt_user_idx" ON "ticket_bookings" ("user_id");
    `);
    console.log("✓ Ticket bookings table ensured.");

    // 4. Update existing guides with rich realistic guide profiles
    await client.query(`
      UPDATE "guides" SET 
        "rating" = 4.9, 
        "reviews_count" = 64, 
        "badge" = 'ASI Senior Guide', 
        "hourly_rate" = 850, 
        "verified" = true
      WHERE "name" ILIKE '%Priya%' OR "name" ILIKE '%Sharma%';

      UPDATE "guides" SET 
        "rating" = 4.8, 
        "reviews_count" = 42, 
        "badge" = 'Heritage Walk Leader', 
        "hourly_rate" = 750, 
        "verified" = true
      WHERE "name" ILIKE '%Arjun%' OR "name" ILIKE '%Verma%';

      UPDATE "guides" SET 
        "rating" = 4.95, 
        "reviews_count" = 89, 
        "badge" = 'ASI Licensed Master', 
        "hourly_rate" = 950, 
        "verified" = true
      WHERE "name" ILIKE '%Mohammad%' OR "name" ILIKE '%Khan%';
    `);
    console.log("✓ Guide ratings and badges updated.");

    // 5. Check row counts
    const tables = ['users', 'destinations', 'guides', 'sellers', 'products', 'orders', 'ticket_bookings', 'guide_booking_requests'];
    for (const tbl of tables) {
      const res = await client.query(`SELECT count(*) FROM "${tbl}"`);
      console.log(`Table ${tbl}: ${res.rows[0].count} rows`);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
