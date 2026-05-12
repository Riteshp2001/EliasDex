import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
  try {
    const token = req.cookies.get("eliasdex-token")?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload?.userId) {
      return NextResponse.json({ user: null });
    }

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(payload.userId) },
      {
        projection: { passwordHash: 0, watchProgress: 0 },
      },
    );

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
        profileImage: user.profileImage,
        watchHistory: user.watchHistory ?? [],
        isDonator: user.isDonator ?? false,
        donorTier: user.donorTier ?? null,
      },
    });
  } catch (error) {
    console.error("[GET /api/auth/me]", error.message);
    return NextResponse.json({ error: "Failed to fetch user data", message: error.message }, { status: 500 });
  }
}
