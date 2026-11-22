import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, products, sellers, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      productId,
      sellerId,
      quantity = 1,
      deliveryAddress,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod = "Cash on Delivery",
      notes,
    } = body;

    if (!productId || !deliveryAddress || !customerName || !customerPhone) {
      return NextResponse.json({ ok: false, error: "Please provide product, delivery address, name, and phone number." }, { status: 400 });
    }

    // Resolve product and seller
    const [prod] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!prod) {
      return NextResponse.json({ ok: false, error: "Product not found." }, { status: 404 });
    }

    const resolvedSellerId = sellerId || prod.sellerId;
    const unitPrice = prod.priceInr || 1200;
    const qty = Math.max(1, Number(quantity));
    const totalPrice = unitPrice * qty;

    // Resolve user
    let userId = user?.id;
    if (!userId) {
      const email = customerEmail || "tourist@delhikikhoj.test";
      const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const [demoUser] = await db.select().from(users).where(eq(users.role, "tourist")).limit(1);
        userId = demoUser?.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Please log in to complete your order." }, { status: 401 });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-DEL-${new Date().getFullYear()}-${randomSuffix}`;

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId,
        sellerId: resolvedSellerId,
        productId: prod.id,
        quantity: qty,
        unitPriceInr: unitPrice,
        totalPriceInr: totalPrice,
        customerName,
        customerEmail: customerEmail || user?.email || "customer@delhikikhoj.test",
        customerPhone,
        deliveryAddress,
        paymentMethod,
        status: "confirmed",
        notes: notes || null,
      })
      .returning();

    return NextResponse.json({ ok: true, order });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Failed to place order." }, { status: 500 });
  }
}
