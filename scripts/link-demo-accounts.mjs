import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Linking accounts in database...");
  const client = await pool.connect();
  try {
    // 1. Link demo seller
    await client.query(`
      UPDATE sellers 
      SET user_id = '44b88159-e450-4e47-bf91-1e1e6cb50ec2' 
      WHERE slug = 'demo-old-delhi-spice-house';
    `);

    // 2. Link demo guide
    await client.query(`
      UPDATE guides 
      SET user_id = '665ce844-9dae-4b49-a98d-2efd2c59facb',
          rating = 4.95,
          reviews_count = 72,
          badge = 'ASI Certified Master',
          hourly_rate = 850,
          verified = true
      WHERE name LIKE '%Old Delhi Walker%';
    `);

    // 3. Update all guides with realistic attributes if needed
    await client.query(`
      UPDATE guides SET
        rating = 4.9,
        reviews_count = 48,
        badge = 'ASI Licensed',
        hourly_rate = 800,
        verified = true
      WHERE rating IS NULL;
    `);

    // 4. Create sample initial bookings and orders for the demo accounts so they see realistic startup data
    const touristUser = await client.query(`SELECT id FROM users WHERE email = 'demo@delhikikhoj.test' LIMIT 1`);
    const seller = await client.query(`SELECT id, user_id FROM sellers WHERE slug = 'demo-old-delhi-spice-house' LIMIT 1`);
    const product = await client.query(`SELECT id, price_inr FROM products WHERE seller_id = $1 LIMIT 1`, [seller.rows[0].id]);
    const guide = await client.query(`SELECT id FROM guides WHERE user_id = '665ce844-9dae-4b49-a98d-2efd2c59facb' LIMIT 1`);

    if (touristUser.rows.length && seller.rows.length && product.rows.length) {
      const uId = touristUser.rows[0].id;
      const sId = seller.rows[0].id;
      const pId = product.rows[0].id;
      const price = product.rows[0].price_inr || 1200;

      // Seed a sample order if none exists
      const existingOrder = await client.query(`SELECT count(*) FROM orders`);
      if (parseInt(existingOrder.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO orders (
            order_number, user_id, seller_id, product_id, quantity, unit_price_inr, total_price_inr,
            customer_name, customer_email, customer_phone, delivery_address, payment_method, status, notes
          ) VALUES (
            'ORD-DEL-8941', $1, $2, $3, 1, $4, $4,
            'Demo Traveller', 'demo@delhikikhoj.test', '+91 98765 43210', 'Room 304, The Imperial, Janpath, New Delhi 110001',
            'Cash on Delivery', 'confirmed', 'Please deliver between 2 PM and 5 PM.'
          )
        `, [uId, sId, pId, price]);
        console.log("✓ Sample order created for demo seller.");
      }

      // Seed a sample ticket booking if none exists
      const existingTickets = await client.query(`SELECT count(*) FROM ticket_bookings`);
      if (parseInt(existingTickets.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO ticket_bookings (
            booking_ref, user_id, destination_slug, destination_name, visit_date, slot_time,
            adults, children, foreigner_count, include_guide, total_price_inr, status, contact_email, contact_phone
          ) VALUES (
            'TKT-RF-2026-902', $1, 'red-fort', 'Red Fort (Lal Qila)', '2026-11-25', 'Morning (9 AM - 12 PM)',
            2, 0, 0, true, 100, 'confirmed', 'demo@delhikikhoj.test', '+91 98765 43210'
          )
        `, [uId]);
        console.log("✓ Sample ticket booking created for demo traveller.");
      }

      // Seed a sample guide booking request if none exists
      if (guide.rows.length) {
        const gId = guide.rows[0].id;
        const existingGbr = await client.query(`SELECT count(*) FROM guide_booking_requests`);
        if (parseInt(existingGbr.rows[0].count) === 0) {
          await client.query(`
            INSERT INTO guide_booking_requests (
              guide_id, user_id, tour_date, time_slot, group_size, destination, message, status
            ) VALUES (
              $1, $2, '2026-11-26', 'Morning (9 AM - 1 PM)', 2, 'Old Delhi Heritage Walk & Chandni Chowk',
              'Looking forward to exploring the Mughal heritage and spice markets!', 'accepted'
            )
          `, [gId, uId]);
          console.log("✓ Sample guide booking created.");
        }
      }
    }

    console.log("✓ Demo accounts linked and verified successfully!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
