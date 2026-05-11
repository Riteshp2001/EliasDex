import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { signToken } from "@/lib/jwt";

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection("users").findOne({ email: email.toLowerCase() });
  if (!user) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const safeUser = {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    name: user.name,
    profileImage: user.profileImage,
    watchHistory: user.watchHistory ?? [],
  };
  const token = signToken({ userId: user._id.toString() });

  const response = NextResponse.json({ user: safeUser }, { status: 200 });
  response.cookies.set("eliasdex-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
