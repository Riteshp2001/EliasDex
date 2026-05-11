import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
  try {
    const token = req.cookies.get("eliasdex-token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload?.userId) {
      return NextResponse.json({ history: [] });
    }

    const client = await clientPromise;
    const db = client.db();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(payload.userId) }, { projection: { watchProgress: 1 } });

    if (!user?.watchProgress) {
      return NextResponse.json({ history: [] });
    }

    // Convert watchProgress object to array and sort by updatedAt
    const history = Object.entries(user.watchProgress)
      .map(([animeId, progress]) => ({
        animeId,
        ...progress,
      }))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 20); // Get last 20 watched

    return NextResponse.json({ history });
  } catch (error) {
    console.error("[GET /api/user/history]", error.message);
    return NextResponse.json({ history: [], error: error.message }, { status: 500 });
  }
}
