import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "orane_admin_session";

function getSecret() {
  const secret = process.env.ADMIN_AUTH_SECRET;

  if (!secret) {
    throw new Error("ADMIN_AUTH_SECRET is not configured.");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
}

export function createAdminSession(email: string) {
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;

  const payload = `${email}|${expiresAt}`;
  const signature = sign(payload);

  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifyAdminSession(token: string | undefined) {
  if (!token) return false;

  try {
    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature) return false;

    const payload = Buffer.from(
      encodedPayload,
      "base64url"
    ).toString("utf8");

    const expectedSignature = sign(payload);

    const supplied = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      return false;
    }

    const separator = payload.lastIndexOf("|");

    if (separator === -1) return false;

    const email = payload.slice(0, separator);
    const expiresAt = Number(payload.slice(separator + 1));

    if (!email || !Number.isFinite(expiresAt)) {
      return false;
    }

    if (Date.now() > expiresAt) {
      return false;
    }

    return email === process.env.ADMIN_EMAIL;
  } catch {
    return false;
  }
}
