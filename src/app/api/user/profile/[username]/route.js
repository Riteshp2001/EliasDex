import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find user by username
    const user = await db.collection("users").findOne(
      { username },
      {
        projection: {
          _id: 1,
          name: 1,
          username: 1,
          profileImage: 1,
          totalXp: 1,
          watchProgress: 1,
          isDonator: 1,
          donorTier: 1,
        },
      },
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert watchProgress object to array
    let watchHistory = [];
    if (user.watchProgress) {
      watchHistory = Object.entries(user.watchProgress)
        .map(([animeId, progress]) => ({
          animeId,
          ...progress,
        }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);
    }

    // Get comic history from comicProgress collection
    let comicHistory = [];
    try {
      comicHistory = await db
        .collection("comicProgress")
        .find({ userId: user._id.toString() })
        .sort({ updatedAt: -1 })
        .limit(5)
        .toArray();
    } catch (err) {
      // Comic history collection might not exist yet
      comicHistory = [];
    }

    // Calculate level and XP
    const totalXp = user.totalXp || 0;
    const level = Math.floor(totalXp / 100) + 1;

    return NextResponse.json({
      user: {
        name: user.name,
        username: user.username,
        profileImage: user.profileImage,
        level,
        totalXp,
        watchHistory,
        comicHistory,
        isDonator: user.isDonator ?? false,
        donorTier: user.donorTier ?? null,
      },
    });
  } catch (error) {
    console.error("[GET /api/user/profile/[username]]", error.message);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
