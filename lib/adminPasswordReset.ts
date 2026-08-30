import crypto from "crypto";

type ResetTokenData = {
  email: string;
  expiresAt: number;
};

const globalForReset = globalThis as unknown as {
  adminResetTokens?: Map<string, ResetTokenData>;
};

const resetTokens =
  globalForReset.adminResetTokens ??
  new Map<string, ResetTokenData>();

if (process.env.NODE_ENV !== "production") {
  globalForReset.adminResetTokens = resetTokens;
}

export function createPasswordResetToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");

  resetTokens.set(token, {
    email,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  return token;
}

export function consumePasswordResetToken(token: string) {
  const data = resetTokens.get(token);

  if (!data) {
    return null;
  }

  resetTokens.delete(token);

  if (Date.now() > data.expiresAt) {
    return null;
  }

  return data;
}
