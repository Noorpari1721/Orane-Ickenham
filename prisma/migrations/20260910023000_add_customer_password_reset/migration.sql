BEGIN;

CREATE TABLE IF NOT EXISTS "CustomerPasswordResetToken" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "customerId" TEXT NOT NULL,

  CONSTRAINT "CustomerPasswordResetToken_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "CustomerPasswordResetToken_tokenHash_key"
    UNIQUE ("tokenHash")
);

CREATE INDEX IF NOT EXISTS
  "CustomerPasswordResetToken_customerId_idx"
  ON "CustomerPasswordResetToken"("customerId");

CREATE INDEX IF NOT EXISTS
  "CustomerPasswordResetToken_expiresAt_idx"
  ON "CustomerPasswordResetToken"("expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname =
      'CustomerPasswordResetToken_customerId_fkey'
  ) THEN

    ALTER TABLE "CustomerPasswordResetToken"
      ADD CONSTRAINT
      "CustomerPasswordResetToken_customerId_fkey"
      FOREIGN KEY ("customerId")
      REFERENCES "Customer"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;

  END IF;
END $$;

COMMIT;