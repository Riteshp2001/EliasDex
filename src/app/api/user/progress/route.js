import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

export async function POST(req) {
  const token = req.cookies.get("eliasdex-token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload?.userId) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const body = await req.json();
  const { animeId, episodeId, currentTime, duration, percent, eventType, title, image } = body;

  if (!animeId || !episodeId) {
    return NextResponse.json({ message: "Anime and episode are required" }, { status: 400 });
  }

  const progressPayload = {
    currentTime: Number(currentTime) || 0,
    duration: Number(duration) || 0,
    percent: Number(percent) || 0,
    eventType: eventType || "watching-log",
    updatedAt: new Date().toISOString(),
  };

  const client = await clientPromise;
  const db = client.db();

  const historyItem = {
    animeId,
    title: title || `Anime ${animeId}`,
    image: image || "",
    currentEp: episodeId,
    percent: progressPayload.percent,
    updatedAt: new Date().toISOString(),
  };

  await db.collection("users").updateOne(
    { _id: new ObjectId(payload.userId) },
    {
      $set: {
        [`watchProgress.${animeId}.${episodeId}`]: progressPayload,
        updatedAt: new Date(),
      },
      $pull: {
        watchHistory: { animeId },
      },
      $push: {
        watchHistory: historyItem,
      },
    },
  );

  return NextResponse.json({ success: true, progress: progressPayload, historyItem });
}
