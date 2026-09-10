-- ORANE ICKENHAM
-- Safe migration for multiple quantities of the same service.
-- IMPORTANT: no DROP TABLE / TRUNCATE / RESET operations.

ALTER TABLE "BookingService"
ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "Booking"
ADD COLUMN IF NOT EXISTS "consultationStatus" TEXT;

DROP INDEX IF EXISTS "BookingService_bookingId_serviceId_key";
