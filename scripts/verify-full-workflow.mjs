// Full Workflow Verification Script for Delhi Ki Khoj
const BASE = "http://localhost:3000";

async function run() {
  console.log("=== STARTING FULL WORKFLOW VERIFICATION ===\n");

  // Step 1: Login as Tourist
  console.log("1. Authenticating as Demo Tourist (demo@delhikikhoj.test)...");
  const touristLoginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@delhikikhoj.test", password: "Demo@1234" }),
  });
  const touristCookie = touristLoginRes.headers.get("set-cookie");
  const touristLoginData = await touristLoginRes.json();
  console.log("Tourist login status:", touristLoginRes.status, touristLoginData);
  if (!touristLoginRes.ok || !touristLoginData.ok) {
    throw new Error("Tourist login failed");
  }

  // Step 2: Book Digital Monument Pass
  console.log("\n2. Booking Digital Fast-Track Pass for Red Fort...");
  const ticketRes = await fetch(`${BASE}/api/tickets/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: touristCookie || "",
    },
    body: JSON.stringify({
      destinationSlug: "red-fort",
      destinationName: "Red Fort (Lal Qila)",
      visitDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      slotTime: "Morning (9 AM - 12 PM)",
      adults: 2,
      children: 1,
      foreignerCount: 0,
      includeGuide: true,
      contactEmail: "demo@delhikikhoj.test",
      contactPhone: "+91 98765 43210",
    }),
  });
  const ticketData = await ticketRes.json();
  console.log("Ticket Pass Response:", ticketRes.status, ticketData);
  if (!ticketRes.ok || !ticketData.ok) {
    throw new Error("Ticket booking failed");
  }
  const bookingRef = ticketData.booking.bookingRef;
  console.log("Generated Ticket Booking Reference:", bookingRef);

  // Step 3: Fetch Nearest Licensed Guides
  console.log("\n3. Testing Nearest Guides Recommendation API...");
  const nearestGuidesRes = await fetch(`${BASE}/api/guides/nearest?locality=Old%20Delhi`);
  const nearestGuidesData = await nearestGuidesRes.json();
  console.log("Nearest Guides Count:", nearestGuidesData.guides?.length);
  if (nearestGuidesData.guides && nearestGuidesData.guides.length > 0) {
    const g0 = nearestGuidesData.guides[0];
    console.log(`Top guide: ${g0.name} | Rating: ★${g0.rating} (${g0.reviewsCount} reviews) | Badge: ${g0.badge} | Rate: ₹${g0.hourlyRate}/hr`);
  }

  // Step 4: Request Guide Tour
  console.log("\n4. Requesting Licensed Guide Tour for Humayun's Tomb...");
  const guideId = nearestGuidesData.guides[0]?.id;
  const guideReqRes = await fetch(`${BASE}/api/guide-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: touristCookie || "",
    },
    body: JSON.stringify({
      guideId: guideId,
      tourDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      timeSlot: "morning",
      groupSize: 2,
      destination: "Humayun's Tomb",
      message: "Looking for an architectural and photography walk.",
    }),
  });
  const guideReqData = await guideReqRes.json();
  console.log("Guide Request Response:", guideReqRes.status, guideReqData);
  if (!guideReqRes.ok || !guideReqData.ok) {
    throw new Error("Guide tour request failed");
  }

  // Step 5: Authenticate as Seller to find their workshop product
  console.log("\n5. Authenticating as Artisan Seller (seller@delhikikhoj.test)...");
  const sellerLoginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "seller@delhikikhoj.test", password: "Seller@1234" }),
  });
  const sellerCookie = sellerLoginRes.headers.get("set-cookie");
  const sellerLoginData = await sellerLoginRes.json();
  console.log("Seller login status:", sellerLoginRes.status, sellerLoginData);
  if (!sellerLoginRes.ok || !sellerLoginData.ok) {
    throw new Error("Seller login failed");
  }

  // The demo seller owns 'Demo Seller — Old Delhi Spice House' product
  const productId = "404586dd-26c3-4fd6-8e91-e51eebf0074a";
  console.log("Artisan Product for order:", productId);

  // Step 6: Tourist places order for the artisan product
  console.log("\n6. Tourist Ordering Artisan Craft (Local to Global Vision)...");
  const orderRes = await fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: touristCookie || "",
    },
    body: JSON.stringify({
      productId: productId,
      quantity: 1,
      customerName: "Demo Traveller",
      customerEmail: "demo@delhikikhoj.test",
      customerPhone: "+91 98765 43210",
      deliveryAddress: "The Imperial Hotel, Janpath, Connaught Place, New Delhi 110001",
      paymentMethod: "Cash on Delivery",
      notes: "Please deliver between 4 PM and 6 PM.",
    }),
  });
  const orderData = await orderRes.json();
  console.log("Artisan Order Response:", orderRes.status, orderData);
  if (!orderRes.ok || !orderData.ok) {
    throw new Error("Artisan order placement failed");
  }
  const orderId = orderData.order.id;
  const orderNumber = orderData.order.orderNumber;
  console.log(`Placed Order ${orderNumber} (ID: ${orderId})`);

  // Step 7: Seller updates order status
  console.log("\n7. Seller Updating Order Status: pending -> confirmed -> shipped -> delivered...");
  const updateOrderRes1 = await fetch(`${BASE}/api/seller/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: sellerCookie || "",
    },
    body: JSON.stringify({ status: "confirmed" }),
  });
  const updateOrderData1 = await updateOrderRes1.json();
  console.log("Confirmed update response:", updateOrderRes1.status, updateOrderData1);
  if (!updateOrderRes1.ok || !updateOrderData1.ok) {
    throw new Error("Failed to confirm order as seller");
  }

  const updateOrderRes2 = await fetch(`${BASE}/api/seller/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: sellerCookie || "",
    },
    body: JSON.stringify({ status: "shipped" }),
  });
  const updateOrderData2 = await updateOrderRes2.json();
  console.log("Shipped update response:", updateOrderRes2.status, updateOrderData2);
  if (!updateOrderRes2.ok || !updateOrderData2.ok) {
    throw new Error("Failed to mark order shipped as seller");
  }

  const updateOrderRes3 = await fetch(`${BASE}/api/seller/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: sellerCookie || "",
    },
    body: JSON.stringify({ status: "delivered" }),
  });
  const updateOrderData3 = await updateOrderRes3.json();
  console.log("Delivered update response:", updateOrderRes3.status, updateOrderData3);
  if (!updateOrderRes3.ok || !updateOrderData3.ok) {
    throw new Error("Failed to mark order delivered as seller");
  }

  // Step 8: Authenticate as Admin & Verify System Stats
  console.log("\n8. Authenticating as Platform Admin (admin@delhikikhoj.test)...");
  const adminLoginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@delhikikhoj.test", password: "Admin@1234" }),
  });
  const adminCookie = adminLoginRes.headers.get("set-cookie");
  const adminLoginData = await adminLoginRes.json();
  console.log("Admin login status:", adminLoginRes.status, adminLoginData);
  if (!adminLoginRes.ok || !adminLoginData.ok) {
    throw new Error("Admin login failed");
  }

  const adminPageRes = await fetch(`${BASE}/admin`, {
    headers: { Cookie: adminCookie || "" },
  });
  console.log("Admin Dashboard HTTP Status:", adminPageRes.status);
  if (adminPageRes.status !== 200) {
    throw new Error("Admin dashboard access failed");
  }

  // Step 9: Verify Tourist My Bookings page displays all items
  console.log("\n9. Verifying Tourist 'My Bookings' Dashboard...");
  const myBookingsRes = await fetch(`${BASE}/my-bookings`, {
    headers: { Cookie: touristCookie || "" },
  });
  const myBookingsHtml = await myBookingsRes.text();
  console.log("My Bookings page status:", myBookingsRes.status);
  const hasPass = myBookingsHtml.includes(bookingRef);
  const hasOrder = myBookingsHtml.includes(orderNumber);
  console.log(`Verification: Ticket Pass ${bookingRef} rendered:`, hasPass);
  console.log(`Verification: Order ${orderNumber} rendered:`, hasOrder);

  if (!hasPass || !hasOrder) {
    throw new Error("Bookings not properly displayed on /my-bookings page");
  }

  console.log("\n=== ALL WORKFLOW TESTS PASSED SUCCESSFULLY! ===");
}

run().catch((err) => {
  console.error("Workflow Verification Failed:", err);
  process.exit(1);
});
