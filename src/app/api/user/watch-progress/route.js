import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

// Konfigurasi XP
const XP_PER_EPISODE = 10;
const XP_PER_LEVEL = 100;

const calculateLevel = (totalXp) => {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
};

const calculateLevelProgress = (totalXp) => {
  const currentLevelXp = (calculateLevel(totalXp) - 1) * XP_PER_LEVEL;
  const nextLevelXp = calculateLevel(totalXp) * XP_PER_LEVEL;
  const progress = ((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return Math.min(100, Math.max(0, progress));
};

// GET - Retrieve watch progress
export async function GET(req) {
  try {
    const token = req.cookies.get("eliasdex-token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload?.userId) {
      return NextResponse.json({ progress: [] }, { status: 200 });
    }

    const client = await clientPromise;
    const db = client.db();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(payload.userId) }, { projection: { watchProgress: 1, totalXp: 1 } });

    return NextResponse.json({
      progress: user?.watchProgress || {},
      totalXp: user?.totalXp || 0,
      level: calculateLevel(user?.totalXp || 0),
      levelProgress: calculateLevelProgress(user?.totalXp || 0),
    });
  } catch (error) {
    console.error("[GET /api/user/watch-progress]", error.message);
    return NextResponse.json({ error: "Failed to fetch watch progress" }, { status: 500 });
  }
}

// POST - Update watch progress (save episode watched)
export async function POST(req) {
  try {
    const token = req.cookies.get("eliasdex-token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { animeId, currentEp, totalEp, title, image } = body;

    if (!animeId || currentEp === undefined) {
      return NextResponse.json({ error: "animeId and currentEp are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = new ObjectId(payload.userId);

    // Get current user data
    const user = await db.collection("users").findOne({ _id: userId });
    const currentProgress = user?.watchProgress || {};
    const currentTotalXp = user?.totalXp || 0;

    // Check if episode already watched to avoid duplicate XP
    const previousEp = currentProgress[animeId]?.currentEp || 0;
    let xpGained = 0;

    if (currentEp > previousEp) {
      xpGained = (currentEp - previousEp) * XP_PER_EPISODE;
    }

    // Update progress
    const now = new Date();
    const newProgress = {
      ...currentProgress,
      [animeId]: {
        currentEp,
        totalEp: totalEp || 0,
        title: title || "Unknown",
        image: image || "",
        percent: totalEp ? Math.round((currentEp / totalEp) * 100) : 0,
        updatedAt: now.toISOString(),
      },
    };

    const newTotalXp = currentTotalXp + xpGained;
    const newLevel = calculateLevel(newTotalXp);
    const oldLevel = calculateLevel(currentTotalXp);
    const leveledUp = newLevel > oldLevel;

    // Update user in database
    await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          watchProgress: newProgress,
          totalXp: newTotalXp,
          updatedAt: now,
        },
        $push: {
          watchHistory: {
            animeId,
            title,
            image,
            episode: currentEp,
            watchedAt: now,
          },
        },
      },
    );

    // Add to history if it's the first time or significant progress
    if (!currentProgress[animeId] || currentEp % 5 === 0) {
      // Limit history to 50 items
      const history = user?.watchHistory || [];
      if (history.length > 50) {
        await db.collection("users").updateOne({ _id: userId }, { $pop: { watchHistory: -1 } });
      }
    }

    return NextResponse.json({
      success: true,
      progress: newProgress[animeId],
      totalXp: newTotalXp,
      xpGained,
      level: newLevel,
      leveledUp,
      levelProgress: calculateLevelProgress(newTotalXp),
    });
  } catch (error) {
    console.error("[POST /api/user/watch-progress]", error.message);
    return NextResponse.json({ error: "Failed to update watch progress", message: error.message }, { status: 500 });
  }
}

// PUT - Update watch progress for multiple episodes
export async function PUT(req) {
  try {
    const token = req.cookies.get("eliasdex-token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { progressData } = body; // Array of {animeId, currentEp, totalEp, title, image}

    if (!Array.isArray(progressData)) {
      return NextResponse.json({ error: "progressData must be an array" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = new ObjectId(payload.userId);

    const user = await db.collection("users").findOne({ _id: userId });
    const currentProgress = user?.watchProgress || {};
    const currentTotalXp = user?.totalXp || 0;

    let newTotalXp = currentTotalXp;
    const newProgress = { ...currentProgress };

    for (const item of progressData) {
      const { animeId, currentEp, totalEp, title, image } = item;
      if (!animeId) continue;

      const previousEp = currentProgress[animeId]?.currentEp || 0;
      if (currentEp > previousEp) {
        newTotalXp += (currentEp - previousEp) * XP_PER_EPISODE;
      }

      newProgress[animeId] = {
        currentEp,
        totalEp: totalEp || 0,
        title: title || "Unknown",
        image: image || "",
        percent: totalEp ? Math.round((currentEp / totalEp) * 100) : 0,
        updatedAt: new Date().toISOString(),
      };
    }

    const newLevel = calculateLevel(newTotalXp);
    const oldLevel = calculateLevel(currentTotalXp);
    const leveledUp = newLevel > oldLevel;

    await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          watchProgress: newProgress,
          totalXp: newTotalXp,
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({
      success: true,
      totalXp: newTotalXp,
      level: newLevel,
      leveledUp,
      levelProgress: calculateLevelProgress(newTotalXp),
    });
  } catch (error) {
    console.error("[PUT /api/user/watch-progress]", error.message);
    return NextResponse.json({ error: "Failed to update watch progress", message: error.message }, { status: 500 });
  }
}
