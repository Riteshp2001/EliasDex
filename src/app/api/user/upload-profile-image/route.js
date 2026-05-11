import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import { Catbox } from "node-catbox";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export async function POST(req) {
  let tempFilePath = null;

  try {
    const token = req.cookies.get("eliasdex-token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("profileImage");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Create temporary file for Catbox upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = tmpdir();
    const fileName = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.type.split("/")[1]}`;
    tempFilePath = join(tempDir, fileName);

    await writeFile(tempFilePath, buffer);

    // Upload to Catbox
    const catbox = new Catbox();
    const catboxUrl = await catbox.uploadFile({ path: tempFilePath });

    // Clean up temp file
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {});
    }

    // Update user profile image in database
    const client = await clientPromise;
    const db = client.db();

    await db.collection("users").updateOne(
      { _id: new ObjectId(payload.userId) },
      {
        $set: {
          profileImage: catboxUrl,
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({
      success: true,
      imageUrl: catboxUrl,
    });
  } catch (error) {
    // Clean up temp file on error
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {});
    }

    console.error("[POST /api/user/upload-profile-image]", error.message);
    return NextResponse.json({ error: "Failed to upload profile image", message: error.message }, { status: 500 });
  }
}
