import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("Missing JWT_SECRET environment variable");
}

export function signToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: "30d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}
