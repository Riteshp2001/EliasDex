import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { signToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, username, name, password } = body;

    if (!email || !username || !name || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const existing = await db.collection("users").findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existing) {
      return NextResponse.json({ message: "Email or username already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();
    const user = {
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      name,
      passwordHash,
      profileImage: "",
      watchHistory: [],
      watchProgress: {},
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("users").insertOne(user);
    const createdUser = {
      id: result.insertedId.toString(),
      email: user.email,
      username: user.username,
      name: user.name,
      profileImage: user.profileImage,
      watchHistory: [],
      createdAt: now.toISOString(),
    };
    const token = signToken({ userId: result.insertedId.toString() });

    const response = NextResponse.json({ user: createdUser }, { status: 201 });
    response.cookies.set("eliasdex-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/register]", error.message);
    return NextResponse.json({ error: "Failed to register user", message: error.message }, { status: 500 });
  }
}
