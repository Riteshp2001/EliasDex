import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import midtransClient from "midtrans-client";

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function POST(req) {
  try {
    const token = req.cookies.get("eliasdex-token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, donorTier, description } = await req.json();

    if (!amount || amount < 10000) {
      return NextResponse.json({ error: "Minimum donation is Rp10,000" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get user info
    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.userId) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create Midtrans transaction
    const orderId = `DONATION-${Date.now()}-${payload.userId}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone || "",
      },
      item_details: [
        {
          id: donorTier,
          price: amount,
          quantity: 1,
          name: `${donorTier.charAt(0).toUpperCase() + donorTier.slice(1)} Donation`,
        },
      ],
    };

    // Create snap transaction token
    const transaction = await snap.createTransaction(parameter);

    // Save donation record to database
    await db.collection("donations").insertOne({
      userId: new ObjectId(payload.userId),
      orderId,
      amount,
      donorTier,
      status: "pending",
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId,
    });
  } catch (error) {
    console.error("[POST /api/donations/create-transaction]", error.message);
    return NextResponse.json({ error: "Failed to create donation transaction" }, { status: 500 });
  }
}
