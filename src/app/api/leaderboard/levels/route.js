import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Get top 10 users by level/XP
    const topUsers = await db
      .collection("users")
      .find({}, { projection: { name: 1, username: 1, profileImage: 1, totalXp: 1, isDonator: 1, donorTier: 1 } })
      .sort({ totalXp: -1 })
      .limit(10)
      .toArray();

    // Calculate levels for each user
    const leaderboard = topUsers.map((user, idx) => ({
      rank: idx + 1,
      name: user.name,
      username: user.username,
      profileImage: user.profileImage,
      totalXp: user.totalXp || 0,
      level: Math.floor((user.totalXp || 0) / 100) + 1,
      isDonator: user.isDonator || false,
      donorTier: user.donorTier || null,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("[GET /api/leaderboard/levels]", error.message);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
