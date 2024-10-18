const crypto = require("crypto");
export default function generateId(length: number) {
  return crypto.randomBytes(length / 2).toString("hex");
}
