import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Get top 10 users by total donations
    const topDonators = await db
      .collection("users")
      .find(
        { totalDonations: { $gt: 0 } },
        { projection: { name: 1, username: 1, profileImage: 1, totalDonations: 1, donorTier: 1, isDonator: 1 } },
      )
      .sort({ totalDonations: -1 })
      .limit(10)
      .toArray();

    // Map with ranks
    const leaderboard = topDonators.map((user, idx) => ({
      rank: idx + 1,
      name: user.name,
      username: user.username,
      profileImage: user.profileImage,
      totalDonations: user.totalDonations || 0,
      donorTier: user.donorTier || "bronze",
      isDonator: user.isDonator || true,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("[GET /api/leaderboard/donations]", error.message);
    return NextResponse.json({ error: "Failed to fetch donations leaderboard" }, { status: 500 });
  }
}
