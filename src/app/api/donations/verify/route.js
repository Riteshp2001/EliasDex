import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

// Determine donor tier based on amount
function getDonorTier(amount) {
  if (amount >= 500000) return "platinum";
  if (amount >= 250000) return "gold";
  if (amount >= 100000) return "silver";
  return "bronze";
}

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get transaction status from Midtrans
    const transactionStatus = await snap.transaction.status(orderId);

    if (transactionStatus.transaction_status === "settlement") {
      // Payment successful
      const donation = await db.collection("donations").findOne({ orderId });

      if (donation && donation.status !== "completed") {
        // Update donation status
        await db.collection("donations").updateOne(
          { orderId },
          {
            $set: {
              status: "completed",
              transactionId: transactionStatus.transaction_id,
              paymentMethod: transactionStatus.payment_type,
              completedAt: new Date(),
            },
          },
        );

        // Update user donor status
        const donorTier = getDonorTier(donation.amount);

        await db.collection("users").updateOne(
          { _id: donation.userId },
          {
            $set: {
              isDonator: true,
              donorTier,
              updatedAt: new Date(),
            },
            $inc: {
              totalDonations: donation.amount,
              totalXp: 100, // Bonus XP for donation
            },
          },
        );
      }

      return NextResponse.json({
        success: true,
        status: "completed",
        message: "Donation successful! Thank you for supporting us!",
      });
    } else if (transactionStatus.transaction_status === "pending") {
      return NextResponse.json({
        success: false,
        status: "pending",
        message: "Payment is still pending",
      });
    } else {
      return NextResponse.json({
        success: false,
        status: transactionStatus.transaction_status,
        message: "Payment failed or was cancelled",
      });
    }
  } catch (error) {
    console.error("[POST /api/donations/verify]", error.message);
    return NextResponse.json({ error: "Failed to verify donation" }, { status: 500 });
  }
}
