BEGIN;

ALTER TABLE "Customer"
ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

CREATE TABLE IF NOT EXISTS "CustomerSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerSession_pkey"
        PRIMARY KEY ("id"),

    CONSTRAINT "CustomerSession_tokenHash_key"
        UNIQUE ("tokenHash"),

    CONSTRAINT "CustomerSession_customerId_fkey"
        FOREIGN KEY ("customerId")
        REFERENCES "Customer"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CustomerSession_customerId_idx"
ON "CustomerSession"("customerId");

CREATE INDEX IF NOT EXISTS "CustomerSession_expiresAt_idx"
ON "CustomerSession"("expiresAt");

COMMIT;