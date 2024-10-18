"use server";
import jwt from "jsonwebtoken";

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    return { valid: true, decoded };
  } catch (_) {
    return { valid: false, message: "Invalid or expired token" };
  }
}

export default verifyToken;
