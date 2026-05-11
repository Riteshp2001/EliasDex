import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    const token = req.cookies.get("eliasdex-token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comicId, currentChapter, totalChapters, title, image } = await req.json();

    if (!comicId || !currentChapter || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Calculate XP (10 XP per chapter)
    const xpEarned = 10;

    // Update or insert comic progress
    await db.collection("comicProgress").updateOne(
      {
        userId: payload.userId,
        comicId: comicId,
      },
      {
        $set: {
          currentChapter: parseInt(currentChapter),
          totalChapters: parseInt(totalChapters) || 0,
          title,
          image,
          updatedAt: new Date(),
          userId: payload.userId,
          comicId,
        },
      },
      { upsert: true },
    );

    // Update user's total XP
    await db.collection("users").updateOne(
      { _id: new ObjectId(payload.userId) },
      {
        $inc: { totalXp: xpEarned },
        $set: { updatedAt: new Date() },
      },
    );

    return NextResponse.json({
      success: true,
      xpEarned,
      message: `Progress saved! Earned ${xpEarned} XP.`,
    });
  } catch (error) {
    console.error("[POST /api/user/comic-progress]", error.message);
    return NextResponse.json({ error: "Failed to save comic progress" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const token = req.cookies.get("eliasdex-token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const history = await db
      .collection("comicProgress")
      .find({ userId: payload.userId })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({ history });
  } catch (error) {
    console.error("[GET /api/user/comic-progress]", error.message);
    return NextResponse.json({ error: "Failed to fetch comic history" }, { status: 500 });
  }
}
