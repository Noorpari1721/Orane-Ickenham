import crypto from "crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .scryptSync(password, salt, KEY_LENGTH)
    .toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(
  password: string,
  storedValue: string
): boolean {
  const [salt, storedHash] = storedValue.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const calculatedHash = crypto.scryptSync(
    password,
    salt,
    KEY_LENGTH
  );

  const storedBuffer = Buffer.from(
    storedHash,
    "hex"
  );

  if (calculatedHash.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    calculatedHash,
    storedBuffer
  );
}