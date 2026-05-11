import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

export async function PATCH(req) {
  const token = req.cookies.get("eliasdex-token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload?.userId) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const body = await req.json();
  const updates = {};
  const { name, username, profileImage } = body;

  if (typeof name === "string" && name.trim().length > 0) {
    updates.name = name.trim();
  }

  if (typeof username === "string" && username.trim().length > 0) {
    updates.username = username.trim().toLowerCase();
  }

  if (typeof profileImage === "string") {
    updates.profileImage = profileImage.trim();
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ message: "No valid update fields provided" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  if (updates.username) {
    const existing = await db
      .collection("users")
      .findOne({ username: updates.username, _id: { $ne: new ObjectId(payload.userId) } });
    if (existing) {
      return NextResponse.json({ message: "Username is already taken" }, { status: 409 });
    }
  }

  await db
    .collection("users")
    .updateOne({ _id: new ObjectId(payload.userId) }, { $set: { ...updates, updatedAt: new Date() } });

  const user = await db.collection("users").findOne(
    { _id: new ObjectId(payload.userId) },
    {
      projection: { passwordHash: 0, watchProgress: 0 },
    },
  );

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      name: user.name,
      profileImage: user.profileImage,
      watchHistory: user.watchHistory ?? [],
    },
  });
}
