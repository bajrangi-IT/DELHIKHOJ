import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, sellers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ ok: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    // Check if user is the seller for this order or an admin
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
    }

    if (user.role !== "admin") {
      const [seller] = await db.select().from(sellers).where(eq(sellers.userId, user.id)).limit(1);
      if (!seller || seller.id !== order.sellerId) {
        return NextResponse.json({ ok: false, error: "Forbidden: You are not the seller of this order." }, { status: 403 });
      }
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    return NextResponse.json({ ok: true, order: updatedOrder });
  } catch (err: any) {
    console.error("Order update error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Failed to update order status." }, { status: 500 });
  }
}
