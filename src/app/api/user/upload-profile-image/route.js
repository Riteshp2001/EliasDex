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

    const formData = await req.formData();
    const file = formData.get("profileImage");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validasi ukuran file (maks 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Konversi file ke buffer dan base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Nama file untuk API
    const extension = file.type.split("/")[1];
    const fileName = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;

    // Ambil API key dari environment variable
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      console.error("IMGBB_API_KEY is not set in environment");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Upload ke ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append("key", apiKey);
    imgbbFormData.append("image", base64Image);
    imgbbFormData.append("name", fileName);

    const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: imgbbFormData,
    });

    const imgbbData = await imgbbResponse.json();

    if (!imgbbData.success) {
      console.error("[ImgBB upload error]", imgbbData);
      return NextResponse.json(
        { error: "Failed to upload image to ImgBB", details: imgbbData },
        { status: 500 }
      );
    }

    const imageUrl = imgbbData.data.url; // URL langsung gambar

    // Update URL gambar profil di database
    const client = await clientPromise;
    const db = client.db();

    await db.collection("users").updateOne(
      { _id: new ObjectId(payload.userId) },
      {
        $set: {
          profileImage: imageUrl,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("[POST /api/user/upload-profile-image]", error.message);
    return NextResponse.json(
      { error: "Failed to upload profile image", message: error.message },
      { status: 500 }
    );
  }
}