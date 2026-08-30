-- CreateTable
CREATE TABLE "GiftCardService" (
    "id" TEXT NOT NULL,
    "giftCardId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftCardService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GiftCardService_giftCardId_idx" ON "GiftCardService"("giftCardId");

-- CreateIndex
CREATE INDEX "GiftCardService_serviceId_idx" ON "GiftCardService"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCardService_giftCardId_serviceId_key" ON "GiftCardService"("giftCardId", "serviceId");

-- AddForeignKey
ALTER TABLE "GiftCardService" ADD CONSTRAINT "GiftCardService_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "GiftCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCardService" ADD CONSTRAINT "GiftCardService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
