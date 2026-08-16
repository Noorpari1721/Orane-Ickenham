-- CreateEnum
CREATE TYPE "GiftCardType" AS ENUM ('SERVICE_VOUCHER', 'CUSTOM_GIFT_CARD');

-- CreateEnum
CREATE TYPE "GiftCardStatus" AS ENUM ('PENDING', 'ACTIVE', 'PARTIALLY_REDEEMED', 'REDEEMED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "giftCardNo" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "GiftCardType" NOT NULL,
    "status" "GiftCardStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "remainingAmount" DECIMAL(10,2) NOT NULL,
    "serviceId" TEXT,
    "purchaserFirstName" TEXT,
    "purchaserLastName" TEXT,
    "purchaserEmail" TEXT,
    "recipientFirstName" TEXT,
    "recipientLastName" TEXT,
    "recipientEmail" TEXT,
    "personalMessage" TEXT,
    "stripeSessionId" TEXT,
    "stripePaymentIntent" TEXT,
    "issuedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCardRedemption" (
    "id" TEXT NOT NULL,
    "redemptionNo" TEXT NOT NULL,
    "giftCardId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "GiftCardRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_giftCardNo_key" ON "GiftCard"("giftCardNo");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_stripeSessionId_key" ON "GiftCard"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_stripePaymentIntent_key" ON "GiftCard"("stripePaymentIntent");

-- CreateIndex
CREATE INDEX "GiftCard_status_idx" ON "GiftCard"("status");

-- CreateIndex
CREATE INDEX "GiftCard_type_idx" ON "GiftCard"("type");

-- CreateIndex
CREATE INDEX "GiftCard_expiresAt_idx" ON "GiftCard"("expiresAt");

-- CreateIndex
CREATE INDEX "GiftCard_recipientEmail_idx" ON "GiftCard"("recipientEmail");

-- CreateIndex
CREATE INDEX "GiftCard_createdAt_idx" ON "GiftCard"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCardRedemption_redemptionNo_key" ON "GiftCardRedemption"("redemptionNo");

-- CreateIndex
CREATE INDEX "GiftCardRedemption_giftCardId_idx" ON "GiftCardRedemption"("giftCardId");

-- CreateIndex
CREATE INDEX "GiftCardRedemption_redeemedAt_idx" ON "GiftCardRedemption"("redeemedAt");

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCardRedemption" ADD CONSTRAINT "GiftCardRedemption_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "GiftCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
